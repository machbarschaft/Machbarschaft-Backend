import mongoose from 'mongoose';

//import all models
import Access from "./access";

const connectDB = () => {
    return mongoose.connect(process.env.MONGODB_URI);
};

const models = { Access } //add all models

export { connectDB };
export default models;