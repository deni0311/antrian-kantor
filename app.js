const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0; 
let nomorDipanggil = 0; 

// 1. HALAMAN TV
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
                    <h1 id="loketText" style="color:yellow; font-size:80px; margin:0;">LOKET -</h1>
                </div>
                <div style="border-left: 2px solid white; padding-left: 50px;">
                    <h2 style="color:white;">SISA ANTRIAN</h2>
                    <h1 id="sisa" style="font-size:150px; color:cyan; margin:0;">${nomorAntrian - nomorDipanggil}</h1>
                </div>
            </div>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                socket.on('update-layar', (data) => {
                    document.getElementById('sisa').innerText = data.total - data.dipanggil;
                    if(data.isPanggil) {
                        document.getElementById('angka').innerText = data.dipanggil;
                        document.getElementById('loketText').innerText = "LOKET " + data.loket;
                        const pesan = new SpeechSynthesisUtterance("Nomor antrian " + data.dipanggil + " menuju loket " + data.loket);
                        pesan.lang = 'id-ID';
                        window.speechSynthesis.speak(pesan);
                    }
                });
                socket.on('reset-layar', () => { location.reload(); });
            </script>
        </body>
        </html>
    `);
});

// 2. HALAMAN ADMIN (Tambah Tombol Reset)
app.get('/admin', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:30px; background:#f4f4f4;">
            <h1>PANEL ADMIN ASABRI</h1>
            <div style="display:flex; justify-content:center; gap:20px; margin-bottom:50px;">
                <button style="padding:40px; font-size:20px; background:green; color:white; border-radius:15px;" onclick="panggil(1)">PANGGIL LOKET 1</button>
                <button style="padding:40px; font-size:20px; background:orange; color:white; border-radius:15px;" onclick="panggil(2)">PANGGIL LOKET 2</button>
            </div>
            <hr>
            <button style="margin-top:50px; padding:20px; background:red; color:white; border-radius:10px;" onclick="reset()">RESET SEMUA NOMOR KE 0</button>
            
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function panggil(n) { socket.emit('proses-panggil', n); }
                function reset() { 
                    if(confirm("Yakin ingin reset semua antrian?")) { socket.emit('reset-antrian'); }
                }
            </script>
        </body>
    `);
});

// 3. HALAMAN AMBIL NOMOR (Tambah Fitur Cetak)
app.get('/ambil', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @media print { body * { visibility: hidden; } #cetak, #cetak * { visibility: visible; } #cetak { position: absolute; left: 0; top: 0; width: 58mm; } }
            </style>
        </head>
        <body style="text-align:center; font-family:sans-serif; padding-top:100px;">
            <div id="konten-layar">
                <h1>AMBIL ANTRIAN ASABRI</h1>
                <button style="padding:50px; font-size:30px; background:blue; color:white; border-radius:20px;" onclick="ambil()">AMBIL & CETAK NOMOR</button>
            </div>

            <div id="cetak" style="display:none; text-align:center; width:58mm; font-family:monospace;">
                <p>ASABRI MALANG</p>
                <p>-------------------------</p>
                <p>Nomor Antrian:</p>
                <h1 style="font-size:50px; margin:10px 0;" id="nomor-struk">0</h1>
                <p id="jam-cetak"></p>
                <p>-------------------------</p>
                <p>Silakan Menunggu</p>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function ambil() { socket.emit('tambah-antrian'); }

                socket.on('siap-cetak', (nomor) => {
                    document.getElementById('nomor-struk').innerText = nomor;
                    document.getElementById('jam-cetak').innerText = new Date().toLocaleString('id-ID');
                    document.getElementById('cetak').style.display = 'block';
                    window.print(); // Membuka jendela print otomatis
                    document.getElementById('cetak').style.display = 'none';
                });
                socket.on('reset-layar', () => { location.reload(); });
            </script>
        </body>
        </html>
    `);
});

// 4. LOGIKA SERVER
io.on('connection', (socket) => {
    socket.on('tambah-antrian', () => { 
        nomorAntrian++; 
        io.emit('update-layar', { total: nomorAntrian, dipanggil: nomorDipanggil, isPanggil: false }); 
        socket.emit('siap-cetak', nomorAntrian); // Hanya kirim ke pengambil nomor untuk cetak
    });

    socket.on('proses-panggil', (n) => {
        if (nomorDipanggil < nomorAntrian) {
            nomorDipanggil++;
            io.emit('update-layar', { total: nomorAntrian, dipanggil: nomorDipanggil, loket: n, isPanggil: true });
        }
    });

    socket.on('reset-antrian', () => {
        nomorAntrian = 0; nomorDipanggil = 0;
        io.emit('reset-layar');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => { console.log('Running...'); });