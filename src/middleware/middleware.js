const jwt = require('jsonwebtoken');
const { User } = require('../models/mongoDB');

exports.authenticateToken = async(req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(405).json({
            title: "Invalid Request",
            message: "Please Check the Request Header Token Mismatch"
        });
        return
    }
    if (!authorization.startsWith("Bearer ")) {
        res.status(405).json({
            title: "Invalid Request",
            message: "Hearder not Started with bearer"
        });
        return
    }

    const token = authorization.replace('Bearer ', '')
    let result;

    try {
        result = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (e) {
        res.status(422).json({
            status: 'FAILURE',
            message: 'Token Validation Failed! Invalid Token',
        })
        return
    }

    if (!result) {
        res.status(405).json({
            title: "Token Mismatch",
            message: "Please Check the Request Header Token Mismatch"
        });
        return
    }

    let user = await User.findOne({ _id: result.payload });
    req.headers.email=user.email;

    if (!user) {
        res.status(403).json({
            title: "Invalid Request",
            message: "User Not Exists in DocValidationApi If you are facing any issue drop a mail team.docvalidation@gmail.com our team will respond you within 24 hrs"
        });
        return
    }
    if (user.token != token) {
        res.status(405).json({
            title: "Token Mismatch in Database",
            message: "Please Check the Request Header Token Mismatch"
        });
        return
    }
    next();
}