const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    // first check request headers has authorization or not
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token not found' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user info to the request object
        req.user = decoded; // You can attach any user information to the request object
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
}

// Function to generate jwt token
const generateToken = (userData) => {
    // Generate new JWT token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30m' }); // Changed '30000' to '30m' for clarity
}

module.exports = { jwtMiddleware, generateToken };
