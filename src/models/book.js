const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }],
    issuedOn: {
        type: Date
    },
    ISBN: {
        type: Number,
        unique: true,
        min: [1000000000, 'ISBN should be of 10-12 numbers long'],
        max: [999999999999, 'ISBN should be of 10-12 numbers long']
    },
    price: {
        type: Number,
        required: true
    },
    cover: {
        type: Buffer
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
    foreignField: 'booksIssued'
});

bookSchema.methods.uploadCover = async function (buffer) {
    console.log('adding cover');
    this.cover = buffer;
    await this.save();
}

bookSchema.methods.toJSON = function () {
    const book = this;
    const bookObject = this.toObject();

    delete bookObject.__v;

    return bookObject;
}

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
