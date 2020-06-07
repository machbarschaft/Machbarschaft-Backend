import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const accessSchema = new mongoose.Schema({
    email: String,
    password: String
});


// const Access = mongoose.model('Access', accessSchema);

accessSchema.plugin(passportLocalMongoose, { usernameField : 'email' });

module.exports = mongoose.model('Access', accessSchema, 'Access');

//export default Access;
