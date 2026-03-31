const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0; 
let nomorDipanggil = 0; 

// 1. HALAMAN TV (DENGAN JAM & RUNNING TEXT)
app.get('/tv', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Display Antrian ASABRI Malang</title>
            <style>
                body {
                    margin: 0; padding: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f7f9;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                /* Header Utama */
                .header {
                    background-color: #2c5e9e;
                    color: white;
                    padding: 15px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 6px solid #d4af37;
                }
                .header-title h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
                
                /* Jam Pojok Kanan Atas */
                #clock {
                    font-size: 36px;
                    font-weight: bold;
                    font-family: 'Courier New', monospace;
                    background: rgba(0,0,0,0.2);
                    padding: 8px 20px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.3);
                }

                .main-content {
                    flex: 1;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 20px;
                }
                
                .card {
                    background: white;
                    border-radius: 30px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                    padding: 50px;
                    text-align: center;
                    min-width: 45%;
                    border: 1px solid #ddd;
                }
                
                .label { font-size: 38px; color: #444; font-weight: bold; margin-bottom: 10px; }
                .number { font-size: 300px; font-weight: bold; color: #2c5e9e; margin: 0; line-height: 0.8; }
                
                .loket-box {
                    background-color: #d4af37;
                    color: white;
                    font-size: 80px;
                    padding: 15px 50px;
                    border-radius: 20px;
                    margin-top: 35px;
                    display: inline-block;
                    font-weight: bold;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                /* Footer Running Text */
                .footer-container {
                    background-color: #2c5e9e;
                    color: white;
                    padding: 18px 0;
                    border-top: 5px solid #d4af37;
                    overflow: hidden;
                    position: relative;
                }
                .marquee {
                    display: inline-block;
                    white-space: nowrap;
                    font-size: 24px;
                    font-weight: bold;
                    animation: scroll 25s linear infinite;
                }
                @keyframes scroll {
                    from { transform: translateX(100%); }
                    to { transform: translateX(-100%); }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="header-title">
                    <h1>PT ASABRI (PERSERO)</h1>
                    <span style="font-size: 18px; opacity: 0.9;">Kantor Cabang Malang</span>
                </div>
                <div id="clock">00:00:00</div>
            </div>

            <div class="main-content">
                <div class="card">
                    <div class="label">NOMOR ANTRIAN</div>
                    <div id="angka" class="number">${nomorDipanggil}</div>
                    <div id="loketText" class="loket-box">LOKET -</div>
                </div>

                <div class="card" style="min-width: 35%;">
                    <div class="label" style="color: #e67e22;">SISA ANTRIAN</div>
                    <div id="sisa" class="number" style="font-size: 200px; color: #e67e22;">${nomorAntrian - nomorDipanggil}</div>
                </div>
            </div>

            <div class="footer-container">
                <div class="marquee">
                    PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LAYANAN TERBAIK UNTUK TNI, POLRI, DAN ASN KEMHAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA
                </div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();

                // Fungsi Jam hh:mm:ss
                function updateClock() {
                    const now = new Date();
                    const h = String(now.getHours()).padStart(2, '0');
                    const m = String(now.getMinutes()).padStart(2, '0');
                    const s = String(now.getSeconds()).padStart(2, '0');
                    document.getElementById('clock').innerText = h + ":" + m + ":" + s;
                }
                setInterval(updateClock, 1000);
                updateClock();

                socket.on('update-layar', (data) => {
                    document.getElementById('sisa').innerText = data.total - data.dipanggil;
                    if(data.isPanggil) {
                        document.getElementById('angka').innerText = data.dipanggil;
                        document.getElementById('loketText').innerText = "LOKET " + data.loket;
                        const msg = new SpeechSynthesisUtterance("Nomor antrian " + data.dipanggil + " menuju loket " + data.loket);
                        msg.lang = 'id-ID';
                        window.speechSynthesis.speak(msg);
                    }
                });
                socket.on('reset-layar', () => { location.reload(); });
            </script>
        </body>
        </html>
    `);
});

// 2. HALAMAN ADMIN (Panggil & Reset)
app.get('/admin', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:50px; background:#f0f2f5;">
            <h1 style="color:#2c5e9e;">PANEL ADMIN ASABRI MALANG</h1>
            <div style="margin: 40px 0;">
                <button style="padding:40px 60px; font-size:24px; background:#2c5e9e; color:white; border:none; border-radius:20px; cursor:pointer;" onclick="panggil(1)">PANGGIL LOKET 1</button>
                <button style="padding:40px 60px; font-size:24px; background:#e67e22; color:white; border:none; border-radius:20px; cursor:pointer; margin-left:20px;" onclick="panggil(2)">PANGGIL LOKET 2</button>
            </div>
            <hr style="width:80%; opacity:0.3;">
            <button style="margin-top:50px; padding:20px 40px; background:#d9534f; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold;" onclick="reset()">RESET SEMUA NOMOR</button>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function panggil(n) { socket.emit('proses-panggil', n); }
                function reset() { if(confirm("Yakin ingin reset semua antrian ke nol?")) { socket.emit('reset-antrian'); } }
            </script>
        </body>
    `);
});

// 3. HALAMAN AMBIL NOMOR (KIOSK)
app.get('/ambil', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; text-align:center; font-family:sans-serif; background-color: #f4f7f9; height: 100vh; display: flex; flex-direction: column; }
                .header-k { background-color: #2c5e9e; color: white; padding: 25px; text-align: left; border-bottom: 5px solid #d4af37; }
                .main-k { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .btn-c { background: white; border: 3px solid #d4af37; padding: 70px 100px; border-radius: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); cursor: pointer; }
                .btn-c:active { transform: scale(0.98); }
                @media print {
                    @page { margin: 0; size: 58mm auto; }
                    body * { visibility: hidden; }
                    #cetak, #cetak * { visibility: visible; }
                    #cetak { position: absolute; left: 0; top: 0; width: 42mm; padding-left: 6mm; text-align: center; }
                    h1 { font-size: 80pt !important; margin: 5px 0 !important; }
                    .jarak-sobek { height: 25px; }
                }
            </style>
        </head>
        <body>
            <div class="header-k">
                <div style="font-weight: bold; font-size: 26px;">PT ASABRI (PERSERO) - Cabang Malang</div>
            </div>
            <div class="main-k">
                <div class="btn-c" onclick="ambil()">
                    <div style="font-size: 100px;">🖨️</div>
                    <div style="font-size: 36px; font-weight: bold; color: #2c5e9e; margin-top:20px;">AMBIL NOMOR ANTREAN</div>
                    <div style="color: #888; font-size: 20px; margin-top: 10px;">SENTUH DI SINI UNTUK MENCETAK</div>
                </div>
            </div>
            <div id="cetak" style="display:none; font-family: 'Courier New', monospace;">
                <h3 style="margin: 0; font-size: 16pt; font-weight: bold;">ASABRI MALANG</h3>
                <div style="border-bottom: 2px solid