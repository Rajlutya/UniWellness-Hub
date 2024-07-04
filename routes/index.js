const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');
const supportController = require('../controllers/supportController');
const blogController = require('../controllers/blogController');
const profileController = require('../controllers/profileController');
const adminController = require('../controllers/adminController');
const studentsController = require('../controllers/studentsController');
const counselorController = require('../controllers/registercounselorController'); 
const auth = require('../middleware/auth'); 
const helpRequestsController = require('../controllers/helpRequestsController');


const Register = require('../src/models/registers'); 


router.get("/", (req, res) => res.render('index'));
router.get("/index", (req, res) => res.render('index'));
router.get("/signIn", (req, res) => res.render('signIn'));
router.get("/registerationpage", (req, res) => res.render('registerationpage'));
router.get("/aboutus", (req, res) => res.render('aboutus'));
router.get("/needhelp", supportController.showForm);
router.post("/needhelp", supportController.submitForm);
router.post("/registers", registerController.registerUser);
router.post("/signin", registerController.signInUser);
router.get("/forgotpassword", registerController.forgotPasswordForm);
router.post('/forgotpassword', registerController.forgotPassword);
router.get('/reset/:token', registerController.resetPasswordForm);
router.post('/reset/:token', registerController.resetPassword);
router.get("/createblog", blogController.createBlogForm);
router.post("/createblog", blogController.createBlog);
router.get("/viewblogs", blogController.viewBlogs);
router.get("/blogs", blogController.getBlogs);
router.get('/profile', profileController.viewProfile);
router.get('/edit', profileController.editProfileForm);
router.post('/edit', profileController.editProfile);
router.get('/pasthistory', profileController.viewPastHistory);

router.get('/admin', auth, blogController.createBlogForm);
router.get('/students', auth, studentsController.getStudents);
router.get('/profile/:id', auth , studentsController.getStudentProfile);


router.get("/signInCounselor", (req, res) => res.render('counselorSignIn'));
router.get("/registerCounselor", (req, res) => res.render('counselorRegisteration'));
router.post('/registerCounselor', counselorController.registerCounselor);
router.post('/signInCounselor', counselorController.signInCounselor);
//router.get('/counselorsrequests', counselorController.getCounselorsRequests);
//router.post('/counselorsrequests/:id/verify', counselorController.postCounselorsVerification);
const Counselor = require('../src/models/counselors');
const moment = require('moment');
router.get('/counselorsrequests', async (req, res) => {
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
});

// Route to update profile verification status
router.post('/counselorsrequests/:id/verify', async (req, res) => {
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
});

router.get('/counselors', async (req, res) => {
    try {
        const counselors = await Counselor.find({ profileVerified: true }); // Adjust the query as per your requirement
        res.render('counselors', { counselors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




router.get('/helpRequests', helpRequestsController.getHelpRequests);
router.post('/helpRequests/:id/assign', helpRequestsController.assignCounselor);

router.post('/verify-otp', registerController.verifyOTP);


router.get("/counselorcreateblog", blogController.counselorCreateBlogForm);
router.post("/counselorcreateblog", blogController.createBlog);



router.get('/helpRequestsList',auth, helpRequestsController.getHelpRequestsList);
router.post('/updatePrescription', helpRequestsController.updatePrescription);
router.get('/myCases', auth, helpRequestsController.getPastCases);



router.get("/counselorforgotpassword", counselorController.counselorforgotPasswordForm);
router.post('/counselorforgotpassword', counselorController.counselorforgotPassword);
router.get('/counselorreset/:token', counselorController.counselorresetPasswordForm);
router.post('/counselorreset/:token', counselorController.counselorresetPassword);

module.exports = router;
