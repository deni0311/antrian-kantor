const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0; 
let nomorDipanggil = 0; 

// 1. HALAMAN TV (Display Utama)
app.get('/tv', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Display Antrian ASABRI</title>
        </head>
        <body style="background:#000; color:#0f0; text-align:center; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; height:100vh; margin:0; overflow:hidden;">
            <h2 style="color:white; letter-spacing: 2px;">KANTOR CABANG ASABRI MALANG</h2>
            
            <div style="display:flex; justify-content:space-around; align-items:center; width:100%; margin-top: 20px;">
                <div style="flex: 1;">
                    <h2 style="color:white;">NOMOR ANTRIAN</h2>
                    <h1 id="angka" style="font-size:280px; margin:0; line-height:1;">${nomorDipanggil}</h1>
                    <div id="boxLoket" style="background:yellow; color:black; display:inline-block; padding:10px 40px; border-radius:15px; margin-top:20px;">
                        <h1 id="loketText" style="margin:0; font-size:60px;">LOKET -</h1>
                    </div>
                </div>

                <div style="flex: 1; border-left: 3px solid white;">
                    <h2 style="color:white;">SISA ANTRIAN</h2>
                    <h1 id="sisa" style="font-size:180px; color:cyan; margin:0;">${nomorAntrian - nomorDipanggil}</h1>
                    <p style="color:white; font-size:20px;">Orang Menunggu</p>
                </div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                
                socket.on('update-layar', (data) => {
                    // Update angka sisa antrian (Total - Dipanggil)
                    document.getElementById('sisa').innerText = data.total - data.dipanggil;
                    
                    if(data.isPanggil) {
                        // Efek Visual Panggilan
                        document.getElementById('angka').innerText = data.dipanggil;
                        document.getElementById('loketText').innerText = "LOKET " + data.loket;
                        
                        // Suara Panggilan Indonesia
                        const pesan = new SpeechSynthesisUtterance("Nomor antrian " + data.dipanggil + " menuju loket " + data.loket);
                        pesan.lang = 'id-ID';
                        pesan.rate = 0.9; // Sedikit lebih lambat agar jelas
                        window.speechSynthesis.speak(pesan);
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// 2. HALAMAN ADMIN (Panel Kontrol 2 Loket)
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <body style="text-align:center; font-family:sans-serif; background:#f0f0f0; padding-top:50px;">
            <h1>PANEL ADMIN ASABRI MALANG</h1>
            <p>Klik tombol di bawah untuk memanggil antrian sesuai loket Anda</p>
            <div style="display:flex; justify-content:center; gap:30px; margin-top:30px;">
                <div style="background:white; padding:30px; border-radius:20px; shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h2>PETUGAS LOKET 1</h2>
                    <button style="padding:40px 60px; font-size:25px; background:green; color:white; border:none; border-radius:15px; cursor:pointer;" onclick="panggil(1)">PANGGIL</button>
                </div>
                <div style="background:white; padding:30px; border-radius:20px;">
                    <h2>PETUGAS LOKET 2</h2>
                    <button style="padding:40px 60px; font-size:25px; background:orange; color:white; border:none; border-radius:15px; cursor:pointer;" onclick="panggil(2)">PANGGIL</button>
                </div>
            </div>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function panggil(n) { socket.emit('proses-panggil', n); }
            </script>
        </body>
        </html>
    `);
});

// 3. HALAMAN AMBIL NOMOR (Kios Antrian)
app.get('/ambil', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <body style="text-align:center; font-family:sans-serif; background:#e3f2fd; padding-top:100px;">
            <div style="background:white; display:inline-block; padding:50px; border-radius:30px; box-shadow:0 10px 20px rgba(0,0,0,0.1);">
                <h1 style="color:#1976d2;">SELAMAT DATANG</h1>
                <p style="font-size:20px;">Silakan klik tombol untuk mengambil nomor antrian</p>
                <button style="padding:60px 80px; font-size:35px; background:#1976d2; color:white; border:none; border-radius:25px; cursor:pointer; margin-top:20px;" onclick="ambil()">AMBIL NOMOR</button>
            </div>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function ambil() { 
                    socket.emit('tambah-antrian'); 
                    alert('Nomor antrian berhasil diambil!'); 
                }
            </script>
        </body>
        </html>
    `);
});

// 4. LOGIKA SERVER (Socket.io)
io.on('connection', (socket) => {
    // Saat ada yang klik tombol AMBIL
    socket.on('tambah-antrian', () => { 
        nomorAntrian++; 
        io.emit('update-layar', { total: nomorAntrian, dipanggil: nomorDipanggil, isPanggil: false }); 
    });

    // Saat Admin klik tombol PANGGIL
    socket.on('proses-panggil', (nomorLoket) => {
        if (nomorDipanggil < nomorAntrian) {
            nomorDipanggil++;
            io.emit('update-layar', { 
                total: nomorAntrian, 
                dipanggil: nomorDipanggil, 
                loket: nomorLoket, 
                isPanggil: true 
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server antrian aktif di port ' + PORT);
});