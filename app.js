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
        <head>
            <title>Display Antrian ASABRI Malang</title>
            <style>
                body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f4f7f9; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
                .header { background-color: #2c5e9e; color: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #d4af37; }
                .main-content { flex: 1; display: flex; justify-content: space-around; align-items: center; padding: 20px; }
                .card { background: white; border-radius: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); padding: 50px; text-align: center; min-width: 45%; }
                .label { font-size: 35px; color: #555; font-weight: bold; }
                .number { font-size: 280px; font-weight: bold; color: #2c5e9e; margin: 0; line-height: 0.9; }
                .loket-box { background-color: #d4af37; color: white; font-size: 70px; padding: 15px 40px; border-radius: 20px; margin-top: 30px; display: inline-block; font-weight: bold; }
                .footer-running-text { background-color: #2c5e9e; color: white; padding: 15px 0; overflow: hidden; white-space: nowrap; font-size: 22px; font-weight: bold; border-top: 3px solid #d4af37; }
                .marquee { display: inline-block; padding-left: 100%; animation: marquee 20s linear infinite; }
                @keyframes marquee { 0% { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
            </style>
        </head>
        <body>
            <div class="header">
                <div><h1>PT ASABRI (PERSERO)</h1><small>Kantor Cabang Malang</small></div>
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
                <div class="marquee">PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LAYANAN PRIMA UNTUK PENSIUNAN TNI, POLRI, DAN ASN KEMHAN</div>
            </div>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
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

// 2. HALAMAN ADMIN
app.get('/admin', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:30px; background:#f4f4f4;">
            <h1>PANEL ADMIN ASABRI MALANG</h1>
            <button style="padding:40px; font-size:20px; background:#2c5e9e; color:white; border-radius:15px;" onclick="panggil(1)">PANGGIL LOKET 1</button>
            <button style="padding:40px; font-size:20px; background:#2c5e9e; color:white; border-radius:15px;" onclick="panggil(2)">PANGGIL LOKET 2</button>
            <br><br>
            <button style="margin-top:50px; padding:20px; background:red; color:white; border:none; border-radius:10px;" onclick="reset()">RESET NOMOR</button>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function panggil(n) { socket.emit('proses-panggil', n); }
                function reset() { if(confirm("Reset ke 0?")) { socket.emit('reset-antrian'); } }
            </script>
        </body>
    `);
});

// 3. HALAMAN AMBIL NOMOR
app.get('/ambil', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; text-align:center; font-family:sans-serif; background-color: #f4f7f9; height: 100vh; display: flex; flex-direction: column; }
                .header-kiosk { background-color: #2c5e9e; color: white; padding: 20px; text-align: left; border-bottom: 5px solid #d4af37;}
                .main-kiosk { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .btn-ambil { background: white; border: 3px solid #d4af37; padding: 80px; border-radius: 40px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); cursor: pointer; }
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
            <div class="header-kiosk"><div style="font-weight: bold; font-size: 24px;">PT ASABRI (PERSERO) - Cabang Malang</div></div>
            <div class="main-kiosk"><div class="btn-ambil" onclick="ambil()"><div style="font-size: 80px;">🖨️</div><div style="font-size:32px; color:#2c5e9e; font-weight:bold;">AMBIL NOMOR ANTREAN</div></div></div>
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