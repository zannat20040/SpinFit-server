const express = require('express');
const cors = require('cors')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.64uf1bl.mongodb.net/?retryWrites=true&w=majority`;

console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)

const stripe = require("stripe")(process.env.SECRET_KEY);

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
        const classesDB = database.collection("classesCollection");
        const trainerApplicationDB = database.collection("trainerApplicationDB");
        const bookingsDB = database.collection("bookingsCollection");
        const salariesDB = database.collection("salariesCollection");


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
            const result = await classesDB.insertOne(data);
            res.send(result)
        })

        // bookings
        app.post('/bookings', async (req, res) => {
            const data = req.body
            const result = await bookingsDB.insertOne(data);
            res.send(result)
        })

        // salaries
        app.post('/salaries', async (req, res) => {
            const data = req.body
            const result = await salariesDB.insertOne(data);
            res.send(result)
        })

        // BeTrainer application
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

        })

        // get balance 

        app.get('/balance', async (req, res) => {

            // Retrieve booking payments from MongoDB
            const bookings = await bookingsDB.find().toArray();
            // Retrieve trainer payments from MongoDB
            const trainers = await salariesDB.find().toArray();

            // Calculate total booking payments
            const totalBookingPayments = bookings.reduce((acc, data) => acc + parseInt(data.packagePrice), 0);

            // Calculate total trainer payments
            const totalTrainerPayments = trainers.reduce((acc, data) => acc + parseInt(data.salary), 0);

            // Calculate total remaining balance

            const totalRemainingBalance = totalBookingPayments - totalTrainerPayments;

            // Ensure total trainer payments do not exceed total booking payments
            if (totalTrainerPayments > totalBookingPayments) {
                return res.send({
                    totalRemainingBalance,
                    totalBookingPayments,
                    totalTrainerPayments
                });
            }

            else {
                return res.send({
                    totalRemainingBalance,
                    totalBookingPayments,
                    totalTrainerPayments
                });
            }
        })

        // get userInfo
        app.get('/users', async (req, res) => {
            const userEmail = req.query.email
            const role = req.query.role

            if (userEmail) {
                const query = { email: userEmail }
                const result = await usersInfoDB.findOne(query);
                res.send(result)
            }
            else if (role) {
                const query = { role: role }
                const result = await usersInfoDB.find(query).toArray();
                res.send(result)
            }
            else {
                const result = await usersInfoDB.find().toArray();
                res.send(result)
            }
        })

        // get all class data
        app.get('/allClass/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await classesDB.findOne(query);
            res.send(result)
        })

        app.get('/bookings', async (req, res) => {
            const email  = req.query.traineeEmail
            if(email){
                const query = {
                    traineeEmail: email,
                };
                const result = await bookingsDB.find(query).toArray();
                // console.log(result)
                return res.send(result)
            }
            else{
                const result = await bookingsDB.find().toArray();
                return res.send(result)
            }
        })

        app.get('/bookings/:email', async (req, res) => {
            const email = req.params.email
            const query = {trainerEmail: email}
            const result = await bookingsDB.find(query).toArray();
            res.send(result)
        })
       
        // gallery data get
        app.get('/gallery', async (req, res) => {
            const userEmail = req.query.email
            if (userEmail) {
                const query = { userEmail: userEmail }
                const result = await galleryDB.find(query).toArray();
                res.send(result)
            }
            else {
                const result = await galleryDB.find().toArray();
                res.send(result)
            }
        })

        // forum data get
        app.get('/blog', async (req, res) => {
            const result = await blogDB.find().toArray();
            res.send(result)
        })

        // classes data get
        app.get('/classes', async (req, res) => {
            const result = await classesDB.find().toArray();
            res.send(result)
        })

        // subscriber data get
        app.get('/subscribers', async (req, res) => {
            const result = await subscribersDB.find().toArray();
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
        // trainer application
        app.get('/application/:email', async (req, res) => {
            const email = req.params.email
            // console.log(email)
            const query = {email: email}
            const result = await trainerApplicationDB.findOne(query);
            res.send(result)
        })

        // trainer details by email
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

        app.patch('/users', async (req, res) => {
            const trainerEmail = req.query.email;
            const { salaryMonth, role, status } = req.body
            const query = { email: trainerEmail };

            if (salaryMonth) {
                const result = await usersInfoDB.updateOne(
                    query,
                    { $set: { salaryMonth } }
                );
                return res.send(result);
            }

            else if (role && status) {
                if (status === "accepted") {
                    const userResut = await usersInfoDB.updateOne(query, { $set: { role } });
                    const applyResult = await trainerApplicationDB.updateOne(query, { $set: { role } });
                    return res.send(applyResult);
                }
                else {
                    const deleteResult = await trainerApplicationDB.deleteOne({ email: trainerEmail });
                    return res.send(deleteResult);

                }
            }

        })

        // booking payment
        app.post("/create-payment-intent", async (req, res) => {
            const packageInfo = req.body;

            if (packageInfo.packagePrice) {
                const price = parseInt(packageInfo.packagePrice * 100)
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: price,
                    currency: "usd",
                    payment_method_types: ["card"],

                });
                res.send({
                    clientSecret: paymentIntent.client_secret
                });
            }

        });

        // salary payment
        app.post("/salary-payment-intent", async (req, res) => {
            const salaryInfo = req.body;
            3
            if (salaryInfo.salary) {
                const salary = parseInt(salaryInfo.salary * 100)
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: salary,
                    currency: "usd",
                    payment_method_types: ["card"],

                });
                res.send({
                    clientSecret: paymentIntent.client_secret
                });
            }

        });


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