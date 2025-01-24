const express = require('express');
const multer = require('multer');
const dbOperations = require('./dbOperations');
const os = require('os');

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

router.get('/get-access-id', async (request, response) => {
    try {
        // get the logged in username (accessID) from the operating system
        var access_id = os.userInfo().username;
        access_id = "hc7822"
        // check if the accessID is listed in the database
        const isAccessIdWhiteListed = await dbOperations.isAccessIdWhiteListed(access_id);
        if (!isAccessIdWhiteListed) { // if the accessID does not exist in the database, set access_id to "Unauthorized"
            access_id = 'Unauthorized';
        }
        response.status(200).send({access_id});
    } catch (error) {
        console.log(error)
        response.status(500).send(error);
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
            new_form_id,
            assigned_key
            } = request.body;
        if (new_form_id != null) { // if a form is provided
            if (old_form_id != null && old_form_id != new_form_id) { // if there is an old form and it is not the same as the new form
                // remove all instances of the key number in the old form
                const update_old_form_result = await dbOperations.setKeyNumberInRequestFormToNull(key_number, old_form_id);
            }
            // update the key number in the form
            // if the form already contains any instance of the key number, adjust it to the new column if necessary
            const update_new_form_result = await dbOperations.updateKeyNumberInRequestForm(key_number, new_form_id, assigned_key); 
        }
        const result = await dbOperations.editKey(tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, new_form_id);
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
            const update_form_result = await dbOperations.setKeyNumberInRequestFormToNull(key_number, form_id);
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
        const { key_number, form_id } = request.body;
        if (form_id != null) { // if a form_id is provided, remove the key from the form
            const update_form_result = await dbOperations.setKeyNumberInRequestFormToNull(key_number, form_id);
        }
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
        const { 
            tag_number, 
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
            new_form_id, 
            assigned_key } = request.body;
        const result = await dbOperations.createKey(tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, new_form_id);
        if (new_form_id != null) { // if a form is provided
            const update_new_form_result = await dbOperations.updateKeyNumberInRequestForm(key_number, new_form_id, assigned_key); 
        }
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
        // delete the form_id from all keys that are in the form
        const delete_form_id_from_keys_result = await dbOperations.deleteFormIdFromKeys(form_id);
        // delete the form
        const result = await dbOperations.deleteKeyRequestForm(form_id);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.get('/get-all-user-data', async (request, response) => {
    try {
        const result = await dbOperations.getAllUserData();
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/add-user', async (request, response) => {
    try {
        const { accessId, permissions } = request.body;
        const doesUserAlreadyExist = await dbOperations.isAccessIdWhiteListed(accessId);
        if (doesUserAlreadyExist) {
            response.status(400).send('User already exists');
            return;
        }
        const result = await dbOperations.addUser(accessId, permissions);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/search-user', async (request, response) => {
    try {
        const { column, row } = request.body;
        const result = await dbOperations.searchUser(column, row);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/edit-user', async (request, response) => {
    try {
        const { fname, lname, access_id, title, permissions } = request.body;
        const result = await dbOperations.editUser(fname, lname, access_id, title, permissions);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/delete-user', async (request, response) => {
    try {
        const { access_id } = request.body;
        const result = await dbOperations.deleteUser(access_id);
        response.status(200).send(result);
    } catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});

module.exports = router;
