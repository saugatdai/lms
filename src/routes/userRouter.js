const express = require('express');

const User = require('../models/user');
const auth = require('../auth/auth')
const router = express.Router();


router.post('/', auth, async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        console.log(token);
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
        res.status(200).send({message: "Successfully logged out"});
    } catch (error) {
        res.status(500).send({ error, token: null });
    }
});

router.post('/logoutall', auth, async (req, res) => {
    req.user.tokens = [];
    try{
        await user.save();
        res.status(200).send({user, message: 'Logged Out from all devices'});
    }catch(error){
        res.status.send({error: 'can not logoutall'});
    }
});




module.exports = router;