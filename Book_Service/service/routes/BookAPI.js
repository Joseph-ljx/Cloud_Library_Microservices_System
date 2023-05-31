/**
 * Sub-router for Books
 */

const express = require("express");
const router = express.Router();
const con = require("../dbCon");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

// Request
const axios = require("axios");

// Make sure that each router is using a middleware.
// The middleware enable the usage of json define.

router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// Regex for validating that price must be
// 1. a valid number
// 2. With at most 2 decimal places.

const regex_1 = /^\d+\.\d{2}$/;

// Regex for validating that quantity should not have decimal.

const regex_2 = /^\d+$/;

/**
 * Retrieve Book endpoint:
 *
 * Description: return a book given its ISBN.
 * Both endpoints shall produce the same response.
 */

router.get(["/isbn/:isbn", "/:isbn"], async function (req, res) {
  const isbn = req.params.isbn || req.params.ISBN;
  console.log(`GET /api/books/isbn - ${isbn}`);

  // Generate SQL and run the script
  var sql = `SELECT * FROM Book WHERE ISBN = '${isbn}'`;
  con.query(sql, function (err, result) {
    if (err) {
      throw err;
    }

    // Accessing the length of the result.
    // Check isbn exist in the database
    let existNum = Object.keys(result).length;

    // Book Found
    if (result && existNum > 0) {
      // Stringify the result value -> string
      console.log(`Book found: ${JSON.stringify(result[0], null, 4)}`);

      // Return 200, string -> json response
      res.status(200).json(result[0]);
      return;
    } else {
      res.status(404).json({ message: "No such ISBN" });
      return;
    }
  });
});

/**
 * Add Book end point:
 *
 * Description: Add a book to the system.
 * The ISBN will be the unique identifier for the book.
 * The book is added to the Book data table on MySql (the ISBN is the primary key).
 */

router.post("/", async function (req, res) {
  console.log("POST /api/books/ - Adding a new book");

  // const bookInfo = JSON.stringify(req.body);
  console.log(req.body); // testing

  const { ISBN, title, Author, description, genre, price, quantity } = req.body;
  // All fields in the request body are mandatory
  // Check number validation
  if (
    !ISBN ||
    !title ||
    !Author ||
    !description ||
    !genre ||
    !price ||
    !quantity
  ) {
    res.status(400);
    res.json({ message: "Fields lost!" });

    // Recommend to place a return statement after the res.send call
    // to make your function stop executing further.
    return;
  } else if (!regex_1.test(req.body.price)) {
    res.status(400);
    res.json({ message: "price need a number with 2 decimals!" });
    return;
  } else if (!regex_2.test(req.body.quantity)) {
    res.status(400);
    res.json({ message: "quantity must be integer!" });
    return;
  } else {
    // Check whether this book already exist
    var sql_1 = `SELECT * FROM Book WHERE ISBN = '${req.body.ISBN}'`;
    con.query(sql_1, function (err, result) {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res
            .status(422)
            .json({ message: "This ISBN already exists in the system." });
        } else {
          throw err;
        }
      }
      // accessing the Result = [RawDataPacket]
      // Using result[0], result[1]...
      // https://stackoverflow.com/questions/38133084/how-to-access-rowdatapacket-mysql-node-js

      // Accessing the length of the result.
      // Check ISBN already exist in the database
      let existNum = Object.keys(result).length;

      // If ISBN already exist
      if (existNum > 0) {
        res
          .status(422)
          .json({ message: "This ISBN already exists in the system." });
        return;
      } else {
        // Insert into Database
        var sql_2 = `INSERT INTO Book
        (ISBN, title, author, description, genre, price, quantity)
        VALUES
        ('${ISBN}', '${title}', '${Author}',
        '${description}', '${genre}', ${price}, ${quantity});
        `;
        con.query(sql_2, function (err) {
          if (err) {
            console.log("Error: " + err.message);
          }
        });

        // Successfully created.
        res.status(201).json({
          ISBN: ISBN,
          title: title,
          Author: Author,
          description: description,
          genre: genre,
          price: parseFloat(price),
          quantity: quantity,
        });
      }
    });
  }
});

/**
 * Update Book endpoint:
 *
 * Description: Update a book’s information in the system.
 * The ISBN will be the unique identifier for the book.
 */

router.put("/:isbn", async function (req, res) {
  console.log("PUT /api/books/isbn - Updating a book");

  // const bookInfo = JSON.stringify(req.body);
  console.log(req.body); // testing

  const { ISBN, title, Author, description, genre, price, quantity } = req.body;

  try {
    // All fields in the request body are mandatory
    // Check number validation
    if (
      !ISBN ||
      !title ||
      !Author ||
      !description ||
      !genre ||
      !price ||
      !quantity
    ) {
      res.status(400);
      res.json({ message: "Bad Request! Attribute lost or format unmatched!" });

      // Recommend to place a return statement after the res.send call
      // to make your function stop executing further.
      return;
    } else if (!regex_1.test(req.body.price)) {
      res.status(400);
      res.send({ message: "price need a number with 2 decimals!" });
      return;
    } else if (!regex_2.test(req.body.quantity)) {
      res.status(400);
      res.send({ message: "quantity must be integer!" });
      return;
    } else {
      // Check whether this book already exist
      var sql_1 = `SELECT * FROM Book WHERE ISBN = '${ISBN}'`;
      con.query(sql_1, function (err, result) {
        if (err) {
          console.log("Error: " + err.message);
        }

        // Accessing the length of the result.
        // Check if ISBN already exist in the database
        let existNum = Object.keys(result).length;

        // If ISBN exist
        if (existNum > 0) {
          // Update Specific Row
          var sql_2 = `UPDATE Book
            SET title = '${title}',
            Author = '${Author}',
            description = '${description}',
            genre = '${genre}',
            price = ${price},
            quantity = ${quantity}
            WHERE ISBN = '${ISBN}';
          `;
          con.query(sql_2, function (err) {
            if (err) {
              console.log("Error: " + err.message);
              res.status(404).json({ message: err.message });
            }
          });

          // Successfully created.
          res.status(200).json(req.body);
          return;
        } else {
          // No such book, fail to update
          res.status(404).json({ message: "ISBN not found." });
          return;
        }
      });
    }
  } catch (e) {
    res.status(400);
    res.json("Request Failed!");
  }
});

