const db = require('./db');
const fs = require('fs');
const path = require('path');
const errorLogOperations = require('./errorLogOperations');
const mysqldump = require('mysqldump');

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
            const sql = 'SELECT * FROM `keys` WHERE tag_number LIKE ? OR core_number LIKE ? OR room_number LIKE ? OR room_type LIKE ? OR key_number LIKE ? OR key_holder_fname LIKE ? OR key_holder_lname LIKE ? OR date_assigned LIKE ? OR key_holder_access_id LIKE ?';
            // Create a search term with wildcards.
            const searchTerm = `%${row}%`;
            const values = [
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm
            ];
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
    editKey: async function (tag_number, tag_color, core_number, room_number, room_type, key_number, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, new_form_id) {
        try {
            const sql = 'UPDATE `Keys` SET tag_number = ?, tag_color = ?, core_number = ?, room_number = ?, room_type = ?, key_holder_fname = ?, key_holder_lname = ?, key_holder_access_id = ?, date_assigned = ?, comments = ?, form_id = ? WHERE key_number = ?';
            const values = [tag_number, tag_color, core_number, room_number, room_type, key_holder_fname, key_holder_lname, key_holder_access_id, date_assigned, comments, new_form_id, key_number];
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
            const sql = 'UPDATE `Keys` SET key_holder_fname = NULL, key_holder_lname = NULL, key_holder_access_id = NULL, date_assigned = NULL WHERE key_number = ?';
            const values = [key_number];
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
    addKeyRequestForm: async function (first_name, last_name, access_id, date_signed, file_buffer, form_id) {
        try {
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
            // Insert the key
            await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            // Now fetch that newly created key
            const select_sql = 'SELECT * FROM `Keys` WHERE key_number = ?';
            const select_values = [key_number];
            const newKeyData = await new Promise((resolve, reject) => {
                db.query(select_sql, select_values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result[0]);
                    }
                });
            });

            return newKeyData; // Return the newly created key
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    searchRequestForm: async function (row) {
        try {
            const sql = 'SELECT * FROM `key_request_form` WHERE first_name LIKE ? OR last_name LIKE ? OR access_id LIKE ? OR date_signed LIKE ? OR assigned_key_1 LIKE ? OR assigned_key_2 LIKE ? OR assigned_key_3 LIKE ? OR assigned_key_4 LIKE ?';
            // Create a search term with wildcards.
            const searchTerm = `%${row}%`;
            const values = [
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm
            ];
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
    addUser: async function (access_id, fname, lname, title, permissions) {
        try {
            const sql = 'INSERT INTO users (access_id, first_name, last_name, title, permission) VALUES (?, ?, ?, ?, ?)';
            const values = [access_id, fname, lname, title, permissions];
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
            const sql = 'SELECT * FROM `users` WHERE access_id LIKE ? OR permission LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR title LIKE ?';
            // Create a search term with wildcards.
            const searchTerm = `%${row}%`;
            const values = [
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm
            ];
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
    advancedSearchRequestForm: async function(
        input_fname,
        input_lname,
        input_access_id,
        input_date_signed,
        input_assigned_key,
        input_status
      ) {
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
      
          // Add status filtering logic based on the derived logic:
          // For the key columns, we'll use COALESCE to default to an empty string if they are NULL.
          if (input_status) {
            if (input_status === "Pending") {
              sql += `
                AND (
                  (date_signed IS NULL OR date_signed = '0000-00-00')
                  AND 
                  (COALESCE(assigned_key_1, '') = '' AND COALESCE(assigned_key_2, '') = '' AND COALESCE(assigned_key_3, '') = '' AND COALESCE(assigned_key_4, '') = '')
                )
              `;
            } else if (input_status === "Idle") {
              sql += `
                AND (
                  (date_signed IS NOT NULL AND date_signed <> '0000-00-00')
                  AND 
                  (COALESCE(assigned_key_1, '') = '' AND COALESCE(assigned_key_2, '') = '' AND COALESCE(assigned_key_3, '') = '' AND COALESCE(assigned_key_4, '') = '')
                )
              `;
            } else if (input_status === "Active") {
              sql += `
                AND (
                  (date_signed IS NOT NULL AND date_signed <> '0000-00-00')
                  AND 
                  (COALESCE(assigned_key_1, '') <> '' OR COALESCE(assigned_key_2, '') <> '' OR COALESCE(assigned_key_3, '') <> '' OR COALESCE(assigned_key_4, '') <> '')
                )
              `;
            } else if (input_status === "Awaiting Signature") {
                sql += `
                AND (
                  (date_signed IS NULL OR date_signed = '0000-00-00')
                  AND 
                  (COALESCE(assigned_key_1, '') <> '' OR COALESCE(assigned_key_2, '') <> '' OR COALESCE(assigned_key_3, '') <> '' OR COALESCE(assigned_key_4, '') <> '')
                )
              `;
            }
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
    advancedSearchKey: async function(
        input_tag_num, 
        input_core, 
        input_room_num, 
        input_room_type, 
        input_key_num, 
        input_availability, 
        input_fname, 
        input_lname, 
        input_access_id, 
        input_date_assigned
    ) {
        try {
        // Start the base query
        let sql = "SELECT * FROM `keys` WHERE 1=1";
        let values = [];
    
        // Dynamically add filters based on provided input values
        if (input_tag_num) {
            sql += " AND tag_number = ?";
            values.push(input_tag_num);
        }
        if (input_core) {
            sql += " AND core_number = ?";
            values.push(input_core);
        }
        if (input_room_num) {
            sql += " AND room_number = ?";
            values.push(input_room_num);
        }
        if (input_room_type) {
            sql += " AND room_type = ?";
            values.push(input_room_type);
        }
        if (input_key_num) {
            sql += " AND key_number = ?";
            values.push(input_key_num);
        }
        if (input_fname) {
            sql += " AND key_holder_fname = ?";
            values.push(input_fname);
        }
        if (input_lname) {
            sql += " AND key_holder_lname = ?";
            values.push(input_lname);
        }
        if (input_access_id) {
            sql += " AND key_holder_access_id = ?";
            values.push(input_access_id);
        }
        if (input_date_assigned) {
            sql += " AND date_assigned = ?";
            values.push(input_date_assigned);
        }
        // Handle availability input
        if (input_availability) {
            if (input_availability === "true") {
                sql += " AND (key_holder_fname IS NULL OR key_holder_fname = '')";
                sql += " AND (key_holder_lname IS NULL OR key_holder_lname = '')";
                sql += " AND (key_holder_access_id IS NULL OR key_holder_access_id = '')";
                sql += " AND (date_assigned IS NULL OR date_assigned = '')";
            } else if (input_availability === "false") {
                sql += " AND (key_holder_fname IS NOT NULL AND key_holder_fname <> '')";
                sql += " AND (key_holder_lname IS NOT NULL AND key_holder_lname <> '')";
                sql += " AND (key_holder_access_id IS NOT NULL AND key_holder_access_id <> '')";
                sql += " AND (date_assigned IS NOT NULL AND date_assigned <> '')";
            }
        }
    
        // Execute the query using a promise wrapper
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
    getFullNameFromAccessID: async function(access_id) {
        try {
            // Use a comma to select multiple columns
            const sql = 'SELECT first_name, last_name FROM users WHERE access_id = ?';
            const values = [access_id];
            const response = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    // Ensure we have a result and then combine first and last name
                    if (result.length > 0) {
                        const fullName = `${result[0].first_name} ${result[0].last_name}`;
                        return resolve(fullName);
                    }
                    resolve(''); // or handle no user found accordingly
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.error(error);
        }
    },
    getAllHistoryLogs: async function() {
        try {
            const sql = 'SELECT * FROM history';
            const response = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            // return the data as newest to oldest
            return response.reverse();
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    deleteHistoryLog: async function() {
        try {
            const sql = 'DELETE FROM history';
            const sql_reset_auto_increment = 'ALTER TABLE history AUTO_INCREMENT = 1'; // Reset auto-increment
            const response = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        db.query(sql_reset_auto_increment, (resetErr) => { // Reset auto-increment after deletion
                            if (resetErr) {
                                reject(resetErr);
                            } else {
                                resolve(result);
                            }
                        });
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    isKeyInDatabase: async function(key_number) {
        try {
            const sql = 'SELECT 1 FROM `Keys` WHERE key_number = ? LIMIT 1';
            const response = await new Promise((resolve, reject) => {
                db.query(sql, [key_number], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.length > 0); // returns true if key exists, false otherwise
                    }
                });
            });
            return response;
        } catch (error) {
            errorLogOperations.logError(error);
            console.error("Error checking key in database:", error);
            return false; // Return false in case of an error
        }
    },
    searchHistory: async function(row) {
        try {
            const sql = 'SELECT * FROM history WHERE log_id LIKE ? OR user LIKE ? OR target_type LIKE ? OR target_id LIKE ? OR action_type LIKE ? OR log_action LIKE ? OR log_time LIKE ?';
            // Create a search term with wildcards.
            const searchTerm = `%${row}%`;
            const values = [
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm
            ];
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
    advancedSearchHistory: async function(log_id, user, target_type, target_id, action_type, action_details, date, time) {
        // Array to hold SQL conditions
        let conditions = [];
        // Array to hold parameter values (for the '?' placeholders)
        let params = [];
        // Add conditions for each column if the parameter is not null.
        if (log_id) {
            conditions.push('log_id = ?');
            params.push(log_id);
        }
        if (user) {
            conditions.push('user = ?');
            params.push(user);
        }
        if (target_type) {
            conditions.push('target_type = ?');
            params.push(target_type);
        }
        if (target_id) {
            conditions.push('target_id = ?');
            params.push(target_id);
        }
        if (action_type) {
            conditions.push('action_type = ?');
            params.push(action_type);
        }
        if (action_details) {
            conditions.push('log_action LIKE ?');
            params.push(`%${action_details}%`);
        }
        if (date && !time) { // if date is given but not time
            conditions.push('log_time LIKE ?');
            params.push(`%${date}%`);
        }
        if (time && !date) { // if time is given but not date
            conditions.push('log_time LIKE ?');
            params.push(`%${time}%`);
        }
        if (date && time) { // if date and time is given
            const date_time = `${date} ${time}`;
            conditions.push('log_time LIKE ?');
            params.push(`%${date_time}%`);
        }
        // Build the final query.
        let sql = "SELECT * FROM history";
        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }
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
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);
        }
    },
    deleteDatabase: async function() {
        const sql = 'DROP DATABASE IF EXISTS `keysdb`';
        try {
            const response = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return response
        } catch (error) {
            errorLogOperations.logError(error); // Log the error
            console.log(error);  
        }
    },
    downloadAllKeys: async function() {
        try {
            const sql = 'SELECT * FROM `Keys`';
    
            const keys = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
    
            if (!keys.length) {
                console.log('No keys found.');
                return;
            }
    
            // Extract headers and rows
            const headers = Object.keys(keys[0]);
            const rows = keys.map(row => headers.map(h => `${row[h] ?? ''}`));
    
            // Calculate column widths
            const colWidths = headers.map((header, i) =>
                Math.max(
                    header.length,
                    ...rows.map(row => row[i]?.toString().length || 0)
                )
            );
    
            // Build string output
            const pad = (str, width) => str.toString().padEnd(width, ' ');
            const headerLine = headers.map((h, i) => pad(h, colWidths[i])).join(' | ');
            const divider = colWidths.map(w => '-'.repeat(w)).join('-|-');
            const dataLines = rows.map(row =>
                row.map((cell, i) => pad(cell, colWidths[i])).join(' | ')
            );
    
            const formattedText = [headerLine, divider, ...dataLines].join('\n');
    
            // Save to file
            const date = new Date().toISOString().split('T')[0];
            const fileName = `keys_${date}.txt`;
            const filePath = path.join(__dirname, '..', 'filedrop', fileName);
    
            await fs.promises.writeFile(filePath, formattedText);
    
            return true;
        } catch (error) {
            errorLogOperations.logError(error);
            console.log(error);
            return false;
        }
    },
    downloadAllRequestForms: async function() {
        try {
            const sql = 'SELECT * FROM key_request_form';
    
            const forms = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
    
            if (!forms.length) {
                console.log('No request forms found.');
                return false;
            }
    
            // Remove 'image_data' column
            const headers = Object.keys(forms[0]).filter(h => h !== 'image_data');
            const rows = forms.map(row =>
                headers.map(h => `${row[h] ?? ''}`)
            );
    
            // Calculate column widths
            const colWidths = headers.map((header, i) =>
                Math.max(header.length, ...rows.map(row => row[i]?.toString().length || 0))
            );
    
            const pad = (str, width) => str.toString().padEnd(width, ' ');
            const headerLine = headers.map((h, i) => pad(h, colWidths[i])).join(' | ');
            const divider = colWidths.map(w => '-'.repeat(w)).join('-|-');
            const dataLines = rows.map(row =>
                row.map((cell, i) => pad(cell, colWidths[i])).join(' | ')
            );
    
            const formattedText = [headerLine, divider, ...dataLines].join('\n');
    
            const date = new Date().toISOString().split('T')[0];
            const fileName = `request_forms_${date}.txt`;
            const filePath = path.join(__dirname, '..', 'filedrop', fileName);
    
            await fs.promises.writeFile(filePath, formattedText);
    
            return true;
        } catch (error) {
            errorLogOperations.logError(error);
            console.log(error);
            return false;
        }
    },
    downloadHistoryLog: async function() {
        try {
            const sql = 'SELECT * FROM history';
    
            const logs = await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
    
            if (!logs.length) {
                console.log('No history log entries found.');
                return;
            }
    
            // Include all columns
            const headers = Object.keys(logs[0]);
            const rows = logs.map(row =>
                headers.map(h => `${row[h] ?? ''}`)
            );
    
            // Calculate column widths
            const colWidths = headers.map((header, i) =>
                Math.max(header.length, ...rows.map(row => row[i]?.toString().length || 0))
            );
    
            const pad = (str, width) => str.toString().padEnd(width, ' ');
            const headerLine = headers.map((h, i) => pad(h, colWidths[i])).join(' | ');
            const divider = colWidths.map(w => '-'.repeat(w)).join('-|-');
            const dataLines = rows.map(row =>
                row.map((cell, i) => pad(cell, colWidths[i])).join(' | ')
            );
    
            const formattedText = [headerLine, divider, ...dataLines].join('\n');
    
            const date = new Date().toISOString().split('T')[0];
            const fileName = `history_log_${date}.txt`;
            const filePath = path.join(__dirname, '..', 'filedrop', fileName);
    
            await fs.promises.writeFile(filePath, formattedText);
    
            return true;
        } catch (error) {
            errorLogOperations.logError(error);
            console.log(error);
            return false;
        }
    },
    createDatabaseBackup: async function() {
        const file_name = 'backup.sql'
        const file_path = path.join(__dirname, '..', 'filedrop', file_name);
        try {
            const result = mysqldump({
                connection: {
                    host: 'localhost',
                    user: 'root',
                    password: '',
                    database: 'keysdb'
                },
                dumpToFile: file_path
            })
            return true
        } catch (error) {
            errorLogOperations.logError(error);
            console.log(error);
            return false;
        }
    }
}

module.exports = dbOperations