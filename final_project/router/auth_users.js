const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helpers
const isValid = (username) => !users.some(user => user.username === username);
const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username);
  return !!(user && user.password === password);
};

// ---- LOGIN (save username in session and also return JWT) ----
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Both username and password are required" });

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.password !== password) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ username: user.username }, 'SecretKey', { expiresIn: '1h' });

  // Store username (and token if you want) in the session
  if (req.session) {
    req.session.username = user.username;
    req.session.token = token; // optional
  }

  return res.status(200).json({ message: "Login successful", token });
});

// Helper: trova il libro per ISBN (campo interno), restituisce [id, book] oppure [null, null]
function findBookByIsbn(isbnParam) {
    for (const id of Object.keys(books)) {
      const book = books[id];
      if (book && typeof book.ISBN === 'string' && book.ISBN === isbnParam) {
        return [id, book];
      }
    }
    return [null, null];
  }
  
  regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbnParam = req.params.isbn;          // es: "978-3-16-148410-0"
    const review = req.query.review;            // deve arrivare come query ?review=...
  
    // 1) prendo lo username dalla sessione; fallback a JWT (Authorization: Bearer ...)
    let username = req.session?.username;
    if (!username) {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (token) {
        try {
          const payload = jwt.verify(token, 'SecretKey');
          username = payload.username;
        } catch (_) { /* token non valido, gestito di seguito */ }
      }
    }
    if (!username) return res.status(401).json({ message: "Unauthorized: username non presente in session/token" });
  
    // 2) validazione review
    if (!review || !review.trim()) {
      return res.status(400).json({ message: "Parametro di query 'review' obbligatorio" });
    }
  
    // 3) trova libro per ISBN interno
    const [bookId, book] = findBookByIsbn(isbnParam);
    if (!book) return res.status(404).json({ message: `Nessun libro con ISBN ${isbnParam}` });
  
    // 4) assicura l'oggetto reviews
    if (!book.reviews || typeof book.reviews !== 'object') book.reviews = {};
  
    // 5) add/modify review per utente
    const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
    book.reviews[username] = review.trim();
  
    // 6) opzionale: salva indietro (utile per chiarezza, anche se stesso riferimento)
    books[bookId] = book;
  
    return res.status(200).json({
      message: isUpdate
        ? `Review aggiornata per ISBN ${isbnParam} da ${username}`
        : `Review aggiunta per ISBN ${isbnParam} da ${username}`,
      isbn: isbnParam,
      bookTitle: book.title,
      reviews: book.reviews
    });
  });
  
  // DELETE: rimuove la review dell'utente corrente per l'ISBN indicato
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbnParam = req.params.isbn;
  
    // 1) recupero username da sessione, fallback a JWT "Authorization: Bearer <token>"
    let username = req.session?.username;
    if (!username) {
      const authHeader = req.headers['authorization'] || req.get('authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (authHeader || null);
      if (token) {
        try {
          const payload = jwt.verify(token, 'SecretKey');
          username = payload.username;
        } catch (_) { /* token non valido, gestito sotto */ }
      }
    }
    if (!username) {
      return res.status(401).json({ message: "Unauthorized: username non presente in session/token" });
    }
  
    // 2) trova libro per ISBN interno
    const [bookId, book] = findBookByIsbn(isbnParam);
    if (!book) {
      return res.status(404).json({ message: `Nessun libro con ISBN ${isbnParam}` });
    }
  
    // 3) controlla se esiste una review dell'utente
    if (!book.reviews || typeof book.reviews !== 'object') {
      book.reviews = {};
    }
    if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
      return res.status(404).json({
        message: `Nessuna review di ${username} trovata per ISBN ${isbnParam}`,
        isbn: isbnParam,
        reviews: book.reviews
      });
    }
  
    // 4) elimina la review dell'utente
    delete book.reviews[username];
    books[bookId] = book; // (ridondante ma esplicito)
  
    return res.status(200).json({
      message: `Review di ${username} cancellata per ISBN ${isbnParam}`,
      isbn: isbnParam,
      bookTitle: book.title,
      reviews: book.reviews
    });
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
