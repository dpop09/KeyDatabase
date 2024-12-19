const express = require('express');
const multer = require('multer');
const dbOperations = require('./dbOperations');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
})

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
            comments,
            old_form_id,
            new_form_id
            } = request.body;
        if (new_form_id != null) { // if a form is provided
            if (old_form_id != null && old_form_id != new_form_id) { // if there is an old form and it is not the same as the new form
                const update_old_form_result = await dbOperations.setKeyNumberInRequestFormToNull(null, old_form_id);
            }
            const update_new_form_result = await dbOperations.updateKeyNumberInRequestForm(key_number, new_form_id);
        }
        const result = await dbOperations.editKey(tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/remove-key-holder', async (request, response) => {
    try {
        const { key_number, form_id } = request.body;
        if (form_id != null) { // if a form_id is provided, remove the key holder from the form
            const update_form_result = await dbOperations.setKeyNumberInRequestFormToNull(null, form_id);
        }
        const result = await dbOperations.removeKeyHolder(key_number);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/delete-key', async (request, response) => {
    try {
        const { key_number } = request.body;
        const result = await dbOperations.deleteKey(key_number);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.get('/get-all-key-request-forms', async (request, response) => {
    try {
        const result = await dbOperations.getAllKeyRequestForms();
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/add-key-request-form', upload.single('file'), async (request, response) => {
    try {
        const {first_name, last_name, access_id, date_signed} = request.body;
        const file_buffer = request.file.buffer;
        const result = await dbOperations.addKeyRequestForm(first_name, last_name, access_id, date_signed, file_buffer);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/get-key-request-form-image', async (req, res) => {
    const { form_id } = req.body;
    try {
        const result = await dbOperations.getKeyRequestFormImage(form_id);
        res.status(200).send(result); // Send the Base64-encoded PDF data
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
});

router.post('/get-key-request-form-id-from-key-number', async (req, res) => {
    const { key_number } = req.body;
    try {
        const form_id_result = await dbOperations.getKeyRequestFormIdFromKeyNumber(key_number);
        res.status(200).send({form_id_result}); // Send the Base64-encoded PDF data
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
});

router.post('/get-key-request-form-image-with-key-number', async (req, res) => {
    const { key_number } = req.body;
    try {
        const result = await dbOperations.getKeyRequestFormImageWithKeyNumber(key_number);
        res.status(200).send(result); // Send the Base64-encoded PDF data
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
});

router.post('/create-key', async (request, response) => {
    try {
        const { tag_number, tag_color, core_number, room_number, room_type, key_number } = request.body;
        const result = await dbOperations.createKey(tag_number, tag_color, core_number, room_number, room_type, key_number);
        response.status(200).send(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
});

router.post('/search-request-form', async (request, response) => {
    try {
        const { column, row } = request.body;
        const result = await dbOperations.searchRequestForm(column, row);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/update-key-request-form', upload.single('file'), async (request, response) => {
    try {
        const {form_id, first_name, last_name, access_id, date_signed} = request.body;
        const file_buffer = request.file.buffer;
        const result = await dbOperations.updateKeyRequestForm(form_id, first_name, last_name, access_id, date_signed, file_buffer);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/delete-key-request-form', async (request, response) => {
    try {
        const { form_id } = request.body;
        const result = await dbOperations.deleteKeyRequestForm(form_id);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

module.exports = router;
