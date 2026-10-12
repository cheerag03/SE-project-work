// middleware/auth.js (example)
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).end();
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id; // or payload.userId
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
