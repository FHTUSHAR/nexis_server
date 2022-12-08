const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken');


app.use(cors())
app.use(express.json())
require('dotenv').config()



function verifyJWT(req, res, next) {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Unauthorized access' })
        }
        req.decoded = decoded;
        next()
    })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jbmhw9z.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const userCollection = await client.db("Nexis_ltd").collection("Users");
        const loginUserCollection = await client.db("Nexis_ltd").collection("loginUsers");


        app.get('/loginuser', verifyJWT, async (req, res) => {
            const query = {}
            const result = await loginUserCollection.find(query).toArray()
            res.send(result)
        })



        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            console.log(email)
            const query = { email: email }
            const user = await userCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ token });
            }

        })




        app.post('/user', async (req, res) => {
            const info = req.body
            const result = await userCollection.insertOne(info)
            res.send(result)
        })

        app.post('/loginuser', async (req, res) => {
            const info = req.body
            const query = {
                email: info.email,
                password: info.password
            }
            const result = await userCollection.findOne(query)
            const name = result.fname + ' ' + result.lname
            const data = { ...info, name }

            if (!result) {
                console.log('error')
                return
            }
            else {
                const lquery = {
                    email: info.email,
                    password: info.password
                }
                const checkLogin = await loginUserCollection.findOne(lquery)
                if (checkLogin) {
                    res.send(checkLogin)
                    return
                }
                else {
                    const login = await loginUserCollection.insertOne(data)
                    res.send(result)
                }



            }
        })
        app.get('/', (req, res) => {
            res.send('Hello Nexis Ltd!')
        })





    }
    finally {

    }
}
run().catch(e => console.log(e))





// xJa5laBldYrwj6eq
// nexis_ltd





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})