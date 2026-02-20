// host-api.js - Sunucu ile iletişim kuran ana fonksiyonlar
const API_URL = 'https://localhost:3443/api/hosts';
const API_KEY = 'super-secret-admin-key-change-me';

// Güvenli değil ama test için bypass
const sslOption = {
  // Browser'da sertifika hatasını geçmek için "Gelişmiş -> Devam Et" demelisiniz.
  // JS ile bunu koddan aşamazsınız.
};

async function getHosts() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'x-api-key': API_KEY }
        });
        if (!response.ok) throw new Error('API Hatası');
        return await response.json();
    } catch (error) {
        console.error("Veri çekilemedi:", error);
        return [];
    }
}

async function addHost(hostData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hostData)
        });
        return await response.json();
    } catch (error) {
        console.error("Host eklenemedi:", error);
        return { error: error.message };
    }
}
