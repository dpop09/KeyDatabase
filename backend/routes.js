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

router.post('/edit-key', async (request, response) => {
    try {
        const { tag_number,
            tag_color,
            core_number,
            room_number,
            room_type,
            key_number,
            key_holder_fname,
            key_holder_lname,
            key_holder_access_id,
            date_assigned,
            comments } = request.body;
        const result = await dbOperations.editKey(tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/remove-key-holder', async (request, response) => {
    try {
        const { key_number } = request.body;
        const result = await dbOperations.removeKeyHolder(key_number);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

module.exports = router;
