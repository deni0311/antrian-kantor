const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let antri = 0, panggil = 0;

app.get('/tv', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>DISPLAY ASABRI</title></head>
    <body style="margin:0; padding:0; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; overflow:hidden;">
        
        <div style="background:#2c5e9e; color:white; padding:15px 40px; display:flex; justify-content:space-between; align-items:center; border-bottom:6px solid #d4af37;">
            <div><h1 style="margin:0; font-size:30px;">PT ASABRI (PERSERO)</h1><small>KC MALANG</small></div>
            <div id="jam" style="font-size:38px; font-weight:bold; font-family:monospace; background:rgba(0,0,0,0.3); padding:10px 25px; border-radius:12px; border:2px solid #d4af37;">00:00:00</div>
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
                PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LAYANAN PRIMA UNTUK TNI, POLRI, DAN ASN KEMHAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PT ASABRI (PERSERO) - CABANG MALANG
            </div>
        </div>

        <script src="/socket.io/socket.io.js"></script>
        <script>
            const s = io();
            function updateJam() {
                const d = new Date();
                const h = String(d.getHours()).padStart(2,'0');
                const m = String(d.getMinutes()).padStart(2,'0');
                const sec = String(d.getSeconds()).padStart(2,'0');
                document.getElementById('jam').innerText = h + ":" + m + ":" + sec;
            }
            setInterval(updateJam, 1000); updateJam();

            s.on('update-layar', (d) => {
                document.getElementById('s').innerText = d.total - d.dipanggil;
                if(d.isP) {
                    document.getElementById('a').innerText = d.dipanggil;
                    document.getElementById('l').innerText = "LOKET " + d.loket;
                    const u = new SpeechSynthesisUtterance("Nomor antrian " + d.dipanggil + " menuju loket " + d.loket);
                    u.lang = 'id-ID'; window.speechSynthesis.speak(u);
                }
            });
            s.on('reset-layar', () => location.reload());
        </script>
    </body></html>`);
});

app.get('/admin', (req, res) => {
    res.send(`<body style="text-align:center;padding-top:50px;background:#f0f2f5;font-family:sans-serif;"><h1>PANEL ADMIN ASABRI</h1><div style="margin:40px 0;"><button style="padding:40px 60px;font-size:24px;background:#2c5e9e;color:white;border-radius:20px;cursor:pointer;border:none;" onclick="io().emit('proses-panggil',1)">LOKET 1</button><button style="padding:40px 60px;font-size:24px;background:#e67e22;color:white;border-radius:20px;cursor:pointer;border:none;margin-left:20px;" onclick="io().emit('proses-panggil',2)">LOKET 2</button></div><hr><button style="margin-top:50px;padding:20px;background:#d9534f;color:white;border:none;border-radius:10px;cursor:pointer;" onclick="if(confirm('Reset?'))io().emit('reset-antrian')">RESET NOMOR</button><script src="/socket.io/socket.io.js"></script></body>`);
});

app.get('/ambil', (req, res) => {
    res.send(`<!DOCTYPE html><html><body style="text-align:center;padding-top:100px;font-family:sans-serif;background:#f4f7f9;">
        <div style="background:#2c5e9e;color:white;padding:25px;position:fixed;top:0;width:100%;text-align:left;font-weight:bold;font-size:24px;border-bottom:5px solid #d4af37;">PT ASABRI (PERSERO) MALANG</div>
        <div style="background:white;border:3px solid #d4af37;padding:70px;border-radius:40px;display:inline-block;box-shadow:0 15px 30px rgba(0,0,0,0.1);cursor:pointer;" onclick="s.emit('tambah-antrian')">
            <div style="font-size:100px;">🖨️</div>
            <div style="font-size:30px;font-weight:bold;color:#2c5e9e;margin-top:20px;">AMBIL NOMOR ANTRIAN</div>
        </div>
        <div id="p" style="display:none;font-family:monospace;width:42mm;text-align:center;">
            <h3>ASABRI MALANG</h3><hr><p>Nomor Antrian:</p><h1 id="n" style="font-size:60pt;margin:10px 0;">0</h1><p id="t"></p><hr><p>SILAKAN MENUNGGU</p>
        </div>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const s = io();
            s.on('siap-cetak', (d) => {
                document.getElementById('n').innerText = d.nomor;
                document.getElementById('t').innerText = new Date().toLocaleString('id-ID');
                document.getElementById('p').style.display = 'block';
                window.print(); document.getElementById('p').style.display = 'none';
            });
        </script></body></html>`);
});

io.on('connection', (s) => {
    s.on('tambah-antrian', () => { antri++; io.emit('update-layar', { total: antri, dipanggil: panggil, isP: false }); s.emit('siap-cetak', { nomor: antri }); });
    s.on('proses-panggil', (n) => { if (panggil < antri) { panggil++; io.emit('update-layar', { total: antri, dipanggil: panggil, loket: n, isP: true }); } });
    s.on('reset-antrian', () => { antri = 0; panggil = 0; io.emit('reset-layar'); });
});

server.listen(process.env.PORT || 3000, () => { console.log('Running...'); });