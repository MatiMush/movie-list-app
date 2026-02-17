"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res
            .status(401)
            .json({ message: 'Not authorized to access this route' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        return res
            .status(401)
            .json({ message: 'Not authorized to access this route' });
    }
};
exports.protect = protect;
