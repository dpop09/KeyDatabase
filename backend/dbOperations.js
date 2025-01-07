const mysql = require('mysql');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
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
            console.log(error);
        }
    },
    search: async function (column, row) {
        try {
            const sql = 'SELECT * FROM `Keys` WHERE ?? = ?';
            const values = [column, row];
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
            console.error(error);
            throw error; // Throw the error to the calling function
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
            console.error(error);
            throw error; // Throw the error to the calling function
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
            console.log(error);
        }
    },
    searchRequestForm: async function (column, row) {
        try {
            const sql = 'SELECT * FROM `key_request_form` WHERE ?? = ?';
            const values = [column, row];
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
            console.log(error);
        }
    },
    updateKeyRequestForm: async function (form_id, first_name, last_name, access_id, date_signed, file_buffer) {
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
            console.log(error);
        }
    },
}

module.exports = dbOperations