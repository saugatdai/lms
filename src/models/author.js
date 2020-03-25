//mongoose must watch
//https://bezkoder.com/mongodb-many-to-many-mongoose/
const mongoose = require('mongoose');
const validator = require('validator');
const authorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is Invalid!!')
            }
        }
    }
});

authorSchema.virtual('books', {
    ref: 'Book',
    localField: '_id',
    foreignField: 'authors'
});

authorSchema.methods.toJSON = function () {
    const author = this;
    const authorObject = author.toObject();
    delete authorObject.__v;

    return authorObject;
}

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;