var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Access = new Schema({
    email: String,
    password: String
});

Access.plugin(passportLocalMongoose, { usernameField : 'email' });

module.exports = mongoose.model('Access', Access, 'Access');
