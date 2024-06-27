const Register = require('../src/models/registers');
const SupportRequest = require('../src/models/supportRequest'); 
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

// Function to get profile for a specific student
/* exports.getStudentProfile = async (req, res) => {
    try {
        const student = await Register.findById(req.params.id);
        if (!student) {
            return res.status(404).send('Student not found');
        }

        // Fetching past history for the student
        const supportRequests = await SupportRequest.find({ student: req.params.id }).sort({ createdAt: -1 });

        const formattedSupportRequests = supportRequests.map(request => ({
            ...request.toObject(),
            formattedDate: moment(request.createdAt).format('DD/MM/YY'),
            formattedTime: moment(request.createdAt).format('hh:mm A')
        }));

        res.render('studentsprofile', { student, supportRequests: formattedSupportRequests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
 */

// Function to render student profile page
exports.getStudentProfile = async (req, res) => {
    try {
        const studentId = req.params.id; // Assuming student ID is passed in the URL params

        // Fetch student details from the database
        const student = await Register.findById(studentId);
        if (!student) {
            return res.status(404).send('Student not found');
        }

        // Fetch past support requests for the student
        const supportRequests = await SupportRequest.find({ userId: studentId }).sort({ createdAt: -1 });

        // Format createdAt dates and times
        const formattedSupportRequests = supportRequests.map(request => ({
            ...request.toObject(),
            formattedDate: moment(request.createdAt).format('DD/MM/YY'),
            formattedTime: moment(request.createdAt).format('hh:mm A')
        }));

        // Render the studentsprofile.hbs template with student and supportRequests data
        res.render('studentsprofile', {
            student,
            supportRequests: formattedSupportRequests
        });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).send('Server Error');
    }
};



/* exports.viewPastHistory = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/signin'); // Redirect to login if not authenticated
        }

        // Fetch all support requests for the logged-in user
        const supportRequests = await SupportRequest.find({ userId }).sort({ createdAt: -1 });

        // Format createdAt dates and times
        const formattedSupportRequests = supportRequests.map(request => ({
            ...request.toObject(),
            formattedDate: moment(request.createdAt).format('DD/MM/YY'),
            formattedTime: moment(request.createdAt).format('hh:mm A')
        }));

        // Render pasthistory.hbs with formattedSupportRequests data
        res.render('pasthistory', { supportRequests: formattedSupportRequests });
    } catch (error) {
        console.error('Error fetching support requests:', error);
        res.status(500).send('Server error');
    }
};
 */