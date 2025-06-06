import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import dotenv from "dotenv";
import userModel from "../models/userModel.js"; // Import your user model

// Load environment variables
dotenv.config();
 
// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Ensure the email is available
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                if (!email) {
                    return done(null, false, { message: "Google account does not have an email address." });
                }

                //Only RRU email allowed
                // const allowedPatterns = [/^.*@rru\.ac\.in$/, /^.*@student\.rru\.ac\.in$/];
                // const isValidEmail = allowedPatterns.some((pattern) => pattern.test(email));
                // if (!isValidEmail) {
                //     return done(null, false, { message: "Please use your RRU Google Mail to log in." });
                // }

                // Check if the user already exists in the database
                let user = await userModel.findOne({ googleId: profile.id });
                if (!user) {
                    // If the user doesn't exist, create a new user with minimal details
                    user = await userModel.create({
                        googleId: profile.id,
                        fullName: profile.displayName,
                        collegeEmail: email,
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;