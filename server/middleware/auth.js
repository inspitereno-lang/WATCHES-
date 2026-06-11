import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No authenticated token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 't24watches_dubai_luxury_secret_signature_jwt_hash_key_182937');
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication token is invalid or expired.' });
  }
};

export default auth;
