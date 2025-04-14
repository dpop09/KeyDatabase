# 🔑 Key Database Web App

An SQL-based web application for managing and digitizing key requests and assignments at the Wayne State University Engineering Building.

# 🧠 About

The Key Database Web App is designed to streamline the management of keys and request forms for Wayne State’s engineering building. It aims to assist student assistants by digitizing the analog request process and offering an intuitive interface to manage keys, holders, and request histories.

# ✨ Features

- Key table

- Key request form table

- Dynamic PDF viewing of request forms

- Simple and advanced search

- User permissions (unauthorized, student assistant, and admin)

- Dynamic logins

- Key creation and editing

- Key request form creation and editing

- Detailed history log

- Automated key pick-up email notifications

- Access ID auto complete

# 🛠️ Tech Stack & Packages

## 💻 System

- OS: Windows 11
- Backend Runtime: Node.js v20.3.0
- Database: MariaDB v10.4.32
- Server Control: XAMPP Control Panel v3.3.0

## 🌐 Core Web Stack

- HTML
- CSS
- JavaScript

## ⚛️ Front End

- @emotion/react v11.14.0
- @emotion/styled v11.14.0
- @mui/material v6.4.5
- react v18.3.1
- react-datepicker v7.5.0
- react-dom v18.3.1
- react-router-dom v6.27.0

## 🧠 Back End

- axios v1.7.9
- cheerio v1.0.0
- cors v2.8.5
- dotenv v16.4.5
- express v4.21.1
- multer v1.4.5-lts.1
- mysql v2.18.1
- mysqldump v3.2.0
- nodemailer v6.10.0
- nodemon v3.1.7
- uuid v11.0.3

# 🚀 Installation

## 1) Clone the Repository

- First, clone the project from GitHub by executing the following commands into your terminal:
```
git clone https://github.com/dpop09/KeyDatabase.git
cd KeyDatabase
```

## 2) Install XAMPP (MariaDB + Apache)

- Download and install XAMPP from the official site: https://www.apachefriends.org/index.html
- Open the XAMPP Control Panel:
- Start Apache and MySQL.
- Click "Admin" next to MySQL to open phpMyAdmin.

## 3) Create the Database

- In phpMyAdmin, create a new database (e.g., key_database).
- Open the file sql.txt from the project folder.
- Copy all SQL commands from the file.
- Paste them into the SQL tab in phpMyAdmin and click Go to run them.

## 4) Install Node.js & NPM Dependencies

- Make sure Node.js is installed:
```
node -v
npm -v
```
- If not installed, download it here: https://nodejs.org/
- Then install the required packages:
```
cd backend
npm install
cd ..\frontend
npm install
```

## 5) Configure Environment Variables

- Create a .env file in the backend directory:
```
cd backend
```
- Copy and paste the contents from the .env section of the user manual into the .env you've created

## 6) Start the Server and Client

- To run the backend:
```
cd backend
npm start
```
- To run the frontend, open a new terminal and run:
```
cd frontend
npm run dev
```
- Open up a web browser and type http://localhost:5173/ into the URL bar
