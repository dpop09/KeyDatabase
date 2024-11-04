const mysql = require('mysql');
const dotenv = require('dotenv');
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
            const sql = 'SELECT * FROM `key_request_forms` WHERE key_number = ?';
            const values = [key_number];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else if (result.length > 0) {
                        // Convert the image data to Base64 if it exists
                        result[0].image_data = result[0].image_data
                            ? result[0].image_data.toString('base64')
                            : null;
                        resolve(result[0]);
                    } else {
                        resolve(null); // No result found
                    }
                });
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    editKey: async function (key_number, tag_number, tag_color, available, key_holder_fname, key_holder_lname, date_assigned, comments) {
        try {
            const sql = 'UPDATE `Keys` SET tag_number = ?, tag_color = ?, available = ?, key_holder_fname = ?, key_holder_lname = ?, date_assigned = ?, comments = ? WHERE key_number = ?';
            const values = [tag_number, tag_color, available, key_holder_fname, key_holder_lname, date_assigned, comments, key_number];
            
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(false); // Reject with false on error
                    } else {
                        resolve(result.affectedRows > 0); // Resolve with true if rows were affected, otherwise false
                    }
                });
            });
    
            return response; // This will be true if the update was successful, otherwise false
        } catch (error) {
            console.log(error);
            return false; // Return false in case of any error
        }
    }    
}

module.exports = dbOperations