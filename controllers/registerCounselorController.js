const Counselor = require('../src/models/counselors');
const moment = require('moment'); 

exports.registerCounselor = async (req, res) => {
    try {
        const newCounselor = new Counselor({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            degree: req.body.degree,
            experience: req.body.experience,
            otherDetails: req.body.otherDetails
        });
        const registeredCounselor = await newCounselor.save();
        return res.status(201).json({
            success: true,
            message: "Your application has been submitted succesfully",
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
