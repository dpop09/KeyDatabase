const mysql = require('mysql');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { scrapeWayneData } = require('./scrape');
const errorLogOperations = require('./errorLogOperations');
dotenv.config(); // read from .env file

// create a connection to the database
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
})

// connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

const dbOperations = {
    getAll: async function () {
        try {
            const sql = 'SELECT * FROM `Keys`';
            const response = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    searchKey: async function (row) {
        try {
            const sql = 'SELECT * FROM `keys` WHERE tag_number = ? OR core_number = ? OR room_number = ? OR room_type = ? OR key_number = ? OR key_holder_fname = ? OR key_holder_lname = ? OR date_assigned = ? OR key_holder_access_id = ?';
            const values = [row, row, row, row, row, row, row, row, row];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    getKeyRequestForm: async function (key_number) {
        try {
            // Define the path to the PDF file in the key_request_forms folder
            const filePath = path.join(__dirname, '../', 'key_request_forms', `${key_number}.pdf`);
            const options = {
                format: 'jpeg',
                out_dir: path.dirname(filePath),
                out_prefix: key_number,
                page: 1 // Render only the first page as an image, or specify range if needed
            };
    
            // Convert PDF to image
            await pdf.convert(filePath, options);
    
            // Read the generated image file
            const imagePath = path.join(options.out_dir, `${options.out_prefix}-1.jpg`);
            const imageData = await fs.readFile(imagePath);
    
            // Convert image to base64
            const base64Image = imageData.toString('base64');

            // Delete the temporary image file after reading it
            await fs.unlink(imagePath);
    
            // Return the base64 image data
            return { image_data: base64Image };
        } catch (error) {
            return null;
        }
    },
    editKey: async function (tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, new_form_id) {
        try {
            const date_assigned_parts = date_assigned.split(/[-\/]/); // Split date
            const formatted_date_assigned = `${date_assigned_parts[2]}-${date_assigned_parts[0]}-${date_assigned_parts[1]}`; // Rebuild date
            const current_date = new Date() // Get current date
            const formatted_date_last_edited = current_date.toISOString().slice(0, 19).replace('T', ' '); // Format date
            const sql = 'UPDATE `Keys` SET tag_number = ?, tag_color = ?, core_number = ?, room_number = ?, room_type = ?, key_holder_fname = ?, key_holder_lname = ?, key_holder_access_id = ?, date_assigned = ?, comments = ?, date_last_edited = ?, form_id = ? WHERE key_number = ?';
            const values = [tag_number, tag_color, core_number, room_number, room_type, key_holder_fname, key_holder_lname, key_holder_access_id, formatted_date_assigned, comments, formatted_date_last_edited, new_form_id, key_number];
            // Perform the update to the key
            await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            
            // Now fetch the updated key
            const select_sql = 'SELECT * FROM `Keys` WHERE key_number = ?';
            const select_values = [key_number];
            const response = await new Promise((resolve, reject) => {
                db.query(select_sql, select_values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result[0]);
                    }
                });
            });

            return response; // Return the updated key
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    removeKeyHolder: async function (key_number) {
        try {
            const current_date = new Date() // Get current date
            const formatted_date_last_edited = current_date.toISOString().slice(0, 19).replace('T', ' '); // Format date
            const last_action_made = 'Removed key holder';
            const sql = 'UPDATE `Keys` SET key_holder_fname = NULL, key_holder_lname = NULL, key_holder_access_id = NULL, date_assigned = NULL, last_action_made = ?, date_last_edited = ? WHERE key_number = ?';
            const values = [last_action_made, formatted_date_last_edited, key_number];
            // Perform the update
            await new Promise((resolve, reject) => { 
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            // Now fetch the updated row
            const select_sql = 'SELECT * FROM `Keys` WHERE key_number = ?';
            const row = await new Promise((resolve, reject) => {
                db.query(select_sql, [key_number], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result[0]);
                    }
                });
            });

            return row; // Return the updated row
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    deleteKey: async function (key_number) {
        try {
            const sql = 'DELETE FROM `Keys` WHERE key_number = ?';
            const values = [key_number];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    getAllKeyRequestForms: async function () {
        try {
            const sql = 'SELECT form_id, first_name, last_name, access_id, date_signed, assigned_key_1, assigned_key_2, assigned_key_3, assigned_key_4 FROM key_request_form';
            const response = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    addKeyRequestForm: async function (first_name, last_name, access_id, date_signed, file_buffer) {
        try {
            const form_id = uuidv4();
            const sql = `INSERT INTO key_request_form (form_id, first_name, last_name, access_id, date_signed, image_data) VALUES (?, ?, ?, ?, ?, ?)`;
            const values = [form_id, first_name, last_name, access_id, date_signed, file_buffer];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    getKeyRequestFormImage: async function (form_id) {
        try {
            const sql = 'SELECT image_data FROM key_request_form WHERE form_id = ?';
            const response = await new Promise((resolve, reject) => {
                db.query(sql, [form_id], (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(new Error('Internal Server Error')); // Reject the Promise with an error
                    } else if (result.length === 0) {
                        reject(new Error('No image found for this form ID')); // Reject if no data found
                    } else {
                        // Encode the PDF buffer as Base64
                        const base64PDF = result[0].image_data.toString('base64');
                        resolve({
                            image_data: `data:application/pdf;base64,${base64PDF}`, // Use the correct MIME type
                        });
                    }
                });
            });
            return response
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.error(error);
        }
    },  
    updateKeyNumberInRequestForm: async function (key_number, form_id, assigned_key) {
        try {
            const sql = `UPDATE key_request_form SET assigned_key_1 = CASE WHEN assigned_key_1 = ? THEN NULL ELSE assigned_key_1 END, assigned_key_2 = CASE WHEN assigned_key_2 = ? THEN NULL ELSE assigned_key_2 END, assigned_key_3 = CASE WHEN assigned_key_3 = ? THEN NULL ELSE assigned_key_3 END, assigned_key_4 = CASE WHEN assigned_key_4 = ? THEN NULL ELSE assigned_key_4 END, ${assigned_key} = ? WHERE form_id = ?`;
            const values = [key_number, key_number, key_number, key_number, key_number, form_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },  
    setKeyNumberInRequestFormToNull: async function (key_number, form_id) {
        try {
            const sql = 'UPDATE key_request_form SET assigned_key_1 = CASE WHEN assigned_key_1 = ? THEN NULL ELSE assigned_key_1 END, assigned_key_2 = CASE WHEN assigned_key_2 = ? THEN NULL ELSE assigned_key_2 END, assigned_key_3 = CASE WHEN assigned_key_3 = ? THEN NULL ELSE assigned_key_3 END, assigned_key_4 = CASE WHEN assigned_key_4 = ? THEN NULL ELSE assigned_key_4 END WHERE form_id = ?';
            const values = [key_number, key_number, key_number, key_number, form_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    getKeyRequestFormImageWithKeyNumber: async function (key_number) {
        try {
            const sql = 'SELECT image_data FROM key_request_form WHERE assigned_key_1 = ? || assigned_key_2 = ? || assigned_key_3 = ? || assigned_key_4 = ?';
            const response = await new Promise((resolve, reject) => {
                db.query(sql, [key_number, key_number, key_number, key_number], (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(new Error('Internal Server Error')); // Reject the Promise with an error
                    } else if (result.length === 0) {
                        resolve(null); // return null if no data found
                    } else {
                        // Encode the PDF buffer as Base64
                        const base64PDF = result[0].image_data.toString('base64');
                        resolve({
                            image_data: `data:application/pdf;base64,${base64PDF}`, // Use the correct MIME type
                        });
                    }
                });
            });
            return response
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.error(error);
        }
    },
    createKey: async function (tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, form_id) {
        try {
            const sql = 'INSERT INTO `keys` (tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, form_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, form_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    searchRequestForm: async function (row) {
        try {
            const sql = 'SELECT * FROM `key_request_form` WHERE first_name = ? OR last_name = ? OR access_id = ? OR date_signed = ? OR assigned_key_1 = ? OR assigned_key_2 = ? OR assigned_key_3 = ? OR assigned_key_4 = ?';
            const values = [row, row, row, row, row, row, row, row];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    updateKeyRequestFormWithFileBuffer: async function (form_id, first_name, last_name, access_id, date_signed, file_buffer) {
        try {
            const sql = 'UPDATE key_request_form SET first_name = ?, last_name = ?, access_id = ?, date_signed = ?, image_data = ? WHERE form_id = ?';
            const values = [first_name, last_name, access_id, date_signed, file_buffer, form_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    updateKeyRequestFormWithoutFileBuffer: async function (form_id, first_name, last_name, access_id, date_signed) {
        try {
            const sql = 'UPDATE key_request_form SET first_name = ?, last_name = ?, access_id = ?, date_signed = ? WHERE form_id = ?';
            const values = [first_name, last_name, access_id, date_signed, form_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    deleteKeyRequestForm: async function (form_id) {
        try {
            const sql = 'DELETE FROM key_request_form WHERE form_id = ?';
            const values = [form_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    deleteFormIdFromKeys: async function (form_id) {
        try {
            const sql = 'UPDATE `keys` SET form_id = NULL WHERE form_id = ?';
            const values = [form_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    isAccessIdWhiteListed: async function (access_id) {
        try {
            const sql = 'SELECT * FROM users WHERE access_id = ?';
            const values = [access_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.length > 0 ? true : false);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    getAllUserData: async function () {
        try {
            const sql = 'SELECT * FROM users';
            const response = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    addUser: async function (access_id, permissions) {
        try {
            const results = await scrapeWayneData(access_id);
            const sql = 'INSERT INTO users (access_id, first_name, last_name, title, permission) VALUES (?, ?, ?, ?, ?)';
            const values = [access_id, results[0].firstName, results[0].lastName, results[0].title, permissions];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return true
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    searchUser: async function (row) {
        try {
            const sql = 'SELECT * FROM `users` WHERE access_id = ? OR permission = ? OR first_name = ? OR last_name = ? OR title = ?';
            const values = [row, row, row, row, row];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    editUser: async function (fname, lname, access_id, title, permissions) {
        try {
            const sql = 'UPDATE users SET first_name = ?, last_name = ?, title = ?, permission = ? WHERE access_id = ?';
            const values = [fname, lname, title, permissions, access_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    deleteUser: async function (access_id) {
        try {
            const sql = 'DELETE FROM users WHERE access_id = ?';
            const values = [access_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    getPermission: async function (access_id) {
        try {
            const sql = 'SELECT permission FROM users WHERE access_id = ?';
            const values = [access_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result[0].permission);
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    advancedSearchRequestForm: async function(input_fname, input_lname, input_access_id, input_date_signed, input_assigned_key) {
        try {
            // Start the base query
            let sql = "SELECT * FROM key_request_form WHERE 1=1";
            let values = [];
    
            // Dynamically add filters based on provided input values
            if (input_fname) {
                sql += " AND first_name = ?";
                values.push(input_fname);
            }
            if (input_lname) {
                sql += " AND last_name = ?";
                values.push(input_lname);
            }
            if (input_access_id) {
                sql += " AND access_id = ?";
                values.push(input_access_id);
            }
            if (input_date_signed) {
                sql += " AND date_signed = ?";
                values.push(input_date_signed);
            }
            if (input_assigned_key) {
                sql += " AND (assigned_key_1 = ? OR assigned_key_2 = ? OR assigned_key_3 = ? OR assigned_key_4 = ?)";
                values.push(input_assigned_key, input_assigned_key, input_assigned_key, input_assigned_key);
            }
    
            // Execute the query
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return response;
        } catch (error) {
            errorLogOperations.logError(error);
            console.log(error);
        }
    },
    advancedSearchKey: async function(tag_number, core_number, room_number, room_type, key_number, availability, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned) {
        // Array to hold SQL conditions
        let conditions = [];
        // Array to hold parameter values (for the '?' placeholders)
        let params = [];
        // Add conditions for each column if the parameter is not null.
        if (tag_number) {
            conditions.push("tag_number = ?");
            params.push(tag_number);
        }
        if (core_number) {
            conditions.push("core_number = ?");
            params.push(core_number);
        }
        if (room_number) {
            conditions.push("room_number = ?");
            params.push(room_number);
        }
        if (room_type) {
            conditions.push("room_type = ?");
            params.push(room_type);
        }
        if (key_number) {
            conditions.push("key_number = ?");
            params.push(key_number);
        }
        if (key_holder_fname) {
            conditions.push("key_holder_fname = ?");
            params.push(key_holder_fname);
        }
        if (key_holder_lname) {
            conditions.push("key_holder_lname = ?");
            params.push(key_holder_lname);
        }
        if (key_holder_access_id) {
            conditions.push("key_holder_access_id = ?");
            params.push(key_holder_access_id);
        }
        if (date_assigned) {
            conditions.push("date_assigned = ?");
            params.push(date_assigned);
        }
        
        // Handle the "availability" logical attribute:
        if (availability) {
            availability = !!availability // convert it to a bool
            if (availability === true) {
            // Key is available if none of the assignment fields are set.
            conditions.push(
                "key_holder_fname IS NULL AND key_holder_lname IS NULL AND key_holder_access_id IS NULL AND date_assigned IS NULL"
            );
            } else if (availability === false) {
            // Key is not available if all assignment fields are set.
            conditions.push(
                "key_holder_fname IS NOT NULL AND key_holder_lname IS NOT NULL AND key_holder_access_id IS NOT NULL AND date_assigned IS NOT NULL"
            );
            }
        }
        
        // Build the final query.
        let sql = "SELECT * FROM `keys`";
        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        // Execute the query (replace 'db.query' with your actual query execution function).
        try {
            const response = await new Promise((resolve, reject) => {
                db.query(sql, params, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response
        } catch (err) {
            // Handle any errors as appropriate for your app.
            console.error("Error executing advanced search query:", err);
            throw err;
        }
    }
}

module.exports = dbOperations