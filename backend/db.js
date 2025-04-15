const mysql = require('mysql');
const errorLogOperations = require('./errorLogOperations');
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
        console.error('Database connection failed. Check your XAMPP control panel to see if both Apache and MySQL are running. Refer to the user manual to fix this issue: ' + err.stack);
        errorLogOperations.logError(err)
        return;
    }
    console.log('Connected to the database successfully!');
});

module.exports = db;