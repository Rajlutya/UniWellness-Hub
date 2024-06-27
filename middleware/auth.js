const Register = require('../src/models/registers'); // Import the Register model

module.exports = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await Register.findById(req.session.userId);
            if (!user || user.role !== 'admin') {
                return res.status(403).send('You do not have permission to view this page.');
            }
            next();
        } catch (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
    } else {
        res.redirect('/login');
    }
};
