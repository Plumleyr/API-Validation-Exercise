const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookSchema = require("../bookSchema.json");
const ExpressError = require("../expressError");

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const validate = jsonschema.validate(req.body, bookSchema);
    if(!validate.valid){
      let errors = validate.errors.map(err => err.stack);
      let error = new ExpressError(errors, 400);
      return next(error);
    }

    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:isbn", async (req, res, next) => {
  try{
    let book = await Book.findOne(req.params.isbn);
    for(let key of Object.keys(req.body)){
      book[key] = req.body[key];
    }
    const validate = jsonschema.validate(book, bookSchema);
    if(!validate.valid){
      let errors = validate.errors.map(err => err.stack);
      let error = new ExpressError(errors, 400);
      return next(error);
    }

    const updatedBook = await Book.update(req.params.isbn, book);
    return res.json({ book: updatedBook });
  } catch (e) {
    return next(e);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const validate = jsonschema.validate(req.body, bookSchema);
    if(!validate.valid){
      let errors = validate.errors.map(err => err.stack);
      let error = new ExpressError(errors, 400);
      return next(error);
    }

    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
