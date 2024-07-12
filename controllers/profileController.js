const Register = require('../src/models/registers');
const SupportRequest = require('../src/models/supportRequest');
const Counselor = require('../src/models/counselors');
const moment = require('moment');

exports.viewProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/signin'); // Redirect to login if not authenticated
        }

        // Fetch user profile data and render profile page
        const user = await Register.findById(userId);
        if (!user) {
            return res.status(404).render('error', { message: 'User not found' });
        }

        res.render('profile', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.editProfileForm = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/signin'); // Redirect to login if not authenticated
        }

        // Fetch user data for editing
        const user = await Register.findById(userId);
        if (!user) {
            return res.status(404).render('error', { message: 'User not found' });
        }

        res.render('edit', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.editProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/signin'); // Redirect to login if not authenticated
        }

        // Update user data based on form submission
        const updatedUser = await Register.findByIdAndUpdate(userId, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            age: req.body.age,
            gender: req.body.gender
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).render('error', { message: 'User not found' });
        }

        res.redirect('/profile'); // Redirect to profile page after successful update
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.viewPastHistory = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/signin'); // Redirect to login if not authenticated
        }

        // Fetch all support requests for the logged-in user and populate counselor field
        const supportRequests = await SupportRequest.find({ userId })
            .populate('counselor') // Populate the counselor field with details from Counselor model
            .sort({ createdAt: -1 });

        // Format createdAt dates and times
        const formattedSupportRequests = supportRequests.map((request,index) => ({
            ...request.toObject(),
            SerialNo: index+1,
            formattedDate: moment(request.createdAt).format('DD/MM/YY'),
            formattedTime: moment(request.createdAt).format('hh:mm A'),
            type: request.counselor ? request.counselor.type : '',
            counselorName: request.counselor ? request.counselor.name : 'Not Assigned' // Access counselor name or show 'Not Assigned'
        }));

        // Render pasthistory.hbs with formattedSupportRequests data
        res.render('pasthistory', { supportRequests: formattedSupportRequests });
    } catch (error) {
        console.error('Error fetching support requests:', error);
        res.status(500).send('Server error');
    }
};