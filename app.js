const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0; 
let nomorDipanggil = 0; 

// 1. HALAMAN TV (Disesuaikan dengan nuansa biru ASABRI di gambar)
app.get('/tv', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Display Antrian ASABRI Malang</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f7f9;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                /* Header Biru sesuai gambar */
                .header {
                    background-color: #2c5e9e;
                    color: white;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 5px solid #d4af37; /* Aksen emas */
                }
                .header h1 { margin: 0; font-size: 28px; }
                
                .main-content {
                    flex: 1;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 20px;
                }
                
                .card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    padding: 40px;
                    text-align: center;
                    min-width: 40%;
                }
                
                .label { font-size: 30px; color: #555; font-weight: bold; margin-bottom: 10px; }
                .number { font-size: 250px; font-weight: bold; color: #2c5e9e; margin: 0; line-height: 1; }
                .loket-box {
                    background-color: #d4af37;
                    color: white;
                    font-size: 60px;
                    padding: 10px 30px;
                    border-radius: 15px;
                    margin-top: 20px;
                    display: inline-block;
                }
                
                .footer-bar {
                    background-color: #2c5e9e;
                    color: white;
                    padding: 15px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>PT ASABRI (PERSERO)</h1>
                    <small>Kantor Cabang Malang</small>
                </div>
                <div id="jam" style="font-size: 24px;"></div>
            </div>

            <div class="main-content">
                <div class="card">
                    <div class="label">NOMOR ANTRIAN</div>
                    <div id="angka" class="number">${nomorDipanggil}</div>
                    <div id="loketText" class="loket-box">LOKET -</div>
                </div>

                <div class="card" style="min-width: 30%;">
                    <div class="label">SISA ANTRIAN</div>
                    <div id="sisa" class="number" style="font-size: 150px; color: #e67e22;">${nomorAntrian - nomorDipanggil}</div>
                </div>
            </div>

            <div class="footer-bar">
                PT ASABRI (PERSERO) SAHABAT PERJUANGAN ANDA SEPANJANG MASA
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                
                // Update Jam Realtime
                setInterval(() => {
                    const now = new Date();
                    document.getElementById('jam').innerText = now.toLocaleTimeString('id-ID');
                }, 1000);

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

// 2. HALAMAN ADMIN (Panel Kontrol)
app.get('/admin', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:30px; background:#f4f4f4;">
            <h1>PANEL ADMIN ASABRI MALANG</h1>
            <div style="display:flex; justify-content:center; gap:20px; margin-bottom:50px;">
                <button style="padding:40px; font-size:20px; background:#2c5e9e; color:white; border-radius:15px; cursor:pointer; border:none;" onclick="panggil(1)">PANGGIL LOKET 1</button>
                <button style="padding:40px; font-size:20px; background:#2c5e9e; color:white; border-radius:15px; cursor:pointer; border:none;" onclick="panggil(2)">PANGGIL LOKET 2</button>
            </div>
            <hr>
            <button style="margin-top:50px; padding:20px; background:red; color:white; border:none; border-radius:10px; cursor:pointer;" onclick="reset()">RESET SEMUA NOMOR</button>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function panggil(n) { socket.emit('proses-panggil', n); }
                function reset() { if(confirm("Reset semua antrian?")) { socket.emit('reset-antrian'); } }
            </script>
        </body>
    `);
});

// 3. HALAMAN AMBIL NOMOR (Sesuai dengan gambar yang Bapak lampirkan)
app.get('/ambil', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    margin: 0; padding: 0; text-align:center; font-family:sans-serif; 
                    background-color: #f4f7f9; height: 100vh; display: flex; flex-direction: column;
                }
                .header-kiosk { background-color: #2c5e9e; color: white; padding: 15px; text-align: left; display: flex; align-items: center; }
                .main-kiosk { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .btn-ambil { 
                    background: white; border: 2px solid #d4af37; padding: 60px; border-radius: 30px; 
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1); cursor: pointer; 
                }
                .btn-ambil img { width: 80px; margin-bottom: 20px; }
                .btn-ambil div { font-size: 24px; font-weight: bold; color: #2c5e9e; }
                
                @media print {
                    @page { margin: 0; size: 58mm auto; }
                    body * { visibility: hidden; }
                    #cetak, #cetak * { visibility: visible; }
                    #cetak { position: absolute; left: 0; top: 0; width: 42mm; padding-left: 6mm; text-align: center; }
                    h1 { font-size: 80pt !important; margin: 5px 0 !important; }
                    .tunggu-teks { font-size: 13pt !important; font-weight: bold; }
                    .jarak-sobek { height: 25px; }
                }
            </style>
        </head>
        <body>
            <div class="header-kiosk">
                <div style="font-weight: bold; font-size: 20px;">Kantor Cabang Malang PT ASABRI (Persero)</div>
            </div>
            
            <div class="main-kiosk">
                <div class="btn-ambil" onclick="ambil()">
                    <div style="font-size: 50px;">🖨️</div>
                    <div>AMBIL NOMOR ANTREAN</div>
                    <small style="color: #888;">SENTUH DI SINI UNTUK MENCETAK</small>
                </div>
            </div>

            <div id="cetak" style="display:none; font-family: 'Courier New', monospace;">
                <h3 style="margin: 0; font-size: 16pt; font-weight: bold;">ASABRI MALANG</h3>
                <div style="border-bottom: 2px solid black; margin: 5px 0;"></div>
                <p style="font-size: 12pt;">Nomor Antrian:</p>
                <h1 id="nomor-struk">0</h1>
                <p id="jam-cetak" style="font-size: 10pt;"></p>
                <div style="border-bottom: 2px solid black; margin: 5px 0;"></div>
                <p style="font-size: 14pt; font-weight: bold;">Sisa Antrian: <span id="sisa-struk">0</span></p>
                <p class="tunggu-teks">SILAKAN MENUNGGU</p>
                <div class="jarak-sobek"></div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function ambil() { socket.emit('tambah-antrian'); }
                socket.on('siap-cetak', (data) => {
                    document.getElementById('nomor-struk').innerText = data.nomor;
                    document.getElementById('sisa-struk').innerText = data.total - data.dipanggil;
                    document.getElementById('jam-cetak').innerText = new Date().toLocaleString('id-ID');
                    document.getElementById('cetak').style.display = 'block';
                    setTimeout(() => { window.print(); document.getElementById('cetak').style.display = 'none'; }, 500);
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
        socket.emit('siap-cetak', { nomor: nomorAntrian, total: nomorAntrian, dipanggil: nomorDipanggil });
    });
    socket.on('proses-panggil', (n) => {
        if (nomorDipanggil < nomorAntrian) {
            nomorDipanggil++;
            io.emit('update-layar', { total: nomorAntrian, dipanggil: nomorDipanggil, loket: n, isPanggil: true });
        }
    });
    socket.on('reset-antrian', () => { nomorAntrian = 0; nomorDipanggil = 0; io.emit('reset-layar'); });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => { console.log('Server Running...'); });