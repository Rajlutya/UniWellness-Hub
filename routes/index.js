const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');
const supportController = require('../controllers/supportController');
const blogController = require('../controllers/blogController');
const profileController = require('../controllers/profileController');
const studentsController = require('../controllers/studentsController');
const counselorController = require('../controllers/registercounselorController'); 
const helpRequestsController = require('../controllers/helpRequestsController');
const auth = require('../middleware/auth'); 


//General Routes
router.get("/", (req, res) => res.render('index'));
router.get("/index", (req, res) => res.render('index'));
router.get("/aboutus", (req, res) => res.render('aboutus'));

//Student Registeration
router.get("/registerationpage", (req, res) => res.render('registerationpage'));
router.post("/registers", registerController.registerUser);
router.post('/verify-otp', registerController.verifyOTP);

//Student SignIn and SignOut
router.get("/signIn", (req, res) => res.render('signIn'));
router.post("/signIn", registerController.signInUser);
router.get('/signOut', registerController.signOutUser);

//Student Forgot and Reset Password
router.get("/forgotpassword", registerController.forgotPasswordForm);
router.post('/forgotpassword', registerController.forgotPassword);
router.get('/reset/:token', registerController.resetPasswordForm);
router.post('/reset/:token', registerController.resetPassword);

//Student Need Help
router.get("/needhelp",auth, supportController.showForm);
router.post("/needhelp",auth, supportController.submitForm);

//Student Blogs
router.get("/viewblogs",auth, blogController.viewBlogs);
router.get("/blogs",auth, blogController.getBlogs);

//Student's Own Profile
router.get('/profile',auth, profileController.viewProfile);
router.get('/edit',auth, profileController.editProfileForm);
router.post('/edit',auth, profileController.editProfile);
router.get('/pasthistory',auth, profileController.viewPastHistory);

//Students About Us
router.get("/studentsaboutus",auth, (req, res) => res.render('studentsaboutus'));




//Admin Create Blog
router.get("/createblog",auth, auth.isAdmin, blogController.createBlogForm);
router.post("/createblog",auth, auth.isAdmin, blogController.createBlog);

//Admin Students List and Students Profile
router.get('/students',auth, auth.isAdmin, studentsController.getStudents);
router.get('/profile/:id',auth, auth.isAdmin, studentsController.getStudentProfile);

//Admin Search for a particular student
router.get('/students/search',auth, auth.isAdmin, studentsController.searchStudentsByName);

//Admin Counselors List and Counselors Request
router.get('/counselorsrequests',auth, auth.isAdmin, counselorController.getCounselorsRequests);
router.post('/counselorsrequests/:id/verify',auth, auth.isAdmin, counselorController.postCounselorsVerification);
router.get('/counselors',auth, auth.isAdmin, counselorController.getCounselors);
  
//Admin Students need help Requests/Counselor Assigning
router.get('/helpRequests',auth, auth.isAdmin, helpRequestsController.getHelpRequests);
router.post('/helpRequests/:id/assign',auth, auth.isAdmin, helpRequestsController.assignCounselor);

//Admin Particular CounselorProfile
router.get('/counselorsprofile/:id',auth, auth.isAdmin, counselorController.getCounselorProfile);





//Counselor registeration
router.get("/registerCounselor", (req, res) => res.render('counselorRegisteration'));
router.post('/registerCounselor', counselorController.registerCounselor);

//Counselor SignIn and SignOut
router.get("/signInCounselor", (req, res) => res.render('counselorSignIn'));
router.post('/signInCounselor', counselorController.signInCounselor);
router.get('/signOutCounselor', counselorController.signOutCounselor);

//Counselor Forgot and reset Password
router.get("/counselorforgotpassword", counselorController.counselorforgotPasswordForm);
router.post('/counselorforgotpassword', counselorController.counselorforgotPassword);
router.get('/counselorreset/:token', counselorController.counselorresetPasswordForm);
router.post('/counselorreset/:token', counselorController.counselorresetPassword);

//Counselor Create Blog
router.get("/counselorcreateblog",auth, auth.isCounselor, blogController.counselorCreateBlogForm);
router.post("/counselorcreateblog",auth, auth.isCounselor, blogController.createBlog);

//Counselor Help Request List and Giving Prescription
router.get('/helpRequestsList',auth, auth.isCounselor, helpRequestsController.getHelpRequestsList);
router.get('/helpRequestsList/prescription/:id',auth, auth.isCounselor, helpRequestsController.getPrescriptionPage);
router.post('/helpRequestsList/prescription/:id',auth, auth.isCounselor, helpRequestsController.savePrescription);

//Counselor Particular student Profile
router.get('/studentsprofile/:id',auth, auth.isCounselor, studentsController.getStudentProfileForCounselor);

//Couselor Past cases History/My Cases
router.get('/myCases',auth, auth.isCounselor, helpRequestsController.getPastCases);


module.exports = router;
