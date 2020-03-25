const express = require('express');

const User = require('../models/user');
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

router.get('/profile/:id', async (req, res) => {
    const id = req.params.id;

    const user = await User.findOne({_id: id}).populate('books').exec();

    res.status(200).send(user);
});

router.get('/allusers', async (req, res) => {
    const users = await User.find();
    res.status(400).send(users);
});


module.exports = router;