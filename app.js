const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let antri = 0, panggil = 0;

// Variabel script untuk jam digital di sisi browser
const scriptJam = `
    function up() { 
        const d = new Date(); 
        const h = String(d.getHours()).padStart(2,'0');
        const m = String(d.getMinutes()).padStart(2,'0');
        const s = String(d.getSeconds()).padStart(2,'0');
        const jamEl = document.getElementById('jam');
        if(jamEl) jamEl.innerText = h + ":" + m + ":" + s; 
    }
    setInterval(up, 1000); up();
`;

// Variabel untuk Running Text agar konsisten di semua halaman
const footerHTML = `
    <div style="background:#2c5e9e; color:white; padding:20px 0; border-top:6px solid #d4af37; overflow:hidden; position:relative;">
        <div style="display:inline-block; white-space:nowrap; font-size:20px; font-weight:bold; animation:jalan 25s linear infinite;">
            <style>@keyframes jalan { from { transform:translateX(100%); } to { transform:translateX(-100%); } }</style>
            PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LAYANAN PRIMA UNTUK TNI, POLRI, ASN KEMHAN DAN POLRI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CABANG MALANG
        </div>
    </div>
`;

// Variabel Header agar konsisten
const headerHTML = `
    <div style="background:#2c5e9e; color:white; padding:15px 40px; display:flex; justify-content:space-between; align-items:center; border-bottom:6px solid #d4af37;">
        <div>
            <h1 style="margin:0; font-size:35px; letter-spacing:1px;">PT ASABRI (PERSERO)</h1>
            <div style="font-size:25px; font-weight:bold; margin-top:2px; opacity:0.9;">CABANG MALANG</div>
        </div>
        <div id="jam" style="font-size:45px; font-weight:bold; font-family:monospace; background:rgba(0,0,0,0.3); padding:8px 25px; border-radius:12px; border:2px solid #d4af37;">00:00:00</div>
    </div>
`;

