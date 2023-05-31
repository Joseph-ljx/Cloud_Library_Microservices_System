// Accessing the .env object
require("dotenv").config();

/**
 * Sub-router for Customers
 */

const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const validator = require("validator");

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
// *** Remember to change it
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
  // console.log(req.headers);

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
 * Retrieve Customer by ID endpoint:
 *
 * Description:  obtain the data for a customer given its numeric ID.
 * This endpoint will retrieve the customer data on MySql and send the data in the response in JSON format.
 * Note that ID is the  numeric ID, not the user-ID.
 */

router.get("/:id", async function (req, res) {
  const id = req.params.id;

  try {
    // Validate the headers
    if (!verifyHeader(req, res)) {
      return;
    }

    // Encode the whole URL based on isbn
    let getURL = baseURL + "/" + id;
    console.log("BFF get a customer by id: " + getURL);

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

      // If the service call is successful
      if (!error && response.statusCode == 200) {
        // Condition:
        // replace in the response body the word “non-fiction” with the numeric value 3
        // iff the client is a mobile device
        if (deviceType(req) == "Mobile") {
          delete result.address;
          delete result.address2;
          delete result.city;
          delete result.state;
          delete result.zipcode;
        }
      }
      // Result
      res.status(resultCode).json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "BFF server error." });
  }
});

/**
 * Retrieve Customer by USER ID endpoint:
 *
 * Description:  obtain the data for a customer given its user ID,which is the email address.
 * This endpoint will retrieve the customer data on MySql and send the data in the response in JSON format.
 * Note that the ‘@’ character should be encoded in the query string parameter value
 * (ex.: userId=starlord2002%40gmail.com).
 *
 * How to access the GET parameters after "?" in Express
 * https://stackoverflow.com/questions/17007997/how-to-access-the-get-parameters-after-in-express
 */

router.get("", async function (req, res) {
  // Obtain the user id (email)
  const userId = req.query.userId;

  try {
    // Validate the headers
    if (!verifyHeader(req, res)) {
      return;
    }

    // Encode the whole URL based on isbn
    let getURL = baseURL;
    console.log("BFF get a customer by id: " + getURL + userId);

    // Const options
    // (including the header params)
    const options = {
      url: getURL,
      // qs: query string, the query params
      qs: {
        userId: userId,
      },
      method: "GET",
    };

    /**
     * Call the get service
     */
    await request(options, (error, response, body) => {
      // extract the body part
      const result = JSON.parse(body);
      const resultCode = response.statusCode;

      // If the service call is successful
      if (!error && response.statusCode == 200) {
        // Condition:
        // replace in the response body the word “non-fiction” with the numeric value 3
        // iff the client is a mobile device
        if (deviceType(req) == "Mobile") {
          delete result.address;
          delete result.address2;
          delete result.city;
          delete result.state;
          delete result.zipcode;
        }
      }
      // Result
      res.status(resultCode).json(result);
    });
  } catch (error) {
    console.log(err);
    res.status(500).send({ error: "BFF server error." });
  }
});

/**
 * Add Customer endpoint:
 *
 * Description:  Add a customer to the system (the system will allow self-registration).
 * This endpoint is called to create the newly registered customer in the system.
 * A unique numeric ID is generated for the new customer, and the customer is added to the Customer data table on MySql (the numeric ID is the primary key).
 */

router.post("/", async function (req, res) {
  try {
    // Validate the headers
    if (!verifyHeader(req, res)) {
      return;
    }

    // Encode the whole URL for post
    let createURL = baseURL + "/";
    console.log("BFF create a new customer: " + createURL);

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
        res.status(500).json({ error: "Customer create service error." });
      } else {
        // Service response
        res.status(resultCode).json(result);
      }
    });
  } catch (error) {
    console.log(err);
    res.status(500).send({ error: "BFF server error." });
  }
});

module.exports = router;
