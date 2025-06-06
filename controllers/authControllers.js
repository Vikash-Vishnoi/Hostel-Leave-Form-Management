import passport from "passport";
import jwt from "jsonwebtoken";


function getHome (req, res) {
    res.redirect("/login");
};

function getLogin(req, res) {
    // Check if the user is already logged in
    if (req.user) {
        return res.redirect(`/${req.user.role}/dashboard`); 
    }

    // Pass the error message (if any) to the login page
    res.render("auth/login", {
        error: req.query.error || null, // Get the error from the query string
    });
}   


function getLogout(req, res) {
    req.logout((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.redirect("/login?error=Failed to log out.");
        }
        res.clearCookie('token');
        res.redirect("/");
    }); 
};


//google auth codes

function googleAuth(req, res, next) {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
}

function googleAuthCallback(req, res, next) {
    passport.authenticate("google", { failureRedirect: "/login" }, async function (err, user, info) {
        if (err) {
            console.error("Error in Google OAuth callback:", err);
            return res.redirect("/login?error=Something went wrong during authentication. Please try again.");
        }

        if (!user) {
            console.error("Google OAuth callback info:", info);
            return res.redirect(`/login?error=${encodeURIComponent(info.message || "Authentication failed.")}`);
        }

        try {
            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "12h" }
            );

            // Set token cookie
            res.cookie("token", token, { httpOnly: true });

            // Redirect based on role
            if (user.role === "admin") {
                return res.redirect("/admin/dashboard");
            }
            if (user.role === "warden") {
                return res.redirect("/warden/dashboard");
            }
            return res.redirect("/student/dashboard");
        } catch (error) {
            console.error("Error in Google OAuth callback:", error);
            return res.redirect("/login?error=Failed to log in. Please try again.");
        }
    })(req, res, next);
}


export default{ 
    googleAuth,
    googleAuthCallback,
    getHome,
    getLogin, 
    getLogout, 
};

