const express = require('express');
const router = express.Router();


class Card {
  constructor(owner, number, expireMonth, expireYear, cvc) {
    this.company = 'VISA';
    this.owner = owner;
    this.number = number;
    this.expireMonth = expireMonth;
    this.expireYear = expireYear;
    this.cvc = cvc;
  }

  get isDefined() {
    return this.owner && this.number && this.expireMonth && this.expireYear && this.cvc;
  }
}


class User {
  constructor(email, password, phone = null, card = undefined) {
    this.id = undefined;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.card = card;
  }
}

const users = [];

addUser(new User('ilkka.salmenius@iki.fi', 'hello', '050 61698', new Card('Matti Meikäläinen', '1234 1234 1234 1234', 2, 22, '123')));
addUser(new User('ilkka.salmenius@gmail.com', 'hello', '050 61698', new Card('Matti Meikäläinen', '1234 1234 1234 1234', 2, 22, '123')));
addUser(new User('ilkka.salmenius@superapp.fi', 'hello', '050 61698', new Card('Matti Meikäläinen', '1234 1234 1234 1234', 2, 22, '123')));

function addUser(user) {
  users.push(user);
  user.id = users.length;
}

function findUserById(id) {
  return users.find(user => user.id == id);
}

function findUserByEmail(email) {
  return users.find(user => user.email == email);
}

function findUserIndexById(id) {
  return users.findIndex(item => item.id == id);
}



router.get('/users', (req, res) => {
  console.log(`Get ${users.length} users`);
  res.send(users);
});

router.get('/user/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);

  const user = findUserById(id);

  if (user) {
    console.log(`Get user ${JSON.stringify(user)}`);
    res.send(user);
  } else {
    sendResponseText(res, 404, `User ${id} not found`);
  }
});

router.post('/user', (req, res) => {
  const email = req.body.email;

  if (!findUserByEmail(email)) {
    const user = new User(email, req.body.password, req.body.phone);
    addUser(user);
  
    res.status(201);
    res.send(user);
    console.log(`Add user ${JSON.stringify(user)}`);
  } else
    sendResponseText(res, 400, `User ${email} already exists`);
});

router.put('/user/:id', (req, res) => {
  function updateField(user, name, required) {
    if (req.body[name] !== undefined) {
      if (req.body[name] || required)
        user[name] = req.body[name];
      else
        user[name] = undefined;
    }
  }

  const id = req.params.id;
  const user = findUserById(id);

  if (user) {
    updateField(user, 'email', true);
    updateField(user, 'phone');

    res.send(user);
    console.log(`Update user ${id} to ${JSON.stringify(req.body)}`);
  } else
    userNotFound(res, id);
});

router.delete('/user/:id', (req, res) => {
  const id = req.params.id;
  const index = findUserIndexById(id);

  if (index != -1) {
    users.splice(index, 1);

    res.send({
      id,
      index
    });

    console.log(`Delete user ${id}`);
  } else
  userNotFound(res, id);
});

function userNotFound(res, id) {
  sendResponseText(res, 404, `User ${id} not found`);
}

function sendResponseText(res, status, text) {
  res.status(status);
  res.send(text);
  console.log(text);
}

module.exports = router;
