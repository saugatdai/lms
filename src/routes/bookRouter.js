const fs = require('fs');

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
        } else if (!book.cover) {
            throw new Error('No cover for requested book');
        } else {
            //get the file first
            const file = fs.readFileSync(book.cover);
            const fileToSend = await sharp(file).resize({ width: 250, height: 500 }).png().toBuffer();
            res.set('Content-Type', 'image/jpg');
            res.status(200).send(fileToSend);
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

router.patch('/updatebook/:isbn', auth, async (req, res) => {
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

router.get('/issuer/:ISBN', auth, async (req, res) => {
    const issuers = [];
    const book = await Book.findOne({ ISBN: req.params.ISBN }).populate({
        path: 'user',
        populate: {
            path: 'booksIssued.book'
        }
    });
    const issuingUsers = book.user.map(user => {
        let issuerElement = {};
        issuerElement.name = user.name;
        issuerElement.role = user.role;
        user.booksIssued.forEach(bookObject => {
            if (bookObject.book.ISBN.toString() === req.params.ISBN) {
                let remDays = Math.ceil((bookObject.date.getTime() + 1000 * 3600 * 24 * 5 -
                    new Date().getTime()) / (3600 * 24 * 1000));

                let fine = (remDays < 0) ? Math.abs(remDays * 2) : 0;

                issuerElement.dateIssued = bookObject.date;
                issuerElement.remainingDays = remDays;
                issuerElement.fine = fine;
                issuers.push(issuerElement);
                console.log(issuerElement);
            }
        });
    });
    console.log(issuers);
    res.status(200).send(issuers);
});

router.delete('/deletebook/:ISBN', auth, async (req, res) => {
    if (req.user.role === 'librarian') {
        //check if there is an issuer
        try {
            const book = await Book.findOne({ ISBN: req.params.ISBN }).populate('user').exec();

            if (!book) {
                throw new Error("Can not find the requested book for deletion");
            }

            if (book.user.length > 0) {
                res.status(400).send({ error: "Can not delete book, " + book.user.length + " book/books are on issue" });
            } else {
                await Book.deleteOne({ ISBN: req.params.ISBN });
                res.status(200).send({ message: "book deleted" });
            }
        } catch (error) {
            res.status(400).send({ error: error.message });
        }

    } else {
        res.status(400).send("Only librarians can delete books");
    }
});

module.exports = router;
