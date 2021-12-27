import jwt from 'jsonwebtoken';

require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = req.headers.token;


    if (!token) return res.sendStatus(401).json({ 'success': false, 'message': 'No token provided' });

    try {
        const returnedPayload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.email = returnedPayload.email;
        next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(403).send(error);
    }
};

module.exports = verifyToken;