# Define the paths to your server and client directories
$serverPath = "C:\Program Files\KeyDatabase\backend"
$clientPath = "C:\Program Files\KeyDatabase\frontend"

# Define the URL to access the web application
$frontendUrl = "http://localhost:5173"

# Function to start a process in a new terminal window
function Start-NpmProcess {
    param (
        [string]$Path,
        [string]$Command
    )

    # Ensure the directory exists
    if (Test-Path -Path $Path) {
        # Start a new PowerShell window with proper quoting for spaces
        Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-NoExit -Command `"Push-Location '$Path'; & npm.cmd $Command`""
    } else {
        Write-Host "Path not found: $Path" -ForegroundColor Red
    }
}

# Run the server
Start-NpmProcess -Path $serverPath -Command "start"

# Run the client
Start-NpmProcess -Path $clientPath -Command "run dev"

# Open Microsoft Edge with the web application
Start-Process -FilePath "msedge.exe" -ArgumentList $frontendUrl
