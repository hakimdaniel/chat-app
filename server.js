const WebSocket = require('ws');
const express = require('express');
const path = require("path");
const http = require("http"); // <-- tambah untuk create server

const app = express();
const port = 8000;

// Buat satu HTTP server
const server = http.createServer(app);

// Sambungkan WebSocket kepada server yang sama
const wss = new WebSocket.Server({ server }); // <-- ganti WebSocket.Server({port:8080})

const KEY = "cQEfzvFidNwt2HeJ60Gk"

const online = new Set()

// WEBSOCKET SECTION
wss.on('connection', (socket,request) => {
  const clientIP = request.headers['x-forwarded-for'] || request.socket.remoteAddress
  console.log("Connection from "+clientIP);

  if(clientIP.includes(",")){
    clientIP = clientIP.split(',')[0]
  }

  online.add(clientIP)

  let totalCount = online.size === 1 
    ? "1 user" 
    : online.size + " users";

  socket.send(`<span style="background-color:black;color:white;padding:5px 8px;display:inline-block;transform:translateY(-5px);">Total online : ${totalCount}</span>`);
  socket.send("<span class=\"animate\"><span class=\"op\">Server</span> : Welcome to Chat-app!");

  socket.on('message', (msg) => {
    const message = msg.toString();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        if(message.split("<>")[0] === KEY){
          client.send(message.split("<>")[1]);
        }
        else if(client === socket){
          client.send(`<span class="animate"><b>You</b> : ${message}</span>`);
        } else {
          if (online.includes(clientIP)) {
            client.send(`<span class="animate"><b>Unknown ${online.indexOf(clientIP)+1}</b> : ${message}</span>`);
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
app.use((req, res) => {
  res.status(404).render('404',{path:req.path});
});

// START SINGLE SERVER
server.listen(port,() => {
  console.log(`HTTP + WebSocket running at http://localhost:${port}`);
});
