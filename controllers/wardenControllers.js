import userModel from "../models/userModel.js";
import leaveFormModel from "../models/leaveFormModel.js";
import upload from "../utils/multer.js";
import generateRefundExcel from "../utils/excelGenerator.js";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
 
// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
const envPath = path.resolve(".env");

// GET: Warden Dashboard
function getDashboard(req, res) {
    res.render("warden/dashboard", {
        user: req.user,
        title: req.user.role === "warden" ? "Warden Dashboard" : "Admin Dashboard",
        success: null,
        error: null,
    });
}

// GET: Pending Leave Forms
async function getPendingLeaveForms(req, res) {
    try {
        const leaveForms = await leaveFormModel
            .find({ status: "pending" })
            .populate("student", "fullName uidNumber profilePic enrollmentNumber gender school course blockHostelName roomNo")
            .populate("approvedBy", "fullName"); // Populate the approvedBy field with fullName

        res.render("warden/leaveFormsStatus", {
            user: req.user,
            title: "Pending Leave Forms",
            leaveForms,
            success: null,
            error: null,
        });
    } catch (error) {
        console.error("Error fetching pending leave forms:", error);
        res.render("warden/leaveFormsStatus", {
            user: req.user,
            title: "Pending Leave Forms",
            leaveForms: [],
            success: null,
            error: "Failed to fetch pending leave forms.",
        });
    }
}

// POST: Update Leave Form Status
async function postPendingLeaveForms(req, res) {
    const { declinedReason } = req.body;  // FIXED: extract properly
    const { id, status } = req.params;

    // Validate the status
    if (!["approved", "declined"].includes(status)) {
        return res.render("warden/leaveFormsStatus", {
            user: req.user,
            title: "Pending Leave Forms",
            leaveForms: await leaveFormModel.find({ status: "pending" }).populate("student", "fullName uidNumber").populate("approvedBy", "fullName"),
            success: null,
            error: "Invalid status.",
        });
    }

    // Ensure only wardens can perform this action
    if (req.user.role !== "warden") {
        return res.status(403).send("Forbidden: You are not authorized to perform this action.");
    }

    try {
        const updateData = {
            status,
            approvedBy: req.user._id,
            approvedOrDeclinedAt: new Date(),
        };

        // Validate declinedReason if the status is declined
        if (status === "declined") {
            if (!declinedReason || declinedReason.trim() === "") {
                return res.render("warden/leaveFormsStatus", {
                    user: req.user,
                    title: "Pending Leave Forms",
                    leaveForms: await leaveFormModel.find({ status: "pending" }).populate("student", "fullName uidNumber").populate("approvedBy", "fullName"),
                    success: null,
                    error: "Declined reason is required.",
                });
            }
            updateData.declinedReason = declinedReason.trim();
        }

        const updatedLeaveForm = await leaveFormModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate("student", "fullName uidNumber")
            .populate("approvedBy", "fullName");
 
        if (!updatedLeaveForm) {
            return res.render("warden/leaveFormsStatus", {
                user: req.user,
                title: "Pending Leave Forms",
                leaveForms: await leaveFormModel.find({ status: "pending" }).populate("student", "fullName uidNumber").populate("approvedBy", "fullName"),
                success: null,
                error: "Leave form not found.",
            });
        }

        res.redirect("/warden/pending-leave-forms?success=Leave form status updated successfully.");
    } catch (error) {
        console.error("Error updating leave form status:", error.message);
        res.render("warden/leaveFormsStatus", {
            user: req.user,
            title: "Pending Leave Forms",
            leaveForms: await leaveFormModel.find({ status: "pending" }).populate("student", "fullName uidNumber").populate("approvedBy", "fullName"),
            success: null,
            error: "Failed to update leave form status.",
        });
    }
}

// GET: Approved Leave Forms
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

// GET: Declined Leave Forms
function getDeclinedLeaveForms(req, res) {
    leaveFormModel
        .find({ status: "declined" })
        .populate("student", "fullName uidNumber profilePic enrollmentNumber gender school course blockHostelName roomNo")
        .populate("approvedBy", "fullName")
        .then((leaveForms) => {
            res.render("warden/leaveFormsStatus", {
                user: req.user,
                title: "Declined Leave Forms",
                leaveForms,
                success: null,
                error: null,
            });
        })
        .catch((error) => {
            console.error("Error fetching declined leave forms:", error);
            res.render("warden/leaveFormsStatus", {
                user: req.user,
                title: "Declined Leave Forms",
                leaveForms: [],
                success: null,
                error: "Failed to fetch declined leave forms.",
            });
        });
}

// GET: All Leave Forms
function getAllLeaveForms(req, res) {
    leaveFormModel
        .find({})
        .populate("student", "fullName uidNumber profilePic enrollmentNumber gender school course blockHostelName roomNo")
        .populate("approvedBy", "fullName")
        .then((leaveForms) => {
            res.render("warden/leaveFormsStatus", {
                user: req.user,
                title: "All Leave Forms",
                leaveForms,
                success: null,
                error: null,
            });
        })
        .catch((error) => {
            console.error("Error fetching all leave forms:", error);
            res.render("warden/leaveFormsStatus", {
                user: req.user,
                title: "All Leave Forms",
                leaveForms: [],
                success: null,
                error: "Failed to fetch all leave forms.",
            });
        });
}

// GET: Refund Management
function getRefundManagement(req, res) {
    res.render("warden/refundManagement", {
        refundMinDays: process.env.REFUND_MIN_DAYS || 8,
        refundAmountPerDay: process.env.REFUND_AMOUNT_PER_DAY || 50,
        title: "Refund Management",
        user: req.user,
        success: req.query.success,
        error: req.query.error,
    });
}

