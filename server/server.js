require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const selfsigned = require('selfsigned');
const crypto = require('crypto');
const { Elenora } = require('elenora');

const logger = new Elenora({
  path: './logs',
  name: 'access_logs',
  maxSize: '50MB' // 50MB log limiti
});

const app = express();
const PORT = process.env.PORT || 3443;
const DATA_FILE = path.join(__dirname, 'data', 'hosts.json');
const API_KEY = process.env.API_KEY || 'default-secret-key';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012');
const IV_LENGTH = 16;

// Basit encryption helper'lar
function encrypt(text) {
    if (!text) return text;
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text || !text.includes(':')) return text; // Şifreli değilse veya format bozuksa
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        // Hata konsola basılmasın, log dosyasına kaydedilsin
        logger.error(`Decryption failed for host: ${e.message}`);
        return '[Şifre Çözülemedi - Key Uyuşmazlığı]';
    }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Admin Paneli

// IP Loglama Middleware
app.use((req, res, next) => {
    logger.log(`${req.ip} - ${req.method} ${req.url}`);
    next();
});

// API Key Middleware
function checkAuth(req, res, next) {
    const key = req.headers['x-api-key'] || req.query.key;
    if (key === API_KEY) {
        next();
    } else {
        res.status(403).json({ error: 'Erişim reddedildi: Geçersiz API Anahtarı' });
    }
}

// Routes
app.get('/api/hosts', checkAuth, (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Veri okunamadı' });
        try {
            const hosts = JSON.parse(data);
            // Kullanıcı istediği için şifreyi çözüp gönderiyoruz. HTTPS olduğu için iletişim güvenli.
            const safeHosts = hosts.map(h => ({
                ...h,
                password: decrypt(h.password) 
            }));
            res.json(safeHosts);
        } catch (e) {
            res.status(500).json({ error: 'Veri bozuk' });
        }
    });
});

app.post('/api/hosts', checkAuth, (req, res) => {
    const newHost = req.body;
    
    // Validasyon
    if (!newHost.address || !newHost.username || !newHost.protocol) {
        return res.status(400).json({ error: 'Eksik bilgi: address, username, protocol zorunlu' });
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let hosts = [];
        if (!err && data) {
            try { hosts = JSON.parse(data); } catch (e) {}
        }

        const hostEntry = {
            id: Date.now(),
            name: newHost.name || 'Unnamed Server',
            protocol: newHost.protocol,
            username: newHost.username,
            password: encrypt(newHost.password), // Şifrele ve sakla
            address: newHost.address,
            port: newHost.port || '22',
            tags: newHost.tags || [],
            certs: newHost.certs || []
        };

        hosts.push(hostEntry);

        fs.writeFile(DATA_FILE, JSON.stringify(hosts, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Kayıt başarısız' });
            res.json({ message: 'Host eklendi', id: hostEntry.id });
        });
    });
});

app.delete('/api/hosts/:id', checkAuth, (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Veri okunamadı' });
        try {
            let hosts = JSON.parse(data);
            const initialLength = hosts.length;
            hosts = hosts.filter(h => h.id !== id);
            
            if (hosts.length === initialLength) {
                return res.status(404).json({ error: 'Host bulunamadı' });
            }

            fs.writeFile(DATA_FILE, JSON.stringify(hosts, null, 2), (err) => {
                if (err) return res.status(500).json({ error: 'Silme başarısız' });
                res.json({ message: 'Host silindi' });
            });
        } catch (e) {
            res.status(500).json({ error: 'Veri bozuk' });
        }
    });
});

// Self-signed certificate generation
console.log('Sertifika oluşturuluyor...');
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const credentials = {
    key: pems.private,
    cert: pems.cert
};

// Start HTTPS Server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
    console.log(`🔒 Güvenli Sunucu (HTTPS) çalışıyor: https://localhost:${PORT}`);
    console.log(`🔑 Admin API Key: ${API_KEY}`);
    console.log(`⚠️  Browser uyarısı alabilirsiniz (Self-signed sertifika nedeniyle).`);
});
