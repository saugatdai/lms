const express = require('express');

const User = require('../models/user');
const Book = require('../models/book');
const auth = require('../auth/auth')
const router = express.Router();


router.post('/', async (req, res, next) => {
    if (req.body.role !== "librarian") {
        next('route');
    } else {
        try {
            const user = new User(req.body);
            const token = await user.generateAuthToken();
            await user.save();
            res.status(201).send({ user, token });
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: error.toString() });
        }
    }
});

router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'librarian') {
        res.status(400).send({ error: 'Only librarian is allowed to create users' });
    } else {
        try {
            const user = new User(req.body);
            await user.save();
            res.status(201).send({ user, token: null });
        } catch (error) {
            res.status(500).send({ error: error.toString() });
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: 'Unable to log in' });
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            token.token != req.token;
        });
        await req.user.save();
        res.status(200).send({ message: "Successfully logged out" });
    } catch (error) {
        res.status(500).send({ error, token: null });
    }
});

router.post('/logoutall', auth, async (req, res) => {
    req.user.tokens = [];
    try {
        await req.user.save();
        res.status(200).send({ message: 'Logged Out from all devices' });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: 'can not logoutall' });
    }
});

router.get('/profile/:id', auth, async (req, res) => {
    const id = req.params.id;

    const user = await User.findOne({ _id: id }).populate('books').exec();

    res.status(200).send(user);
});

router.get('/allusers', auth, async (req, res) => {
    const users = await User.find();
    res.status(400).send(users);
});

router.patch('/updateuser/:id', auth, async (req, res) => {
    if (req.user.role === 'librarian') {
        const user = await User.findOne({ _id: req.params.id });

        user.name = req.body.name;
        user.age = req.body.age;
        user.email = req.body.email;
        user.password = req.body.password;
        user.role = req.body.role;

        await user.save();

        res.status(200).send({ message: 'idont know' });
    } else {
        res.status(500).send({ error: 'Only librarians can update users' });
    }
});

router.post('/issuebook/:userid', auth, async (req, res) => {
    try {
        if (req.user.role === 'librarian') {
            const book = await Book.findOne({ ISBN: req.body.ISBN });
            const user = await User.findOne({ _id: req.params.userid });

            const bookObject = {
                book: book._id,
                date: new Date()
            }

            if(user.role === 'student' && user.booksIssued.length >= 5){
                throw new Error('Can not issue more than 5 books for student');
            }else if(user.role === 'staff' && user.booksIssued.length >= 7){
                throw new Error('Can not issue more than 7 books for staff');
            }

            user.booksIssued.forEach(async (book) => {
                try {
                    const bookObject = await Book.findOne({ _id: book.book });
                    console.log(bookObject);
                    if (bookObject.ISBN === req.body.ISBN) {
                        throw new Error('Book is already issued');
                    }
                    console.log(bookObject.ISBN, req.body.ISBN);
                }catch(error){
                    res.status(400).send({error: error.message});
                }
            });

            user.booksIssued.push(bookObject);
            book.quantity = book.quantity - 1;

            await user.save();
            await book.save();

            res.status(200).send({ book: book, issuer: user });
        } else {
            res.status(400).send('Only librarian can issue book for a user');
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});




module.exports = router;