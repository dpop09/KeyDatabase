const mysql = require('mysql');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { scrapeWayneData } = require('./scrape');
const errorLogOperations = require('./errorLogOperations');
const dbOperations = require('./dbOperations')
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

const historyLogOperations = {
    logCreateKey: async function(access_id, tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, form_id) {
        const first_name = await dbOperations.getFirstNameFromAccessID(access_id)
        let text = `${first_name} created a key with the following information:\ntag_number = '${tag_number}', tag_color = '${tag_color}', core_number = '${core_number}', room_number = '${room_number}', room_type = '${room_type}', key_number = '${key_number}'`
        if (key_holder_fname) {
            text += `, key_holder_fname = '${key_holder_fname}'`
        }
        if (key_holder_lname) {
            text += `, key_holder_lname = '${key_holder_lname}'`
        }
        if (key_holder_access_id) {
            text += `, key_holder_access_id = '${key_holder_access_id}'`
        }
        if (date_assigned) {
            text += `, date_assigned = '${date_assigned}'`
        }
        if (comments) {
            text += `, comments = '${comments}'`
        }
        if (form_id) {
            text += `, form_id = '${form_id}'`
        }
        try {
            const sql = 'INSERT INTO history (access_id, log_action) VALUES (?, ?)';
            const values = [access_id, text];
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
    logEditKey: async function(access_id, tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, new_form_id) {
        const first_name = await dbOperations.getFirstNameFromAccessID(access_id)
        let text = `${first_name} edited a key with the following information:\n`
        if (tag_number) {
            text += `, tag_number = '${tag_number}'`
        }
        if (tag_color) {
            text += `, tag_color = '${tag_color}'`
        }
        if (core_number) {
            text += `, core_number = '${core_number}'`
        }
        if (room_number) {
            text += `, room_number = '${room_number}'`
        }
        if (room_type) {
            text += `, room_type = '${room_type}'`
        }
        if (key_number) {
            text += `, key_number = '${key_number}'`
        }
        if (key_holder_fname) {
            text += `, key_holder_fname = '${key_holder_fname}'`
        }
        if (key_holder_lname) {
            text += `, key_holder_lname = '${key_holder_lname}'`
        }
        if (key_holder_access_id) {
            text += `, key_holder_access_id = '${key_holder_access_id}'`
        }
        if (date_assigned) {
            text += `, date_assigned = '${date_assigned}'`
        }
        if (comments) {
            text += `, comments = '${comments}'`
        }
        if (form_id) {
            text += `, form_id = '${form_id}'`
        }
        try {
            const sql = 'INSERT INTO history (access_id, log_action) VALUES (?, ?)';
            const values = [access_id, text];
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
    }
}

module.exports = historyLogOperations;
