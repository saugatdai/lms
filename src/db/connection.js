const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/lms', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() =>{
    console.log("successfully connected to the database...");
}).catch(error =>{
    console.log(error);
});
