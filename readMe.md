rru-hostel-app/
├── app.js
├── package.json
├── .env
│
├── config/
│   ├── db.js
│   ├── passport.js
│   └── session.js
│
├── controllers/
│   ├── authController.js
│   ├── leaveController.js
│   └── wardenController.js
│
├── models/
│   ├── user.js
│   ├── leave.js
│   └── warden.js
│
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
│
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── images/
│       ├── rru-logo.webp
│       ├── default-avatar.png
│       └── favicon.ico
│
├── routes/
│   ├── authRoutes.js
│   ├── leaveRoutes.js
│   └── wardenRoutes.js
│
└── views/
    ├── partials/
    │   ├── header.ejs
    │   ├── footer.ejs
    │   └── alerts.ejs
    │
    ├── auth/
    │   ├── login.ejs
    │   └── register.ejs
    │
    ├── student/
    │   ├── dashboard.ejs
    │   ├── leaveForm.ejs
    │   └── status.ejs
    │
    ├── warden/
    │   ├── approve.ejs
    │   ├── history.ejs
    │   └── refunds.ejs
    │
    └── error.ejs


