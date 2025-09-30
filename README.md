# PELITA: Platform Edukasi dan Layanan Informasi Taman Kanak-kanak
Platform pengawasan kegiatan anak TK dan jembatan komunikasi antara orang tua dengan sekolah berbasis web
  
## Kelompok 15 (PELITA)
1. Argya Sabih Elysio - 23/512630/TK/56335
2. Christian Kevin Andhika Dandaiva - 23/513576/TK/56433
3. Lisa Olivia Putri Maharani - 23/519241/TK/57250
4. Pradana Yahya Abdillah - 23/515259/TK/56625
5. Muhammad Hafidz Al Farisi - 23/519650/TK/57256

## Struktur Folder dan File
```
be-pelita/
├── 📁 config/               # Konfigurasi aplikasi
│   ├── connectDBConfig.js     # Konfigurasi koneksi MongoDB
│   └── passport.js            # Konfigurasi Google OAuth Strategy
│
├── 📁 controllers/                 # Logic bisnis aplikasi
│   ├── AnnouncementController.js     # Controller pengumuman
│   ├── FeedbackController.js         # Controller feedback
│   ├── PermissionLetterController.js # Controller surat izin
│   ├── ScheduleController.js         # Controller jadwal
│   └── UserController.js             # Controller user & autentikasi
│
├── 📁 middlewares/          # Middleware kustom
│   └── Auth.js                # Middleware autentikasi JWT
│
├── 📁 models/               # Schema dan model database
│   ├── Announcement.js        # Model pengumuman
│   ├── Child.js               # Model data anak
│   ├── Feedback.js            # Model feedback
│   ├── PermissionLetter.js    # Model surat izin
│   ├── Schedule.js            # Model jadwal
│   └── User.js                # Model pengguna
│
├── 📁 routes/                  # Definisi routing API
│   ├── AnnouncementRoutes.js     # Routes pengumuman
│   ├── AuthRoutes.js             # Routes autentikasi Google OAuth
│   ├── FeedbackRoutes.js         # Routes feedback
│   ├── PermissionLetterRoutes.js # Routes surat izin
│   ├── ScheduleRoutes.js         # Routes jadwal
│   └── UserRoutes.js             # Routes pengguna
│
├── 📁 utils/                 # Utility functions
│   └── JWT.js                  # Helper untuk JWT operations
│
├── 📄 index.js                # Entry point aplikasi
├── 📄 package.json            # Dependencies dan scripts
└── 📄 .gitignore              # Git ignore rules
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB dengan Mongoose ODM
- **Authentication**: JWT + Passport.js (for Google OAuth 2.0)
- **Password Hashing**: bcryptjs

#### **Development Tools**
- **Package Manager**: Yarn
- **Development Server**: Nodemon
- **Environment Management**: dotenv
- **API Testing**: Postman

## Google Drive URL
https://drive.google.com/drive/folders/1nfgsRv8AN8AGNuo30J47-5nqW_Epkkpl
