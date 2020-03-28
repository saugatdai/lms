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

test('No user creation without login', async () => {
    await request(app).post('/user').send({
        "name": "Laba Limbu",
        "role": "student",
        "email": "labalimbu@gmail.com",
        "age": 25,
        "password": "nothing21"
    }).expect(500);
});

test('Login users', async () => {
    await request(app).post('/user/login').send({
        "email": "anilman@gmail.com",
        "password": "nothing21"
    }).expect(200);
});

test('Not logging in invalid users', async () => {
    await request(app).post('/user/login').send({
        "email": "holus@molus.com",
        "password": "invalidPassword"
    }).expect(400);
});

test('Librarians can create a user', async () => {
    await request(app).post('/user').
        set('Authorization', `Bearer ${userOne.tokens[0].token}`).
        send({
            "name": "Laba Limbu",
            "role": "student",
            "email": "labalimbu@gmail.com",
            "age": 25,
            "password": "nothing21"
        }).expect(201);
});

test('User log out', async () => {
    await request(app).post('/user/logout')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200);
});

test('Log out from all devices', async () => {
    await request(app).post('/user/logoutall')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`).
        send().expect(200);
});

test('Librarians can view all users', async () => {
    await request(app).get('/user/allusers')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200);
});

test('Normal users can not view all users', async () => {
    await request(app).get('/user/allusers').
        set('Authorization', `Bearer ${userTwo.tokens[0].token}`).
        send().expect(400);
});

test('Librarians can view any user profile', async () => {
    await request(app).get(`/user/profile/${testId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200);
});

test('Normal user can not view any user profile', async () => {
    await request(app).get(`/user/profile/${testId}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send().expect(400);
});

test('Normal users can view their profile', async () => {
    await request(app).get(`/user/profile/${userTwo._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send().expect(200);
});

test('Librarians can update user', async () => {
    await request(app).patch(`/user/updateuser/${userOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "name": "Saugat Prasad Sigdel",
            "age": 32,
            "role": "staff",
            "email": "saugatdai@gmail.com",
            "password": "hancysaugat"
        }).expect(200);
});

test('Normal Users can not update any user', async () => {
    await request(app).patch(`/user/updateuser/${testId}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            "name": "Saugat Prasad Sigdel",
            "age": 32,
            "role": "staff",
            "email": "saugatdai@gmail.com",
            "password": "hancysaugat"
        }).expect(400);
});

test('Non existant user can not be updated', async () => {
    await request(app).patch(`/user/updateuser/${testId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "name": "Saugat Prasad Sigdel",
            "age": 32,
            "role": "staff",
            "email": "saugatdai@gmail.com",
            "password": "hancysaugat"
        }).expect(500);
});

test('Librarian deletes a user', async () => {
    await request(app).delete(`/user/deleteuser/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200);
});

test('Non existant user can not be deleted', async () => {
    await request(app).delete(`/user/deleteuser/${testId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(500);
});

test('Librarians issues books for users', async () => {
    await request(app).post(`/user/issuebook/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "ISBN": 9841328768
        }).expect(200);
});

test('Can not delete users with issued books', async () => {
    await request(app).post(`/user/issuebook/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "ISBN": 9841328768
        }).expect(200);
    await request(app).delete(`/user/deleteuser/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(400);
});

test('Return issued book', async () => {
    await request(app).post(`/user/issuebook/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "ISBN": 9841328768
        }).expect(200);

    await request(app).post(`/user/returnbook/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "ISBN": 9841328768
        }).expect(200);
});

test('Get books issued by a user', async () => {
    await request(app).post(`/user/issuebook/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "ISBN": 9841328768
        }).expect(200);
    await request(app).get(`/user/mybooks/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200);
});

test('User can not view books issued by others', async () => {
    await request(app).post(`/user/issuebook/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "ISBN": 9841328768
        }).expect(200);
    await request(app).get(`/user/mybooks/${testId}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send().expect(400);
});

test('Users can view books issued by them', async () => {
    await request(app).post(`/user/issuebook/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            "ISBN": 9841328768
        }).expect(200);
    await request(app).get(`/user/mybooks/${userTwo._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send().expect(200);
});
