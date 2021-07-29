const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes')
const corsOptions = {
  origin: 'http://localhost:3000' || 'http://localhost:3001' ,
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(authRoutes)
const http = require('http');
const server = http.createServer(app);
const serverSocket = require("socket.io");
const io = serverSocket(server);
const mongoose = require('mongoose')
const mongoDB = 'mongodb+srv://narqe:569842a@cluster0.3r8pq.mongodb.net/chat-database?retryWrites=true&w=majority'
const PORT = process.env.PORT || 5000;
const { addUser, removeUser, getUser, removeRoom } = require('./helper'); 
const Room = require('./models/Room');
const Message = require('./models/Message');

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('connect to mongoDB'))
  .catch((error) => console.error(error))

  app.get('/', (req, res) => {
  res.send('./index.html');
});

app.get('/set-cookies', (req, res)=> {
  res.cookie('username', '')
  res.cookie('isAuthenticated', true, {maxAge: 24*60*60*1000, httpOnly: true, secure: true})
  res.send('cookies are set')
})

app.get('/get-cookies', (req, res)=> {
  const cookies = req.cookies
  res.send(cookies);
  res.json(cookies);
})

io.on('connection', (socket) => {
  Room.find().then(results => {
    io.emit('input-rooms', results)
  })
  socket.on('create-room', ({name, userCreator}) => {
    const room = new Room({name, userCreator})
    room.save().then(result => {
      io.emit('room-created', result)
    })
  })
  socket.on('delete-room', (roomId) => {
    Room.findByIdAndDelete(roomId).then(r => {
      Room.find().then(results => {
        io.emit('input-rooms', results)
      })
    })
  })
  socket.on('join', ({name, roomId, userId}) => {
    const {error, user} = addUser({
      socketId: socket.id, 
      name, 
      roomId,
      userId
    })
    socket.join(roomId)
    if(error){
      console.error('error joining')
    } else {
      console.info(user.name + 'joined')
    }
  })
  socket.on('send-message', (message, roomId, callback) => {
    const user = getUser(socket.id);
    const msgSave = {
      name: user.name,
      userId: user.userId,
      roomId,
      text: message,
    }
    console.log(msgSave)
    const msg = new Message(msgSave)
    msg.save().then(result => {
      io.to(roomId).emit('recive-message', result);
      callback();
    })
  })
  socket.on('get-messages-history', roomId => {
    Message.find({ roomId }).then(result => {
        socket.emit('output-messages', result)
    })
  })
  socket.on('bye', () => {
    const user = removeUser(socket.io)
  })
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});