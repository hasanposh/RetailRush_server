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

   app.get("/products", async (req, res) => {
    try {
        const products = await productsCollection.find().toArray();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
