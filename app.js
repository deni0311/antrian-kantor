const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0;

// Halaman untuk TV (Layar Monitor)
app.get('/tv', (req, res) => {
    res.send(`
        <body style="background:#000; color:#0f0; text-align:center; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; height:100vh; margin:0;">
            
            <div style="margin-top: 20px;">
                <img src="/logo.png" style="height: 120px; width: auto;">
                <h2 style="color:white; margin: 10px 0;">KANTOR CABANG ASABRI MALANG</h2>
            </div>

            <h2 style="color:white; margin-top: 30px;">NOMOR ANTRIAN</h2>
            <h1 id="angka" style="font-size:300px; margin:0; line-height: 1;">${nomorAntrian}</h1>
            <h2 id="status" style="color:white;">Silakan Menunggu</h2>
            
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                socket.on('update-nomor', (n) => {
                    document.getElementById('angka').innerText = n;
                    document.getElementById('status').innerText = "SILAKAN KE LOKET 1";
                    
                    const pesan = new SpeechSynthesisUtterance("Nomor antrian " + n + " menuju loket satu");
                    pesan.lang = 'id-ID';
                    window.speechSynthesis.speak(pesan);
                });
            </script>
        </body>
    `);
});

// Halaman untuk Admin (Tombol Panggil)
app.get('/admin', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:100px;">
            <h1>PANEL ADMIN</h1>
            <button style="padding:50px; font-size:30px; background:green; color:white; border-radius:20px; cursor:pointer;" 
                    onclick="fetch('/panggil')">PANGGIL BERIKUTNYA</button>
            <p>Klik tombol di atas untuk update layar TV</p>
        </body>
    `);
});

// Halaman untuk Pengunjung Ambil Nomor (Versi Berkoneksi)
app.get('/ambil', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; background:#f0f0f0; padding-top:100px;">
            <img src="/logo.png" style="height:100px;">
            <h1>Selamat Datang di ASABRI</h1>
            <p>Silakan tekan tombol di bawah untuk mengambil nomor antrian</p>
            
            <button onclick="ambil()" style="padding:50px; font-size:40px; border-radius:20px; background:green; color:white; cursor:pointer;">
                AMBIL NOMOR ANTRIAN
            </button>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function ambil() {
                    // Memberitahu server (app.js) bahwa ada orang ambil antrian baru
                    socket.emit('tambah-antrian');
                    alert("Nomor Antrian Berhasil Diambil!");
                }
            </script>
        </body>
    `);
});

// Fungsi Logika Panggil
app.get('/panggil', (req, res) => {
    nomorAntrian++;
    io.emit('update-nomor', nomorAntrian); 
    res.send('Nomor ' + nomorAntrian + ' dipanggil!');
});

io.on('connection', (socket) => {
    console.log('Seseorang terhubung');

    // Tambahkan perintah ini:
    socket.on('tambah-antrian', () => {
        nomorAntrian++; // Angka naik 1
        io.emit('update-nomor', nomorAntrian); // Kirim angka baru ke TV & Admin
    });

    socket.on('panggil', () => {
        io.emit('update-nomor', nomorAntrian);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log('------------------------------------------');
    console.log('SERVER AKTIF!');
    console.log('Buka Layar TV: http://localhost:3000/tv');
    console.log('Buka Remote Admin: http://localhost:3000/admin');
    console.log('------------------------------------------');
});