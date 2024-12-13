const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose);

/*
You're free to define your User how you like. Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value.
Additionally, Passport-Local Mongoose adds some methods to your Schema. See the API Documentation section for more details.
*/


/* 
Passport-Local Mongoose use the "pbkdf2 algorithm" of the node crypto library. Pbkdf2 was chosen because platform independent (in contrary to bcrypt). For every user a generated salt value is saved to make rainbow table attacks even harder.
*/

module.exports = mongoose.model('User', userSchema);