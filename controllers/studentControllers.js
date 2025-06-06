import { fileURLToPath } from "url";
import path from "path";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
import userModel from "../models/userModel.js";
import leaveFormModel from "../models/leaveFormModel.js";
import upload from "../utils/multer.js";
import fs from "fs";
import moment from "moment"; // Import moment.js for formatting dates

async function getDashboard (req, res) {   
    res.render("student/dashboard", { 
        user: req.user,
        title: "Student Dashboard",
        success: null,
        error: null
    });
}

function getProfile(req, res) {
    res.render("student/profile", {
        user: req.user,
        title: "Student Profile", 
        success: null,
        error: null,
    });
}


async function postProfileUpdate(req, res) {
    upload.single("profilePic")(req, res, async (err) => {
        if (err) {
            console.error("Error uploading profile picture:", err);
            return res.render("student/profile", {
                user: req.user,
                title: "Student Profile",
                success: null,
                error: "Failed to upload profile picture. Ensure the file is an image and less than 2MB.",
            });
        }

        try {
            const user = await userModel.findById(req.user._id); // Fetch user by ID

            // Delete the old profile picture if a new one is uploaded
            if (req.file) {
                if (user.profilePic && user.profilePic !== "/images/default-avatar.png") {
                    const oldFilePath = path.join(__dirname, "../public", user.profilePic);
                    fs.unlink(oldFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting old profile picture:", err);
                        }
                    });
                }

                // Update the profilePic field with the new file path
                user.profilePic = `/images/profile-pic-uploads/${req.file.filename}`;
            }

            // Update other fields
            const {gender, enrollmentNumber, uidNumber, address, blockHostelName, roomNo, fatherMobileNumber, ownMobileNumber, school, course, studyPeriodEnd, accountNumber, ifscCode } = req.body;
            
            // Update studyPeriod only if studyPeriodEnd is provided
            if (studyPeriodEnd) {
                user.studyPeriod = user.studyPeriod || {}; // Ensure studyPeriod exists
                user.studyPeriod.end = parseInt(studyPeriodEnd, 10);
            }
            
            user.gender = gender
            user.enrollmentNumber = enrollmentNumber;
            user.uidNumber = uidNumber;
            user.school = school;
            user.course = course;
            user.address = address;
            user.blockHostelName = blockHostelName;
            user.roomNo = roomNo;
            user.fatherMobileNumber = fatherMobileNumber;
            user.ownMobileNumber = ownMobileNumber;
            user.accountNumber = accountNumber;
            user.ifscCode = ifscCode;

            await user.save();

            res.render("student/profile", {
                user,
                title: "Student Profile",
                success: "Profile updated successfully.",
                error: null,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            res.render("student/profile", {
                user: req.user,
                title: "Student Profile",
                success: null,
                error: "Failed to update profile.",
            });
        }
    });
}   


async function getLeaveForm(req, res) {
    try {
        // Check if the student has any pending leave forms
        const pendingLeaveForm = await leaveFormModel.findOne({ student: req.user._id, status: "pending" });

        if (pendingLeaveForm) {
            // If a pending leave form exists, render a message instead of the form
            return res.render("student/leaveForm", {
                title: "Leave Application Form",
                user: req.user,
                formData: {}, // No form data since the form is not displayed
                error: "You already have a pending leave application. Please wait for it to be processed before submitting a new one.",
                success: null
            });
        }

        // Render the leave form if no pending leave form exists
        res.render("student/leaveForm", {
            title: "Leave Application Form",
            user: req.user,
            formData: {}, // Empty form data for a new form
            error: null,
            success: null
        });
    } catch (error) {
        console.error("Error fetching leave form:", error);
        res.status(500).render("student/leaveForm", {
            title: "Leave Application Form",
            user: req.user,
            formData: {},
            error: "An error occurred while loading the leave form. Please try again later.",
            success: null
        });
    }
}

async function postLeaveForm(req, res) {
    const user = req.user;
    const { reason, from, to, goingTo, parentContact } = req.body;

    const leaveForm = new leaveFormModel({
        student: user._id,
        reason,
        from,
        to,
        goingTo,
        parentContact,
        profilePicture: user.profilePic, // Use the profile picture path from the user model
    });

    try {
        await leaveForm.save();
        res.redirect("/student/dashboard");
    } catch (error) {
        console.error("Error submitting leave form:", error);
        res.render("student/leaveForm", {
            user: user,
            title: "Leave Form",
            success: null,
            error: "Error submitting leave application",
            formData: req.body // Pass the submitted values back to the template
        });
    }
}

