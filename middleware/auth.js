const Register = require('../src/models/registers'); // Import the Register model
const Counselor = require('../src/models/counselors'); // Import the Counselor model

module.exports = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await Register.findById(req.session.userId);
            const counselor = await Counselor.findById(req.session.userId);

            if (user) {
                req.user = user;
                next();
            } else if (counselor) {
                req.user = counselor;
                next();
            } else {
                return res.status(403).send('You do not have permission to view this page.');
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
    } else {
        res.redirect('/login');
    }
};
