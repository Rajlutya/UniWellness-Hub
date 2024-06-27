// controllers/adminController.js
const Register = require('../src/models/registers');

exports.viewAdminPage = async (req, res) => {
    try {
        // You might want to add some admin-specific logic here
        const users = await Register.find(); // Example: fetching all registered users
        res.render('admin', { users });
    } catch (error) {
        console.error('Error in /admin GET:', error);
        res.status(500).send('Server error');
    }
};

