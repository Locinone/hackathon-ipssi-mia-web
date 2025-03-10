const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { userSchema } = require('../validators/userValidator');

const login = async (req, res) => {
  try {
    userSchema.parse(req.body);

    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    
    if (user && user.password === password) {
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(400).json({ message: e.errors });
  }
};

const register = async (req, res) => {
  try {
    userSchema.parse(req.body);
    
    const { username, password } = req.body;
    
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (e) {
    res.status(400).json({ message: e.errors });
  }
};

module.exports = { login, register };
