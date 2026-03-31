const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let antri = 0, panggil = 0;

// HALAMAN TV
app.get('/tv', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><style>
        body { margin:0; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
        .header { background:#2c5e9e; color:white; padding:15px 30px; display:flex; justify-content:space-between; align-items:center; border-bottom:5px solid #d4af37; }
        .main { flex:1; display:flex; justify-content:space-around; align-items:center; }
        .card { background:white; border-radius:25px; box-shadow:0 10px 30px rgba(0,0,0,0.1); padding:40px; text-align:center; min-width:40%; }
        .big { font-size:250px; font-weight:bold; color:#2c5e9e; line-height:0.8; margin:20px 0; }
        .footer { background:#2c5e9e; color:white; padding:12px 0; border-top:4px solid #d4af37; }
        .marquee { display:inline-block; white-space:nowrap; font-size:22px; font-weight:bold; animation:m 20s linear infinite; }
        @keyframes m { from { transform:translateX(100%); } to { transform:translateX(-100%); } }
    </style></head><body>
        <div class="header">
            <div><h2 style="margin:0">PT ASABRI (PERSERO)</h2><small>KC MALANG</small></div>
            <div id="jam" style="font-size:30px; font-weight:bold; background:rgba(0,0,0,0.2); padding:5px 15px; border-radius:8px;">00:00:00</div>
        </div>
        <div class="main">
            <div class="card"><h3>ANTRIAN SEKARANG</h3><div id="a" class="big">${panggil}</div><div id="l" style="background:#d4af37; color:white; font-size:60px; padding:10px; border-radius:15px;">LOKET -</div></div>
            <div class="card"><h3>SISA ANTRIAN</h3><div id="s" class="big" style="color:#e67e22;">${antri - panggil}</div></div>
        </div>
        <div class="footer"><div class="marquee">PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; LAYANAN PRIMA UNTUK TNI, POLRI, DAN ASN KEMHAN</div></div>
        <script src="/socket.io/socket.io.js"></script><script>
            const s = io();
            setInterval(() => { const d = new Date(); document.getElementById('jam').innerText = d.toLocaleTimeString('id-ID'); }, 1000);
            s.on('update-layar', (d) => {
                document.getElementById('s').innerText = d.total - d.dipanggil;
                if(d.isP) {
                    document.getElementById('a').innerText = d.dipanggil;
                    document.getElementById('l').innerText = "LOKET " + d.loket;
                    const u = new SpeechSynthesisUtterance("Nomor " + d.dipanggil + " ke loket " + d.loket);
                    u.lang = 'id-ID'; window.speechSynthesis.speak(u);
                }
            });
            s.on('reset-layar', () => location.reload());
        </script></body></html>`);
});

// HALAMAN ADMIN & AMBIL
app.get('/admin', (req, res) => {
    res.send(`<body style="text-align:center;padding-top:50px"><h1>ADMIN ASABRI</h1><button style="padding:30px;font-size:20px" onclick="io().emit('proses-panggil',1)">LOKET 1</button><button style="padding:30px;font-size:20px" onclick="io().emit('proses-panggil',2)">LOKET 2</button><br><br><button onclick="io().emit('reset-antrian')">RESET</button><script src="/socket.io/socket.io.js"></script></body>`);
});

app.get('/ambil', (req, res) => {
    res.send(`<!DOCTYPE html><html><body style="text-align:center;padding-top:100px;font-family:sans-serif">
        <div style="background:#2c5e9e;color:white;padding:20px;position:fixed;top:0;width:100%">PT ASABRI (PERSERO) MALANG</div>
        <button style="padding:50px;font-size:30px;border:3px solid #d4af37;border-radius:20px" onclick="s.emit('tambah-antrian')">🖨️ AMBIL NOMOR</button>
        <div id="p" style="display:none;font-family:monospace"><h3>ASABRI MALANG</h3><hr><h1 id="n" style="font-size:60pt">0</h1><p id="t"></p><hr><p>SILAKAN MENUNGGU</p></div>
        <script src="/socket.io/socket.io.js"></script><script>
            const s = io();
            s.on('siap-cetak', (d) => {
                document.getElementById('n').innerText = d.nomor;
                document.getElementById('t').innerText = new Date().toLocaleString('id-ID');
                document.getElementById('p').style.display = 'block';
                window.print();
                document.getElementById('p').style.display = 'none';
            });
        </script></body></html>`);
});

// LOGIKA
io.on('connection', (s) => {
    s.on('tambah-antrian', () => { antri++; io.emit('update-layar', { total: antri, dipanggil: panggil, isP: false }); s.emit('siap-cetak', { nomor: antri }); });
    s.on('proses-panggil', (n) => { if (panggil < antri) { panggil++; io.emit('update-layar', { total: antri, dipanggil: panggil, loket: n, isP: true }); } });
    s.on('reset-antrian', () => { antri = 0; panggil = 0; io.emit('reset-layar'); });
});

server.listen(process.env.PORT || 3000);