// 1. HALAMAN TV
app.get('/tv', (req, res) => {
    // 1. GANTI ID DI BAWAH INI DENGAN ID FILE JPG BAPAK (BUKAN ID FOLDER)
    // ID file adalah kode acak di link "Bagikan" per file.
   const idFoto = [
        "1L-4H7jq2gICJjHrtkOFXoIeAFfawE6pT","1VwXRsVkhLt5fy3aJqN7QsmNY-RqynrGB","1qWXns-6xF39TrYxqvnC_aTklDe0m3tso","1sW7_xr5B4DA5PGyuQOyp2Mx-cNcxfa0h","1IaG1k4DjzFqKMysnRGxDbmsz-4XY4ePZ","19cw57w_sDsds3SineNFBZjONtMcjC-RD","1gVuuq4OmVgPTMBfd0H0oGIRRUrhOYWd-","1UNl5Z8h4RMP1pFAuw-MVTcSuIQC7d0-y",
        "1VqVHa0aC5PdG07V4DXMwHKVhRZH14BKr","1EpNeJnr0ikZ5HwT5dO0Ox_C2dQygcrYu","1SsSSLwzJ7r7cK5T6-wwl7jGwT2638hcb","1CWl5AS4d0Xup_k3OINfHibq_ZUt-3Xue","1pP9T_wT9txCQzPlPSReqyDISGEH0LSLc","1LyyHKlHJAqKKzdZowQNw8rBN-KKyk9Xc","13U1Hf8zfp2Nmx3HaiaFB6hQ-dXffpdHU","1jPzfWnCiIP7nFX4fDdCJ4bQNzZKWBVpx",
        "13bWS9o5wZPMGFhjzlRYg64Rf7llYaOD3","1LRozf9TVSbxbmVw12zTYOo00dLVtbfuT","12NLE1hacQZDicQuCaczAyxjkHFh2PXpk","104F-6dKMF2bChhb7LK3jjX5Xedj1vLRV","1LRhSsWbfWp4U0J224Ke65jNw9V_k7Gmy","1mylsmU1p4PK0QwcPjDnx6vmZrtjC_uwz","1tqHz7VGGWlOMjCfn6o7KUtjVviBKRjI7","1EFWKJtNCnlchoQcGsT3NHUuYwlS0YEz3",
        "1Pj09F8770PfYUfkiX79Fx-bHE225bL-7","1BAUSnNNVi4kcqpOjh4psUYOwfrMae96M","1UEKmhKpDbExGhyLyq73nBsNk9Xo_XfHJ","1kxcMBrCURZt4rt0dLX7UWdYxIPntvLXt","1-1cBu_s8jvmGTcdIipsEsoChqreY330d","1y9JSpKi4lbQn4IDBIl9mJ_aHZ2l0OURg","1f_gkJpwQlEWprGWEoeb4qZuMxxvrmwSz","1HgACg7nspZHFGYWR0xSCEVISSNqmJFn6",
        "16T2rL7zSUGlXmSCc7pzQ4zn4_hdPrwIb","14SCEaBF32qAz0Rja2Bh5YrS1J1p64shb","1J4J3rfaSgKfFM_NTgI1Uok1TISzYoPCP","1Z3RtEHrQ0TWHx8nrrcIRk5jMHGXqw1ow","1C4Q8mLogwkqerp8-RdbFn7QQ5dCAsgyV","1wAD_qLTGYj1ZaQf_TSUqjzG4YC9juun-","1aV3UB5ULYDiJLqicJANmMhZXJfv6hOPt","1FByRoKK59IDE5BYDfvh6TnH0EQ0J1REe",
        "1mqmh7QeB0BRUchA3to5E-vLTpzO6SQCE","1dROK0N25x7XZec5cX9UG2flyOZIpD0CH","1D4Q6m9n8wpz-gfCYdKDp8WI9Fxv1vWbd","1_RstiXCiG-H1VkaAJvBF9ANU4TV6rRvh","1g00ixv7StUG7K-y7Y3bWqQu7z1-tCvrz","1koO-XEez8fcTWtd_y-lwRfigPSlIyHxL","1XE7HfuwLsWLYJKxorkDxFif6zCMIpPSY","104fohrGKJLnAhx1Q414hJx5sO-Rast1q",
        "1LVUUn_6LgN4LV-PVhxVTeF02Wb7IjOcZ","19MC3ISAZ2iJPrxlOHVQH-9KTWrUt9gYy","1C0K0ckv5Z1DSI7kb1ZSGpdEMCbhDDfsa","14h73mfE2grQj-syVwBVrXzwua1HszkAm","1jjsrtUUgjNKyie62HMaWrb2ORVq28WE4","1C93hXm-ZwlcCl3nh8nIyHx6YHFylkZil","1jaDyoVTytEkrUudcndkoIGZENwqC5BNT","11Se0Btjg9Zovvc1tWONjBIrnk2Mp_EOk",
        "195GyNIUxdhLlV1Cztd0gwwailry0xMHA","1SK81LXLBwz_sRtXAAGXyT4yHIy1tB_Vx","1XGHSq7d3iKrAQFJWXaYOx9X8fnBMPvQ3","1YtxvZrUQE4rTSnV8NY0kOw2o8bDCBFRc","1DRrhq2fbf4NZbVgTscr8oQ7Z78UT-mM9","1Lp-mr7fDHD_GZMM5a3RnMHwdeBlg2X1w","1AsvcH3-zdNI-0MmCx-3W0rrHjUWoQDkF","1J2IERnD371OCd0AtQnpwZPCid7kb626Z",
        "1pnUvkXFCEjOd7c6uc0W9OIOA-QPa8j-o","1oHDxhuBoS02CcsFKZX_AT3sIIXH3222F","1Oqql5RE1YD5IqUGgynCc2drXT04IuUOu","1Iqy8Q6FEWQezBPvjncpLWeZzNou0mSoJ","1DrFausnzMJxlY3KucRFjlgYz0kAn7WeW","1-WiTDgy0CXYFA_17VwL2ag45X9Cc6xZj","1oiBd8VNlpOdO-PluGArk7sCPbqk6EJ97"
    ];

       // 2. Gunakan format link 'uc?export=view' agar gambar langsung muncul (bypass halaman Drive)
    const daftarSlide = idFoto.map(id => `https://lh3.googleusercontent.com/u/0/d/${id}`);

    res.send(`<!DOCTYPE html><html><head><title>DISPLAY TV ASABRI</title></head>
    <body style="margin:0; padding:0; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; overflow:hidden;" onclick="mulaiAudio()">
        
        <div style="background:#2c5e9e; color:white; padding:15px 40px; display:flex; justify-content:space-between; align-items:center; border-bottom:6px solid #d4af37;">
            <div>
                <h1 style="margin:0; font-size:35px; letter-spacing:1px;">PT ASABRI (PERSERO)</h1>
                <div style="font-size:20px; font-weight:bold; margin-top:2px; opacity:0.9;">CABANG MALANG</div>
            </div>
            <div id="jam" style="font-size:45px; font-weight:bold; font-family:monospace; background:rgba(0,0,0,0.3); padding:8px 25px; border-radius:12px; border:2px solid #d4af37;">00:00:00</div>
        </div>
        
        <div style="flex:1; display:flex; padding:20px; gap:20px; overflow:hidden;">
            
            <div style="flex:1; display:flex; flex-direction:column; gap:20px;">
                <div style="flex:2; background:white; border-radius:30px; box-shadow:0 10px 30px rgba(0,0,0,0.1); text-align:center; display:flex; flex-direction:column; justify-content:center; padding:20px;">
                    <div style="font-size:35px; font-weight:bold; color:#444;">NOMOR ANTRIAN</div>
                    <div id="a" style="font-size:200px; font-weight:bold; color:#2c5e9e; line-height:1;">0</div>
                    <div id="l" style="background:#d4af37; color:white; font-size:60px; padding:10px 40px; border-radius:15px; margin-top:20px; align-self:center; font-weight:bold;">LOKET -</div>
                </div>
                
                <div style="flex:1; background:white; border-radius:30px; box-shadow:0 10px 30px rgba(0,0,0,0.1); text-align:center; display:flex; flex-direction:column; justify-content:center;">
                    <div style="font-size:30px; font-weight:bold; color:#e67e22;">SISA ANTRIAN</div>
                    <div id="s" style="font-size:100px; font-weight:bold; color:#e67e22;">0</div>
                </div>
            </div>

            <div style="flex:1.5; background:white; border-radius:30px; box-shadow:0 10px 30px rgba(0,0,0,0.1); overflow:hidden; position:relative;">
                <div id="slider" style="width:100%; height:100%; display:flex; transition: transform 1s ease-in-out;">
                    ${daftarSlide.map(url => `<img src="${url}" style="width:100%; height:100%; object-fit:contain; flex-shrink:0;">`).join('')}
                </div>
            </div>

        </div>

        <div style="background:#2c5e9e; color:white; padding:20px 0; border-top:6px solid #d4af37; overflow:hidden; position:relative;">
            <div style="display:inline-block; white-space:nowrap; font-size:26px; font-weight:bold; animation:jalan 25s linear infinite;">
                <style>@keyframes jalan { from { transform:translateX(100%); } to { transform:translateX(-100%); } }</style>
                PT ASABRI (PERSERO) - SAHABAT PERJUANGAN ANDA SEPANJANG MASA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; LAYANAN PRIMA UNTUK TNI, POLRI, DAN ASN KEMHAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PT ASABRI (PERSERO) CABANG MALANG
            </div>
        </div>

        <script src="/socket.io/socket.io.js"></script>
        <script>
            const s = io();
            
            // Jam Digital
            function updateJam() { 
                const d = new Date(); 
                const h = String(d.getHours()).padStart(2,'0');
                const m = String(d.getMinutes()).padStart(2,'0');
                const s = String(d.getSeconds()).padStart(2,'0');
                document.getElementById('jam').innerText = h + ":" + m + ":" + s; 
            }
            setInterval(updateJam, 1000); updateJam();

            // Jalankan Slider Otomatis
            let slideIndex = 0;
            const slider = document.getElementById('slider');
            const totalSlides = ${idFoto.length};

            function geserSlide() {
                if (totalSlides > 1) {
                    slideIndex++;
                    if (slideIndex >= totalSlides) slideIndex = 0;
                    slider.style.transform = "translateX(-" + (slideIndex * 100) + "%)";
                }
            }
            setInterval(geserSlide, 10000); // Ganti slide setiap 10 detik

            // Suara & Update Antrian
            let audioIzin = false;
            function mulaiAudio() { audioIzin = true; }

            function panggilSuara(nomor, loket) {
                if(!audioIzin) return;
                const text = "Nomor antrian " + nomor + ", silakan menuju ke loket " + loket;
                const msg = new SpeechSynthesisUtterance(text);
                msg.lang = 'id-ID';
                msg.rate = 0.8;
                window.speechSynthesis.speak(msg);
            }

            s.on('update-layar', (d) => {
                document.getElementById('s').innerText = d.total - d.dipanggil;
                if(d.isP) {
                    document.getElementById('a').innerText = d.dipanggil;
                    document.getElementById('l').innerText = "LOKET " + d.loket;
                    panggilSuara(d.dipanggil, d.loket);
                }
            });
            s.on('reset-layar', () => location.reload());
        </script>
    </body></html>`);
});

