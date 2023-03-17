const express = require("express");
const { User } = require('./src/models/mongoDB');
const { authenticate, getUserData, getPostData, addPost, getAllPostData, deletePost, followUser, unfollowUser, likePost, unlikePost, comment } = require("./src/controller/userController");
const { authenticateToken } = require("./src/middleware/middleware");

const app = express();
var cors = require("cors");

app.use(cors({ origin: '*', optionsSuccessStatus: 200, credentials: true }));

app.options("*", cors({ origin: true, optionsSuccessStatus: 200, credentials: true }));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.options("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://example.com");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(204);
});



const port = 5000 || process.env.PORT;
app.listen(port);


app.post("/api/authenticate", authenticate);

app.get("/api/user", authenticateToken, getUserData);

app.post("/api/posts", authenticateToken, addPost);
app.get("/api/posts/:id", authenticateToken, getPostData);
app.get("/api/all_posts", authenticateToken, getAllPostData);
app.delete("/api/posts/:id", authenticateToken, deletePost);


app.post("/api/follow/:id", authenticateToken, followUser);
app.post("/api/unfollow/:id", authenticateToken, unfollowUser);

app.post("/api/like/:id", authenticateToken, likePost);
app.post("/api/unlike/:id", authenticateToken, unlikePost);
app.post("/api/comment/:id", authenticateToken, comment);




































app.post("/addUser", addUser);

async function addUser(req, res) {

    const { email, password } = req.body;

    const newUser = new User({
        email: email,
        password: password,
        post: [],
        followers: [],
        following: []
    });

    await newUser.save();

    return res.status(200).send({ newUser });



}