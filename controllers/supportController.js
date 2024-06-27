const SupportRequest = require('../src/models/supportRequest');

exports.showForm = (req, res) => {
    res.render('needhelp'); // Renders the form for creating a support request
};
exports.submitForm = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { issue, duration, description, history} = req.body;

        // Validate input fields
        if (!issue || !duration || !description || !userId) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Create a new SupportRequest document
        const supportRequest = new SupportRequest({
            issue: issue,
            duration: duration,
            description: description,
            history: history,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Save the SupportRequest document
        await supportRequest.save();

        return res.status(201).json({
            success: true,
            message: 'Support request submitted successfully',
            data: supportRequest,
        });
    } catch (error) {
        console.error('Error submitting support request:', error);
        return res.status(500).json({ success: false, message: 'Error submitting support request' });
    }
};
