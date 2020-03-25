const express = require('express');
const Author = require('../models/author');
const router = express.Router();

module.exports = router;

router.post('/', async (req, res) => {
    const author = await new Author({
        name: req.body.name,
        email: req.body.email
    }).save();

    res.status(201).send(author);
});

router.get('/listall', async (req, res) => {
    const authors = await Author.find();
    res.status(200).send(authors);
});

router.get('/profile/:id', async (req, res) => {
    const id = req.params.id;

    console.log(id);
    const author = await Author.findOne({_id: id}).populate('books').exec();

    res.status(200).send({author: author, books: author.books});
});