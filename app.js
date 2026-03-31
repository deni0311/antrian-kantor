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
                /* Header */
                .header {
                    background-color: #2c5e9e;
                    color: white;
                    padding: 15px 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 5px solid #d4af37;
                }
                .header h1 { margin: 0; font-size: 24px; }
                
                /* Konten Utama */
                .main-content {
                    flex: 1;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 20px;
                }
                .card {
                    background: white;
                    border-radius: 25px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    padding: 50px;
                    text-align: center;
                    min-width: 45%;
                }
                .label { font-size: 35px; color: #555; font-weight: bold; margin-bottom: 10px; }
                .number { font-size: 280px; font-weight: bold; color: #2c5e9e; margin: 0; line-height: 0.9; }
                .loket-box {
                    background-color: #d4af37;
                    color: white;
                    font-size: 70px;
                    padding: 15px 40px;
                    border-radius: 20px;
                    margin-top: 30px;
                    display: inline-block;
                    font-weight: bold;
                }

                /* Running Text Bar */
                .footer-running-text {
                    background-color: #2c5e9e;
                    color: white;
                    padding: 15px 0;
                    overflow: hidden;
                    white-space: nowrap;
                    font-size: 22px;
                    font-weight: bold;
                    border-top: 3px solid #d4af37;
                }
                .marquee {
                    display: inline-block;
                    padding-left: 100%;
                    animation: marquee 20s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-100%, 0); }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>PT ASABRI (PERSERO)</h1>
                    <small>Kantor Cabang Malang</small>
                </div>
                <div id="jam" style="font-size: 32px; font-weight: bold; font-family: monospace; background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 10px;">00:00:00</div>
            </div>

            <div class="main-content">
                <div class="card">
                    <div class="label">ANTRIAN SEKARANG</div>
                    <div id="angka" class="number">${nomorDipanggil}</div>
                    <div id="loketText" class="loket-box">LOKET -</div>
                </div>

                <div class="card" style="min-width: 35%;">
                    <div class="label">SISA ANTRIAN</div>
                    <div id="sisa" class="number" style="font-size: 180px; color: #e67e22;">${nomorAntrian - nomorDipanggil}</div>
                </div>
            </div>

            <div class="footer-running-text">
                <div class="marquee">
                    PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LAYANAN PRIMA UNTUK PENSIUNAN TNI, POLRI, DAN ASN KEMHAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA
                </div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                
                // Fungsi Jam Digital hh:mm:ss
                function updateTime() {
                    const now = new Date();
                    const h = String(now.getHours()).padStart(2, '0');
                    const m = String(now.getMinutes()).padStart(2, '0');
                    const s = String(now.getSeconds()).padStart(2, '0');
                    document.getElementById('jam').innerText = h + ":" + m + ":" + s;
                }
                setInterval(updateTime, 1000);
                updateTime();

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
                function reset() { if(confirm("Yakin ingin reset semua antrian ke 0?")) { socket.emit('reset-antrian'); } }
            </script>
        </body>
    `);
});

// 3. HALAMAN AMBIL NOMOR (Kiosk)
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
                .header-kiosk { background-color: #2c5e9e; color: white; padding: 20px; text-align: left; border-bottom: 5px solid #d4af37;}
                .main-kiosk { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .btn-ambil { 
                    background: white; border: 3px solid #d4af37; padding: 80px; border-radius: 40px; 
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1); cursor: pointer; transition: 0.3s;
                }
                .btn-ambil:active { transform: scale(0.95); }
                .btn-title { font-size: 32px; font-weight: bold; color: #2c5e9e; margin-top: 20px; }
                
                @media print {
                    @page { margin: 0; size: 58mm auto; }
                    body * { visibility: hidden; }
                    #cetak, #cetak * { visibility: visible; }
                    #cetak { position: absolute; left: 0; top: 0; width: 42mm; padding-left: 6mm; text-align: center; }
                    h1 { font-size: 80pt !important; margin: