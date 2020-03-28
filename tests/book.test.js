const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const app = require('../src/app');
const User = require('../src/models/user');
const Book = require('../src/models/book');
const Author = require('../src/models/author');

const id1 = new mongoose.Types.ObjectId;
const id2 = new mongoose.Types.ObjectId;
const bookId1 = new mongoose.Types.ObjectId;
const bookId2 = new mongoose.Types.ObjectId;
const bookId3 = new mongoose.Types.ObjectId;
const authorId1 = new mongoose.Types.ObjectId;
const authorId2 = new mongoose.Types.ObjectId;
const testId = new mongoose.Types.ObjectId;

const book1 = {
    _id: bookId1,
    title: "The complete IOT design",
    ISBN: 9841328768,
    price: 456,
    pages: 305,
    quantity: 1,
    authors: [authorId1.toString()]
};

const book2 = {
    _id: bookId2,
    title: "The complete IOT design",
    ISBN: 9867053771,
    price: 456,
    pages: 305,
    quantity: 1,
    authors: [authorId2.toString()]
};

const book3 = {
    _id: bookId3,
    title: "The complete IOT design",
    ISBN: 9843438627,
    price: 456,
    pages: 305,
    quantity: 1,
    authors: [authorId1.toString(), authorId2.toString()]
};

const author1 = {
    _id: authorId1,
    name: "Author 1",
    email: "author1@gmail.com"
}

const author2 = {
    _id: authorId2,
    name: "Author 2",
    email: "author2@gmail.com"
}

const userOne = {
    _id: id1,
    name: "Anil Man Shrestha",
    role: 'librarian',
    email: "anilman@gmail.com",
    age: 45,
    password: "nothing21",
    tokens: [{ token: jwt.sign({ _id: id1 }, 'secretphrase') }]
};

const userTwo = {
    _id: id2,
    name: "Holus Molus",
    role: 'staff',
    email: "holusmolus@gmail.com",
    age: 35,
    password: "nothing21",
    tokens: [{ token: jwt.sign({ _id: id2 }, 'secretphrase') }]
};

beforeEach(async () => {
    await User.deleteMany();
    await Book.deleteMany();
    await Author.deleteMany();

    await new User(userOne).save();
    await new User(userTwo).save();
    await new Book(book1).save();
    await new Book(book2).save();
    await new Book(book3).save();

    await new Author(author1).save();
    await new Author(author2).save();
});

test('librarians can add a book', async () => {
    await request(app).post('/book')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "title": "The complete IOT design",
            "ISBN": 9813273310,
            "price": 456,
            "pages" : 305,
            "quantity": 1,
            "authors": ["5e7b70190dcf9f6a696cdd11"]
        }).expect(201);
});

test('Normal users can not add a book', async () => {
    await request(app).post('/book')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            "title": "The complete IOT design",
            "ISBN": 9813273310,
            "price": 456,
            "pages" : 305,
            "quantity": 1,
            "authors": ["5e7b70190dcf9f6a696cdd11"]
        }).expect(400);
});

test('All users can view books list in library', async () => {
    request(app).get('/listallbooks')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send().expect(200);
});
