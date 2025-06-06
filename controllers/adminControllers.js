import userModel from "../models/userModel.js";
import leaveFormModel from "../models/leaveFormModel.js"; // Import the leave form model

function getManageRoles(req, res) {
    const searchQuery = req.query.search || ""; // Get the search query from the request

    // If a search query is provided, find the user by college email
    const searchCriteria = searchQuery
        ? { collegeEmail: { $regex: searchQuery, $options: "i" }, role: { $ne: "admin" } }
        : { role: { $ne: "admin" } }; // Exclude admins by default
 
    userModel.find(searchCriteria)
        .then((users) => {
            res.render("admin/manageRoles", {
                user: req.user,
                title: "Manage Roles",
                users,
                searchQuery,
                success: req.query.success || null,
                error: req.query.error || null,
            });
        })
        .catch((error) => {
            console.error("Error fetching users:", error);
            res.render("admin/manageRoles", {
                user: req.user,
                title: "Manage Roles",
                users: [],
                searchQuery,
                success: null,
                error: "Failed to fetch users.",
            });
        });
}

function postManageRoles(req, res) {
    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
        return res.redirect("/admin/manage-roles?error=All fields are required.");
    }

    userModel.findByIdAndUpdate(userId, { role: newRole }, { new: true })
        .then(() => {
            res.redirect("/admin/manage-roles?success=User role updated successfully.");
        })
        .catch((error) => {
            console.error("Error updating user role:", error);
            res.redirect("/admin/manage-roles?error=Failed to update user role.");
        });
}



async function getDeletePassout(req, res) {
    res.render("admin/deletePassout", {
        user: req.user || null,
        success: req.query.success || null,
        error: req.query.error || null,
    });
}

async function postDeletePassout(req, res) {
    const { passoutYear } = req.body;

    if (!passoutYear) {
        return res.redirect("/admin/delete-passout?error=Please select a pass-out year.");
    }

    try {
        // Find all students matching the pass-out year
        const students = await userModel.find({
            role: "student",
            "studyPeriod.end": { $eq: parseInt(passoutYear, 10) },
        });

        if (students.length === 0) {
            return res.redirect("/admin/delete-passout?error=No students found for the selected year.");
        }

        // Extract student IDs
        const studentIds = students.map((student) => student._id);

        // Delete all leave forms related to these students
        const leaveFormsDeleted = await leaveFormModel.deleteMany({ student: { $in: studentIds } });

        // Delete the students
        const studentsDeleted = await userModel.deleteMany({ _id: { $in: studentIds } });

        res.redirect(
            `/admin/delete-passout?success=${studentsDeleted.deletedCount} students and ${leaveFormsDeleted.deletedCount} leave forms deleted successfully.`
        );
    } catch (error) {
        console.error("Error deleting pass-out students and their leave forms:", error);
        res.redirect("/admin/delete-passout?error=Failed to delete students and their leave forms.");
    }
}

export default {
    getManageRoles,
    postManageRoles,
    getDeletePassout,
    postDeletePassout,
};