const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // Import your routes

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use routes from routes.js
app.use('/', routes);

// Set up the web server listener
app.listen(8081, () => {
    console.log("I am listening.");
});
