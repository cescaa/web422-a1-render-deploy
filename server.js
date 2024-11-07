/********************************************************************************
* WEB422 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Anna Francesca (Cesca) Dela Cruz Student ID:123123150 Date: 9/13/2024
*
* Published URL: https://web422-a1-nine.vercel.app/
*
********************************************************************************/
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ListingsDB = require("./modules/listingsDB.js");
const db = new ListingsDB();
const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
 res.json({ message: "API Listening" });
});

// Add new listing
app.post("/api/listings", async (req, res) => {
  try {
    const newListing = req.body;
    const newListingAdded = await db.addNewListing(newListing);

    res.status(201).json(newListingAdded); // 201 = request fulfilled
    console.log("New listing added!");
  } catch (err) {
    res.status(500).json({ message: "New listing not added." }); // 500 = Internal Server Error
    console.log("New listing not added.");
  }
});

// Show all listings based on given page value, filtered by name if given
app.get("/api/listings", async (req, res) => {
  // get query param values from URL; ensure page and perPage are converted to numbers
  const page = parseInt(req.query.page, 10) || 1; // default to page 1
  const perPage = parseInt(req.query.perPage, 10) || 5; // default to 5 listings per pg
  const name = req.query.name;

  try {
    const allListings = await db.getAllListings(page, perPage, name);
    res.status(200).json(allListings);
  } catch (err) {
    res.status(500).json({ message: "Failed to get listings." });
    console.log("Error getting listings:", err);
  }
});

// Show specfic listing by id
app.get("/api/listings/:id", async (req, res) => {
  try {
    const URLListingID = req.params.id;
    const listingByID = await db.getListingById(URLListingID);

    if (listingByID) {
      res.status(200).json(listingByID);
      console.log(`Showing listing ${URLListingID}.`);
    } else {
      res.status(404).json({ message: `Listing ${URLListingID} not found.` }); // 404 = Not found
      console.log(`Listing ${URLListingID} not found.`);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to get listing by ID." });
    console.log("Failed to get listing by ID.");
  }
});

// Update specific listing by id
app.put("/api/listings/:id", async (req, res) => {
  try {
    const URLListingID = req.params.id;
    const updatedListingData = req.body;
    const listingUpdated = await db.updateListingById(
      updatedListingData,
      URLListingID
    );

    if (listingUpdated.modifiedCount == 1) {
      res.status(200).json(listingUpdated);
      console.log(`Listing ${URLListingID} updated.`);
    } else {
      res.status(404).json({ message: `Listing ${URLListingID} not updated.` });
      console.log(`Listing ${URLListingID} not updated.`);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing." });
    console.log("Failed to update listing:", err);
  }
});

// Delete specific listing by id
app.delete("/api/listings/:id", async (req, res) => {
  try {
    const URLListingID = req.params.id;
    const listingDeleted = await db.deleteListingById(URLListingID);

    if (listingDeleted.deletedCount == 1) {
      res.status(200).json(listingDeleted);
      console.log(`SUCCESS: Listing ${URLListingID} deleted.`);
    } else {
      res.status(404).json({ message: `Listing ${URLListingID} not deleted.` });
      console.log(`Listing ${URLListingID} not deleted.`);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing." });
    console.error("Failed to delete listing:", err);
  }
});

// start server
const runServer = async () => {
  try {
    await db.initialize(process.env.MONGODB_CONN_STRING); // init mongodb connection string
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log("Unable to connect:", err);
  }
};

runServer();

module.exports = app;