// 2. HALAMAN AMBIL NOMOR
app.get('/ambil', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>AMBIL ANTRIAN</title>
    <style>
        /* TAMPILAN DI LAYAR MONITOR */
        body { margin:0; padding:0; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
        
        /* CSS KHUSUS SAAT DICETAK (PRINT) */
        @media print {
            body * { visibility: hidden; } /* Sembunyikan semua elemen layar */
            #p, #p * { visibility: visible; } /* Hanya tampilkan elemen struk (id="p") */
            #p { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                display: block !important; 
            }
            @page { size: auto; margin: 0mm; } /* Menghilangkan header/footer browser (tanggal/url) */
        }
    </style>
    </head>
    <body>
        ${headerHTML}
        <div style="flex:1; display:flex; justify-content:center; align-items:center;">
            <div style="background:white; border:3px solid #d4af37; padding:80px; border-radius:40px; text-align:center; box-shadow:0 15px 30px rgba(0,0,0,0.1); cursor:pointer;" onclick="s.emit('tambah-antrian')">
                <div style="font-size:120px;">🖨️</div>
                <div style="font-size:25px; font-weight:bold; color:#2c5e9e; margin-top:20px;">SENTUH UNTUK AMBIL NOMOR</div>
            </div>
        </div>
        ${footerHTML}

        <div id="p" style="display:none; font-family:monospace; width:58mm; text-align:center; padding:10px;">
            <div style="font-size:14pt; font-weight:bold;">PT ASABRI (PERSERO)</div>
            <div style="font-size:12pt;">CABANG MALANG</div>
            <hr style="border:1px dashed #000;">
            <div style="font-size:12pt;">NOMOR ANTRIAN</div>
            <div id="n" style="font-size:70pt; font-weight:bold; margin:10px 0;">0</div>
            <div id="t" style="font-size:10pt;"></div>
            <hr style="border:1px dashed #000;">
            <div style="font-size:10pt; font-weight:bold;">SILAKAN MENUNGGU</div>
        </div>

        <script src="/socket.io/socket.io.js"></script>
        <script>${scriptJam}
            const s = io();
            s.on('siap-cetak', (d) => {
                const nEl = document.getElementById('n');
                const tEl = document.getElementById('t');
                const pEl = document.getElementById('p');
                
                if(nEl && tEl && pEl) {
                    nEl.innerText = d.nomor;
                    tEl.innerText = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                    
                    // Proses Cetak
                    window.print();
                }
            });
        </script>
    </body></html>`);
});

// 3. PANEL ADMIN (SUDAH DISESUAIKAN)
app.get('/admin', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>PANEL ADMIN</title></head>
    <body style="margin:0; padding:0; font-family:sans-serif; background:#f4f7f9; height:100vh; display:flex; flex-direction:column; overflow:hidden;">
        ${headerHTML}
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:20px;">
            <h2 style="color:#2c5e9e; margin-bottom:30px; font-size:32px;">KONTROL PEMANGGILAN LOKET</h2>
            <div style="display:flex; gap:30px;">
                <button style="padding:50px 70px; font-size:30px; font-weight:bold; background:#2c5e9e; color:white; border:none; border-radius:25px; cursor:pointer; box-shadow:0 10px 20px rgba(44,94,158,0.3);" onclick="s.emit('proses-panggil',1)">PANGGIL LOKET 1</button>
                <button style="padding:50px 70px; font-size:30px; font-weight:bold; background:#e67e22; color:white; border:none; border-radius:25px; cursor:pointer; box-shadow:0 10px 20px rgba(230,126,34,0.3);" onclick="s.emit('proses-panggil',2)">PANGGIL LOKET 2</button>
            </div>
            <button style="margin-top:60px; padding:15px 30px; background:#d9534f; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold;" onclick="if(confirm('Reset semua nomor?'))s.emit('reset-antrian')">RESET ANTRIAN HARI INI</button>
        </div>
        ${footerHTML}
        <script src="/socket.io/socket.io.js"></script>
        <script>${scriptJam}
            const s = io();
            s.on('reset-layar', () => location.reload());
        </script>
    </body></html>`);
});

io.on('connection', (s) => {
    s.on('tambah-antrian', () => { antri++; io.emit('update-layar', { total: antri, dipanggil: panggil, isP: false }); s.emit('siap-cetak', { nomor: antri }); });
    s.on('proses-panggil', (n) => { if (panggil < antri) { panggil++; io.emit('update-layar', { total: antri, dipanggil: panggil, loket: n, isP: true }); } });
    s.on('reset-antrian', () => { antri = 0; panggil = 0; io.emit('reset-layar'); });
});

server.listen(process.env.PORT || 3000, () => { console.log('Server running...'); });