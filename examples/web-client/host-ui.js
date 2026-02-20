// host-ui.js - Arayüz işlemleri
async function loadHosts() {
    const tableBody = document.querySelector('#hostTable tbody');
    tableBody.innerHTML = '<tr><td colspan="5">Yükleniyor...</td></tr>';
    
    // host-api.js içindeki getHosts() fonksiyonunu kullanır
    const hosts = await getHosts();
    
    tableBody.innerHTML = '';
    hosts.forEach(host => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${host.name}</td>
            <td>${host.ip}</td>
            <td>${host.username}</td>
            <td>${host.password}</td>
            <td>
                <button onclick="deleteHost(${host.id})">Sil</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function deleteHost(id) {
    // Silme işlemi için henüz API'de deleteHosts fonksiyonu yazılmalı örnek
    // veya basit alert ile geçilebilir
    alert(id + ' ID li sunucu silinecek. (Henüz bağlı değil)');
}
