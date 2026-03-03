const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0; 
let nomorDipanggil = 0; 
let loketAktif = "-"; // Mengetahui loket mana yang memanggil

// 1. HALAMAN TV (Disesuaikan untuk 2 Loket)
app.get('/tv', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <body style="background:#000; color:#0f0; text-align:center; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; height:100vh; margin:0;">
            <h2 style="color:white;">KANTOR CABANG ASABRI MALANG</h2>
            
            <div style="display:flex; justify-content:space-around; align-items:center; width:100%;">
                <div>
                    <h2 style="color:white;">NOMOR ANTRIAN</h2>
                    <h1 id="angka" style="font-size:250px; margin:0;">${nomorDipanggil}</h1>
                    <h1 id="loketText" style="color:yellow; font-size:80px; margin:0;">LOKET ${loketAktif}</h1>
                </div>
                <div style="border-left: 2px solid white; padding-left: 50px;">
                    <h2 style="color:white;">TOTAL ANTRIAN</h2>
                    <h1 id="total" style="font-size:150px; color:cyan; margin:0;">${nomorAntrian}</h1>
                </div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                
                // Update saat ada yang ambil nomor
                socket.on('update-total', (total) => {
                    document.getElementById('total').innerText = total;
                });

                // Update saat dipanggil
                socket.on('suara-panggilan', (data) => {
                    document.getElementById('angka').innerText = data.nomor;
                    document.getElementById('loketText').innerText = "LOKET " + data.loket;
                    
                    const pesan = new SpeechSynthesisUtterance("Nomor antrian " + data.nomor + " menuju loket " + data.loket);
                    pesan.lang = 'id-ID';
                    window.speechSynthesis.speak(pesan);
                });
            </script>
        </body>
        </html>
    `);
});

// 2. HALAMAN ADMIN (2 Tombol Loket)
app.get('/admin', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:50px;">
            <h1>PANEL ADMIN ASABRI (2 LOKET)</h1>
            <div style="display:flex; justify-content:center; gap:20px;">
                <button style="padding:40px; font-size:20px; background:green; color:white; border-radius:15px;" onclick="panggil(1)">PANGGIL - LOKET 1</button>
                <button style="padding:40px; font-size:20px; background:orange; color:white; border-radius:15px;" onclick="panggil(2)">PANGGIL - LOKET 2</button>
            </div>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function panggil(n) { socket.emit('proses-panggil', n); }
            </script>
        </body>
    `);
});

// 3. HALAMAN AMBIL NOMOR
app.get('/ambil', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:100px;">
            <h1>AMBIL ANTRIAN</h1>
            <button style="padding:50px; font-size:30px; background:blue; color:white; border-radius:20px;" onclick="ambil()">AMBIL NOMOR</button>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function ambil() { socket.emit('tambah-antrian'); alert('Nomor diambil!'); }
            </script>
        </body>
    `);
});

io.on('connection', (socket) => {
    socket.on('tambah-antrian', () => { 
        nomorAntrian++; 
        io.emit('update-total', nomorAntrian); 
    });

    socket.on('proses-panggil', (nomorLoket) => {
        if (nomorDipanggil < nomorAntrian) {
            nomorDipanggil++;
            io.emit('suara-panggilan', { nomor: nomorDipanggil, loket: nomorLoket });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port ' + PORT);
});