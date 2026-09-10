import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ error: 'Server authentication is not configured.' });
    }

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No authenticated token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication token is invalid or expired.' });
  }
};

export default auth;
