const SupportRequest = require('../src/models/supportRequest');
const Counselor = require('../src/models/counselors');
const moment = require('moment');

exports.getHelpRequests = async (req, res) => {
    try {
        // Find all support requests where the counselor field is null (i.e., counselor not assigned)
        const helpRequests = await SupportRequest.find({ counselor: { $exists: false } }).populate('userId');
        const counselors = await Counselor.find({ profileVerified: true });

        // Format the help requests data
        const formattedHelpRequests = helpRequests.map((request, index) => ({
            ...request.toObject(),
            serialNo: index + 1,
            dateFormatted: moment(request.createdAt).format('DD-MM-YYYY'),
            timeFormatted: moment(request.createdAt).format('hh:mm A'),
            studentName: request.userId.name,
            studentEmail: request.userId.email,
        }));

        // Render the helpRequests view with the filtered and formatted data
        res.render('helpRequests', { helpRequests: formattedHelpRequests, counselors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.assignCounselor = async (req, res) => {
    const { id } = req.params;
    const { counselorId } = req.body;

    console.log(`Assigning counselorId: ${counselorId} to support request: ${id}`); // Add this line

    try {
        await SupportRequest.findByIdAndUpdate(id, { counselor: counselorId });
        console.log('Counselor assigned successfully'); // Add this line
        res.redirect('/helpRequests');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


exports.getHelpRequestsList = async (req, res) => {
     
    try {
        const counselorId = req.user._id;

        const helpRequests = await SupportRequest.find({ 
            counselor: counselorId,
            prescription: { $exists: false }
        }).populate('userId');


        const formattedHelpRequests = helpRequests.map((request, index) => ({
            serialNo: index + 1,
            studentId: request.userId ? request.userId._id : 'Unknown',
            studentName: request.userId ? request.userId.name : 'Unknown',
            studentAge: request.userId ? request.userId.age : 'Unknown',
            issue: request.issue,
            duration: request.duration,
            description: request.description,
            prescription: request.prescription,
        }));

        res.render('helpRequestsList', { helpRequests: formattedHelpRequests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updatePrescription = async (req, res) => {
    const { helpRequestId, prescription } = req.body;

    console.log('helpRequestId:', helpRequestId); // Debug log to check the value

    if (!helpRequestId) {
        return res.status(400).send('Invalid help request ID');
    }

    try {
        await SupportRequest.findByIdAndUpdate(helpRequestId, { prescription });
        res.redirect('/helpRequestsList');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getPastCases = async (req, res) => {
    try {
        const counselorId = req.user._id;

        // Fetch details for a particular student where description exists or not
        const studentDetails = await SupportRequest.find({
            counselor: counselorId,
            // Add conditions as needed, like date range or specific conditions
            // Example: description: { $exists: true } for where description exists
        }).populate('userId');

        const formattedStudentDetails = studentDetails.map((request, index) => ({
            serialNo: index + 1,
            date: moment(request.createdAt).format('DD/MM/YY'),
            time: moment(request.createdAt).format('hh:mm A'),
            studentName: request.userId ? request.userId.name : 'Unknown',
            issue: request.issue,
            description: request.description,
        }));

        res.render('myCases', { studentDetails: formattedStudentDetails });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
