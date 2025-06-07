# Hostel Leave Form Management System

A web-based system that streamlines the process of applying, approving, and managing hostel leave applications using role-based access and dynamic refund calculations. Built using **Node.js**, **Express**, **EJS**, and MongoDB.

---

## Features

### Student
* Google Authentication using college email.
* Fill, edit, and submit leave application forms.
* View leave history and current leave status.
* Calculate refund amount for eligible leaves.

### Warden
* View pending leave applications.
* Approve or decline applications with remarks.
* View approved, declined, and all application history.
* View refund amounts per student.

### Admin
* Set refund rules (per-day refund, minimum qualifying days).
* Assign or revoke roles (Student, Warden).
* View all leave records.
* Delete pass-out students' data.

---

## Tech Stack

| Technology         | Description                        |
| :----------------- | :--------------------------------- |
| Node.js            | Backend JavaScript runtime         |
| Express.js         | Web framework                      |
| MongoDB + Mongoose | NoSQL Database & ODM (Object Data Modeling) |
| Passport.js        | Authentication middleware (Google OAuth) |
| EJS                | Server-side templating             |
| Multer             | Middleware for handling `multipart/form-data` (primarily for profile picture uploads) |
| dotenv             | Environment variable management    |

---

## Folder Structure

    Hostel Leave Form Management
    │
    ├── config/             # Database connection and Passport.js strategies
    │   ├── database.js
    │   └── passport.js
    │
    ├── controllers/        # Business logic for different user roles
    │   ├── adminControllers.js
    │   ├── authControllers.js
    │   ├── studentControllers.js
    │   └── wardenControllers.js
    │
    ├── middleware/         # Custom middleware (authentication, error handling)
    │   ├── auth.js
    │   └── errorHandler.js
    │
    ├── models/             # Mongoose schemas for data models
    │   ├── leaveFormModel.js
    │   └── userModel.js
    │
    ├── routes/             # Routes for different features/roles
    │   ├── adminRoutes.js
    │   ├── authRoutes.js
    │   ├── studentRoutes.js
    │   └── wardenRoutes.js
    │
    ├── utils/              # Helper functions (e.g., Excel generation, Multer setup)
    │   ├── excelGenerator.js
    │   └── multer.js
    │
    ├── views/              # EJS templates for server-side rendering
    ├── public/             # Static assets (CSS, client-side JS, images)
    ├── .env                # Environment variables (sensitive data)
    ├── app.js              # Main application entry point
    └── package.json        # Project metadata and dependencies

---

## Authentication

* **Google OAuth** using Passport.js for secure login.
* **Domain Restriction:** Only valid college email domains are accepted for user registration.
* **Session-based Authentication:** Maintains user persistence across sessions.

---

## Role Management

The system implements robust role-based access control:

| Role    | Capabilities                                    |
| :------ | :---------------------------------------------- |
| Student | Apply/edit/view leave, check refund status      |
| Warden  | Approve/decline leave requests, view student records |
| Admin   | Manage user roles, set refund rules, delete old records |

---

## Refund Calculation

Admins have the flexibility to configure refund rules:
* `REFUND_PER_DAY`: The amount to be refunded per day of eligible leave.
* `MIN_ELIGIBLE_DAYS`: The minimum number of days a leave must span to qualify for a refund.

The refund amount is calculated server-side and is visible to both wardens and students on their respective interfaces.

---

## Route Highlights

This section provides a sample of some important routes within the application:

### Auth Routes
```js
GET   /login             // Displays the login page
GET   /auth/google       // Initiates Google OAuth login
GET   /auth/google/callback // Callback URL after successful Google authentication
GET   /logout            // Logs out the user
```
### Student Routes
```js
GET   /dashboard         // Student dashboard
GET   /leave-form        // Display leave application form
POST  /leave-form        // Submit new leave application
GET   /leave-form-status // View status of current/recent leave
GET   /leave-form-history // View past leave applications
```
### Warden Routes
```js
GET   /pending-leave-forms       // View all pending leave applications
POST  /pending-leave-forms/:id/:status // Approve or decline a specific application
GET   /refund-management         // View refund details for students
```
### Admin Routes
```js
GET   /manage-roles      // Display user role management interface
POST  /manage-roles      // Update user roles
GET/POST /delete-passout // Interface/logic to delete data for pass-out students
```
## Security

* Implemented **Google OAuth** for user authentication.
* **Role-based access middleware** ensures that users can only access authorized routes and functionalities.
* Includes **input validations** to prevent common web vulnerabilities.
* **Session protection** mechanisms are in place for user persistence and security.

## Future Improvements

* Implement email notifications for leave status updates.
* Develop an Admin dashboard with analytics and reporting features.
* Refactor the frontend using a modern JavaScript framework (e.g., React.js) for a Single Page Application (SPA) experience.
* Add functionality to export all data (e.g., leave records, student information) as PDF or Excel files.
