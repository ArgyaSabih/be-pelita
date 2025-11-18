# PELITA: Pendamping Teliti Anak TK
Platform pengawasan kegiatan anak TK dan jembatan komunikasi antara orang tua dengan sekolah berbasis web
  
## Kelompok 15 (PELITA)
1. Argya Sabih Elysio - 23/512630/TK/56335
2. Christian Kevin Andhika Dandaiva - 23/513576/TK/56433
3. Lisa Olivia Putri Maharani - 23/519241/TK/57250
4. Pradana Yahya Abdillah - 23/515259/TK/56625
5. Muhammad Hafidz Al Farisi - 23/519650/TK/57256

## Struktur Folder dan File
```
Directory structure:
└── argyasabih-be-pelita/
    ├── README.md
    ├── index.js
    ├── package.json
    ├── railway.json
    ├── .env.example
    ├── config/
    │   ├── connectDBConfig.js
    │   └── passport.js
    ├── controllers/
    │   ├── AnnouncementController.js
    │   ├── ChildController.js
    │   ├── FeedbackController.js
    │   ├── PermissionLetterController.js
    │   ├── ScheduleController.js
    │   └── UserController.js
    ├── middlewares/
    │   └── Auth.js
    ├── models/
    │   ├── Announcement.js
    │   ├── Child.js
    │   ├── Feedback.js
    │   ├── PermissionLetter.js
    │   ├── Schedule.js
    │   └── User.js
    ├── routes/
    │   ├── AnnouncementRoutes.js
    │   ├── AuthRoutes.js
    │   ├── ChildRoutes.js
    │   ├── FeedbackRoutes.js
    │   ├── PermissionLetterRoutes.js
    │   ├── ScheduleRoutes.js
    │   └── UserRoutes.js
    └── utils/
        └── JWT.js
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

## Deployed Website URL
https://fe-pelita-production.up.railway.app
