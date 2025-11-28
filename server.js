clientIPnstnstnst WebSocket = require('ws');
const express = require('express');
const path = require("path");
const http = require("http"); // <-- tambah untuk create server
const online = new Set()
const app = express();
const port = 8000;

// Buat satu HTTP server
const server = http.createServer(app);

// Sambungkan WebSocket kepada server yang sama
const wss = new WebSocket.Server({ server }); // <-- ganti WebSocket.Server({port:8080})

const KEY = "cQEfzvFidNwt2HeJ60Gk"
const bannedWords = [
  "ale uto",
  "anak haram",
  "anak pungut",
  "ayuk",
  "ayut",
  "babeng",
  "babi",
  "bahlul",
  "balaci",
  "bangang",
  "bangsat",
  "bapak",
  "bapak kau",
  "bapok",
  "batang",
  "bongok",
  "burit",
  "butuh",
  "celaka",
  "cucuk",
  "Dunia Ketiga",
  "ekor",
  "hampeh",
  "hanat",
  "haram jadah",
  "harga Yahudi",
  "jalang",
  "jolok",
  "rogol",
  "jilat",
  "kamjat",
  "katak",
  "kepala butuh",
  "kepala otak",
  "kimak",
  "kiok",
  "konek",
  "kongkek",
  "kote",
  "kotek",
  "kunyit",
  "lahabau",
  "lahanat",
  "lancau",
  "lanjiao",
  "macai",
  "mak kau hijau",
  "mampus",
  "merecik",
  "muka awam",
  "negara haram",
  "ngok",
  "palat",
  "pepek",
  "politahi",
  "politaik",
  "politikus",
  "puki",
  "pukimak",
  "pundek",
  "rejim Zionis",
  "Tanjung Rambutan",
  "terjengkang",
  "tetek",
  "tukang",
  "waknat"
];

function filter(msg,socket) {
  let ftext = msg;          // mula-mula ftext sama dengan msg
  let hasBanned = false;    // flag sama ada ada perkataan larangan

  for (const word of bannedWords) {
    if (ftext.toLowerCase().includes(word.toLowerCase())) {
      ftext = ftext.split(word).join("*****"); // ganti perkataan larangan
      hasBanned = true;
    }
  }

  // Hantar mesej amaran jika ada kata larangan
  if (hasBanned) {
    return [false, ftext];  // ada kata larangan → kembalikan false + teks baru
  }

  // tiada kata larangan → kembalikan true + mesej asal
  return [true, msg];
}


// WEBSOCKET SECTION
wss.on('connection', (socket,request) => {
 let clientIP = request.headers['x-forwarded-for'] || request.socket.remoteAddress
  console.log("Connection from "+clientIP);

  if(clientIP.includes(",")){
    clientIP = clientIP.split(',')[0]
  }

  online.add(clientIP)

  let totalCount = online.size === 1 
    ? "1 user" 
    : online.size + " users";

  socket.send("<span class=\"animate\"><span class=\"op\">Server</span> : Welcome to Chat-app!");
  setTimeout(()=>socket.send("<span class=\"animate\"><span class=\"op\">Server</span> : Read <a href=\"/policy\">Policy</a> before chatting.!"),1000)

  socket.on('message', (msg) => {
    let message = msg.toString();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        if(message.split("<>")[0] === KEY){
          client.send(message.split("<>")[1]);
        }
        else if(client === socket){
          if(!filter(message)[0]){
              message = filter(message)[1]
              client.send(`<span class="animate"><span class="name">You</span> : ${message}</span>`);
              setTimeout(() => {
                socket.send('<span class="animate"><span class="op">Server</span> : Jaga pertuturan, jangan guna kata-kata kesat!</span>');
              }, 1000);
          }else{
              client.send(`<span class="animate"><span class="name">You</span> : ${message}</span>`);
          }
        } else {
          if (online.includes(clientIP)) {
            if(!filter(message)[0]){
              message = filter(message)[1]
              client.send(`<span class="animate"><span class="name">Unknown ${online.indexOf(clientIP)+1}</span> : ${message}</span>`);
              setTimeout(() => {
                socket.send('<span class="animate"><span class="op">Server</span> : Jaga pertuturan, jangan guna kata-kata kesat!</span>');
              }, 1000);
            }else{
              client.send(`<span class="animate"><span class="name">Unknown ${online.indexOf(clientIP)+1}</span> : ${message}</span>`);
            }
          }
        }

      }
    });
  });

  wss.on('close', () => {
        online.delete(ip);
        console.log('Pelawat keluar:', online.size);
    });
  wss.on('error', () => {
        online.delete(ip);
        console.log('Pelawat disconnect (error):', online.size);
    });
});

// EXPRESS SECTION
app.set("view engine","ejs");
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render('index',{path:req.path});
});

app.get('/about', (req, res) => {
  res.render('about',{path:req.path});
});

app.get('/contact', (req, res) => {
  res.render('contact',{path:req.path});
});

app.get('/policy', (req, res) => {
  res.render('policy',{path:req.path});
});

app.get('/console',(req, res)=>{
  res.render('default')
})

// 404
app.use((req, res, next) => {
  res.status(404).render('404',{path:req.path});
});

// START SINGLE SERVER
server.listen(port,() => {
  console.log(`HTTP + WebSocket running at http://localhost:${port}`);
});
