import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId:{
        type: String,
        required: true,
        unique: true
    },
    enrollmentNumber:{
        type:Number,
    }, 
    fullName: {
        type: String,
        required: true
    },
    gender:{
        type: String,
        enum: ['Male', 'Female', 'Other'], 
    },
    collegeEmail: {
        type: String,
        required: true,
        unique: true
    },
    uidNumber: {
        type: String,
    },
    school: {
        type: String,
        enum:['SITAICS','SASET','SISSP', 'SICMSS', 'SISDSS', 'SFRMNS', 'SICSSL', 'SCBS', 'SCLML', 'SPES'],
        required: false
    },
    course: {
        type: String,
    },
    studyPeriod: {
        start: { type: Number }, 
        end: { type: Number },
    },
    ownMobileNumber: {
        type: Number,
    },
    fatherMobileNumber: {
        type: Number,
    },
    address: {
        type: String,
    },
    profilePic: {
        type: String, 
    },
    role: {
        type: String,
        enum: ['student', 'warden', 'admin'],
        default: 'student'
    },
    blockHostelName: {
        type: String,
    },
    roomNo: {
        type: Number,
    }, 
    accountNumber:{
        type: Number,
    },
    ifscCode:{
        type: String,
    },

}, { timestamps: true });

export default mongoose.model('user', userSchema);
