const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).send({ message: "Unauthorize Access" });
  }
  const token = authorizationHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
  });
  next();
};

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
    /* Auth */
    app.post("/signIn", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_KEY_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });
    /* API */
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
    app.get("/myItems", verifyToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email };
        const result = await myItemsCollection.find(query).toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
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
