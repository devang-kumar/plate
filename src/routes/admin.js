const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../db/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../public/uploads/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/login', (req, res) => {
    if (req.session.adminId) return res.redirect('/admin/dashboard');
    res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM admins WHERE username = ?", [username], (err, admin) => {
        if (err) return res.render('admin/login', { error: 'Database access error.' });
        if (!admin) return res.render('admin/login', { error: 'Invalid security credentials.' });
        
        if (bcrypt.compareSync(password, admin.password)) {
            req.session.adminId = admin.id;
            res.redirect('/admin/dashboard');
        } else {
            res.render('admin/login', { error: 'Invalid security credentials.' });
        }
    });
});

router.use((req, res, next) => {
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }
    next();
});

router.get('/dashboard', (req, res) => res.render('admin/dashboard'));

router.get('/emirates', (req, res) => {
    db.all("SELECT * FROM emirates", [], (err, rows) => {
        res.render('admin/emirates', { emirates: rows || [] });
    });
});

router.post('/emirates/add', (req, res) => {
    db.run("INSERT INTO emirates (name, logo_url) VALUES (?, ?)", [req.body.name, req.body.logo_url], () => {
        res.redirect('/admin/emirates');
    });
});

router.post('/emirates/delete/:id', (req, res) => {
    db.run("DELETE FROM emirates WHERE id = ?", [req.params.id], () => res.redirect('/admin/emirates'));
});

router.get('/templates', (req, res) => {
    db.all("SELECT * FROM templates", [], (err, rows) => {
        res.render('admin/templates', { templates: rows || [] });
    });
});

router.post('/templates/add', upload.single('media_file'), (req, res) => {
    const { type, perspective_coords, plate_width, plate_height } = req.body;
    const media_url = req.file ? '/uploads/' + req.file.filename : req.body.media_url;
    
    db.run("INSERT INTO templates (type, media_url, perspective_coords, plate_width, plate_height) VALUES (?, ?, ?, ?, ?)",
        [type, media_url, perspective_coords, plate_width || 300, plate_height || 100], () => {
        res.redirect('/admin/templates');
    });
});

router.post('/templates/delete/:id', (req, res) => {
    db.run("DELETE FROM templates WHERE id = ?", [req.params.id], () => res.redirect('/admin/templates'));
});

router.get('/listings', (req, res) => {
    db.all(`
        SELECT plate_listings.*, emirates.name as emirate_name 
        FROM plate_listings 
        LEFT JOIN emirates ON plate_listings.emirate_id = emirates.id
    `, [], (err, rows) => {
        db.all("SELECT * FROM emirates", [], (err, emirates) => {
            res.render('admin/listings', { listings: rows || [], emirates: emirates || [] });
        });
    });
});

router.post('/listings/add', (req, res) => {
    const { plate_number, plate_code, emirate_id, price, contact_info } = req.body;
    db.run("INSERT INTO plate_listings (plate_number, plate_code, emirate_id, price, contact_info) VALUES (?, ?, ?, ?, ?)",
        [plate_number, plate_code, emirate_id, price, contact_info], () => {
        res.redirect('/admin/listings');
    });
});

router.post('/listings/delete/:id', (req, res) => {
    db.run("DELETE FROM plate_listings WHERE id = ?", [req.params.id], () => res.redirect('/admin/listings'));
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

module.exports = router;
