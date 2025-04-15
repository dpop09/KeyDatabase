const express = require('express');
const cors = require('cors');
const errorLogOperations = require('./errorLogOperations');
const routes = require('./routes'); // Import your routes

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use routes from routes.js
app.use('/', routes);

const PORT = 8081;

// Set up the web server listener
const server = app.listen(PORT, () => {
    console.log(`I am listening on port ${PORT}.`);
});

// Listen for errors on the server
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use. Please free the port or choose a different one.`);
        process.exit(1);
    } else {
        console.error(error);
    }
});
