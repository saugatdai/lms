const express = require('express');
const multer = require('multer');
const fs = require('fs');

const auth = require('../auth/auth');
const Book = require('../models/book');

const router = express.Router();

const upload = multer({
    dest: 'images/',
    limits: {
        fileSize: 1000000
    }, fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Please Upload image only'));
        }
        cb(undefined, true);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role === 'librarian') {
            const book = new Book({
                title: req.body.title,
                ISBN: req.body.ISBN,
                price: req.body.price,
                pages: req.body.pages,
                quantity: req.body.quantity
            });

            const authors = req.body.authors;
            authors.forEach(author => {
                book.authors.push(author);
            });
            await book.save();
            res.status(201).send(book);
        } else {
            res.status(400).send({ error: 'Only librarian can add books' })
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});



router.post('/addcover/:ISBN', auth, upload.single('cover'), async (req, res) => {
    if (req.user.role === 'librarian') {
        try {
            const isbn = req.params.ISBN;
            const book = await Book.findOne({ ISBN: isbn });
            await book.uploadCover(req.file);
            res.status(200).send(book.cover);
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    } else {
        res.status(400).send({ error: 'Only librarian can upload covers' });
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.get('/getbookcover/:ISBN', async (req, res) => {
    try {
        const book = await Book.findOne({ ISBN: req.params.ISBN });
        if (!book) {
            throw new Error('Cannot Find book with ISBN : ' + req.ISBN);
        } else {
            //get the file first
            const file = fs.readFileSync(book.cover);
            res.set('Content-Type', 'image/jpg');
            res.status(200).send(file);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.patch('/addbooks', auth, async (req, res) => {
    if (req.user.role === 'librarian') {
        try {
            const ISBN = req.body.ISBN;
            console.log(`${req.body.ISBN} : ${req.body.quantity}`);
            const book = await Book.updateOne({ ISBN: ISBN }, { $inc: { quantity: parseInt(req.body.quantity) } });
            res.status(201).send(book);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    } else {
        res.status(400).send('Only Librarians can add books')
    }
});

router.get('/listallbooks', auth, async (req, res) => {
    const books = await Book.find();
    res.status(200).send(books);
});

router.patch('/updatebook/:isbn', auth,async (req, res) => {
    try {
        const status = await Book.updateOne({ ISBN: req.params.isbn }, {
            $set: {
                title: req.body.title,
                authors: req.body.authors,
                ISBN: req.body.ISBN,
                price: req.body.price,
                pages: req.body.pages,
                quantity: req.body.quantity
            }
        });
        res.status(200).send(status);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


module.exports = router;
