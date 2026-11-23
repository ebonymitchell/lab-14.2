const router = require('express').Router();
const { User } = require('../../models');
const { signToken } = require('../../utils/auth');

// POST /api/users/register - Create a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({
      username,
      email,
      password,
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(400).json({
      message: 'Unable to register user.',
    });
  }
});

// POST /api/users/login - Authenticate a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isCorrectPassword(password))) {
      return res.status(400).json({
        message: 'Incorrect email or password.',
      });
    }

    const token = signToken(user);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to log in.',
    });
  }
});

module.exports = router;
