const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

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
    if (req.user.role === 'librarian') {
        const book = new Book({
            name: req.body.name,
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
    }else{
        res.status(400).send({error: 'Only librarian can add books'})
    }
});

router.post('/upload/:bookId', auth, upload.single('cover'), async (req, res) => {
    if (req.user.role === 'librarian') {
        const bookId = req.params.bookId;
        const book = await Book.findOne({ _id: bookId });
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 500 }).png().toBuffer();
        await book.uploadCover(buffer);
    } else {
        res.status(400).send({ error: 'Only librarian can upload covers' });
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

module.exports = router;
