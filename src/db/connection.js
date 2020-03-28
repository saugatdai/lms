const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() =>{
    console.log("successfully connected to the database...");
}).catch(error =>{
    console.log(error);
});
