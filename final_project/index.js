const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js');

const app = express();

app.use(express.json());

app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}))

app.use("/customer/auth/*", function auth(req, res, next) {
  const accessToken = req.session.accessToken;
  if (!accessToken) {
    return res.status(401).send('Access Denied: No token provided.');
  }
  try {
    const verified = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/public", genl_routes);

app.listen(PORT, () => console.log
