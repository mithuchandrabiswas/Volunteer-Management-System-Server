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
        // 'https://solosphere.web.app',
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



app.get('/', (req, res) => {
    res.send('Hello Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))