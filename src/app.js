const express = require('express');
const connection = require('./db/connection');

const auth = require('./auth/auth');
const userRouter = require('./routes/userRouter');

const port = process.env.port || 3000;

const app = express();

app.use(express.json());
app.use('/user',userRouter);


//create a user : 


app.listen(port, ()=>{
    console.log('Server started on port : ' + port);
});