// *** External recommendation System url ***
const baseRecommendationURL = "http://44.214.218.139/recommended-titles/isbn/";

// --- Test URL ---
// const baseRecommendationURL = "http://35.173.254.57:80/recommended-titles/isbn/";

// Create the circuit breaker state status file
const circuitBreakerStateFilePath = "/app/state/CircuitBreaker.json";

/**
 * Retrieve related Book endpoint:
 *
 * Description:
 * Return a related book JSON response by calling an external recommendation system.
 */

router.get("/:isbn/related-books", async function (req, res) {
  const isbn = req.params.isbn || req.params.ISBN;
  console.log(`GET related books from recommendation - ${isbn}`);

  // Set the URL and option for calling external recommendation system
  let recommendURL = baseRecommendationURL + isbn;
  const options = {
    url: recommendURL,
    // time out of 3 seconds
    timeout: 3000,
    method: "GET",
  };

  // 3. Obtain the state JSON
  // *** Kubernetes cloud ***
  let circuitBreakerState = readCircuitBreakerState();
  console.log("circuitBreakerState: " + circuitBreakerState);

  // Check if the circuit is open
  if (circuitBreakerState.isOpen) {
    // Obtain the circuit breaker last time.
    const timeSinceOpened = Date.now() - circuitBreakerState.openTime;

    if (timeSinceOpened < 60000) {
      // If the circuit breaker = open && Time < 60 seconds
      // => directly return 503
      res
        .status(503)
        .json({ message: "The circuit breaker is still open! Try it later." });
    } else {
      // If the circuit breaker  = open && Time >= 60 seconds
      // => try reach the external system:
      // Success: close the circuit breaker, 200
      // Timeout: another 60 seconds window, 503
      try {
        const response = await axios(options);
        // Success: (not going into error)
        let resultCode = response.status;

        // Close the circuit breaker:
        circuitBreakerState.isOpen = false;

        // *** Kubernetes cloud ***
        saveCircuitBreakerState(circuitBreakerState);

        // No recommendation Book or ISBN not found.
        if (resultCode == 204) {
          res.status(resultCode).json({ message: "No recommendation books." });
        } else {
          let result = response.data;
          res.status(resultCode).json(result);
        }
      } catch (error) {
        // Still timeout:
        if (error.code === "ECONNABORTED") {
          // Schedule another 60 seconds time window
          circuitBreakerState.openTime = Date.now();

          // *** Kubernetes cloud ***
          saveCircuitBreakerState(circuitBreakerState);
          res.status(503).json({
            message: "Request recommendation system still unavailable!",
          });
        } else {
          res.status(500).json({
            message: "message: " + error.message + " Stack: " + error.stack,
          });
        }
      }
    }
  } else {
    // The circuit breaker is not open = (false):
    // => Query the out source system as usual
    // Success: 200
    // Timeout: open the circuit breaker, record the open time, 504
    try {
      const response = await axios(options);
      // Success:
      let resultCode = response.status;

      // No recommendation Book or ISBN not found.
      if (resultCode == 204) {
        res.status(resultCode).json({ message: "No recommendation books." });
      } else {
        let result = response.data;
        res.status(resultCode).json(result);
      }
    } catch (error) {
      // Timeout:
      if (error.code === "ECONNABORTED") {
        console.log("Time out!");

        // Open the circuit breaker:
        // False => true
        circuitBreakerState.isOpen = true;
        circuitBreakerState.openTime = Date.now();

        // *** Kubernetes cloud ***
        saveCircuitBreakerState(circuitBreakerState);
        res
          .status(504)
          .json({ message: "Request recommendation system time out!" });
      } else {
        res.status(500).json({
          message: "message: " + error.message + " Stack: " + error.stack,
        });
      }
    }
  }
});

/**
 * Read the state from the file
 * @returns The current state
 */
function readCircuitBreakerState() {
  const data = fs.readFileSync(circuitBreakerStateFilePath, "utf8");
  return JSON.parse(data);
}

/**
 * Save the current state to the file
 * @param state save the current state
 */
function saveCircuitBreakerState(state) {
  const data = JSON.stringify(state);
  fs.writeFileSync(circuitBreakerStateFilePath, data);
}

/**
 * Initialize the circuit breaker statue
 */
async function initializeCircuitBreaker() {
  const initialState = {
    isOpen: false,
    openTime: Date.now(),
  };
  saveCircuitBreakerState(initialState);
}

// Initialize the circuit breaker
initializeCircuitBreaker();

module.exports = router;
