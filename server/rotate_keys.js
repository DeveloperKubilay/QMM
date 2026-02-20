// rotate_keys.js - Güvenli Key Değiştirme Aracı
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Kullanım: node rotate_keys.js <ESKI_KEY> <YENI_KEY>
// Örn: node rotate_keys.js 12345678901234567890123456789012 abcdefghijklmnopqrstuvwxyz123456

const OLD_KEY_STR = process.argv[2];
const NEW_KEY_STR = process.argv[3];

if (!OLD_KEY_STR || OLD_KEY_STR.length !== 32 || !NEW_KEY_STR || NEW_KEY_STR.length !== 32) {
    console.error('HATA: Lütfen hem ESKİ hem de YENİ keyi 32 karakter uzunluğunda parametre olarak verin.');
    console.error('Doğru Kullanım: node rotate_keys.js ESKIKEY32KARAKTEROLMALI YENIKEY32KARAKTEROLMALI');
    process.exit(1);
}

const OLD_KEY = Buffer.from(OLD_KEY_STR);
const NEW_KEY = Buffer.from(NEW_KEY_STR);
const DATA_FILE = path.join(__dirname, 'data', 'hosts.json');
const IV_LENGTH = 16;

function decrypt(text, key) {
    if (!text || !text.includes(':')) return text;
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) { return null; }
}

function encrypt(text, key) {
    if (!text) return text;
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// İşlem Başlıyor
console.log('🔄 Key rotasyonu başlatılıyor...');
const rawData = fs.readFileSync(DATA_FILE, 'utf8');
const hosts = JSON.parse(rawData);
let successCount = 0;

const newHosts = hosts.map(host => {
    // 1. Eski key ile şifreyi çöz
    const plainPassword = decrypt(host.password, OLD_KEY);
    
    if (!plainPassword) {
        console.warn(`⚠️  Host ID ${host.id} şifresi çözülemedi, atlanıyor.`);
        return host; // Dokunma
    }

    // 2. Yeni key ile şifrele
    const newEncryptedPassword = encrypt(plainPassword, NEW_KEY);
    successCount++;
    return { ...host, password: newEncryptedPassword };
});

// Dosyayı kaydet
fs.writeFileSync(DATA_FILE, JSON.stringify(newHosts, null, 2));

console.log(`✅ ${successCount} adet host başarıyla yeni key ile şifrelendi.`);
console.log(`⚠️  DİKKAT: Şimdi .env dosyasındaki ENCRYPTION_KEY değerini şu ile değiştirin:\n`);
console.log(`ENCRYPTION_KEY=${NEW_KEY_STR}\n`);
