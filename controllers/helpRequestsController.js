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
            studentId: request.userId ? request.userId._id : 'Unknown',
            studentName: request.userId ? request.userId.name : 'Unknown',
            studentEmail: request.userId ? request.userId.email : 'Unknown',
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
            _id: request._id,
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

exports.getPrescriptionPage = async (req, res) => {
    const { id } = req.params;

    try {
        const request = await SupportRequest.findById(id).populate('userId');

        if (!request) {
            return res.status(404).send('Support request not found');
        }

        const formattedRequest = {
            _id: request._id,
            studentName: request.userId ? request.userId.name : 'Unknown',
            issue: request.issue,
            duration: request.duration,
            description: request.description,
            prescription: request.prescription,
        };

        res.render('editPrescription', { request: formattedRequest });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.savePrescription = async (req, res) => {
    const { id } = req.params;
    const { prescription } = req.body;

    try {
        await SupportRequest.findByIdAndUpdate(id, { prescription });
        res.redirect('/helpRequestsList');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getPastCases = async (req, res) => {
    try {
        const counselorId = req.user._id;
        const studentDetails = await SupportRequest.find({
            counselor: counselorId,
        }).populate('userId');

        studentDetails.sort((a, b) => b.createdAt - a.createdAt);

        const formattedStudentDetails = studentDetails.map((request, index) => ({
            serialNo: index + 1,
            date: moment(request.createdAt).format('DD/MM/YY'),
            time: moment(request.createdAt).format('hh:mm A'),
            studentId: request.userId._id,
            studentName: request.userId.name,
            issue: request.issue,
            description: request.description,
            prescription: request.prescription,
        }));

        res.render('myCases', { studentDetails: formattedStudentDetails });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
