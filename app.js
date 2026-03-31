const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let antri = 0, panggil = 0;

// Format Jam untuk dimasukkan ke script browser
const scriptJam = `
    function up() { 
        const d = new Date(); 
        const h = String(d.getHours()).padStart(2,'0');
        const m = String(d.getMinutes()).padStart(2,'0');
        const s = String(d.getSeconds()).padStart(2,'0');
        document.getElementById('jam').innerText = h + ":" + m + ":" + s; 
    }
    setInterval(up, 1000); up();
`;

// 1. HALAMAN TV
app.get('/tv', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>DISPLAY ASABRI</title></head>
    <body style="margin:0; padding:0; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; overflow:hidden;">
        <div style="background:#2c5e9e; color:white; padding:15px 40px; display:flex; justify-content:space-between; align-items:center; border-bottom:6px solid #d4af37;">
            <div>
                <h1 style="margin:0; font-size:35px; letter-spacing:1px;">PT ASABRI (PERSERO)</h1>
                <div style="font-size:20px; font-weight:bold; margin-top:2px; opacity:0.9;">CABANG MALANG</div>
            </div>
            <div id="jam" style="font-size:45px; font-weight:bold; font-family:monospace; background:rgba(0,0,0,0.3); padding:8px 25px; border-radius:12px; border:2px solid #d4af37;">00:00:00</div>
        </div>
        <div style="flex:1; display:flex; justify-content:space-around; align-items:center; padding:20px;">
            <div style="background:white; border-radius:30px; box-shadow:0 15px 40px rgba(0,0,0,0.2); padding:50px; text-align:center; min-width:45%;">
                <div style="font-size:40px; font-weight:bold; color:#444;">NOMOR ANTRIAN</div>
                <div id="a" style="font-size:280px; font-weight:bold; color:#2c5e9e; margin:0; line-height:0.8;">${panggil}</div>
                <div id="l" style="background:#d4af37; color:white; font-size:80px; padding:15px 50px; border-radius:20px; margin-top:35px; display:inline-block; font-weight:bold;">LOKET -</div>
            </div>
            <div style="background:white; border-radius:30px; box-shadow:0 15px 40px rgba(0,0,0,0.2); padding:50px; text-align:center; min-width:35%;">
                <div style="font-size:40px; font-weight:bold; color:#e67e22;">SISA ANTRIAN</div>
                <div id="s" style="font-size:200px; font-weight:bold; color:#e67e22;">${antri - panggil}</div>
            </div>
        </div>
        <div style="background:#2c5e9e; color:white; padding:20px 0; border-top:6px solid #d4af37; overflow:hidden; position:relative;">
            <div style="display:inline-block; white-space:nowrap; font-size:26px; font-weight:bold; animation:jalan 25s linear infinite;">
                <style>@keyframes jalan { from { transform:translateX(100%); } to { transform:translateX(-100%); } }</style>
                PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LAYANAN PRIMA UNTUK TNI, POLRI, DAN ASN KEMHAN
            </div>
        </div>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const s = io();
            ${scriptJam}
            s.on('update-layar', (d) => {
                document.getElementById('s').innerText = d.total - d.dipanggil;
                if(d.isP) {
                    document.getElementById('a').innerText = d.dipanggil;
                    document.getElementById('l').innerText = "LOKET " + d.loket;
                }
            });
            s.on('reset-layar', () => location.reload());
        </script>
    </body></html>`);
});

// 2. HALAMAN AMBIL NOMOR
app.get('/ambil', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>AMBIL ANTRIAN</title></head>
    <body style="margin:0; padding:0; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; overflow:hidden;">
        <div style="background:#2c5e9e; color:white; padding:15px 40px; display:flex; justify-content:space-between; align-items:center; border-bottom:6px solid #d4af37;">
            <div>
                <h1 style="margin:0; font-size:35px; letter-spacing:1px;">PT ASABRI (PERSERO)</h1>
                <div style="font-size:20px; font-weight:bold; margin-top:2px; opacity:0.9;">CABANG MALANG</div>
            </div>
            <div id="jam" style="font-size:45px; font-weight:bold; font-family:monospace; background:rgba(0,0,0,0.3); padding:8px 25px; border-radius:12px; border:2px solid #d4af37;">00:00:00</div>
        </div>
        <div style="flex:1; display:flex; justify-content:center; align-items:center;">
            <div style="background:white; border:3px solid #d4af37; padding:80px; border-radius:40px; text-align:center; box-shadow:0 15px 30px rgba(0,0,0,0.1); cursor:pointer;" onclick="s.emit('tambah-antrian')">
                <div style="font-size:120px;">🖨️</div>
                <div style="font-size:35px; font-weight:bold; color:#2c5e9e; margin-top:20px;">SENTUH UNTUK AMBIL NOMOR</div>
            </div>
        </div>
        <div style="background:#2c5e9e; color:white; padding:20px 0; border-top:6px solid #d4af37; overflow:hidden; position:relative;">
            <div style="display:inline-block; white-space:nowrap; font-size:26px; font-weight:bold; animation:jalan 25s linear infinite;">
                <style>@keyframes jalan { from { transform:translateX(100%); } to { transform:translateX(-100%); } }</style>
                PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PT ASABRI (PERSERO) CABANG MALANG
            </div>
        </div>
        <div id="p" style="display:none; font-family:monospace; width:42mm; text-align:center;">
            <h3>ASABRI MALANG</h3><hr><h1 id="n" style="font-size:60pt; margin:10px 0;">0</h1><p id="t"></p><hr><p>SILAKAN MENUNGGU</p>
        </div>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const s = io();
            ${scriptJam}
            s.on('siap-cetak', (d) => {
                document.getElementById('n').innerText = d.nomor;
                document.getElementById('t').innerText = new Date().toLocaleString('id-ID');
                document.getElementById('p').style.display = 'block';
                window.print(); document.getElementById('p').style.display = 'none';
            });
        </script>
    </body></html>`);
});

// 3. ADMIN PANEL
app.get('/admin', (req, res) => {
    res.send(`<body style="text-align:center;padding-top:50px;background:#f0f2f5;font-family:sans-serif;"><h1>PANEL ADMIN</h1><button style="padding:40px;font-size:24px;background:#2c5e9e;color:white;border:none;border-radius:20px;cursor:pointer;" onclick="io().emit('proses-panggil',1)">LOKET 1</button><button style="padding:40px;font-size:24px;background:#e67e22;color:white;border:none;border-radius:20px;cursor:pointer;margin-left:20px;" onclick="io().emit('proses-panggil',2)">LOKET 2</button><br><br><button onclick="if(confirm('Reset?'))io().emit('reset-antrian')">RESET</button><script src="/socket.io/socket.io.js"></script></body>`);
});

io.on('connection', (s) => {
    s.on('tambah-antrian', () => { antri++; io.emit('update-layar', { total: antri, dipanggil: panggil, isP: false }); s.emit('siap-cetak', { nomor: antri }); });
    s.on('proses-panggil', (n) => { if (panggil < antri) { panggil++; io.emit('update-layar', { total: antri, dipanggil: panggil, loket: n, isP: true }); } });
    s.on('reset-antrian', () => { antri = 0; panggil = 0; io.emit('reset-layar'); });
});

server.listen(process.env.PORT || 3000, () => { console.log('Server running...'); });