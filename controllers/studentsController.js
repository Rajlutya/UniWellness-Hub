const Register = require('../src/models/registers');
const SupportRequest = require('../src/models/supportRequest'); 
const Counselor = require('../src/models/counselors');
const moment = require('moment');

// Function to get all students
exports.getStudents = async (req, res) => {
    try {
        const students = await Register.find({}, 'name email');
        res.render('students', { students });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Function to render student profile page
exports.getStudentProfile = async (req, res) => {
    try {
        const studentId = req.params.id; // Assuming student ID is passed in the URL params

        // Fetch student details from the database
        const student = await Register.findById(studentId);
        if (!student) {
            return res.status(404).send('Student not found');
        }

        // Fetch past support requests for the student and populate counselor field
        const supportRequests = await SupportRequest.find({ userId: studentId })
            .populate('counselor') // Populate the counselor field with details from Counselor model
            .sort({ createdAt: -1 });

        // Format createdAt dates and times
        const formattedSupportRequests = supportRequests.map(request => ({
            ...request.toObject(),
            formattedDate: moment(request.createdAt).format('DD/MM/YY'),
            formattedTime: moment(request.createdAt).format('hh:mm A'),
            counselorName: request.counselor ? request.counselor.name : 'Not Assigned' // Access counselor name or show 'Not Assigned'
        }));

        // Render the studentsprofile.hbs template with student and supportRequests data
        res.render('studentsprofile', {
            student,
            pastHistory: formattedSupportRequests // Use pastHistory instead of supportRequests
        });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).send('Server Error');
    }
};

