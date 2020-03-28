const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const app = require('../src/app');
const User = require('../src/models/user');

const id1 = new mongoose.Types.ObjectId;
const id2 = new mongoose.Types.ObjectId;

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
    await new User(userOne).save();
    await new User(userTwo).save();
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