async function getLeaveFormStatus(req, res) {
    const user = req.user;

    try {
        // Fetch the latest leave form and populate the approvedBy field
        const latestForm = await leaveFormModel
            .findOne({ student: user._id })
            .sort({ createdAt: -1 })
            .populate('approvedBy', 'fullName'); // Populate the approvedBy field with the warden's full name

        // Format the date fields if the leave form exists
        if (latestForm) {
            latestForm.formattedApprovedOrDeclinedAt = latestForm.approvedOrDeclinedAt
                ? moment(latestForm.approvedOrDeclinedAt).format("ddd MMM DD YYYY HH:mm")
                : null;

            latestForm.formattedEditedAt = latestForm.editedAt
                ? moment(latestForm.editedAt).format("ddd MMM DD YYYY HH:mm")
                : null;
        }

        res.render("student/leaveFormStatus", {
            user: user,
            title: "Leave Form Status",
            leaveForm: latestForm,
            success: null,
            error: null,
        });
    } catch (error) {
        console.error("Error fetching leave form:", error);
        res.render("student/leaveFormStatus", {
            user: user,
            title: "Leave Form Status",
            leaveForm: null,
            success: null,
            error: "Error fetching leave status",
        });
    }
}


async function getLeaveFormHistory(req, res) {
    try {
        const leaveForms = await leaveFormModel.find({ student: req.user._id })
        res.render('student/leaveFormHistory', {
            user: req.user,
            title: "Leave From History",
            leaveForms,
            error: null
        });
    } catch (error) {
        console.error(error);
        res.render('student/leaveFormHistory', {
            title: "Leave History",
            leaveForms: [],
            error: "Failed to load leave form history."
        });
    }
}



async function getEditLeaveForm(req, res) {
    const user = req.user;
    try {
        const leaveForm = await leaveFormModel.findOne({ _id: req.params.id, student: user._id });

        if (!leaveForm) {
            return res.status(404).render("student/editLeaveForm", {
                user,
                title: "Edit Leave Form",
                leaveForm: null,
                success: null,
                error: "Leave form not found"
            });
        }

        res.render("student/editLeaveForm", {
            user,
            title: "Edit Leave Form",
            leaveForm,
            success: null,
            error: null
        });
    } catch (error) {
        console.error("Error fetching leave form:", error);
        res.status(500).render("student/editLeaveForm", {
            user,
            title: "Edit Leave Form",
            leaveForm: null,
            success: null,
            error: "Error fetching leave form"
        });
    }
}

async function postEditLeaveForm(req, res) {
    const { id } = req.params;
    const { to, originalToDate, studentComment } = req.body;

    try {
        // Check if "To Date" was changed
        if (to === originalToDate) {
            return res.redirect(`/student/leave-form-status?error=No changes were made to the leave form.`);
        }

        // Update the leave form
        const updatedLeaveForm = await leaveFormModel.findByIdAndUpdate(
            id,
            {
                to: new Date(to),
                studentComment,
                editedByStudent: true, // Mark as edited
                editedAt: new Date(),
                status:"pending"
            },
            { new: true }
        );

        if (!updatedLeaveForm) {
            return res.status(404).send("Leave form not found.");
        }

        res.redirect(`/student/leave-form-status?success=Leave form updated successfully.`);
    } catch (error) {
        console.error("Error updating leave form:", error);
        res.redirect(`/student/leave-form-status?error=Failed to update leave form.`);
    }
}

async function getRefundAmount(req, res) {
    const user = req.user;
    const minDays = parseInt(process.env.REFUND_MIN_DAYS);
    const amountPerDay = parseInt(process.env.REFUND_AMOUNT_PER_DAY);

    try {
        const leaves = await leaveFormModel.find({ student: user._id, status: 'approved' });

        let totalRefund = 0;
        const processedLeaves = leaves.map(leave => {
            const diffDays = Math.ceil((leave.to - leave.from) / (1000 * 60 * 60 * 24)) + 1;
            let amount = 0;
            let eligible = false;

            if (diffDays >= minDays) {
                amount = diffDays * amountPerDay;
                totalRefund += amount;
                eligible = true;
            }

            return {
                from: leave.from,
                to: leave.to,
                reason: leave.reason,
                days: diffDays,
                amount,
                eligible
            };
        });

        res.render("student/refundAmount", {
            title: "Refund Amount",
            user: user,
            leaves: processedLeaves,
            totalRefund,
            error: null
        });
    } catch (error) {
        console.error(error);
        res.render("student/refundAmount", {
            title: "Refund Amount",
            user: user,
            leaves: [],
            totalRefund: 0,
            error: "Error calculating refund"
        });
    }
}

function getApprovedLeaveForms(req, res) {
    leaveFormModel
        .find({ status: "approved" })
        .populate("student", "fullName uidNumber profilePic enrollmentNumber gender school course blockHostelName roomNo") // Include profilePic
        .populate("approvedBy", "fullName") // Populate the approvedBy field with fullName
        .then((leaveForms) => {
            res.render("warden/leaveFormsStatus", {
                user: req.user,
                title: "Approved Leave Forms",
                leaveForms,
                success: null,
                error: null,
            });
        })
        .catch((error) => {
            console.error("Error fetching approved leave forms:", error);
            res.render("warden/leaveFormsStatus", {
                user: req.user,
                title: "Approved Leave Forms",
                leaveForms: [],
                success: null,
                error: "Failed to fetch approved leave forms.",
            });
        });
}

export default {
    getDashboard,
    getProfile,
    postProfileUpdate,
    getLeaveForm,
    postLeaveForm,
    getLeaveFormStatus,
    getLeaveFormHistory,
    getEditLeaveForm,
    postEditLeaveForm,
    getRefundAmount,
    getApprovedLeaveForms
}