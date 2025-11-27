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

let online = [];
const KEY = "cQEfzvFidNwt2HeJ60Gk"
// WEBSOCKET SECTION
wss.on('connection', (socket,request) => {
  const clientIP = request.socket.remoteAddress;
  console.log("Connection from "+clientIP);

  if(!online.includes(clientIP)){
    online.push(clientIP);
  }

  let totalCount = online.length > 1 ? online.length+" users" : online.length+" user";

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
          console.log(socket.clientKey)
          client.send(`<span class="animate"><b>You</b> : ${message}</span>`);
        } else {
          if (online.includes(clientIP)) {
            client.send(`<span class="animate"><b>Unknown ${online.indexOf(clientIP)+1}</b> : ${message}</span>`);
          }
        }

      }
    });
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

// 404
app.use((req, res) => {
  res.status(404).render('404',{path:req.path});
});

// START SINGLE SERVER
server.listen(port, () => {
  console.log(`HTTP + WebSocket running at http://localhost:${port}`);
});
