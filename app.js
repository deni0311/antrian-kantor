const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0, nomorDipanggil = 0;

// 1. HALAMAN TV
app.get('/tv', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>Display ASABRI</title><style>
        body { margin:0; padding:0; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
        .header { background:#2c5e9e; color:white; padding:15px 40px; display:flex; justify-content:space-between; align-items:center; border-bottom:6px solid #d4af37; }
        .main { flex:1; display:flex; justify-content:space-around; align-items:center; padding:20px; }
        .card { background:white; border-radius:30px; box-shadow:0 15px 40px rgba(0,0,0,0.15); padding:50px; text-align:center; min-width:45%; border:1px solid #ddd; }
        .num { font-size:280px; font-weight:bold; color:#2c5e9e; margin:0; line-height:0.8; }
        .loket { background:#d4af37; color:white; font-size:70px; padding:15px 50px; border-radius:20px; margin-top:30px; display:inline-block; font-weight:bold; }
        .footer { background:#2c5e9e; color:white; padding:15px 0; border-top:5px solid #d4af37; overflow:hidden; }
        .marquee { display:inline-block; white-space:nowrap; font-size:24px; font-weight:bold; animation:scroll 20s linear infinite; }
        @keyframes scroll { from { transform:translateX(100%); } to { transform:translateX(-100%); } }
    </style></head><body>
        <div class="header"><div><h1>PT ASABRI (PERSERO)</h1><small>KC Malang</small></div><div id="jam" style="font-size:32px; font-weight:bold; font-family:monospace; background:rgba(0,0,0,0.2); padding:10px 20px; border-radius:10px;">00:00:00</div></div>
        <div class="main">
            <div class="card"><div style="font-size:35px; font-weight:bold;">NOMOR ANTRIAN</div><div id="angka" class="num">${nomorDipanggil}</div><div id="lkt" class="loket">LOKET -</div></div>
            <div class="card" style="min-width:35%;"><div style="font-size:35px; font-weight:bold; color:#e67e22;">SISA</div><div id="sisa" class="num" style="color:#e67e22; font-size:180px;">${nomorAntrian - nomorDipanggil}</div></div>
        </div>
        <div class="footer"><div class="marquee">PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; LAYANAN PRIMA UNTUK TNI, POLRI, DAN ASN KEMHAN</div></div>
        <script src="/socket.io/socket.io.js"></script><script>
            const socket = io();
            setInterval(() => { const n = new Date(); document.getElementById('jam').innerText = n.getHours().toString().padStart(2,'0')+":"+n.getMinutes().toString().padStart(2,'0')+":"+n.getSeconds().toString().padStart(2,'0'); }, 1000);
            socket.on('update-layar', (d) => {
                document.getElementById('sisa').innerText = d.total - d.dipanggil;
                if(d.isPanggil) {
                    document.getElementById('angka').innerText = d.dipanggil;
                    document.getElementById('lkt').innerText = "LOKET " + d.loket;
                    const sp = new SpeechSynthesisUtterance("Nomor antrian " + d.dipanggil + " ke loket " + d.loket);
                    sp.lang = 'id-ID'; window.speechSynthesis.speak(sp);
                }
            });
            socket.on('reset-layar', () => location.reload());
        </script></body></html>`);
});

// 2. HALAMAN ADMIN
app.get('/admin', (req, res) => {
    res.send(`<body style="text-align:center; font-family:sans-serif; padding-top:50px; background:#f0f2f5;">
        <h1>PANEL ADMIN ASABRI</h1>
        <button style="padding:40px; font-size:24px; background:#2c5e9e; color:white; border-radius:20px; cursor:pointer;" onclick="s.emit('proses-panggil', 1)">LOKET 1</button>
        <button style="padding:40px; font-size:24px; background:#e67e22; color:white; border-radius:20px; cursor:pointer;" onclick="s.emit('proses-panggil', 2)">LOKET 2</button>
        <br><br><button style="background:red; color:white; padding:15px;" onclick="if(confirm('Reset?')) s.emit('reset-antrian')">RESET</button>
        <script src="/socket.io/socket.io.js"></script><script>const s = io();</script></body>`);
});

// 3. HALAMAN AMBIL NOMOR
app.get('/ambil', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><style>
        body { margin:0; text-align:center; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; }
        .btn { background:white; border:3px solid #d4af37; padding:70px; border-radius:40px; box-shadow:0 15px 30px rgba(0,0,0,0.1); cursor:pointer; margin:auto; }
        @media print { body * { visibility:hidden; } #p, #p * { visibility:visible; } #p { position:absolute; left:0; top:0; width:42mm; text-align:center; } }
    </style></head><body>
        <div style="background:#2c5e9e; color:white; padding:20px; text-align:left; border-bottom:5px solid #d4af37;">PT ASABRI (PERSERO) - Cabang Malang</div>
        <div class="btn" onclick="s.emit('tambah-antrian')"><div style="font-size:80px;">🖨️</div><div style="font-size:30px; font-weight:bold; color:#2c5e9e;">AMBIL NOMOR</div></div>
        <div id="p" style="display:none; font-family:monospace;">
            <h3>ASABRI MALANG</h3><hr>
            <p>Nomor Antrian:</p><h1 id="n" style="font-size:60pt; margin:10px 0;">0</h1>
            <p id="t"></p><hr>
            <p style="font-weight:bold;">SISA: <span id="s">0</span></p>
            <p>SILAKAN MENUNGGU</p>
        </div>
        <script src="/socket.io/socket.io.js"></script><script>
            const s = io();
            s.on('siap-cetak', (d) => {
                document.getElementById('n').innerText = d.nomor;
                document.getElementById('s').innerText = d.total - d.dipanggil;
                document.getElementById('t').innerText = new Date().toLocaleString('id-ID');
                document.getElementById('p').style.display = 'block';
                setTimeout(() => { window.print(); document.getElementById('p').style.display = 'none'; }, 500);
            });
            s.on('reset-layar', () => location.reload());
        </script></body></html>`);
});

// 4. LOGIKA SERVER
io.on('connection', (s) => {
    s.on('tambah-antrian', () => { nomorAntrian++; io.emit('update-layar', { total: nomorAntrian, dipanggil: nomorDipanggil, isPanggil: false }); s.emit('siap-cetak', { nomor: nomorAntrian, total: nomorAntrian, dipanggil: nomorDipanggil }); });
    s.on('proses-panggil', (n) => { if (nomorDipanggil < nomorAntrian) { nomorDipanggil++; io.emit('update-layar', { total: nomorAntrian, dipanggil: nomorDipanggil, loket: n, isPanggil: true }); } });
    s.on('reset-antrian', () => { nomorAntrian = 0; nomorDipanggil = 0; io.emit('reset-layar'); });
});

server.listen(process.env.PORT || 3000, () => console.log('Ready'));