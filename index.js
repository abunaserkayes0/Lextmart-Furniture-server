const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ywizv1d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  await client.connect();
  const inventoriesCollection = client
    .db("inventoriesDb")
    .collection("inventories");
  const myItemsCollection = client.db("myItemsDb").collection("myItems");
  try {
    app.get("/inventories", async (req, res) => {
      const query = {};
      const result = await inventoriesCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoriesCollection.findOne(query);
      res.send(result);
    });
    app.post("/inventory/add", async (req, res) => {
      const doc = req.body;
      const result = await inventoriesCollection.insertOne(doc);
      res.send(result);
    });
    app.get("/inventory/add", async (req, res) => {
      const query = {};
      const result = await inventoriesCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoriesCollection.deleteOne(query);
      res.send(result);
    });
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: query.finalQuantity,
        },
      };
      const result = await inventoriesCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    app.post("/myItems", async (req, res) => {
      const query = req.body.myItem;
      const result = await myItemsCollection.insertOne(query);
      res.send(result);
    });
    app.get("/myItems", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await myItemsCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/myItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myItemsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello boss");
});

app.listen(port, () => {
  console.log(`Listening Port`, port);
});

/*
 */
