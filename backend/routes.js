const express = require('express');
const dbOperations = require('./dbOperations');

const router = express.Router();

router.get('/getall', async (request, response) => {
    try {
        const result = await dbOperations.getAll();
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/search', async (request, response) => {
    try {
        const { column, row } = request.body;
        const result = await dbOperations.search(column, row);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

module.exports = router;
