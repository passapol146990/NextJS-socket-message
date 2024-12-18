const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});
app.get('/chat/bot',(req,res)=>{
  io.emit('chat message', "สวัดดีครับให้ช่วยหาอะไรดีครับ?");
  res.send({status:200})
})
app.get('/chat/bot/:message',(req,res)=>{
  const message = `ไม่พบสินค้า ${req.params.message} ในระบบนะครับช่วยค้นหาสินค้าอื่นได้ไหมครับผม`
  io.emit('chat message', "ได้เลยครับ กำลังค้นหาสินค้าให้นะครับรอสักครู่...");
  io.emit('chat message', message);
  res.send({status:200})
})
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

// io.on('connection', (socket) => {
//   socket.on('hello', (arg) => {
//     console.log(arg); // 'world'
//   });
// });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});