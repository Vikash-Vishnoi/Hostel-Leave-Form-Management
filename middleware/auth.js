import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

async function ensureLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        console.error("Token missing, redirecting to /login");
        return res.redirect("/login");
    }
 
    
    try { 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            console.error("User not found, redirecting to /login");
            return res.redirect("/login");
        }
        
        req.user = user;
        return next();
    } catch (err) {
        console.error("Error verifying token:", err);
        res.redirect("/login");
    }
}

function Role(role){
    return (req, res, next) => {
        const hasRole = Array.isArray(role) ? role.includes(req.user.role) : req.user.role === role;
  
        if (hasRole) {
            return next();
        }
  
        res.status(403).render("error/403", {
            message: "You are not authorized to access this resource",
        });
    };
};

export {
    ensureLoggedIn,
    Role
};