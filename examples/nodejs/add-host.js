const axios = require('axios');
const https = require('https');

// Prod ortamında gerçek sertifika varsa bu satıra gerek yok
const agent = new https.Agent({ rejectUnauthorized: false });

const API_URL = 'https://localhost:3443/api/hosts';
const API_KEY = 'super-secret-admin-key-change-me';

// Eklenecek Sunucu Bilgileri
const newHost = {
    name: "Web-Server-02",
    protocol: "ssh",
    username: "deploy",
    password: "secure_password_123!",
    address: "10.0.0.15",
    port: "2202",
    tags: ["web", "prod"]
};

async function addHost() {
    try {
        const response = await axios.post(API_URL, newHost, {
            headers: { 'x-api-key': API_KEY },
            httpsAgent: agent
        });
        console.log('✅ Host Başarıyla Eklendi:', response.data);
    } catch (error) {
        console.error('❌ Ekleme Başarısız:', error.message);
    }
}

addHost();
