const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/lms', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
