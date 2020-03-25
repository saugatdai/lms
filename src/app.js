const express = require('express');
const connection = require('./db/connection');

const userRouter = require('./routes/userRouter');
const bookRouter = require('./routes/bookRouter');
const authorRouter = require('./routes/authorRouter');

const port = process.env.port || 3000;

const app = express();

app.use(express.json());
app.use('/user',userRouter);
app.use('/book',bookRouter);
app.use('/author',authorRouter);


//create a user : 


app.listen(port, ()=>{
    console.log('Server started on port : ' + port);
});