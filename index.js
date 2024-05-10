const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Config
require("dotenv").config();
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5000',
        'https://assignment-eleven-full-stack.web.app'
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
// Middleware 
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
//Created Middleware
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
        const bidsPostCollection = client.db("volunteersDB").collection("bidsPost");

        // Token related API==========> 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log('dynamic token of', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
            // res.send(token); // SEND TOKEN FRONT IN BY AXIOS ER DATA ER VITORE
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
            }).send({ success: true });
        })

        // ==> Token clear after user logOut
        app.get('/logout', async (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 0,
            }).send({ success: true });
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