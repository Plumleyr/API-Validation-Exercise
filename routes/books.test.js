process.env.NODE_ENV = "test";

const request = require('supertest');

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let testBook;
let data = {
    "isbn": "000000000",
    "amazon_url": "http://a.co/test",
    "author": "test author",
    "language": "english",
    "pages": 1,
    "publisher": "test publisher",
    "title": "test title",
    "year": 1998
  }

let updateData = {
    "isbn": "000000000",
    "amazon_url": "http://a.co/test",
    "author": "test author",
    "language": "spanish",
    "pages": 3,
    "publisher": "test publisher",
    "title": "test title",
    "year": 1998
  }

let wrongData = {
    "isbn": "000000000",
    "amazon_url": "http://a.co/test",
    "author": "test author",
    "language": true,
    "pages": "5",
    "publisher": "test publisher",
    "title": "test title",
    "year": 1998
  }

let data2 = {
    "isbn": "000000001",
    "amazon_url": "http://a.co/test2",
    "author": "test2 author",
    "language": "english",
    "pages": 2,
    "publisher": "test2 publisher",
    "title": "test2 title",
    "year": 1997
  }

let incompleteData = {
    "isbn": "000000001",
    "author": "test2 author",
    "language": "english",
    "pages": 2,
    "title": "test2 title",
    "year": 1997
  }

beforeEach(async() => {
    testBook = await Book.create(data)
});

afterEach(async() => {
    await db.query(`DELETE FROM books`);
});

afterAll(async() => {
    await db.end();
});

describe('GET /books', () => {
    test("GETS all books", async() => {
        const response = await request(app).get(`/books`)
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({"books" : [testBook]})
    });
});

describe('GET /books/:id', () => {
    test("GETS a book", async() => {
        const response = await request(app).get(`/books/${testBook.isbn}`)
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({book : testBook})
    });

    test("GETS an unregistered book", async() => {
        const response = await request(app).get(`/books/000001`)
        expect(response.statusCode).toBe(404);
        expect(response.body.error.message).toEqual("There is no book with an isbn 000001")
    });
});

describe('POST /books', () => {
    test("CREATES a book", async() => {
        const response = await request(app).post(`/books`).send(data2)
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({book:{
            "isbn": "000000001",
            "amazon_url": "http://a.co/test2",
            "author": "test2 author",
            "language": "english",
            "pages": 2,
            "publisher": "test2 publisher",
            "title": "test2 title",
            "year": 1997}});
    });

    test("POSTS an incomplete book", async() => {
        const response = await request(app).post(`/books`).send(incompleteData)
        expect(response.statusCode).toBe(400);
        expect(response.body.error.message).toEqual(["instance requires property \"amazon_url\"", "instance requires property \"publisher\""])
    });
});

describe('PATCH /books/:isbn', () => {
    test("UPDATES property(s) of a book", async() => {
        const response = await request(app).patch(`/books/${testBook.isbn}`).send({"pages" : 264})
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({book:{
            "isbn": "000000000",
            "amazon_url": "http://a.co/test",
            "author": "test author",
            "language": "english",
            "pages": 264,
            "publisher": "test publisher",
            "title": "test title",
            "year": 1998
          }});
    });

    test("UPDATES property(s) incorrectly of a book", async() => {
        const response = await request(app).patch(`/books/${testBook.isbn}`).send({"pages": true})
        expect(response.statusCode).toBe(400);
        expect(response.body.error.message).toEqual(["instance.pages is not of a type(s) integer"])
    });
});

describe('PUT /books', () => {
    test("UPDATES a book", async() => {
        const response = await request(app).put(`/books/${testBook.isbn}`).send(updateData)
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({book:{
            "isbn": "000000000",
            "amazon_url": "http://a.co/test",
            "author": "test author",
            "language": "spanish",
            "pages": 3,
            "publisher": "test publisher",
            "title": "test title",
            "year": 1998
          }});
    });
    test("UPDATES a book with wrong data", async() => {
        const response = await request(app).put(`/books/${testBook.isbn}`).send(wrongData)
        expect(response.statusCode).toBe(400);
        expect(response.body.error.message).toEqual(["instance.language is not of a type(s) string", "instance.pages is not of a type(s) integer"])
    });
});

describe('DELETE /books/:id', () => {
    test("DELETES a book", async() => {
        const response = await request(app).delete(`/books/${testBook.isbn}`)
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toEqual("Book deleted")
    });
});