const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
    //get the user from the jwt token and add Id to req object
    const token = req.header("auth-token");
    console.log("token",token);
    if (!token) {
       return res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data;
        next();
    } catch (error) {
        return res.status(401).send({ error: "Please authenticate using a valid token" })
    }
}
module.exports = fetchuser; 