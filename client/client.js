import axios from 'axios';
import inquirer from 'inquirer';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'https://localhost:3443/api/hosts';
const API_KEY = process.env.API_KEY || 'super-secret-admin-key-change-me';

// Self-signed sertifikayı development ortamında kabul etmek için
const agent = new https.Agent({  
  rejectUnauthorized: false
});

const client = axios.create({
  httpsAgent: agent,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

async function main() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Ne yapmak istersiniz?',
        choices: [
          'List Hosts',
          'Add Host',
          'Delete Host',
          'Exit'
        ]
      }
    ]);

    if (action === 'Exit') break;

    try {
      if (action === 'List Hosts') {
        const response = await client.get(API_URL);
        console.table(response.data);
      } else if (action === 'Add Host') {
        const answers = await inquirer.prompt([
          { name: 'name', message: 'Sunucu Adı:' },
          { name: 'protocol', message: 'Protokol (ssh/rdp):', default: 'ssh' },
          { name: 'address', message: 'IP Adresi:' },
          { name: 'username', message: 'Kullanıcı Adı:' },
          { name: 'password', type: 'password', message: 'Şifre:' },
          { name: 'port', message: 'Port:', default: '22' }
        ]);
        
        await client.post(API_URL, answers);
        console.log('✅ Host başarıyla eklendi!');
      } else if (action === 'Delete Host') {
        const list = await client.get(API_URL);
        if (list.data.length === 0) {
            console.log('Host yok.');
            continue;
        }
        
        const { hostId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'hostId',
                message: 'Silinecek hostu seçin:',
                choices: list.data.map(h => ({ name: `${h.name} (${h.address})`, value: h.id }))
            }
        ]);

        await client.delete(`${API_URL}/${hostId}`);
        console.log('🗑️  Host silindi.');
      }
    } catch (error) {
      console.error('Hata:', error.response ? error.response.data : error.message);
    }
  }
}

main();
