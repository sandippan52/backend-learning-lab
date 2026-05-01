const express = require('express');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

require('dotenv').config();


mongoose.connect('mongodb://localhost:27017/altrodevdata')




const app = express();


//This is the global middleware below to parse the JSON bodies ->
app.use(express.json())




app.get('/health',(req,res)=>{
    res.status(200).json({status : "Platform is superactive"})
})




app.post('/signup', async(req, res)=>{
try{

const {email, password} = req.body;

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password,salt);


const user = new User({
    email : email,
    passwordHash : await bcrypt.hash(password,salt)
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





app.listen(3000, () => {
console.log('Server started on port 3000');
});