// POST: Update Refund Management Configuration
function postRefundManagement(req, res) {
    const { minDays, amountPerDay } = req.body;

    if (!minDays || !amountPerDay) {
        return res.redirect("/warden/refund-management?error=All fields are required");
    }

    try {
        let envConfig = fs.readFileSync(envPath, "utf-8");

        envConfig = envConfig.replace(/REFUND_MIN_DAYS=.*/g, `REFUND_MIN_DAYS=${minDays}`);
        envConfig = envConfig.replace(/REFUND_AMOUNT_PER_DAY=.*/g, `REFUND_AMOUNT_PER_DAY=${amountPerDay}`);

        fs.writeFileSync(envPath, envConfig);

        process.env.REFUND_MIN_DAYS = minDays;
        process.env.REFUND_AMOUNT_PER_DAY = amountPerDay;

        res.redirect(`/${req.user.role}/refund-management?success=Configuration Updated Successfully!`);
    } catch (err) {
        console.error(err);
        res.redirect(`/${req.user.role}/refund-management?error=Something went wrong.`);
    }
}

// GET: Refund List
function getRefundList(req, res) {

    const refundMinDays = parseInt(process.env.REFUND_MIN_DAYS);
    const refundAmountPerDay = parseInt(process.env.REFUND_AMOUNT_PER_DAY);

    leaveFormModel
        .find({ status: "approved" })
        .populate("student", "fullName uidNumber enrollmentNumber gender school course blockHostelName roomNo")
        .populate("approvedBy", "fullName")
        .then((leaveForms) => {
            const refunds = leaveForms.map((leave) => {
                const fromDate = new Date(leave.from);
                const toDate = new Date(leave.to);

                // Validate dates
                if (isNaN(fromDate) || isNaN(toDate)) {
                    console.error("Invalid date for leave:", leave);
                    return null;
                }

                const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
                const daysEligible = diffDays >= refundMinDays ? diffDays : 0;

                // Validate refundAmountPerDay
                if (isNaN(daysEligible) || isNaN(refundAmountPerDay)) {
                    console.error("Invalid calculation for refund:", { daysEligible, refundAmountPerDay });
                    return null;
                }

                const refundAmount = daysEligible * refundAmountPerDay;

                return {
                    student: leave.student,
                    from: leave.from,
                    to: leave.to,
                    reason: leave.reason,
                    daysEligible,
                    refundAmount,
                };
            }).filter(refund => refund !== null); // Filter out invalid refunds

            res.render("warden/refundList", {
                user: req.user,
                title: "Refund List",
                refunds,
                success: null,
                error: null,
            });
        })
        .catch((error) => {
            console.error("Error fetching refund list:", error);
            res.render("warden/refundList", {
                user: req.user,
                title: "Refund List",
                refunds: [],
                success: null,
                error: "Failed to fetch refund list.",
            });
        });
}

async function getDownloadRefundExcel(req, res) {
    try {
        const refundMinDays = parseInt(process.env.REFUND_MIN_DAYS);
        const refundAmountPerDay = parseInt(process.env.REFUND_AMOUNT_PER_DAY);

        // Fetch refunds and populate student details
        const refunds = await leaveFormModel.aggregate([
            { $match: { status: 'approved' } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'student',
                },
            },
            { $unwind: '$student' },
        ]);

        // Group refunds by student and calculate eligibleDays and refundAmount
        const groupedRefunds = refunds.reduce((acc, refund) => {
            const studentId = refund.student._id.toString();
            if (!acc[studentId]) {
                acc[studentId] = { student: refund.student, refunds: [] };
            }

            const fromDate = new Date(refund.from);
            const toDate = new Date(refund.to);

            // Validate dates
            if (isNaN(fromDate) || isNaN(toDate)) {
                console.error("Invalid date for leave:", refund);
                return acc;
            }

            const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
            const daysEligible = diffDays >= refundMinDays ? diffDays : 0;
            const refundAmount = daysEligible * refundAmountPerDay;

            acc[studentId].refunds.push({
                ...refund,
                daysEligible,
                refundAmount,
            });

            return acc;
        }, {});

        const refundData = Object.values(groupedRefunds);

        // Generate Excel workbook
        const workbook = generateRefundExcel(refundData);

        // Send the Excel file as a response
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="Refund_List.xlsx"'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating refund Excel file');
    }
}

// GET: Warden Profile
function getProfile(req, res) {
    res.render("warden/profile", {
        user: req.user,
        success: null,
        error: null,
    });
}

// POST: Update Warden Profile
async function postProfile(req, res) {
    upload.single("profilePic")(req, res, async (err) => {
        if (err) {
            console.error("Error uploading profile picture:", err);
            return res.render("warden/profile", {
                user: req.user,
                title: "Warden Profile",
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
            const {gender, address,ownMobileNumber} = req.body;

            user.gender = gender;
            user.address = address;
            user.ownMobileNumber = ownMobileNumber;

            await user.save();

            res.render("warden/profile", {
                user,
                title: "Warden Profile",
                success: "Profile updated successfully.",
                error: null,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            res.render("warden/profile", {
                user: req.user,
                title: "Warden Profile",
                success: null,
                error: "Failed to update profile.",
            });
        }
    });
}   

export default {
    getDashboard,
    getPendingLeaveForms,
    postPendingLeaveForms,
    getApprovedLeaveForms,
    getDeclinedLeaveForms,
    getAllLeaveForms,
    getRefundManagement,
    postRefundManagement,
    postRefundManagement,
    getRefundList,  
    getDownloadRefundExcel,
    postProfile,    
    getProfile
};