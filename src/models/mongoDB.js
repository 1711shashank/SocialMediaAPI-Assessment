const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

const db_link = process.env.MONGO_URL;

mongoose.set('strictQuery', false);
mongoose.connect(db_link)
    .then(() => {
        console.log("db connected");
    }).catch((err) => {
        console.log(err);
    })

// database stracture
const userDataBsae = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    token: String,
    post: [],
    followers: [],
    following: []

})

const User = mongoose.model("userDataBsae", userDataBsae);
module.exports = { User };