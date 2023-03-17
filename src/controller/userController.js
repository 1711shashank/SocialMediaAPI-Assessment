
const { User } = require('../models/mongoDB');
const jwt = require('jsonwebtoken');
var uniqid = require('uniqid');



exports.authenticate = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email, password : password });

    if (!user) {
        return res.status(401).send({ error: 'Invalid email or password' });
    }

    const jwtToken = jwt.sign({ payload: user._id }, process.env.JWT_SECRET_KEY , { expiresIn: '12h' });

    await User.findOneAndUpdate(
        { email: email },
        { token: jwtToken }
    );

    return res.status(200).send({ jwtToken });

}

exports.getUserData = async (req, res) => {
    try {

        const user = await User.findOne({ email: req.headers.email });

        const UserData = {
            Name: user.name,
            NumberOfFollowers: user.followers.length,
            NumberOfFollowing: user.following.length
        }

        res.status(200).json({
            Message: UserData
        });
    } catch (err) {
        console.log(err);
    }
}

exports.addPost = async (req, res) => {
    try {

        const email =  req.headers.email;
        const { title, description } = req.body;

        const newPost = {
            id: uniqid(),
            title: title,
            description: description,
            createdTime: new Date(),
            likedBy: [],
            comment: []
        }

        await User.findOneAndUpdate(
            { email: email }, // filter
            { $addToSet: { post: newPost } }, // update
            { upsert: true, new: true } // conduction
        );

        res.status(200).json({
            Message: "Created a new post",
        });
    } catch (err) {
        console.log(err);
    }
}
exports.deletePost = async (req, res) => {
    try {

        const postId = req.params.id;
        const email = req.headers.email;

        await User.findOneAndUpdate(
            { "post.id": postId, email : email }, // filter
            { $pull: { post: { id: postId } } }, // update
            { upsert: true, new: true } // conduction
        );

        res.status(200).json({
            Message: "Post Deleted",
        });
    } catch (err) {
        console.log(err);
    }
}

exports.followUser = async (req, res) => {
    try {


        const userId = req.params.id;
        const email = req.headers.email;

        const user = await User.findOne({ _id: userId });

        if (user.email === email) {
            return res.status(401).send({ error: 'Can not follow your own Account' });
        }

        await User.findOneAndUpdate(
            { _id: userId }, // filter
            { $addToSet: { followers: email } }, // update
            { upsert: true, new: true } // conduction
        );

        await User.findOneAndUpdate(
            { email: email }, // filter
            { $addToSet: { following: user.email } }, // update
            { upsert: true, new: true } // conduction
        );

        res.status(200).json({
            Message: `You Started following ${user.name}`
        });
    } catch (err) {
        console.log(err);
    }
}
exports.unfollowUser = async (req, res) => {
    try {


        const userId = req.params.id;
        const email = req.headers.email;

        const user = await User.findOne({ _id: userId });

        await User.findOneAndUpdate(
            { _id: userId }, // filter
            { $pull: { followers: email } }, // update
            { upsert: true, new: true } // conduction
        );

        await User.findOneAndUpdate(
            { email: email }, // filter
            { $pull: { following: user.email } }, // update
            { upsert: true, new: true } // conduction
        );

        res.status(200).json({
            Message: `You Started unfollowing ${user.name}`
        });
    } catch (err) {
        console.log(err);
    }
}

exports.likePost = async (req, res) => {
    try {


        const postId = req.params.id;
        const email = req.headers.email;

        await User.findOneAndUpdate(
            { "post.id": postId }, // filter
            { $addToSet: { "post.$.likedBy": email } }, // update
            { upsert: true, new: true } // conduction
        );

        res.status(200).json({
            Message: `Post Liked`
        });
    } catch (err) {
        console.log(err);
    }
}
exports.unlikePost = async (req, res) => {
    try {


        const postId = req.params.id;
        const email = req.headers.email;

        await User.findOneAndUpdate(
            { "post.id": postId }, // filter
            { $pull: { "post.$.likedBy": email } }, // update
            { upsert: true, new: true } // conduction
        );

        res.status(200).json({
            Message: `Post Unliked`
        });
    } catch (err) {
        console.log(err);
    }
}
exports.comment = async (req, res) => {
    try {


        const postId = req.params.id;
        const { comment } = req.body;
        const email = req.headers.email;


        const commentData = {
            comment: comment,
            commentId: uniqid(),
            commentBy: email
        }


        await User.findOneAndUpdate(
            { "post.id": postId }, // filter
            { $addToSet: { "post.$.comment": commentData } }, // update
            { upsert: true, new: true } // conduction
        );

        res.status(200).json({
            CommentID: commentData.commentId
        });
    } catch (err) {
        console.log(err);
    }
}


exports.getPostData = async (req, res) => {

    const postId = req.params.id;
    const email = req.headers.email;

    const postData = await User.findOne({ "post.id": postId, email:email});

    reqData = {
        "Number Of Likes": postData.post[0].likedBy.length,
        "Number Of Comments": postData.post[0].comment.length
    }

    res.status(200).json({
        postData: reqData
    });

}
exports.getAllPostData = async (req, res) => {

    const email = req.headers.email;

    const allPostData = await User.findOne({ email });

    const temp1 = allPostData.post.map(post => {
        return {
            ...post,
            likes: post.likedBy.length,
            likedBy: undefined
        };
    });

    const newData = temp1.map(post => ({
        ...post,
        comment: post.comment.map(({ comment, ...rest }) => ({ comment }))
    }));



    res.status(200).json({
        postData: newData
    });

}



