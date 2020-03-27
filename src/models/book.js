const mongoose = require('mongoose');
const Path = require('path');

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
        type: String
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
    foreignField: 'booksIssued.book'
});

bookSchema.methods.uploadCover = async function (file) {
    console.log('adding cover');
    const pathForSave = Path.join(__dirname, '../../', file.path);
    this.cover = pathForSave;
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
