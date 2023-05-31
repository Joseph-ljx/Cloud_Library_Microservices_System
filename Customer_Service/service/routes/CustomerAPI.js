/**
 * Sub-router for Customers
 */

const express = require("express");
const router = express.Router();
const con = require("../dbCon");
const bodyParser = require("body-parser");
const validator = require("validator");

// Require the Kafka Producer
const produceMessage = require("../Kafka/KafkaProducer");

// Make sure that each router is using a middleware.
// The middleware enable the usage of json define.

router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

/**
 * Add Customer endpoint:
 *
 * Description:  Add a customer to the system (the system will allow self-registration).
 * This endpoint is called to create the newly registered customer in the system.
 * A unique numeric ID is generated for the new customer, and the customer is added to the Customer data table on MySql (the numeric ID is the primary key).
 */

router.post("/", async function (req, res) {
  console.log("Service - Creating a new customer");
  console.log(req.body);

  // Generate a unique digit id
  var id = Date.now();

  // Get the parameters
  const { userId, name, phone, address, address2, city, state, zipcode } =
    req.body;

  // Address 2 is optional, others are mandatory
  if (!userId || !name || !phone || !address || !city || !state || !zipcode) {
    res.status(400);
    res.json({ message: "Bad Request! Attribute lost or format unmatched!" });

    // Recommend to place a return statement after the res.send call
    // to make your function stop executing further.
    return;
  } else if (!validator.isEmail(req.body.userId)) {
    res.status(400);
    res.json({ message: "Not a valid email!" });
    return;
  } else if (state.length != 2) {
    res.status(400);
    res.json({ message: "State is illegal, should be 2 letter long!" });
    return;
  } else {
    // Check whether this user-ID (not ID) already exist
    var sql_1 = `SELECT * FROM Customer WHERE userId = '${req.body.userId}'`;
    con.query(sql_1, function (err, result) {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res
            .status(422)
            .json({ message: "This user ID already exists in the system." });
          return;
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
      if (result && existNum > 0) {
        res
          .status(422)
          .json({ message: "This user ID already exists in the system." });
        return;
      } else {
        // Creation of a customer is valid:

        // Insert into Database
        var sql_2 = `INSERT INTO Customer
        (id, userId, name, phone, address, address2, city, state, zipcode)
        VALUES
        (${id}, '${userId}', '${name}', '${phone}', '${address}',
        '${address2}', '${city}', '${state}', '${zipcode}');
        `;
        con.query(sql_2, function (err) {
          if (err) {
            console.log("Error: " + err.message);
            res.status(500).json({ message: "Insertion failed." });
            return;
          }
        });

        // Assign the id for exhibition
        req.body.id = id;

        // If the customer information is valid.
        // => Sending a message to Kafka, message = req.body.
        produceMessage(req.body);

        res.status(201).json(req.body);
      }
    });
  }
});

/**
 * Retrieve Customer by ID endpoint:
 *
 * Description:  obtain the data for a customer given its numeric ID.
 * This endpoint will retrieve the customer data on MySql and send the data in the response in JSON format.
 * Note that ID is the  numeric ID, not the user-ID.
 */

router.get("/:id", async function (req, res) {
  console.log("GET /api/customers/id - Get a customer by ID");

  const id = req.params.id;

  if (!validator.isNumeric(id)) {
    res.status(400).json({ message: "invalid id" });
    return;
  } else {
    // Generate SQL and run the script
    var sql = `SELECT * FROM Customer WHERE id = ${id}`;
    con.query(sql, function (err, result) {
      if (err) {
        // ISBN Not found
        throw err;
      }

      // Accessing the length of the result.
      // Check id exist in the database
      let existNum = Object.keys(result).length;

      // Customer Found
      if (result && existNum > 0) {
        // Stringify the result value -> string
        console.log(`Customer found: ${JSON.stringify(result[0], null, 4)}`);

        // Return 200, string -> json response
        res.status(200).json(result[0]);
        return;
      } else {
        res.status(404).json({ message: "ID does not exist in the system" });
        return;
      }
    });
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
  console.log("GET /api/customers/uid - Get a customer by user ID");

  const userId = req.query.userId;

  if (!validator.isEmail(userId)) {
    res.status(400).json({ message: "invalid user id" });
    return;
  } else {
    // Generate SQL and run the script
    var sql = `SELECT * FROM Customer WHERE userId = '${userId}'`;
    console.log(sql);
    con.query(sql, function (err, result) {
      if (err) {
        // ISBN Not found
        throw err;
      }

      // Accessing the length of the result.
      // Check id exist in the database
      let existNum = Object.keys(result).length;

      // Customer Found
      if (existNum > 0) {
        // Stringify the result value -> string
        console.log(`Customer found: ${JSON.stringify(result, null, 4)}`);

        // Return 200, string -> json response
        res.status(200).json(result[0]);
        return;
      } else {
        res
          .status(404)
          .json({ message: "User ID does not exist in the system" });
        return;
      }
    });
  }
});

module.exports = router;
