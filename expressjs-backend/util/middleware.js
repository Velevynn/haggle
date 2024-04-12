// middleware.js
const jwt = require('jsonwebtoken');

const secretKey = 'YourSecretKey'; // 32 bytes, generated using a cryptographically secure random number generator to ensure unpredictability... move to .env

const verifyToken = (req, res, next) => {
  // Extract the 'Authorization' header from the incoming request.
    const bearerHeader = req.headers['authorization'];    
    if (!bearerHeader) return res.status(403).send({ message: "Token is required" });
  
    // The expected format of the header is "Bearer [token]". Split the header to extract the token part.
    const token = bearerHeader.split(' ')[1];

    // Use jwt.verify to check if the token is valid.
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return res.status(401).send({ message: "Invalid Token" });
      req.user = decoded;
      next();
    });
};

module.exports = { verifyToken };
