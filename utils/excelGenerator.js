import ExcelJS from 'exceljs';

function generateRefundExcel(refunds) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Refund List');

    // Add header row
    worksheet.columns = [
        { header: 'Full Name', key: 'fullName', width: 20 },
        { header: 'Enrollment Number', key: 'enrollmentNumber', width: 20 },
        { header: 'UID Number', key: 'uidNumber', width: 20 },
        { header: 'College Email', key: 'collegeEmail', width: 25 },
        { header: 'School', key: 'school', width: 15 },
        { header: 'Course', key: 'course', width: 15 },
        { header: 'Study Period', key: 'studyPeriod', width: 20 },
        { header: 'Mobile Number', key: 'ownMobileNumber', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Hostel Name', key: 'blockHostelName', width: 15 },
        { header: 'Room Number', key: 'roomNo', width: 10 },
        { header: 'Account Number', key: 'accountNumber', width: 20 },
        { header: 'IFSC Code', key: 'ifscCode', width: 15 },
        { header: 'Number of Eligible Days', key: 'eligibleDays', width: 20 }, // New column
        { header: 'Total Refund Amount', key: 'totalRefund', width: 20 },
    ];

    // Add data rows
    let grandTotal = 0;
    let grandEligibleDays = 0;

    refunds.forEach((refund) => {
        const totalEligibleDays = refund.refunds.reduce((sum, r) => sum + (r.daysEligible || 0), 0);
        const totalRefundAmount = refund.refunds.reduce((sum, r) => sum + (r.refundAmount || 0), 0);

        grandTotal += totalRefundAmount;
        grandEligibleDays += totalEligibleDays;

        worksheet.addRow({
            fullName: refund.student.fullName || 'N/A',
            enrollmentNumber: refund.student.enrollmentNumber || 'N/A',
            uidNumber: refund.student.uidNumber || 'N/A',
            collegeEmail: refund.student.collegeEmail || 'N/A',
            school: refund.student.school || 'N/A',
            course: refund.student.course || 'N/A',
            studyPeriod: refund.student.studyPeriod
                ? `${refund.student.studyPeriod.start || 'N/A'} - ${refund.student.studyPeriod.end || 'N/A'}`
                : 'N/A',
            ownMobileNumber: refund.student.ownMobileNumber || 'N/A',
            address: refund.student.address || 'N/A',
            blockHostelName: refund.student.blockHostelName || 'N/A',
            roomNo: refund.student.roomNo || 'N/A',
            accountNumber: refund.student.accountNumber || 'N/A',
            ifscCode: refund.student.ifscCode || 'N/A',
            eligibleDays: totalEligibleDays, // Aggregated eligible days
            totalRefund: totalRefundAmount, // Aggregated refund amount
        });
    });

    // Add grand total row
    worksheet.addRow({});
    worksheet.addRow({
        fullName: 'Grand Total',
        eligibleDays: grandEligibleDays,
        totalRefund: grandTotal,
    });

    return workbook;
}

export default generateRefundExcel;