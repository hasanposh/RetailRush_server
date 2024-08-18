const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://retailrush-clitent.firebaseapp.com",
      "https://retailrush-clitent.web.app",
      "http://localhost:5173",
    ],
  })
);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tlu13v2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productsCollection = client.db("retailRushDB").collection("products");

    //    app.get("/products", async (req, res) => {
    //     try {
    //         const products = await productsCollection.find().toArray();
    //         res.json(products);
    //     } catch (error) {
    //         console.error("Error fetching products:", error);
    //         res.status(500).json({ error: "Internal Server Error" });
    //     }
    // });

    app.get("/products", async (req, res) => {
      try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 9; // Number of products per page
        const search = req.query.search || "";
        const brand = req.query.brand || "";
        const category = req.query.category || "";
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
        const sort = req.query.sort || ""; // Sort criteria (price or date)
    
        // Build the query
        const query = {
          ...(search && { productName: { $regex: search, $options: "i" } }),
          ...(brand && { brandName: brand }),
          ...(category && { category: category }),
          price: { $gte: minPrice, $lte: maxPrice },
        };
    
        const skip = (page - 1) * limit; // Calculate skip value
    
        // Define the sort object
        const sortOption = {};
        if (sort === "priceAsc") {
          sortOption.price = 1;
        } else if (sort === "priceDesc") {
          sortOption.price = -1;
        } else if (sort === "dateAsc") {
          sortOption.creationDate = 1;
        } else if (sort === "dateDesc") {
          sortOption.creationDate = -1;
        }
    
        // Fetch the data
        const products = await productsCollection
          .find(query)
          .sort(sortOption)
          .limit(limit)
          .skip(skip)
          .toArray();
    
        // Fetch the total number of products matching the query
        const totalProducts = await productsCollection.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
    
        res.json({
          products,
          totalPages,
          currentPage: page,
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server Error" });
      }
    });
    
    
    app.get("/allproducts", async (req, res) => {
      try {
        // Fetch distinct brand names from the collection
        const brands = await productsCollection.find().toArray();
        res.json(brands);
      } catch (error) {
        console.error("Error fetching brand names:", error);
        res.status(500).json({ message: "Server Error" });
      }
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// middleware
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from Retail Rush!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
