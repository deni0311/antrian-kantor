const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0; // Nomor yang sudah diambil pengunjung
let nomorDipanggil = 0; // Nomor yang sedang dipanggil petugas

// Halaman untuk TV (Layar Monitor)
app.get('/tv', (req, res) => {
    res.send(`
        <body style="background:#000; color:#0f0; text-align:center; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; height:100vh; margin:0;">
            <div style="margin-top: 20px;">
                <img src="/logo.png" style="height: 120px; width: auto;">
                <h2 style="color:white; margin: 10px 0;">KANTOR CABANG ASABRI MALANG</h2>
            </div>

            <h2 style="color:white; margin-top: 30px;">NOMOR ANTRIAN</h2>
            <h1 id="angka" style="font-size:300px; margin:0; line-height: 1;">${nomorDipanggil}</h1>
            <h2 id="status" style="color:white;">Silakan Menunggu</h2>
            
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();

                // TV hanya merubah angka TANPA suara saat pengunjung ambil nomor
                socket.on('update-layar-saja', (n) => {
                    document.getElementById('angka').innerText = n;
                    document.getElementById('status').innerText = "NOMOR BARU TERSEDIA";
                });

                // TV merubah angka DAN bersuara saat ADMIN klik panggil
                socket.on('suara-panggilan', (n) => {
                    document.getElementById('angka').innerText = n;
                    document.getElementById('status').innerText = "SILAKAN KE LOKET 1";
                    
                    const pesan = new SpeechSynthesisUtterance("Nomor antrian " + n + " menuju loket satu");
                    pesan.lang = 'id-ID';
                    window.speechSynthesis.speak(pesan);
                });
            </script>
        </body>
    `);
});

// Halaman untuk Admin (Tombol Panggil)
app.get('/admin', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; padding-top:100px;">
            <h1>PANEL ADMIN</h1>
            <h2 id="info">Menunggu Antrian...</h2>
            <button style="padding:50px; font-size:30px; background:green; color:white; border-radius:20px; cursor:pointer;" 
                    onclick="panggil()">PANGGIL BERIKUTNYA</button>
            <p>Klik untuk memanggil nomor yang sudah diambil pengunjung</p>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function panggil() {
                    socket.emit('proses-panggil');
                }
                socket.on('update-layar-saja', (n) => {
                    document.getElementById('info').innerText = "Antrian Terakhir: " + n;
                });
            </script>
        </body>
    `);
});

// Halaman untuk Pengunjung (Ambil Nomor)
app.get('/ambil', (req, res) => {
    res.send(`
        <body style="text-align:center; font-family:sans-serif; background:#f0f0f0; padding-top:100px;">
            <img src="/logo.png" style="height:100px;">
            <h1>Selamat Datang di ASABRI</h1>
            <p>Silakan tekan tombol di bawah untuk mengambil nomor antrian</p>
            <button onclick="ambil()" style="padding:50px; font-size:40px; border-radius:20px; background:green; color:white; cursor:pointer;">
                AMBIL NOMOR ANTRIAN
            </button>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                function ambil() {
                    socket.emit('tambah-antrian');
                    alert("Nomor Antrian Berhasil Diambil!");
                }
            </script>
        </body>
    `);
});

io.on('connection', (socket) => {
    // Saat Pengunjung klik Ambil
    socket.on('tambah-antrian', () => {
        nomorAntrian++; 
        // Hanya update angka di layar, TIDAK memicu suara
        io.emit('update-layar-saja', nomorAntrian);
    });

    // Saat Admin klik Panggil
    socket.on('proses-panggil', () => {
        // Hanya panggil jika ada antrian yang tersedia
        if (nomorDipanggil < nomorAntrian) {
            nomorDipanggil++;
            // Kirim sinyal khusus yang memicu suara di TV
            io.emit('suara-panggilan', nomorDipanggil);
        } else {
            console.log("Tidak ada antrian baru");
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('SERVER RUNNING ON PORT ' + PORT);
});