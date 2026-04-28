const express = require('express');
const app = express();
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
