const express = require('express');
const Author = require('../models/author');
const Book = require('../models/book');
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
    } else {
        res.status(400).send({ error: 'Only Librarian can add Authors' });
    }
});

router.get('/listall', auth, async (req, res) => {
    const authors = await Author.find();
    res.status(200).send(authors);
});

router.get('/profile/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;

        const author = await Author.findOne({ _id: id }).populate('books').exec();

        res.status(200).send({ author: author, books: author.books });
    }catch(error){
        console.log(error.message);
        res.status(500).send(error.message);
    }
});

router.delete('/deleteauthor/:id', auth, async (req, res) => {
    if (req.user.role === 'librarian') {
        try {
            const author = await Author.findOne({ _id: req.params.id }).populate('books').exec();
            if (!author) {
                throw new Error('Cannot find the author');
            }
            //first remove the books and authors from books
            author.books.forEach(async book => {
                if (book.authors.length > 1) {
                    book.authors = book.authors.filter(author => author._id.toString() !== req.params.id);
                    await book.save();
                } else {
                    await Book.deleteOne({ _id: book._id });
                }
            });
            //Now delete the author
            await Author.deleteOne({ _id: req.params.id });
            res.status(200).send({ message: 'Author Deleted' });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }

    } else {
        res.status(400).send({ error: 'Only librarian can delete author' });
    }
});