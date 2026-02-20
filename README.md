# QMM - Güvenli Makine Yönetim Sistemi

Node.js tabanlı, yüksek güvenlikli (HTTPS + Şifreli Veritabanı) Sunucu Yönetim Sistemi.

## Özellikler

- **HTTPS (SSL/TLS)**: Tüm iletişim şifreli kanal üzerinden yapılır.
- **Veri Şifreleme (AES-256-GCM)**: Veritabanında saklanan parolalar AES-256 ile şifrelenir.
- **API Key Doğrulaması**: İzinsiz erişimleri engellemek için API Anahtarı kullanılır.
- **İki Arayüz**:
    1. **Web Admin Paneli**: Modern ve şık bir arayüz.
    2. **CLI İstemci (Client)**: Terminal üzerinden hızlı yönetim.

## Kurulum ve Çalıştırma

### 1. Sunucuyu Başlat (Server)

```bash
cd server
npm start
```
- Sunucu **https://localhost:3443** adresinde çalışır.
- İlk açılışta tarayıcınız "Güvenli Değil" uyarısı verebilir (Self-signed sertifika nedeniyle). Gelişmiş -> Siteye İlerle diyerek geçebilirsiniz.
- Admin Panel için tarayıcıdan **https://localhost:3443** adresine gidin.
- **Varsayılan API Key**: `super-secret-admin-key-change-me`

### 2. İstemciyi Başlat (Client CLI)

```bash
cd client
node client.js
```
- Menüden host ekleyebilir, silebilir veya listeleyebilirsiniz.
- İletişim HTTPS üzerinden güvenli sağlanır.

## Güvenlik Notları

- **API Anahtarı**: `server.js` ve `client.js` dosyalarındaki `API_KEY` değişkenini prodüksiyon ortamında mutlaka değiştirin.
- **Sertifika**: Geliştirme ortamı için otomatik "Self-signed" sertifika üretilir. Prodüksiyon için gerçek bir SSL sertifikası (Let's Encrypt vb.) kullanılmalıdır.
"# QMM" 
