const Counselor = require('../src/models/counselors');
const SupportRequest = require('../src/models/supportRequest');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const moment = require('moment'); 

exports.registerCounselor = async (req, res) => {
    try {
        const newCounselor = new Counselor({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            type: req.body.type,
            degree: req.body.degree,
            experience: req.body.experience,
            otherDetails: req.body.otherDetails
        });
        const registeredCounselor = await newCounselor.save();
        return res.status(201).json({
            success: true,
            message: "Your application has been submitted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: "Counselor is already registered or there was an error during registration",
        });
    }
};

exports.signInCounselor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const counselor = await Counselor.findOne({ email: email });

        if (!counselor) {
            return res.status(400).json({ 
                success: false, 
                message: "Counselor not found" 
            });
        }

        if (!counselor.profileVerified) {
            return res.status(400).json({
                success: false,
                message: "Profile not approved"
            });
        }

        if (counselor.password === password) {
            req.session.userId = counselor._id;
            return res.status(200).json({
                success: true,
                message: "Sign in successful",
                redirectUrl: '/counselorcreateblog'
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "There was a problem with the sign-in process. Please try again.",
        });
    }
};

// Function to fetch counselors with unverified profiles
exports.getCounselorsRequests = async (req, res) => {
    try {
        const counselors = await Counselor.find({ profileVerified: false });
        const formattedCounselors = counselors.map((counselor, index) => ({
            ...counselor.toObject(),
            serialNo: index + 1,
            dateFormatted: moment(counselor.createdAt).format('DD-MM-YYYY'),
            timeFormatted: moment(counselor.createdAt).format('hh:mm A')
        }));
        res.render('counselorRequests', { counselors: formattedCounselors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Function to update profile verification status
exports.postCounselorsVerification = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    try {
        if (action === 'accept') {
            await Counselor.findByIdAndUpdate(id, { profileVerified: true });
        } else if (action === 'reject') {
            await Counselor.findByIdAndDelete(id);
        }
        res.redirect('/counselorsrequests');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


exports.counselorforgotPasswordForm = (req, res) => {
    res.render('counselorforgotpassword');
};

exports.counselorforgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid email address' });
        }

        const user = await Counselor.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'uniwellnesshub@gmail.com',
                pass: 'govw wpct qchk xeii' // Ensure this is correct and secure
            }
        });

        const mailOptions = {
            from: 'uniwellnesshub@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: `Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/counselorreset/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Password reset instructions sent to your email.' });
    } catch (error) {
        console.error('Error in /forgotpassword POST:', error);
        res.status(500).json({ success: false, message: 'Error sending password reset email.' });
    }
};

exports.counselorresetPasswordForm = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await Counselor.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        console.log(user);
        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        res.render('counselorresetpassword', { token });
    } catch (error) {
        console.error('Error in /couselorreset/:token GET:', error);
        res.status(500).send('Server error');
    }
};

exports.counselorresetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await Counselor.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        user.password = password; // Ensure you hash the password before saving
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).send('Password has been reset successfully.');
    } catch (error) {
        console.error('Error in /counselorreset/:token POST:', error);
        res.status(500).send('Server error');
    }
};



exports.signOutCounselor = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "There was a problem with the sign-out process. Please try again.",
            });
        }
        res.redirect('/signInCounselor');
    });
};


exports.getCounselorProfile = async (req, res) => {
    try {
        const counselorId = req.params.id;

        // Fetch counselor details from the database
        const counselor = await Counselor.findById(counselorId);
        if (!counselor) {
            return res.status(404).send('Counselor not found');
        }

        // Fetch past cases assigned to this counselor, sorted by createdAt descending
        const pastCases = await SupportRequest.find({
            counselor: counselorId
        }).populate('userId').sort({ createdAt: -1 });

        // Format pastCases data for rendering
        const formattedPastCases = pastCases.map((request, index) => ({
            serialNumber: index + 1,
            date: moment(request.createdAt).format('DD/MM/YY'),
            time: moment(request.createdAt).format('hh:mm A'),
            studentId: request.userId ? request.userId._id : 'Unknown',
            studentName: request.userId ? request.userId.name : 'Unknown',
            issue: request.issue,
            description: request.description,
            prescription: request.prescription
        }));

        // Render counselorProfile.hbs with counselor and pastCases data
        res.render('counselorsProfile', {
            counselor,
            pastCases: formattedPastCases
        });

    } catch (error) {
        console.error('Error fetching counselor profile:', error);
        res.status(500).send('Server Error');
    }
};


exports.getCounselors = async (req, res) => {
    try {
        const counselors = await Counselor.find({ profileVerified: true }).sort({ type: 1 });
        const formattedCounselors = counselors.map((counselor, index) => ({
            ...counselor.toObject(),
            serialNo: index + 1
        }));
        res.render('counselors', { counselors: formattedCounselors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


exports.getCounselorRequests = async (req, res) => {
    try {
        const counselors = await Counselor.find({ profileVerified: false });
        const formattedCounselors = counselors.map((counselor, index) => ({
            ...counselor.toObject(),
            serialNo: index + 1,
            dateFormatted: moment(counselor.createdAt).format('DD-MM-YYYY'),
            timeFormatted: moment(counselor.createdAt).format('hh:mm A')
        }));
        res.render('counselorRequests', { counselors: formattedCounselors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateProfileVerification = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    try {
        if (action === 'accept') {
            await Counselor.findByIdAndUpdate(id, { profileVerified: true });
        } else if (action === 'reject') {
            await Counselor.findByIdAndDelete(id);
        }
        res.redirect('/counselorsrequests');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
