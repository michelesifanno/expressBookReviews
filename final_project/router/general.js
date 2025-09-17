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
public_users.get('/', function (req, res) {
    res.status(200).json({
        books: books
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Usa Object.values per ottenere un array di libri e poi filtra quelli con l'ISBN corrispondente
    const booksFiltered = Object.values(books).filter(b => b.ISBN === isbn);

    if (booksFiltered.length === 0) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Restituisce il primo libro trovato (o l'intero array se preferisci)
    return res.status(200).json(booksFiltered[0]);
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    const authorFiltered = Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());

    if (authorFiltered.length === 0) {
        return res.status(404).json({ message: "Author not found" });
    }

    //Restituisce i libri dell'autore
    return res.status(200).json(authorFiltered);
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const titleFiltered = Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());

    if (titleFiltered.length === 0) {
        return res.status(404).json({ message: "Title not found" });
    }

    //Restituisce i libri dell'autore
    return res.status(200).json(titleFiltered);
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
