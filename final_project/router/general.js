const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;  // Estrai 'username' e 'password' dal corpo della richiesta

    // Verifica che 'username' e 'password' siano forniti
    if (!username || !password) {
        return res.status(400).json({ message: "Both username and password are required" });
    }

    // Verifica se l'utente esiste già
    if (users[username]) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Aggiungi l'utente alla lista
    users.push({ username, password });


    // Risposta di successo
    return res.status(201).json({ message: "User registered successfully" });
});


// Get the book list available in the shop
//public_users.get('/', function (req, res) {
//    res.status(200).json({
//        books: books
//    });
//});


public_users.get('/', async (req, res) => {
    try {
      // Simulo una chiamata asincrona restituendo i libri
      const data = await new Promise((resolve) => {
        setTimeout(() => resolve(books), 100); // finto delay
      });
      return res.status(200).send(JSON.stringify(data, null, 2));
    } catch (err) {
      return res.status(500).json({ message: 'Errore nel recupero dei libri', error: err.message });
    }
  });
  



// Get book details based on ISBN (async/await version - Task 11)
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
      const isbn = req.params.isbn;
  
      // Simulo una chiamata asincrona (potrebbe essere una query DB o chiamata API)
      const book = await new Promise((resolve) => {
        setTimeout(() => {
          const found = Object.values(books).find(b => b.ISBN === isbn);
          resolve(found);
        }, 100);
      });
  
      if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
      }
  
      return res.status(200).json(book);
    } catch (err) {
      return res.status(500).json({
        message: 'Errore nel recupero dei dettagli del libro',
        error: err.message
      });
    }
  });
  
// Get book details based on author (async/await version - Task 12)
public_users.get('/author/:author', async (req, res) => {
    try {
      const author = req.params.author;
        const booksByAuthor = await new Promise((resolve) => {
        setTimeout(() => {
          const filtered = Object.values(books).filter(
            b => b.author.toLowerCase() === author.toLowerCase()
          );
          resolve(filtered);
        }, 100);
      });
  
      if (booksByAuthor.length === 0) {
        return res.status(404).json({ message: `No books found by author ${author}` });
      }
  
      return res.status(200).json(booksByAuthor);
    } catch (err) {
      return res.status(500).json({
        message: 'Errore nel recupero dei libri per autore',
        error: err.message
      });
    }
  });
  


public_users.get('/title/:title', async (req, res) => {
    try {
      const title = req.params.title;
      const booksByTitle = await new Promise((resolve) => {
        setTimeout(() => {
          const filtered = Object.values(books).filter(
            b => b.title.toLowerCase() === title.toLowerCase()
          );
          resolve(filtered);
        }, 100);
      });
  
      if (booksByTitle.length === 0) {
        return res.status(404).json({ message: `No books found with title ${title}` });
      }
  
      return res.status(200).json(booksByTitle);
    } catch (err) {
      return res.status(500).json({
        message: 'Errore nel recupero dei libri per titolo',
        error: err.message
      });
    }
  });
  

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Trova il libro con l'ISBN specificato
    const book = Object.values(books).find(b => b.ISBN === isbn);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Controlla se il libro ha recensioni
    if (Object.keys(book.reviews).length === 0) {
        return res.status(404).json({ message: "No reviews available for this book" });
    }

    // Restituisce le recensioni del libro
    return res.status(200).json(book.reviews);
});


module.exports.general = public_users;
