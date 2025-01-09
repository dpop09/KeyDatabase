# Define the paths to your server and client directories
$serverPath = "C:\Users\Public\KeyDatabase\backend"
$clientPath = "C:\Users\Public\KeyDatabase\frontend"

# Define the url to access the web application
$frontendUrl = "http://localhost:5173"

# Function to start a process in a new terminal window
function Start-NpmProcess {
    param (
        [string]$Path,
        [string]$Command
    )

    # Ensure the directory exists
    if (Test-Path $Path) {
        # Change to the specified directory and run the command
        Start-Process -NoNewWindow powershell -ArgumentList "-NoExit", "-Command", "cd `"$Path`"; npm $Command"
    } else {
        Write-Host "Path not found: $Path" -ForegroundColor Red
    }
}

# Run the server
Start-NpmProcess -Path $serverPath -Command "start"

# Run the client
Start-NpmProcess -Path $clientPath -Command "run dev"

# Open a new Chrome tab to access the web application
Start-Process "chrome.exe" $frontendUrl