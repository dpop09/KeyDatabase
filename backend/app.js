const express = require('express');
const cors = require('cors');
const dbOperations = require('./dbOperations');

const app = express();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}));

app.get('/getall', async (request, response) => {
    try {
        const result = await dbOperations.getAll();
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

// set up the web server listener
app.listen(8081, () => {
    console.log("I am listening.")
});