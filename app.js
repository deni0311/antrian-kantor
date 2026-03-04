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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* Gaya untuk tampilan di Tablet */
                body { text-align:center; font-family:sans-serif; background:#e3f2fd; padding-top:50px; }
                .btn-ambil { padding:50px; font-size:30px; background:blue; color:white; border-radius:20px; cursor:pointer; }
                
                /* Gaya khusus untuk cetak struk */
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    #cetak, #cetak * { visibility: visible; }
                    #cetak { 
                        position: absolute; left: 0; top: 0; 
                        width: 54mm; /* Sesuaikan sedikit lebih kecil dari 58mm agar tidak terpotong */
                        padding: 2mm;
                        background: white;
                    }
                    .jarak-potong { height: 50px; } /* Memberi ruang agar teks terakhir tidak kena sobekan */
                }
            </style>
        </head>
        <body>
            <div id="konten-layar">
                <h1>ASABRI MALANG</h1>
                <button class="btn-ambil" onclick="ambil()">AMBIL NOMOR</button>
            </div>

            <div id="cetak" style="display:none; text-align:center; font-family: 'Courier New', Courier, monospace;">
                <h3 style="margin:0; font-size:16px;">ASABRI MALANG</h3>
                <p style="margin:0;">-----------------------</p>
                <p style="margin:5px 0; font-size:14px;">Nomor Antrian:</p>
                <h1 style="font-size:70px; margin:10px 0; font-weight:bold;" id="nomor-struk">0</h1>
                <p style="margin:0; font-size:12px;" id="jam-cetak"></p>
                <p style="margin:0;">-----------------------</p>
                <p style="margin:0; font-size:14px; font-weight:bold;">SILAKAN MENUNGGU</p>
                <div class="jarak-potong"></div>
                <p style="font-size:10px;">.</p> <div style="height:30px;"></div>
            </div>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function ambil() { socket.emit('tambah-antrian'); }

                socket.on('siap-cetak', (nomor) => {
                    document.getElementById('nomor-struk').innerText = nomor;
                    document.getElementById('jam-cetak').innerText = new Date().toLocaleString('id-ID');
                    document.getElementById('cetak').style.display = 'block';
                    
                    // Delay sedikit agar browser sempat mengganti angka sebelum cetak
                    setTimeout(() => {
                        window.print();
                        document.getElementById('cetak').style.display = 'none';
                    }, 500);
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