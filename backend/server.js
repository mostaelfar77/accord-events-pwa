const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database setup
const db = new sqlite3.Database('./accord_events.db');

// Initialize database tables
db.serialize(() => {
    // Attendees table (official list)
    db.run(`CREATE TABLE IF NOT EXISTS attendees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        type TEXT DEFAULT 'official',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Registrations table (successful registrations)
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        registration_type TEXT NOT NULL,
        registration_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'), false);
        }
    }
});

// Routes

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Upload Excel file
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Validate format
        if (jsonData.length < 2) {
            return res.status(400).json({ error: 'Invalid Excel format. Please ensure the file has Name and Phone Number columns.' });
        }

        // Clear existing attendees
        db.run('DELETE FROM attendees', (err) => {
            if (err) {
                console.error('Error clearing attendees:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Insert new attendees
            const stmt = db.prepare('INSERT INTO attendees (name, phone, type) VALUES (?, ?, ?)');
            let insertedCount = 0;

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row.length >= 2 && row[0] && row[1]) {
                    stmt.run(row[0].toString().trim(), row[1].toString().trim(), 'official');
                    insertedCount++;
                }
            }

            stmt.finalize((err) => {
                if (err) {
                    console.error('Error inserting attendees:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                res.json({ 
                    success: true, 
                    message: `Successfully uploaded ${insertedCount} attendees`,
                    count: insertedCount
                });
            });
        });

    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).json({ error: 'Error processing Excel file' });
    }
});

// Get all attendees
app.get('/api/attendees', (req, res) => {
    db.all('SELECT * FROM attendees ORDER BY name', (err, rows) => {
        if (err) {
            console.error('Error fetching attendees:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});



// Search attendees
app.get('/api/attendees/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json([]);
    }

    db.all('SELECT * FROM attendees WHERE name LIKE ? ORDER BY name', [`%${query}%`], (err, rows) => {
        if (err) {
            console.error('Error searching attendees:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Register attendee
app.post('/api/register', (req, res) => {
    const { name, phone, registrationType } = req.body;

    if (!name || !phone || !registrationType) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already registered
    db.get('SELECT * FROM registrations WHERE name = ? AND phone = ?', [name, phone], (err, row) => {
        if (err) {
            console.error('Error checking registration:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            return res.status(400).json({ error: 'Attendee already registered' });
        }

        // Insert registration
        db.run('INSERT INTO registrations (name, phone, registration_type) VALUES (?, ?, ?)', 
            [name, phone, registrationType], function(err) {
                if (err) {
                    console.error('Error inserting registration:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                res.json({ 
                    success: true, 
                    message: 'Registration successful',
                    registrationId: this.lastID
                });
            });
    });
});

// Get all registrations
app.get('/api/registrations', (req, res) => {
    db.all('SELECT * FROM registrations ORDER BY registration_time DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching registrations:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get registration statistics
app.get('/api/stats', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM registrations', (err, totalRow) => {
        if (err) {
            console.error('Error getting total registrations:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        db.get('SELECT COUNT(*) as official FROM registrations WHERE registration_type = "Official"', (err, officialRow) => {
            if (err) {
                console.error('Error getting official registrations:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            db.get('SELECT COUNT(*) as walkin FROM registrations WHERE registration_type = "Walk-in"', (err, walkinRow) => {
                if (err) {
                    console.error('Error getting walk-in registrations:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                res.json({
                    total: totalRow.total,
                    official: officialRow.official,
                    walkin: walkinRow.walkin
                });
            });
        });
    });
});

// Download report
app.get('/api/report', (req, res) => {
    db.all('SELECT * FROM registrations ORDER BY registration_time DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching registrations for report:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (rows.length === 0) {
            return res.status(400).json({ error: 'No registrations to download' });
        }

        // Generate CSV
        const headers = ['Name', 'Phone Number', 'Registration Type', 'Registration Time'];
        const csvRows = [headers];

        rows.forEach(row => {
            csvRows.push([
                row.name,
                row.phone,
                row.registration_type,
                new Date(row.registration_time).toLocaleString()
            ]);
        });

        const csvContent = csvRows.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="accord_events_report_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    });
});

// Reset system
app.post('/api/reset', (req, res) => {
    db.run('DELETE FROM attendees', (err) => {
        if (err) {
            console.error('Error clearing attendees:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        db.run('DELETE FROM registrations', (err) => {
            if (err) {
                console.error('Error clearing registrations:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({ success: true, message: 'System reset successfully' });
        });
    });
});

// Print badges endpoint
app.post('/api/print/badges', (req, res) => {
    db.all('SELECT * FROM registrations ORDER BY registration_time DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching registrations for printing:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (rows.length === 0) {
            return res.status(400).json({ error: 'No registrations to print' });
        }

        const badgesHTML = generateBadgesHTML(rows);
        res.json({ success: true, html: badgesHTML });
    });
});

// Print certificates endpoint
app.post('/api/print/certificates', (req, res) => {
    db.all('SELECT * FROM registrations ORDER BY registration_time DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching registrations for printing:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (rows.length === 0) {
            return res.status(400).json({ error: 'No registrations to print' });
        }

        const certificatesHTML = generateCertificatesHTML(rows);
        res.json({ success: true, html: certificatesHTML });
    });
});

// Helper functions for printing
function generateBadgesHTML(attendees) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Accord Events - Badges</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .badge { 
                    width: 300px; height: 200px; 
                    border: 2px solid #667eea; 
                    border-radius: 10px; 
                    margin: 10px; 
                    padding: 20px; 
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    page-break-inside: avoid;
                }
                .badge h2 { margin: 0 0 10px 0; font-size: 24px; }
                .badge p { margin: 5px 0; font-size: 16px; }
                .logo { font-size: 48px; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            ${attendees.map(attendee => `
                <div class="badge">
                    <div class="logo">🎫</div>
                    <h2>${attendee.name}</h2>
                    <p>${attendee.phone}</p>
                    <p>${attendee.registration_type}</p>
                    <p>Accord Events</p>
                </div>
            `).join('')}
        </body>
        </html>
    `;
}

function generateCertificatesHTML(attendees) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Accord Events - Certificates</title>
            <style>
                body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; }
                .certificate { 
                    width: 800px; height: 600px; 
                    border: 3px solid #667eea; 
                    margin: 20px auto; 
                    padding: 40px; 
                    text-align: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    page-break-inside: avoid;
                }
                .certificate h1 { color: #667eea; font-size: 36px; margin-bottom: 20px; }
                .certificate h2 { color: #333; font-size: 28px; margin: 20px 0; }
                .certificate p { font-size: 18px; margin: 10px 0; color: #666; }
                .logo { font-size: 64px; margin-bottom: 20px; }
                .signature { margin-top: 60px; }
            </style>
        </head>
        <body>
            ${attendees.map(attendee => `
                <div class="certificate">
                    <div class="logo">🏆</div>
                    <h1>Certificate of Attendance</h1>
                    <h2>This is to certify that</h2>
                    <h2 style="color: #667eea; font-size: 32px;">${attendee.name}</h2>
                    <p>has successfully attended the medical conference organized by</p>
                    <h2 style="color: #667eea;">Accord Events</h2>
                    <p>Registration Type: ${attendee.registration_type}</p>
                    <p>Date: ${new Date(attendee.registration_time).toLocaleDateString()}</p>
                    <div class="signature">
                        <p>_____________________</p>
                        <p>Event Coordinator</p>
                    </div>
                </div>
            `).join('')}
        </body>
        </html>
    `;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎫 Accord Events Registration System is running!`);
    console.log(`📱 Local access: http://localhost:${PORT}`);
    
    // Get network IP addresses
    const networkInterfaces = os.networkInterfaces();
    console.log(`🌐 Network access:`);
    
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        const interfaces = networkInterfaces[interfaceName];
        interfaces.forEach((interface) => {
            if (interface.family === 'IPv4' && !interface.internal) {
                console.log(`   http://${interface.address}:${PORT}`);
            }
        });
    });
    
    console.log(`📝 Press Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
}); 