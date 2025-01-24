const fs = require('fs');
const path = require('path');

const errorLogOperations = {
    logError: function (error) {
        const logFilePath = path.join(__dirname, 'error_log.txt'); // Path to the error log txt file
        const timestamp = new Date().toISOString(); // Current timestamp
        const errorMessage = `[${timestamp}] ERROR: ${error.message}\nStack: ${error.stack}\n\n`;

        // Append error message to log file
        fs.appendFile(logFilePath, errorMessage, (err) => {
            if (err) {
                console.error('Failed to write to error log:', err);
            }
        });
    }
}

module.exports = errorLogOperations