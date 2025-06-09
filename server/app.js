const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const communitiesDir = path.join(uploadsDir, 'communities');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(communitiesDir)) {
  fs.mkdirSync(communitiesDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/communities', require('./routes/communities'));
// ... other routes ...

module.exports = app; 