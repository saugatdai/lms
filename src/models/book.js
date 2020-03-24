const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    authors: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }],
    issuedOn: {
        type: Date
    },
    ISBN: {
        type: Number,
        min: [1000000000, 'ISBN should be of 10-12 numbers long'],
        max: [999999999999, 'ISBN should be of 10-12 numbers long']
    },
    price: {
        type: Number,
        required: true
    },
    cover: {
        type: Buffer,
        requied: true
    },
    pages: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }

});

bookSchema.virtual('user', {
    ref: 'User',
    localField: '_id',
    foreignField: 'bookIssued'
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
