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
        const blogDB = database.collection("blogCollection");
        const clasessDB = database.collection("classesCollection");
        const trainerApplicationDB = database.collection("trainerApplicationDB");

        // newsletter

        app.post('/subscribers', async (req, res) => {
            const data = req.body
            const query = { email: data.email }
            const existSubscribe = await subscribersDB.findOne(query);
            if (existSubscribe) {
                res.status(400).send({ message: "Email already exists" });
            } else {
                const result = await subscribersDB.insertOne(data);
                res.send(result);
            }
        })

        // user data set
        app.post('/users', async (req, res) => {
            const data = req.body
            const query = { email: data.email }
            const existingUser = await usersInfoDB.findOne(query);

            if (existingUser) {
                res.status(400).send({ message: "Email already exists" });
            } else {
                const result = await usersInfoDB.insertOne(data);
                res.send(result);
            }
        })

        // blog data insert
        app.post('/blog', async (req, res) => {
            const data = req.body
            const result = await blogDB.insertOne(data);
            res.send(result)
        })
        // class slot store
        app.post('/allClass', async (req, res) => {
            const data = req.body
            const result = await clasessDB.insertOne(data);
            res.send(result)
        })

        app.post('/trainerApplication', async (req, res) => {
            const data = req.body
            const query = { email: data.email }
            const existingUser = await trainerApplicationDB.findOne(query);

            if (existingUser) {
                res.status(400).send({ message: 'You have already applied' })
            } else {
                const result = await trainerApplicationDB.insertOne(data);
                res.send(result);
            }
            // const result = await trainerApplicationDB.insertOne(data);
            // res.send(result)
        })




        // get userInfo
        app.get('/users', async (req, res) => {
            const userEmail = req.query.email
            const query = { email: userEmail }
            const result = await usersInfoDB.findOne(query);
            res.send(result)
        })

        // gallery data get
        app.get('/gallery', async (req, res) => {
            const result = await galleryDB.find().toArray();
            res.send(result)
        })
        // forum data get
        app.get('/blog', async (req, res) => {

            const result = await blogDB.find().toArray();
            res.send(result)
        })
        // blog deatils 
        app.get('/blog/:id', async (req, res) => {
            const data = req.params.id;
            const query = { _id: new ObjectId(data) }
            const result = await blogDB.findOne(query);
            res.send(result)
        })
        // trainer application
        app.get('/application', async (req, res) => {
            const userRole = req.query.role
            const query = { role: userRole }
            const result = await trainerApplicationDB.find(query).toArray();
            res.send(result)
        })
        app.get('/application/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await trainerApplicationDB.findOne(query);
            res.send(result)
        })

        // update like value
        app.patch('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body
            const query = { _id: new ObjectId(id) };
            if (data.dislike) {
                const updateDisLike = {
                    $set: {
                        dislike: data.updatedDislike.increaseDislike,
                        dislikedUser: data.updatedDislike.dislikedUser
                    }
                }
                const result = await blogDB.updateOne(query, updateDisLike);
                res.send(result)

            }
            else if (data.like) {
                const updateLike = {
                    $set: {
                        like: data.updatedLike.increaselike,
                        likedUser: data.updatedLike.likedUser
                    }
                }
                const result = await blogDB.updateOne(query, updateLike);
                res.send(result)
            }

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