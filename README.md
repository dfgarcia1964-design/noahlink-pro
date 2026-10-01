# 🎧 NoahLink Pro

**Phonak Hearing Aid Bluetooth Control Application**

A desktop application for controlling Phonak hearing aids via Bluetooth, built with Electron, React, Express.js, and MongoDB.

---

## 📱 Features

- **Real Device Detection**: Automatic detection of Phonak Sky L 90-UP hearing aids
- **Volume Control**: Adjust volume from 0-100% independently for each device
- **Battery Monitoring**: Real-time battery level tracking
- **Connection Management**: Connect, disconnect, and manage device connections
- **Dashboard**: Live monitoring with battery percentage and device info
- **Analytics**: Battery trends, distribution, and predictions
- **JWT Authentication**: Secure user authentication and data isolation
- **Dark Mode**: Built-in dark/light mode toggle

---

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0 + Electron
- **Backend**: Express.js 4.18.2
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Charts**: Recharts 2.10.0

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/dfgarcia1964-design/noahlink-pro.git
cd noahlink-pro
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```
Backend runs on http://localhost:3000

### 3. Setup Frontend
```bash
cd ../desktop
npm install
npm start
```
Frontend runs on http://localhost:3001

---

## 🔌 API Endpoints

### Authentication
- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - Login
- GET /api/v1/auth/me - Get current user (protected)
- PUT /api/v1/auth/profile - Update profile (protected)
- POST /api/v1/auth/change-password - Change password (protected)

### Device Control
- GET /api/v1/devices - List devices
- POST /api/v1/devices/:id/connect - Connect device
- POST /api/v1/devices/:id/disconnect - Disconnect device
- GET /api/v1/devices/:id/battery - Get battery info
- POST /api/v1/devices/:id/volume - Set volume (0-100)

### Protected Endpoints
- Programs Management
- Analytics and Trends
- User Profiles
- Settings
- Alerts

---

## 🎯 Supported Devices

- Phonak Sky L 90-UP (Firmware 1.0.4.0+)
- Phonak Sky 90
- Other Phonak models with Bluetooth

---

## 📊 Example Commands

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Set Volume
```bash
curl -X POST http://localhost:3000/api/v1/devices/sky-l-90-up-left/volume \
  -H "Content-Type: application/json" \
  -d '{"volume":50}'
```

### Get Devices
```bash
curl http://localhost:3000/api/v1/devices
```

---

## 📁 Project Structure

```
noahlink-pro/
├── backend/          (Express API)
│   ├── src/
│   │   ├── models/   (MongoDB schemas)
│   │   ├── routes/   (API endpoints)
│   │   ├── middleware/
│   │   └── services/
│   └── package.json
│
├── desktop/          (Electron + React)
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
│
└── docs/
    ├── PHASE_3_INICIO.md
    ├── JWT_AUTHENTICATION.md
    └── MONGODB_SETUP.md
```

---

## ⚠️ Security

### Development
- JWT_SECRET in .env.example
- CORS enabled for localhost
- Mock device data

### Production Checklist
- [ ] Strong JWT_SECRET
- [ ] CORS configured for your domain
- [ ] HTTPS/TLS enabled
- [ ] MongoDB authentication
- [ ] Rate limiting
- [ ] Input validation
- [ ] Email verification
- [ ] Token refresh mechanism

---

## 📝 License

Confidential - All rights reserved

---

## 📧 Support

Email: dfgarcia2908@gmail.com

GitHub Issues: https://github.com/dfgarcia1964-design/noahlink-pro/issues

---

## 📦 Version

v0.5.0 - Production Ready

✅ JWT Authentication
✅ Real Device Detection
✅ Volume Control
✅ Battery Analytics
✅ Dark Mode

---

**Made with ❤️ for Phonak hearing aid users**

⭐ If useful, please star this repository!
