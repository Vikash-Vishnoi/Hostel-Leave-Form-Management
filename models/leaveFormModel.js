import mongoose from 'mongoose';

const LeaveFormSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    profilePicture: {
        type: String,
    },
    reason: { 
        type: String,
        required: true
    },
    from: {
        type: Date,
        required: true
    },
    to: {
        type: Date,
        required: true
    },
    goingTo: {
        type:String,
        required: true
    },
    parentContact:{
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    declinedReason: {
        type: String,
        default: null
    },
    approvedOrDeclinedAt: {
        type: Date,
        default: null
    },
    editedAt: {
        type: Date,
        default: null
    },
    editedByStudent:{
        type: Boolean,
        default: false
    },
    studentComment: {
    type: String,
    default: null
    },
}, { timestamps: true });

export default mongoose.model('LeaveForm', LeaveFormSchema);