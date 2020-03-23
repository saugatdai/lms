const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = async function (req, res, next) {

    if (req.body.role === "librarian") {
        console.log('No authentication for librarian creation');
        next();
    } else {
        try {
            const token = req.header('Authorization').replace('Bearer ', '');
            req.token = token;
            const decoded = await jwt.verify(token, 'secretphrase');
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
            if (!user) {
                throw new Error();
            }
            req.user = user;
            next();
        } catch (error) {
            res.status(500).send({ error: 'Please authenticate' });
        }
    }
};

module.exports = auth;

