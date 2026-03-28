const express = require('express');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const db = require('./db/database'); // Initialize DB


const app = express();
const PORT = process.env.PORT || 3000;

// Set up file upload storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public/uploads/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretplate',
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Main Public Routes
app.get('/', (req, res) => {
    db.all("SELECT * FROM emirates", [], (err, emirates) => {
        db.all("SELECT * FROM templates", [], (err, templates) => {
            db.all(`
                SELECT plate_listings.*, emirates.name as emirate_name 
                FROM plate_listings 
                LEFT JOIN emirates ON plate_listings.emirate_id = emirates.id
                LIMIT 10
            `, [], (err, listings) => {
                res.render('index', { emirates: emirates || [], templates: templates || [], listings: listings || [] });
            });
        });
    });
});

app.get('/search', (req, res) => {
    const { q, emirate, code, digits } = req.query;
    let sql = `
        SELECT plate_listings.*, emirates.name as emirate_name 
        FROM plate_listings 
        LEFT JOIN emirates ON plate_listings.emirate_id = emirates.id
        WHERE 1=1
    `;
    const params = [];

    if (q) {
        sql += ` AND (plate_number LIKE ? OR plate_code LIKE ?)`;
        params.push(`%${q}%`, `%${q}%`);
    }
    if (emirate) {
        sql += ` AND plate_listings.emirate_id = ?`;
        params.push(emirate);
    }
    // Code and digits would need more logic or columns in DB

    db.all("SELECT * FROM emirates", [], (err, emirates) => {
        db.all(sql, params, (err, listings) => {
            res.render('index', { emirates: emirates || [], listings: listings || [], templates: [] });
        });
    });
});

app.get('/listings', (req, res) => {
    db.all("SELECT * FROM emirates", [], (err, emirates) => {
        db.all(`
            SELECT plate_listings.*, emirates.name as emirate_name 
            FROM plate_listings 
            LEFT JOIN emirates ON plate_listings.emirate_id = emirates.id
        `, [], (err, listings) => {
            res.render('index', { emirates: emirates || [], listings: listings || [], templates: [] });
        });
    });
});

app.get('/paintings', (req, res) => {
    db.all("SELECT * FROM templates", [], (err, templates) => {
        res.render('paintings', { templates: templates || [] });
    });
});

app.get('/drawing', (req, res) => {
    db.all("SELECT * FROM templates", [], (err, templates) => {
        if (err) {
            console.error('Error fetching templates:', err);
            return res.render('drawing', { templates: [] });
        }
        res.render('drawing', { templates: templates || [] });
    });
});

app.get('/drawmultiemi', (req, res) => {
    res.render('drawmultiemi');
});

// Simple placeholder routes for other pages
const otherPages = [
    { path: 'terms', title: 'Terms and Conditions' },
    { path: 'sell', title: 'Sell your number' },
    { path: 'how-to-buy', title: 'How to buy' },
    { path: 'faq', title: 'Frequently Asked Questions' },
    { path: 'buy-tablet', title: 'Buy a tablet online' },
    { path: 'contact', title: 'Communication' },
    { path: 'about', title: 'About the Company' }
];


otherPages.forEach(page => {
    app.get(`/${page.path}`, (req, res) => {
        res.render('page', { title: page.title });
    });
});

// Admin Dashboard Routes
app.get('/admin-dashboard', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const tab = req.query.section || 'templates';
    
    db.all("SELECT * FROM emirates", [], (err, emirates) => {
        const data = { 
            section: tab, 
            emirates: emirates || [], 
            templates: [], 
            listings: [] 
        };
        
        if (tab === 'templates') {
            db.all("SELECT * FROM templates", [], (err, templates) => {
                data.templates = templates || [];
                res.render('admin', data);
            });
        } else if (tab === 'listings') {
            db.all(`
                SELECT plate_listings.*, emirates.name as emirate_name 
                FROM plate_listings 
                LEFT JOIN emirates ON plate_listings.emirate_id = emirates.id
            `, [], (err, listings) => {
                data.listings = listings || [];
                res.render('admin', data);
            });
        } else if (tab === 'emirates') {
            res.render('admin', data);
        } else {
            res.redirect('/admin-dashboard?section=templates');
        }
    });
});

// Admin Listings CRUD
app.post('/admin/listings/save', (req, res) => {
    const { id, plate_number, plate_code, emirate_id, price, contact_info } = req.body;
    if (id) {
        db.run("UPDATE plate_listings SET plate_number = ?, plate_code = ?, emirate_id = ?, price = ?, contact_info = ? WHERE id = ?", 
            [plate_number, plate_code, emirate_id, price, contact_info, id], (err) => {
            if (err) console.error('listings/save update error:', err);
            res.redirect('/admin-dashboard?section=listings');
        });
    } else {
        db.run("INSERT INTO plate_listings (plate_number, plate_code, emirate_id, price, contact_info) VALUES (?, ?, ?, ?, ?)", 
            [plate_number, plate_code, emirate_id, price, contact_info], (err) => {
            if (err) console.error('listings/save insert error:', err);
            res.redirect('/admin-dashboard?section=listings');
        });
    }
});

app.post('/admin/listings/delete', (req, res) => {
    const { id } = req.body;
    db.run("DELETE FROM plate_listings WHERE id = ?", [id], (err) => {
        if (err) console.error('listings/delete error:', err);
        res.redirect('/admin-dashboard?section=listings');
    });
});

// Admin Emirates CRUD
app.post('/admin/emirates/save', (req, res) => {
    const { id, name } = req.body;
    if (id) {
        db.run("UPDATE emirates SET name = ? WHERE id = ?", [name, id], (err) => {
            if (err) console.error('emirates/save update error:', err);
            res.redirect('/admin-dashboard?section=emirates');
        });
    } else {
        db.run("INSERT INTO emirates (name) VALUES (?)", [name], (err) => {
            if (err) console.error('emirates/save insert error:', err);
            res.redirect('/admin-dashboard?section=emirates');
        });
    }
});

app.post('/admin/emirates/delete', (req, res) => {
    const { id } = req.body;
    db.run("DELETE FROM emirates WHERE id = ?", [id], (err) => {
        if (err) console.error('emirates/delete error:', err);
        res.redirect('/admin-dashboard?section=emirates');
    });
});

// Admin Templates CRUD
app.post('/admin/templates/save', upload.single('media_file'), (req, res) => {
    const { id, type, media_url, perspective_coords, aspect_ratio, media_type } = req.body;
    let final_media_url = media_url || '';
    
    if (req.file) {
        final_media_url = '/uploads/' + req.file.filename;
    }

    if (id) {
        db.run("UPDATE templates SET type = ?, media_url = ?, perspective_coords = ?, plate_width = ?, media_type = ? WHERE id = ?",
            [type, final_media_url, perspective_coords, aspect_ratio, media_type, id], (err) => {
            if (err) console.error('templates/save update error:', err);
            res.redirect('/admin-dashboard?section=templates');
        });
    } else {
        db.run("INSERT INTO templates (type, media_url, perspective_coords, plate_width, media_type) VALUES (?, ?, ?, ?, ?)",
            [type, final_media_url, perspective_coords, aspect_ratio, media_type], (err) => {
            if (err) console.error('templates/save insert error:', err);
            res.redirect('/admin-dashboard?section=templates');
        });
    }
});

app.post('/admin/templates/delete', (req, res) => {
    const { id } = req.body;
    db.run("DELETE FROM templates WHERE id = ?", [id], (err) => {
        if (err) console.error('templates/delete error:', err);
        res.redirect('/admin-dashboard?section=templates');
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
