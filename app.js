const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0; 
let nomorDipanggil = 0; 

// 1. HALAMAN TV (Yang sudah berhasil)
app.get('/tv', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <body style="background:#000; color:#0f0; text-align:center; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; height:100vh; margin:0;">
            <h2 style="color:white;">KANTOR CABANG ASABRI MALANG</h2>
            <h2 style="color:white; margin-top: 30px;">NOMOR ANTRIAN</h2>
            <h1 id="angka" style="font-size:300px; margin:0;">${nomorDipanggil}</h1>
            <h2 id="status" style="color:white;">Silakan Menunggu</h2>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                socket.on('suara-panggilan', (n) => {
                    document.getElementById('angka').innerText = n;
                    const pesan = new SpeechSynthesisUtterance("Nomor antrian " + n + " menuju loket satu");
                    pesan.lang = 'id-ID';
                    window.speechSynthesis.speak(pesan);
                });
            </script>
        </body>
        </html>
    `);
});

// 2. HALAMAN ADMIN (Untuk memanggil)
app.get('/admin', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:100px;">
            <h1>PANEL ADMIN ASABRI</h1>
            <button style="padding:50px; font-size:30px; background:green; color:white; border-radius:20px; cursor:pointer;" onclick="panggil()">PANGGIL BERIKUTNYA</button>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function panggil() { socket.emit('proses-panggil'); }
            </script>
        </body>
    `);
});

// 3. HALAMAN AMBIL NOMOR
app.get('/ambil', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:100px;">
            <h1>AMBIL ANTRIAN</h1>
            <button style="padding:50px; font-size:30px; background:blue; color:white; border-radius:20px; cursor:pointer;" onclick="ambil()">AMBIL NOMOR</button>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function ambil() { socket.emit('tambah-antrian'); alert('Nomor diambil!'); }
            </script>
        </body>
    `);
});

app.get('/', (req, res) => { res.send('Antrian Online - Silakan buka /tv, /admin, atau /ambil'); });

io.on('connection', (socket) => {
    socket.on('tambah-antrian', () => { 
        nomorAntrian++; 
        io.emit('update-layar-saja', nomorAntrian); 
    });
    socket.on('proses-panggil', () => {
        if (nomorDipanggil < nomorAntrian) {
            nomorDipanggil++;
            io.emit('suara-panggilan', nomorDipanggil);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port ' + PORT);
});