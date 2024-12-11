const mysql = require('mysql');
const dotenv = require('dotenv');
const pdf = require('pdf-poppler');
const fs = require('fs').promises;
const path = require('path');
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
    editKey: async function (tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments) {
        try {
            const date_assigned_parts = date_assigned.split(/[-\/]/); // Split date
            const formatted_date_assigned = `${date_assigned_parts[2]}-${date_assigned_parts[0]}-${date_assigned_parts[1]}`; // Rebuild date
            const current_date = new Date() // Get current date
            const formatted_date_last_edited = current_date.toISOString().slice(0, 19).replace('T', ' '); // Format date
            const sql = 'UPDATE `Keys` SET tag_number = ?, tag_color = ?, core_number = ?, room_number = ?, room_type = ?, key_holder_fname = ?, key_holder_lname = ?, key_holder_access_id = ?, date_assigned = ?, comments = ?, date_last_edited = ? WHERE key_number = ?';
            const values = [tag_number, tag_color, core_number, room_number, room_type, key_holder_fname, key_holder_lname, key_holder_access_id, formatted_date_assigned, comments, formatted_date_last_edited, key_number];
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
    removeKeyHolder: async function (key_number) {
        try {
            const current_date = new Date() // Get current date
            const formatted_date_last_edited = current_date.toISOString().slice(0, 19).replace('T', ' '); // Format date
            const last_action_made = 'Removed key holder';
            const sql = 'UPDATE `Keys` SET key_holder_fname = NULL, key_holder_lname = NULL, key_holder_access_id = NULL, date_assigned = NULL, last_action_made = ?, date_last_edited = ? WHERE key_number = ?';
            const values = [last_action_made, formatted_date_last_edited, key_number];
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
    }
}

module.exports = dbOperations