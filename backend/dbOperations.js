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
}

module.exports = dbOperations