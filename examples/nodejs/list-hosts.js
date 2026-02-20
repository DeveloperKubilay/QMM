const axios = require('axios');
const https = require('https');

// Prod ortamında gerçek sertifika varsa bu satıra gerek yok
const agent = new https.Agent({ rejectUnauthorized: false });

const API_URL = 'https://localhost:3443/api/hosts';
const API_KEY = 'super-secret-admin-key-change-me';

async function listHosts() {
    try {
        const response = await axios.get(API_URL, {
            headers: { 'x-api-key': API_KEY },
            httpsAgent: agent
        });
        console.log('--- SUNUCU LİSTESİ ---');
        console.table(response.data);
    } catch (error) {
        // Hata detayını gizle, sadece mesajı göster
        console.error('Hata:', error.message);
    }
}

listHosts();
