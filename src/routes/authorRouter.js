const express = require('express');
const Author = require('../models/author');
const auth = require('../auth/auth');

const router = express.Router();


module.exports = router;

router.post('/', auth, async (req, res) => {
    if (req.user.role === 'librarian') {
        const author = await new Author({
            name: req.body.name,
            email: req.body.email
        }).save();

        res.status(201).send(author);
    }else{
        res.status(200).send({error: 'Only Librarian can add Authors'});
    }
});

router.get('/listall', auth, async (req, res) => {
    const authors = await Author.find();
    res.status(200).send(authors);
});

router.get('/profile/:id', auth, async (req, res) => {
    const id = req.params.id;

    console.log(id);
    const author = await Author.findOne({ _id: id }).populate('books').exec();

    res.status(200).send({ author: author, books: author.books });
});