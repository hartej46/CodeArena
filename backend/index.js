const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express()

app.get('/',(req,res) => {
    res.send("Route Working")
});

const port = process.env.PORT
app.listen(port,() => {
    console.log(`Server running on port: ${port}`)
})