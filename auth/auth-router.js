const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/secrets')

const Users = require('../users/users-model.js');

router.post('/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user)

        res.status(200).json({ user, token });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(({name, message, stack, code}) => {
      res.status(500).json({name, stack, code, message});
    });
});

function generateToken (user) {
  const payload = {
    id: user.id,
    username: user.username,
    user_type: user.user_type
  }
  const options = {
    expiresIn: '1h',

  }
  return jwt.sign(payload, jwtSecret, options)
}

module.exports = router;