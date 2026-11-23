const jwt = require('jsonwebtoken');

const expiration = '2h';

module.exports = {
  authMiddleware: function (req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'You must be logged in to do that.',
      });
    }

    const token = authorization.split(' ')[1];

    try {
      const { data } = jwt.verify(
        token,
        process.env.JWT_SECRET,
        { maxAge: expiration }
      );

      req.user = data;
      next();
    } catch (err) {
      return res.status(401).json({
        message: 'Invalid or expired token.',
      });
    }
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign(
      { data: payload },
      process.env.JWT_SECRET,
      { expiresIn: expiration }
    );
  },
};
