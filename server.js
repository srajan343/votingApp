const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

// import the router files
const userroutes = require('./routes/userroutes');
const candidateroutes = require('./routes/candidateroutes');

//use the routers
app.use('/user', userroutes)
app.use('/candidate',candidateroutes)


app.listen(PORT, ()=> {
    console.log(`Server is running on port 3000`);
})