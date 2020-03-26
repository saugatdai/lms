//watch for relational database.
// https://vegibit.com/mongoose-relationships-tutorial/

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    role: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['staff', 'student', 'librarian']
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    age: {
        type: Number,
        required: true,
        min: [18, 'Age must be greater than 18'],
        max: [60, 'Age should not be more than 60']
    },
    password: {
        type: String,
        rquired: true
    },
    booksIssued: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
        },
        date: {
            type: Date
        }
    }],
    tokens: [{
        token: {
            type: String,
            rquired: true
        }
    }]
});

//Before saving the password, first encrypt it
userSchema.pre('save', async function () {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});



userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;

    return userObject;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable to login');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new Error('Unable to login');
    }

    return user;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'secretphrase');
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

const User = mongoose.model('User', userSchema);

module.exports = User;