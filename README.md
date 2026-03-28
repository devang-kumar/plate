# Official UAE Plate Generator System

## System Architecture
This application is built with an ultra-lightweight, high-performance architecture requiring zero heavy dependencies.
- **Frontend**: Pure HTML5, Vanilla JavaScript, CSS3
- **Backend API**: Node.js + Express
- **Database**: SQLite (Highly portable, single-file DB located at `db/plates.db`)
- **File Management**: Multer (Local disk storage)

## Deployment Instructions

Because we use SQLite, this project is **100% portable**. You can copy-paste the folder to any host (VPS, cPanel Node App, AWS, DigitalOcean) and it will run instantly without complicated database setups.

1. **Environment Initialization:**
   ```bash
   npm install
   ```

2. **Start the Production Server:**
   ```bash
   node server.js
   ```

3. **Access Controls:**
   - Public Generator: `http://your-domain.com/`
   - Admin Control Panel: `http://your-domain.com/admin`
   - Default Admin Credentials: Username: `admin`, Password: `admin123`
     *(Make sure to change this in a production environment)*

## Scaling and Expansion
The code is intentionally un-minified and strictly separated into clear MVC patterns (Views in `/views`, Controllers/Routes in `/src/routes`). To add new Emirates or Plate Styles, use the robust Admin Control Panel. No code modification is physically required to operate the daily business functions.
