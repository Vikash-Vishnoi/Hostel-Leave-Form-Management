import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// Ensure the upload directory exists
const uploadDir = "./public/images/profile-pic-uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function (err, name) {
            if (err) return cb(err);
            const fn = name.toString("hex") + path.extname(file.originalname);
            cb(null, fn);
        });
    },
});

const upload = multer({ storage: storage });

export default upload;