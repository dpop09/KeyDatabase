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

router.post('/getKeyRequestForm' , async (request, response) => {
    try {
        const { key_number } = request.body;
        const result = await dbOperations.getKeyRequestForm(key_number);
        if (result) {
            response.status(200).send(result);
        } else {
            response.status(404).send('Key Request Form not found');
        }
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/editKey', async (request, response) => {
    try {
        const { key_number, tag_number, tag_color, available, key_holder_fname, key_holder_lname, date_assigned, comments } = request.body;
        //console.log(key_number, tag_number, tag_color, available, key_holder_fname, key_holder_lname, date_assigned, comments);
        const result = await dbOperations.editKey(key_number, tag_number, tag_color, available, key_holder_fname, key_holder_lname, date_assigned, comments);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

module.exports = router;
