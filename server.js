// const express = require('express');
// const path = require('path');
// const bodyParser = require('body-parser');
// const app = express();
// const port = 3000;

// // Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));

// // Routes
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', '1.2OrginalHackathon.html'));
// });
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', '1tast.html'));
// });

// // API Endpoints
// app.post('/api/alert', (req, res) => {
//     console.log('Alert received:', req.body);
//     // Process the alert data here
//     res.json({ 
//         status: 'success',
//         message: 'Alert received successfully',
//         data: req.body
//     });
// });

// // Start server
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });







const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Whitelist of allowed pages for security
const ALLOWED_PAGES = [
    '1.2OrginalHackathon',
    '1tast',
    '2.GoogelForm',
    '3Dasboard',
    '13BasicTips',
    '17tIME'
];

// Dynamic Route Handler for all HTML pages
app.get('/page/:pageName', (req, res) => {
    const pageName = req.params.pageName;
    
    // Security validation
    if (!ALLOWED_PAGES.includes(pageName)) {
        return res.status(404).send('Page not found');
    }

    const filePath = path.join(__dirname, 'public', `${pageName}.html`);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Error serving ${pageName}:`, err);
            res.status(500).send('Error loading page');
        }
    });
});

// API Endpoints
app.post('/api/alert', (req, res) => {
    console.log('Alert received:', req.body);
    res.json({ 
        status: 'success',
        message: 'Alert received successfully',
        data: req.body
    });
});

// Form Submission Endpoint
app.post('/api/submit-help-request', (req, res) => {
    console.log('Help request received:', req.body);
    // Process the form data here (save to database, etc.)
    res.json({
        status: 'success',
        message: 'Help request submitted successfully',
        data: req.body
    });
});

// Root route - serves main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '1.2OrginalHackathon.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



// Add these to your existing server.js

// Mock disaster data database
const disasterData = {
    // Sample data structure
    "Odisha": {
        "flood": { level: 2, lastUpdated: new Date() },
        "cyclone": { level: 0, lastUpdated: new Date() }
    }
};

// Mock user database
const users = {
    // Sample user data
    "user1": { phone: "+911234567890", location: "Jatani", subscribedAlerts: ["flood", "earthquake"] }
};

// New API Endpoints
app.get('/api/disaster-data/:location', (req, res) => {
    const location = req.params.location;
    res.json(disasterData[location] || {});
});

app.post('/api/subscribe', (req, res) => {
    const { userId, alertTypes } = req.body;
    // In a real system, save to database
    users[userId].subscribedAlerts = alertTypes;
    res.json({ status: 'success', message: 'Subscription updated' });
});

app.post('/api/report', (req, res) => {
    const { location, disasterType, severity, userId } = req.body;
    // Process and validate report
    if (!disasterData[location]) disasterData[location] = {};
    disasterData[location][disasterType] = {
        level: severity,
        lastUpdated: new Date(),
        reportedBy: userId
    };
    res.json({ status: 'success', message: 'Report received' });
});

// AI Classification Endpoint
app.post('/api/classify-disaster', (req, res) => {
    const { disasterType, metrics } = req.body;
    let severity = 0; // 0-3 scale (0=none, 1=mild, 2=moderate, 3=severe)
    let safetyTips = [];
    
    // Simple AI classification logic
    if (disasterType === 'flood') {
        if (metrics.waterLevel > 3) severity = 3;
        else if (metrics.waterLevel > 2) severity = 2;
        else if (metrics.waterLevel > 1) severity = 1;
        
        safetyTips = [
            "Move to higher ground",
            "Avoid walking through flood waters",
            "Turn off electricity at the main switch"
        ];
    }
    // Add other disaster types...
    
    res.json({ severity, safetyTips });
});






// Mock SMS notification function
function sendSMSNotification(phone, message) {
    console.log(`Sending SMS to ${phone}: ${message}`);
    // In a real system, integrate with SMS gateway like Twilio
}

// Function to check for new alerts and notify users
function checkAndNotify() {
    Object.entries(users).forEach(([userId, user]) => {
        const locationData = disasterData[user.location] || {};
        
        user.subscribedAlerts.forEach(alertType => {
            if (locationData[alertType] && locationData[alertType].level > 0) {
                const message = `ALERT: ${alertType.toUpperCase()} level ${locationData[alertType].level} in ${user.location}`;
                sendSMSNotification(user.phone, message);
            }
        });
    });
}

// Check every 15 minutes
setInterval(checkAndNotify, 900000);

