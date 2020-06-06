import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const accessSchema = new mongoose.Schema({
    email: String,
    password: String
});

accessSchema.plugin(passportLocalMongoose);

const Access = mongoose.model('Access', accessSchema);

export default Access;
