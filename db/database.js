const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'plates.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS emirates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                logo_url TEXT
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS plate_styles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emirate_id INTEGER,
                name TEXT NOT NULL,
                design_config TEXT,
                FOREIGN KEY(emirate_id) REFERENCES emirates(id)
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                media_url TEXT NOT NULL,
                media_type TEXT DEFAULT 'image',
                perspective_coords TEXT,
                plate_width INTEGER,
                plate_height INTEGER
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS plate_listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plate_number TEXT NOT NULL,
                plate_code TEXT NOT NULL,
                emirate_id INTEGER,
                price REAL,
                contact_info TEXT,
                FOREIGN KEY(emirate_id) REFERENCES emirates(id)
            )`);
            
            // Insert default admin
            db.get("SELECT * FROM admins WHERE username = 'admin'", [], (err, row) => {
                if (!row) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync('admin123', salt);
                    db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['admin', hash]);
                }
            });
        });
    }
});

module.exports = db;
