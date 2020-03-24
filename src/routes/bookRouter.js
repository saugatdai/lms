const express = require('express');
const auth = require('../auth/auth');

const Book = require('../models/book');

const router = express.Router();

router.post('/', auth, (req, res) =>{
    res.send({message: 'book adding feature'});
});


module.exports = router;
