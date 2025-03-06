const mysql = require('mysql');
const dotenv = require('dotenv');
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
        const user = await dbOperations.getFullNameFromAccessID(access_id)
        let text = `Key was inserted with the following information:\ntag_number = '${tag_number}', tag_color = '${tag_color}', core_number = '${core_number}', room_number = '${room_number}', room_type = '${room_type}', key_number = '${key_number}'`
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
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "Key", key_number, "Insert", text];
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
    logEditKey: async function(access_id, tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, request_form) {
        const user = await dbOperations.getFullNameFromAccessID(access_id)
        let text = `Key was edited with the following information:\n`;
        if (tag_number.edit_flag) {
            text += `, tag_number = '${tag_number.value}'`
        }
        if (tag_color.edit_flag) {
            text += `, tag_color = '${tag_color.value}'`
        }
        if (core_number.edit_flag) {
            text += `, core_number = '${core_number.value}'`
        }
        if (room_number.edit_flag) {
            text += `, room_number = '${room_number.value}'`
        }
        if (room_type.edit_flag) {
            text += `, room_type = '${room_type.value}'`
        }
        if (key_number.edit_flag) {
            text += `, key_number = '${key_number.value}'`
        }
        if (key_holder_fname.edit_flag) {
            text += `, key_holder_fname = '${key_holder_fname.value}'`
        }
        if (key_holder_lname.edit_flag) {
            text += `, key_holder_lname = '${key_holder_lname.value}'`
        }
        if (key_holder_access_id.edit_flag) {
            text += `, key_holder_access_id = '${key_holder_access_id.value}'`
        }
        if (date_assigned.edit_flag) {
            text += `, date_assigned = '${date_assigned.value}'`
        }
        if (comments.edit_flag) {
            text += `, comments = '${comments.value}'`
        }
        if (request_form.new_form_id !== null) {
            text += `, form_id = '${request_form.new_form_id}'`
        }
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "Key", key_number.value, "Edit", text];
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
    logRemoveKeyHolder: async function(access_id, key_number, form_id) {
        const user = await dbOperations.getFullNameFromAccessID(access_id)
        let text = `All of the key holder's information was removed `;
        if (form_id) {
            text += `, and the key got unattached from request form '${form_id}'`;
        }
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "Key", key_number, "Edit", text];
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
    logDeleteKey: async function(access_id, key_number, form_id) {
        const user = await dbOperations.getFullNameFromAccessID(access_id)
        let text = `The key was deleted `;
        if (form_id) {
            text += `and unattached from request form '${form_id}'`;
        }
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "Key", key_number, "Delete", text];
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
    logCreateRequestForm: async function(user_access_id, first_name, last_name, access_id, date_signed, form_id) {
        const user = await dbOperations.getFullNameFromAccessID(user_access_id)
        let text = `Request form was inserted with a PDF file with the following information:\nfirst_name = '${first_name}', last_name = '${last_name}, access_id = '${access_id}'`
        if (date_signed) {
            text += `, date_signed = '${date_signed}'`
        }
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "Request Form", form_id, "Insert", text];
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
    logEditRequestForm: async function(user_access_id, form_id, first_name, last_name, access_id, date_signed, file_buffer_flag) {
        const user = await dbOperations.getFullNameFromAccessID(user_access_id);
        let text = `Request form was edited with the following information:\n`;
        if (file_buffer_flag) {
            text += `Uploaded a new PDF file, `;
        }
        if (first_name.edit_flag) {
            text += `first_name = '${first_name.value}'`;
        }
        if (last_name.edit_flag) {
            text += `last_name = '${last_name.value}'`;
        }
        if (access_id.edit_flag) {
            text += `access_id = '${access_id}'`;
        }
        if (date_signed.edit_flag) {
            text += `date_signed = '${date_signed}'`;
        }
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "Request Form", form_id, "Insert", text];
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
    logDeleteRequestForm: async function(user_access_id, form_id) {
        const user = await dbOperations.getFullNameFromAccessID(user_access_id);
        const text = `Request form was deleted`;
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "Request Form", form_id, "Delete", text];
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
    logAddUser: async function(user_access_id, access_id, fname, lname, title, permissions) {
        const user = await dbOperations.getFullNameFromAccessID(user_access_id);
        let text = `User added with the following information:\naccess_id = '${access_id}', first_name = '${fname}', last_name = '${lname}', title = '${title}', permissions = '${permissions}'`
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "User", access_id, "Insert", text];
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
    logEditUser: async function(user_access_id, fname, lname, access_id, title, permissions) {
        const user = await dbOperations.getFullNameFromAccessID(user_access_id);
        let text = `User was edited with the following information:\n`;
        if (fname.edit_flag) {
            text += `, first_name = '${fname.value}'`;
        }
        if (lname.edit_flag) {
            text += `, last_name = '${lname.value}'`;
        }
        if (title.edit_flag) {
            text += `, title = '${title.value}'`;
        }
        if (permissions.edit_flag) {
            text += `, permission = '${permissions.value}'`
        }
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "User", access_id, "Edit", text];
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
    logDeleteUser: async function(user_access_id, access_id) {
        const user = await dbOperations.getFullNameFromAccessID(user_access_id);
        const text = `User was deleted`;
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "User", access_id, "Delete", text];
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
    logDeleteHistoryLog: async function(user_access_id) {
        const user = await dbOperations.getFullNameFromAccessID(user_access_id);
        const text = `History log was deleted`;
        try {
            const sql = 'INSERT INTO history (user, target_type, target_id, action_type, log_action) VALUES (?, ?, ?, ?, ?)';
            const values = [user, "History", null, "Delete", text];
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
}

module.exports = historyLogOperations;
