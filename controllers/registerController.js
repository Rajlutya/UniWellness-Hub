const Register = require('../src/models/registers');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


const { addTempRegistration, getTempRegistration, deleteTempRegistration } = require('../temporarayStorage');
// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'uniwellnesshub@gmail.com',
        pass: 'govw wpct qchk xeii'
    }
});

// Function to generate OTP
const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};
exports.registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const otp = generateOTP();
        const tempId = crypto.randomBytes(16).toString('hex');

        // Store the user data temporarily
        addTempRegistration(tempId, {
            name,
            email,
            phone,
            password,
            otp
        });

        // Send OTP to user's email
        const mailOptions = {
            from: 'uniwellnesshub@gmail.com',
            to: email,
            subject: 'Verify your email',
            text: `Your OTP is: ${otp}`
        };
        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for the OTP.',
            tempId: tempId
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(400).json({
            success: false,
            message: 'User registration failed.',
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { tempId, otp } = req.body;
        const tempUser = getTempRegistration(tempId);

        if (tempUser && tempUser.otp === otp) {
            const { name, email, phone, password } = tempUser;
            const newUser = new Register({ name, email, phone, password });
            await newUser.save();

            // Clear the OTP and temporary data
            deleteTempRegistration(tempId);

            return res.status(200).json({
                success: true,
                message: 'OTP verified and user registered successfully.',
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP.',
            });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(400).json({
            success: false,
            message: 'OTP verification failed.',
        });
    }
};
















exports.signInUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Register.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (user.password === password) {
            req.session.userId = user._id;
            if (user.role === 'admin') {
                return res.status(200).json({
                    success: true,
                    message: "Sign in successful",
                    redirectUrl: '/admin'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "Sign in successful",
                    redirectUrl: '/needhelp'
                });
            } 
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


exports.forgotPasswordForm = (req, res) => {
    res.render('forgotpassword');
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid email address' });
        }

        const user = await Register.findOne({ email });
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
            http://${req.headers.host}/reset/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Password reset instructions sent to your email.' });
    } catch (error) {
        console.error('Error in /forgotpassword POST:', error);
        res.status(500).json({ success: false, message: 'Error sending password reset email.' });
    }
};

exports.resetPasswordForm = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await Register.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        console.log(user);
        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        res.render('resetpassword', { token });
    } catch (error) {
        console.error('Error in /reset/:token GET:', error);
        res.status(500).send('Server error');
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await Register.findOne({
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
        console.error('Error in /reset/:token POST:', error);
        res.status(500).send('Server error');
    }
};
