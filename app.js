const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let nomorAntrian = 0; 
let nomorDipanggil = 0; 

app.get('/tv', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <body style="background:#000; color:#0f0; text-align:center; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; height:100vh; margin:0;">
            <h2 style="color:white;">KANTOR CABANG ASABRI MALANG</h2>
            <h2 style="color:white; margin-top: 30px;">NOMOR ANTRIAN</h2>
            <h1 id="angka" style="font-size:300px; margin:0;">${nomorDipanggil}</h1>
            <h2 id="status" style="color:white;">Silakan Menunggu</h2>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                socket.on('suara-panggilan', (n) => {
                    document.getElementById('angka').innerText = n;
                    const pesan = new SpeechSynthesisUtterance("Nomor antrian " + n + " menuju loket satu");
                    pesan.lang = 'id-ID';
                    window.speechSynthesis.speak(pesan);
                });
            </script>
        </body>
        </html>
    `);
});

app.get('/', (req, res) => { res.send('Antrian Online'); });

io.on('connection', (socket) => {
    socket.on('tambah-antrian', () => { nomorAntrian++; io.emit('update', nomorAntrian); });
    socket.on('proses-panggil', () => {
        if (nomorDipanggil < nomorAntrian) {
            nomorDipanggil++;
            io.emit('suara-panggilan', nomorDipanggil);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port ' + PORT);
});