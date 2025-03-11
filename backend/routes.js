const express = require('express');
const multer = require('multer');
const dbOperations = require('./dbOperations');
const historyLogOperations = require('./historyLogOperations')
const errorLogOperations = require('./errorLogOperations');
const { scrapeWayneData } = require('./scrape');
const os = require('os');
const { access } = require('fs');
const { v4: uuidv4 } = require('uuid');
const { sendKeyPickupEmail } = require('./emailOperations');

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
        var permission = "Unauthorized";

        access_id = "hc7822" // for testing

        // check if the detected accessID is listed in the database
        const isAccessIdWhiteListed = await dbOperations.isAccessIdWhiteListed(access_id);
        if (isAccessIdWhiteListed) { // if the accessID does not exist in the database, set permission to "Unauthorized"
            permission = await dbOperations.getPermission(access_id); // get the permission corresponding to the accessID from the database
        }
        response.status(200).send({access_id: access_id, permission: permission});
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error)
        response.status(500).send(error);
    }
})

router.get('/getall', async (request, response) => {
    try {
        const result = await dbOperations.getAll();
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/search-key', async (request, response) => {
    try {
        const { row } = request.body;
        const result = await dbOperations.searchKey(row);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
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
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/edit-key', async (request, response) => {
    try {
        const { access_id,
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
            request_form
            } = request.body;
        if (request_form.new_form_id != null) { // if a form is provided
            if (request_form.old_form_id != null && request_form.old_form_id != request_form.new_form_id) { // if there is an old form and it is not the same as the new form
                // remove all instances of the key number in the old form
                const update_old_form_result = await dbOperations.setKeyNumberInRequestFormToNull(key_number.value, request_form.old_form_id);
            }
            // update the key number in the form
            // if the form already contains any instance of the key number, adjust it to the new column if necessary
            const update_new_form_result = await dbOperations.updateKeyNumberInRequestForm(key_number.value, request_form.new_form_id, request_form.assigned_column); 
        }
        const result = await dbOperations.editKey(tag_number.value, tag_color.value, core_number.value, room_number.value, room_type.value, key_number.value, key_holder_fname.value, key_holder_lname.value, key_holder_access_id.value, date_assigned.value, comments.value, request_form.new_form_id);
        const history_log_result = await historyLogOperations.logEditKey(access_id, tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, request_form);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/remove-key-holder', async (request, response) => {
    try {
        const { access_id, key_number, form_id } = request.body;
        if (form_id != null) { // if a form_id is provided, remove the key holder from the form
            const update_form_result = await dbOperations.setKeyNumberInRequestFormToNull(key_number, form_id);
        }
        const result = await dbOperations.removeKeyHolder(key_number);
        const history_log_result = await historyLogOperations.logRemoveKeyHolder(access_id, key_number, form_id)
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/delete-key', async (request, response) => {
    try {
        const { access_id, key_number, form_id } = request.body;
        if (form_id != null) { // if a form_id is provided, remove the key from the form
            const update_form_result = await dbOperations.setKeyNumberInRequestFormToNull(key_number, form_id);
        }
        const result = await dbOperations.deleteKey(key_number);
        const history_log_result = await historyLogOperations.logDeleteKey(access_id, key_number, form_id)
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.get('/get-all-key-request-forms', async (request, response) => {
    try {
        const result = await dbOperations.getAllKeyRequestForms();
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/add-key-request-form', upload.single('file'), async (request, response) => {
    try {
        const {user_access_id, first_name, last_name, access_id, date_signed} = request.body;
        const file_buffer = request.file.buffer;
        const form_id = uuidv4().replace(/-/g, '').substring(0, 8);
        const result = await dbOperations.addKeyRequestForm(first_name, last_name, access_id, date_signed, file_buffer, form_id);
        const history_log_result = await historyLogOperations.logCreateRequestForm(user_access_id, first_name, last_name, access_id, date_signed, form_id);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
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
        errorLogOperations.logError(error);
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
        errorLogOperations.logError(error);
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
});

router.post('/create-key', async (request, response) => {
    try {
        const { 
            access_id,
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

        // check if the key already exists
        const does_key_already_exist = await dbOperations.isKeyInDatabase(key_number);
        if (does_key_already_exist) {
            return response.status(409).json({ error: "Key already exists in the database." }); // 409 Conflict
        }

        // create the key if it doesn't exist
        const result = await dbOperations.createKey(
            tag_number, tag_color, core_number, room_number, room_type, key_number, 
            key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, 
            comments, new_form_id);

        // log key creation in history
        const history_log_result = await  historyLogOperations.logCreateKey(
            access_id, tag_number, tag_color, core_number, room_number, room_type, 
            key_number, key_holder_fname, key_holder_lname, key_holder_access_id, 
            date_assigned, comments, new_form_id)

        // update the request form if a form is provided
        if (new_form_id != null) {
            const update_new_form_result = await dbOperations.updateKeyNumberInRequestForm(key_number, new_form_id, assigned_key); 
        }

        // send success response
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
});

router.post('/search-request-form', async (request, response) => {
    try {
        const { row } = request.body;
        const result = await dbOperations.searchRequestForm(row);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/update-key-request-form', upload.single('file'), async (request, response) => {
    try {
        const { user_access_id, form_id, first_name, first_name_edit_flag, last_name, last_name_edit_flag,
             access_id, access_id_edit_flag, date_signed, date_signed_edit_flag } = request.body;
        const file_buffer = request.file ? request.file.buffer : null;
        let result = null;
        if (file_buffer) { // if the user did upload a new pdf file, we replace the old pdf file
            result = await dbOperations.updateKeyRequestFormWithFileBuffer(
                form_id, first_name, last_name, access_id, date_signed, file_buffer
            );
        } else { // otherwise, the user left the upload file blank and we fallback on the old one
            result = await dbOperations.updateKeyRequestFormWithoutFileBuffer(
                form_id, first_name, last_name, access_id, date_signed
            );
        }
        const history_log_result = await historyLogOperations.logEditRequestForm(user_access_id, 
            form_id, first_name, last_name, access_id, date_signed, (file_buffer) ? true : false, 
            first_name_edit_flag, last_name_edit_flag, access_id_edit_flag, date_signed_edit_flag);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.error(error);
        response.status(500).send(error);
    }
});


router.post('/delete-key-request-form', async (request, response) => {
    try {
        const { user_access_id, form_id } = request.body;
        // delete the form_id from all keys that are in the form
        const delete_form_id_from_keys_result = await dbOperations.deleteFormIdFromKeys(form_id);
        const history_log_result = await historyLogOperations.logDeleteRequestForm(user_access_id, form_id);
        const result = await dbOperations.deleteKeyRequestForm(form_id);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.get('/get-all-user-data', async (request, response) => {
    try {
        const result = await dbOperations.getAllUserData();
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/add-user', async (request, response) => {
    try {
        const { user_access_id, access_id, fname, lname, title, permissions } = request.body;
        // check if the user already exists
        const doesUserAlreadyExist = await dbOperations.isAccessIdWhiteListed(access_id);
        if (doesUserAlreadyExist) {
            response.status(400).send('User already exists');
            return;
        }
        const result = await dbOperations.addUser(access_id, fname, lname, title, permissions);
        const history_log_result = await historyLogOperations.logAddUser(user_access_id, access_id, fname, lname, title, permissions);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/search-user', async (request, response) => {
    try {
        const { row } = request.body;
        const result = await dbOperations.searchUser(row);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/edit-user', async (request, response) => {
    try {
        const { user_access_id, fname, lname, access_id, title, permissions } = request.body;
        const result = await dbOperations.editUser(fname.value, lname.value, access_id, title.value, permissions.value);
        const history_log_result = await historyLogOperations.logEditUser(user_access_id, fname, lname, access_id, title, permissions);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/delete-user', async (request, response) => {
    try {
        const { user_access_id, access_id } = request.body;
        const result = await dbOperations.deleteUser(access_id);
        const history_log_result = await historyLogOperations.logDeleteUser(user_access_id, access_id);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/get-info-from-access-id', async (request, response) => {
    try {
        const {input_access_id } = request.body;
        let result = await scrapeWayneData(input_access_id)
        // ensure result is an array and check if it's empty
        if (!Array.isArray(result) || result.length === 0) {
            result = [{ firstName: null, lastName: null }];
        }
        response.status(200).send({first_name : result[0].firstName, last_name : result[0].lastName})
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
})

router.post('/advanced-search-request-form', async (request, response) => {
    try {
        const { input_status, input_fname, input_lname, input_access_id, input_date_signed, input_assigned_key } = request.body;
        const result = await dbOperations.advancedSearchRequestForm(input_fname, input_lname, input_access_id, input_date_signed, input_assigned_key, input_status)
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
})

router.post('/advanced-search-key', async (request, response) => {
    try {
        const { input_tag_num, input_core, input_room_num, input_room_type, input_key_num, input_availability, input_fname, input_lname, input_access_id, input_date_assigned } = request.body;
        const result = await dbOperations.advancedSearchKey(input_tag_num, input_core, input_room_num, input_room_type, input_key_num, input_availability, input_fname, input_lname, input_access_id, input_date_assigned);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
})

router.get('/get-all-history', async (request, response) => {
    try {
        const result = await dbOperations.getAllHistoryLogs();
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
})

router.post('/get-name-title-from-access-id', async (request, response) => {
    try {
        const {input_access_id } = request.body;
        let result = await scrapeWayneData(input_access_id)
        // ensure result is an array and check if it's empty
        if (!Array.isArray(result) || result.length === 0) {
            result = [{ firstName: null, lastName: null, title: null }];
        }
        response.status(200).send({first_name : result[0].firstName, last_name : result[0].lastName, title : result[0].title})
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
})

router.post('/delete-history', async (request, response) => {
    try {
        const {access_id} = request.body;
        const result = await dbOperations.deleteHistoryLog();
        const history_log_result = await historyLogOperations.logDeleteHistoryLog(access_id);
        response.status(200).send(result)
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
})

router.post('/search-history', async (request, response) => {
    try {
        const { row } = request.body;
        const result = await dbOperations.searchHistory(row);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/advanced-search-history', async (request, response) => {
    try {
        const { log_id,
            user,
            target_type,
            target_id,
            action_type,
            action_details,
            date,
            time } = request.body;
        const result = await dbOperations.advancedSearchHistory(
            log_id,
            user,
            target_type,
            target_id,
            action_type,
            action_details,
            date,
            time);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
});

router.post('/send-email', async (request, response) => {
    try {
        const { access_id } = request.body;
        const result = await sendKeyPickupEmail(access_id);
        response.status(200).send(result);
    } catch (error) {
        errorLogOperations.logError(error);
        console.log(error);
        response.status(500).send(error);
    }
})

module.exports = router;
