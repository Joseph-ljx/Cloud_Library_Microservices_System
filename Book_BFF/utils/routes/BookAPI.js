// Accessing the .env object
require("dotenv").config();

/**
 * Sub BFF for Books
 */

const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

// Request
const request = require("request");

// acquire JWT decode
const jwt = require("jsonwebtoken");

// Make sure that each router is using a middleware.
// The middleware enable the usage of json define.

router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// Request service base URL
// *** Remember to change this when deploying to the cloud ***
const baseURL = process.env.baseURL;

/**
 * 1. Decode the payload (2nd part of the token) to obtain a JSON string
 * 2. Parse the JSON string into a JSON object.
 * @param token the authorization token
 * @returns A JSON representation of the payload
 */
function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

/**
 * This method is to validate the header conditions
 * @param req request passed
 * @param res response passed
 * @returns true || false => success of validation
 */

function verifyHeader(req, res) {
  // Show headers: console.log(req.headers);

  // Obtain the user agent header: if not exist, return 400
  const agent = req.headers["user-agent"];
  if (!agent) {
    res.status(400).send({ message: "User agent not present!" });
    return false;
  }

  // Obtain the JWT Authorization header: if not exist, return 401
  const authorization = req.headers["authorization"];
  if (!authorization) {
    res.status(401).send({ message: "JWT token not present!" });
    return false;
  }

  // JWT Verification - is always valid if use jwt.decode
  // Should use jwt.verify(token, secretKey) if have a secret
  try {
    const verifiedToken = jwt.decode(authorization.split(" ")[1]);
  } catch (err) {
    res.status(401).send({ message: "JWT token could not be verified!" });
    return false;
  }

  // Extract the JWT payload
  const decodedPayload = parseJwt(authorization.split(" ")[1]);
  if (!decodedPayload.sub || !decodedPayload.exp || !decodedPayload.iss) {
    res.status(401).send({ error: "JWT payload field(s) not present!" });
    return false;
  }

  // Validating payload - sub
  const sub = decodedPayload.sub;
  if (
    sub != "starlord" &&
    sub != "gamora" &&
    sub != "drax" &&
    sub != "rocket" &&
    sub != "groot"
  ) {
    res.status(401).send({ error: "JWT payload sub invalid." });
    return false;
  }

  // Validating payload - exp
  // Convert the Unix timestamp to milliseconds
  const unixTimestamp = decodedPayload.exp;
  const expirationTime = unixTimestamp * 1000;

  // Obtain the current time in milliseconds
  const currentTime = Date.now();

  // Judge whether the time is expired
  if (currentTime > expirationTime) {
    res.status(401).send({ error: "JWT payload exp is expired." });
    return false;
  }

  // Validating payload - iss
  const iss = decodedPayload.iss;
  if (iss != "cmu.edu") {
    res.status(401).send({ error: "JWT payload iss invalid." });
    return false;
  }

  // All fields are valid
  return true;
}

/**
 * This method is used to determine the type of the device
 * @param req the request
 */
function deviceType(req) {
  const agent = req.headers["user-agent"];
  if (agent.indexOf("Mobile") != -1) {
    return "Mobile";
  } else {
    return "Desktop";
  }
}

/**
 * Retrieve Book backend endpoint:
 *
 * Description: call the book service based on specific ISBN
 * Both endpoints shall produce the same response.
 */

router.get(["/isbn/:isbn", "/:isbn"], async function (req, res) {
  const isbn = req.params.isbn || req.params.ISBN;

  try {
    // Validate the headers
    if (!verifyHeader(req, res)) {
      return;
    }

    // Encode the whole URL based on isbn
    let getURL = baseURL + "/isbn/" + isbn;
    console.log("BFF get a book: " + getURL);

    // Const options
    // (including the header params)
    const options = {
      url: getURL,
      // headers: {
      //   "User-Agent": "...",
      //   Authorization: "Bearer your_access_token_here",
      // },
      method: "GET",
    };

    /**
     * Call the get service
     */
    await request(options, (error, response, body) => {
      // extract the body part
      const result = JSON.parse(body);
      const resultCode = response.statusCode;
      console.log(result);

      // If the service call is successful
      if (!error && response.statusCode == 200) {
        // Condition:
        // replace in the response body the word “non-fiction” with the numeric value 3
        // iff the client is a mobile device
        if (deviceType(req) == "Mobile" && result.genre == "non-fiction") {
          result.genre = 3;
        }
      }
      // Error
      res.status(resultCode).json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "BFF server error." });
  }
});

