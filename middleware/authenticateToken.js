
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // No token was providedd
  if (token == null) return res.sendStatus(401); 

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // Token is not valid
    if (err) return res.sendStatus(403); 
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
