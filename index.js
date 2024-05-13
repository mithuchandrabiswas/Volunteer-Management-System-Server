const express = require('express');
const cors = require('cors');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Config
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5000',
        'https://assignment-eleven-full-stack.web.app'
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
// ==========> Middleware <=========
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//Create Custom Middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    // console.log(token);
    if (!token) {
        return res.status(401).send({ message: 'unathorized access' });
    }
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, docoded) => {
            if (err) {
                console.log(err);
                return res.status(401).send({ message: 'unathorized access' });
            }
            console.log(docoded);
            req.user = docoded
            next();
        })
    }
}

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.2bu9h7l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})
async function run() {
    try {
        // Create database and collection
        const volunteersCollection = client.db("volunteersDB").collection("volunteers");
        const requestVolunteersPostCollection = client.db("volunteersDB").collection("requestVolunteersPost");

        //========> Token related API <==========
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            // console.log('dynamic token of', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
            // res.send(token); // SEND TOKEN FRONT IN BY AXIOS ER DATA ER VITORE
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
            }).send({ success: true });
        })
        // Token clear after user logOut
        app.get('/logout', async (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 0,
            }).send({ success: true });
        })

        // ========> Volunteers Added Related API Code <==========
        // Save a Volunteer data into MongoDB Database
        app.post('/volunteer', async (req, res) => {
            const volunteerData = req.body
            const result = await volunteersCollection.insertOne(volunteerData)
            res.send(result)
        })

        // Get all Volunteers data from MongoDB Database
        app.get('/volunteers', async (req, res) => {
            const result = await volunteersCollection.find().toArray()
            // console.log(result);
            res.send(result)
        })

        // Get a single volunteer data from database using volunteer id
        app.get('/volunteer/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await volunteersCollection.findOne(query)
            res.send(result)
        })

        // get all volunteers data by a specific user
        app.get('/volunteers/:email', async (req, res) => {
            // const tokenEmail = req.user.email;
            const email = req.params.email;
            // console.log('token Email:',tokenEmail, 'user email:',email);
            // if (tokenEmail !== email) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            const query = { organizer_email: email }
            // if (req.query?.email) {
            //     query = { organizer_email: req.query.email }
            // }

            const result = await volunteersCollection.find(query).toArray()
            res.send(result)
        })

        // delete a Volunteer data from database
        app.delete('/volunteer/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await volunteersCollection.deleteOne(query);
            res.send(result);
        })

        // update a Volunteer Data to database
        app.put('/volunteer/:id', verifyToken, async (req, res) => {
            const id = req.params.id
            const volunteerData = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...volunteerData,
                },
            }
            const result = await volunteersCollection.updateOne(query, updateDoc, options)
            console.log(result);
            res.send(result)
        })


        // Volunteer Post Request related API Code
        // Save a Volunteer data into MongoDB Database
        app.post('/request-volunteer-post', async (req, res) => {
            const volunteerData = req.body
            console.log(volunteerData); // for server console
            const result = await requestVolunteersPostCollection.insertOne(volunteerData)
            res.send(result) // for send or save database
        })

        // Get all Request volunteer post data from MongoDB Database
        app.get('/request-volunteer-post-allData', async (req, res) => {
            const result = await requestVolunteersPostCollection.find().toArray()
            // console.log(result);
            res.send(result)
        })

        // Get a single request volunteer post data from database using volunteer id
        app.get('/request-volunteer-post-sData/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await requestVolunteersPostCollection.findOne(query)
            res.send(result)
        })

        // Get all request volunteer post data from database using volunteer email
        app.get('/request-volunteer-post-allData/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { volunteer_email: email };
            const result = await requestVolunteersPostCollection.find(query).toArray();
            res.send(result);
        })
        // delete a Volunteer request data from database
        app.delete('request-volunteer-post-sData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await requestVolunteersPostCollection.deleteOne(query);
            res.send(result);
        })




        // Send a ping to confirm a successful connection
        // await client.db('admin').command({ ping: 1 })
        console.log(
            'Pinged your deployment. You successfully connected to MongoDB!'
        )
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Hello Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))