/**
 * Add Book end point:
 *
 * Description: Add a book to the system.
 * The ISBN will be the unique identifier for the book.
 * The book is added to the Book data table on MySql (the ISBN is the primary key).
 */

router.post("/", async function (req, res) {
  try {
    // Validate the headers
    if (!verifyHeader(req, res)) {
      return;
    }

    // Encode the whole URL for post
    let createURL = baseURL + "/";
    console.log("BFF create a new book: " + createURL);

    // Options
    const options = {
      url: createURL,
      method: "POST",
      body: req.body,
      json: true,
    };

    /**
     * Call the create service:
     */
    await request(options, (error, response, body) => {
      // extract the body part, already in JSON format
      const result = body;
      const resultCode = response.statusCode;

      // If the creation is successful
      if (error) {
        // Error
        res.status(500).json({ error: "Book create service error." });
      } else {
        // Service response
        res.status(resultCode).json(result);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "BFF server error." });
  }
});

/**
 * Update Book endpoint:
 *
 * Description: Update a book’s information in the system.
 * The ISBN will be the unique identifier for the book.
 */

router.put("/:isbn", async function (req, res) {
  const isbn = req.params.isbn || req.params.ISBN;

  try {
    // Validate the headers
    if (!verifyHeader(req, res)) {
      return;
    }

    // Encode the whole URL for update
    let updateURL = baseURL + "/" + isbn;
    console.log("BFF update a book: " + updateURL);

    // Options
    const options = {
      url: updateURL,
      method: "PUT",
      body: req.body,
      json: true,
    };

    /**
     * Call the update service
     */
    await request(options, (error, response, body) => {
      // extract the body part, already in JSON format
      const result = body;
      const resultCode = response.statusCode;

      // If the update is successful
      if (error) {
        // Error
        res.status(500).json({ error: "Book update service error." });
      } else {
        // Service response
        res.status(resultCode).json(result);
      }
    });
  } catch (e) {
    res.status(400);
    res.json("Request Failed!");
  }
});

/**
 * Retrieve Related Books endpoint:
 *
 * Description:
 * Returns a list of book titles that are related to a given book specified via its ISBN.
 *
 * 978-0-321-55268-6
 * 978-0321815736
 * 9780133065107
 * 978-0395489321
 * 978-0544174221
 */

router.get("/:isbn/related-books", async function (req, res) {
  const isbn = req.params.isbn || req.params.ISBN;

  try {
    // Validate the headers
    if (!verifyHeader(req, res)) {
      return;
    }

    // Encode the whole URL for update
    let relevantURL = baseURL + "/" + isbn + "/related-books";
    console.log(
      "BFF retrieve related books for: " + isbn + " from: " + relevantURL
    );

    // Options
    const options = {
      url: relevantURL,
      method: "GET",
    };

    /**
     * Call the get related books service
     */
    await request(options, (error, response, body) => {
      const resultCode = response.statusCode;

      // Change the key name space
      if (resultCode == 200) {
        // extract the body part
        let result = JSON.parse(body);
        // Define the new key name
        let newKeyName = "Author";

        // Modify each item's key name
        result.map((item) => {
          // Create a new key-value pair with the new key name and the same value
          item[newKeyName] = item["authors"];

          // Remove the original name key
          delete item["authors"];
        });

        // Return the modified result
        res.status(resultCode).json(result);
      } else if (resultCode == 204) {
        res
          .status(resultCode)
          .json({ message: "No relevant book for this ISBN!" });
      } else {
        // Return relevant information
        res.status(resultCode).json({ message: "Strange return..." });
      }
    });
  } catch (e) {
    res.status(400);
    res.json("Request Failed!");
  }
});

module.exports = router;
