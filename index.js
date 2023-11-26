const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.64uf1bl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const database = client.db("SpinFit");
        const subscribersDB = database.collection("newsletterCollection");
        const usersInfoDB = database.collection("usersInfoDBCollection");
        const galleryDB = database.collection("galleryCollection");

        // newsletter

        app.post('/subscribers', async(req,res)=>{
            const data  = req.body
            const result = await subscribersDB.insertOne(data);
            res.send(result)
        })

        // user data set
        app.post('/users', async(req,res)=>{
            const data  = req.body
            const result = await usersInfoDB.insertOne(data);
            res.send(result)
        })
        // get userInfo
        app.get('/users', async(req,res)=>{
            const userEmail  = req.query.email
            const query = { email: userEmail }
            const result = await usersInfoDB.findOne(query);
            res.send(result)
        })

        // gallery data get
        app.get('/gallery', async(req,res)=>{
            const result = await galleryDB.find().toArray();
            res.send(result)
        })


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })