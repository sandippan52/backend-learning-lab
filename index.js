const express = require('express');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('./db')
const authMiddleware = require('./middleware/auth');
const http = require('http')
const {Server} = require('socket.io')
const { Worker } = require('worker_threads');
const redis = require('redis');

const client = redis.createClient();

client.connect().then(() => {
  console.log("Redis connected");
});


require('dotenv').config();


 connectDB()


 

const app = express();


//This is the global middleware below to parse the JSON bodies ->
app.use(express.json())





const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});






io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on('connection', (socket) => {
  console.log("User connected:", socket.id);

  socket.on('message', (data) => {
    console.log("Message:", data);
    io.emit('message_broadcast', data);
  });

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Joined room: ${room}`);
  });

  socket.on('room_message', ({ room, message }) => {
    io.to(room).emit('new_message', message);
  });

  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
});




app.get('/api/heavy-task', (req, res) => {
  const worker = new Worker('./worker.js', {
    workerData: { iterations: 100000000 }
  });

  worker.on('message', (result) => {
    res.json({ result });
  });

  worker.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
});











app.get('/health',(req,res)=>{
    res.status(200).json({status : "Platform is superactive"})
})

const Post = require('./models/Post');

app.post('/posts', authMiddleware, async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id
    });

    await post.save();
    await client.del("posts");
    res.json(post);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get('/posts', async (req, res) => {
//   const posts = await Post.find().populate('author', ['email']);
//   res.json(posts);
// });


app.get('/posts', async (req, res) => {
  try {
    const cached = await client.get("posts");

    if (cached) {
      console.log("Cache Hit");
      return res.json(JSON.parse(cached));
    }

    console.log("Cache Miss");

    const posts = await Post.find().populate('author', ['email']);

    await client.setEx("posts", 3600, JSON.stringify(posts));

    res.json(posts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






app.post('/signup', async(req, res)=>{
try{

const {email, password} = req.body;

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password,salt);


const user = new User({
    email : email,
    passwordHash : hashedPassword
})

await user.save();
res.status(201).json({message : "User created successfully"});

}catch(err){
    res.status(500).json({ error: err.message });

}


})

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});




app.get('/', (req, res) => {
res.send('Server Running');
});




const users = [
    {id:1, name : "Sandip", role : "node js developer"},
    {id : 2, name : "Pritam", role : "Android Developer"},
    {id : 3, name : "Shuvajit", role : "Data Analyst"}
]

app.use((req,res,next)=>{
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`)
    next()
})

app.get('/about',(req,res)=>{
    res.send("This is about api -> backend login is active")
})

app.get('/users',(req,res)=>{
    res.json({
        name : "Sandip",
        age: 21,
        role : "node js Developer"
    })
})

app.get('/api/users',(req,res)=>{
    res.json(users)
})





// app.listen(3000, () => {
// console.log('Server started on port 3000');
// });

server.listen(3000, () => {
  console.log("Server running on port 3000");
});






