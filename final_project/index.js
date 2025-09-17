const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Leggi l’Authorization correttamente
    const authHeader = req.headers['authorization'] || req.get('authorization');
  
    if (!authHeader) {
      return res.status(403).json({ message: 'No token provided' });
    }
  
    // Supporta sia "Bearer <token>" che il token nudo
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;
  
    jwt.verify(token, 'SecretKey', function (err, decoded) {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.user = decoded; // { username: ... }
      next();
    });
  });
  

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
