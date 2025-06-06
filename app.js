import express from "express";
import session from "express-session";
import flash from "connect-flash";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js"; // Import configured passport instance

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import wardenRoutes from "./routes/wardenRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

import { ensureLoggedIn, Role } from "./middleware/auth.js";
import connectDB from "./config/database.js";
import errorHandeler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// EJS view engine
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add cookie-parser middleware
app.use(cookieParser());

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || "default_secret",
        resave: false,
        saveUninitialized: true,
    })
);

// Flash middleware
app.use(flash());

// Pass flash messages to all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
}); 
 
// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB().catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the application if the database connection fails
});

// Routes
app.use("/", authRoutes);
app.use("/student", ensureLoggedIn, Role("student"), studentRoutes);
app.use("/warden", ensureLoggedIn, Role("warden"), wardenRoutes);
app.use("/admin", ensureLoggedIn, Role("admin"), adminRoutes);

// Error handling middleware
app.use(errorHandeler.handle403Error);
app.use(errorHandeler.handle404Error);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT);
