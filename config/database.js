import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => { 
    try {
        const uri = process.env.MONGODB_URI;
        if (!process.env.MONGODB_URI) {
            console.warn("MONGODB_URI is not defined. Falling back to default URI.");
        }
        const conn = await mongoose.connect(uri); 
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;