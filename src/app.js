/* const express = require('express');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const moment = require('moment'); 
const app = express();
const port = 3000;

require("./db/conn");
const Register = require("./models/registers");
const Blog = require("./models/blogs");
const SupportRequest = require('./models/supportRequest');

// Paths for static files and templates
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));


hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partial_path);

app.use(express.static(static_path));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Routes
app.get("/", (req, res) => {
    res.render('index');
});

app.get("/index", (req, res) => {
    res.render('index');
});

app.get("/signIn", (req, res) => {
    res.render('signIn');
});

app.get("/registerationpage", (req, res) => {
    res.render('registerationpage');
});

app.get("/aboutus", (req, res) => {
    res.render('aboutus');
});

app.get("/needhelp", (req, res) => {
    res.render('needhelp'); // Render the form view
});

app.post('/needhelp', async (req, res) => {
    try {
        const userId = req.session.userId; // Fetch userId from session

        const newSupportRequest = new SupportRequest({
            issue: req.body.issue,
            duration: req.body.duration,
            description: req.body.description,
            history: req.body.history,
            userId: userId, // Assign userId from session
            createdAt: new Date(), // Set createdAt timestamp
            updatedAt: new Date()
        });

        await newSupportRequest.save();
        res.status(200).json({ success: true, message: 'Support request submitted successfully' });
    } catch (error) {
        console.error('Error in POST /needhelp:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



app.post("/registers", async (req, res) => {
    try {
        const registerUser = new Register({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password
        });
        console.log(registerUser);
        const registered = await registerUser.save();
        // console.log(registered); 
        return res.status(201).json({
            success:true,
            message:"User is registered successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success:false,
            message:"User is already registered",
        });
    }
});


app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Register.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (user.password===password) {
            req.session.userId = user._id;
            return res.status(200).json({
                success: true,
                message: "Sign in successful",
            }); 
        }
        else{
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
});


app.get("/forgotpassword", (req, res) => {
    res.render('forgotpassword');
});

// Handle forgot password form submission
app.post('/forgotpassword', async (req, res) => {
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

        console.log('Before saving user:', user);

        await user.save();
        
        console.log('After saving user:', user);

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

        console.log('Mail options:', mailOptions);

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Password reset instructions sent to your email.' });
    } catch (error) {
        console.error('Error in /forgotpassword POST:', error);
        res.status(500).json({ success: false, message: 'Error sending password reset email.' });
    }
});

app.get('/reset/:token', async (req, res) => {
    try {
        const { token } = req.params;

        console.log('Token from URL:', token);

        const user = await Register.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log('User found for token:', user);

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        res.render('resetpassword', { token });
    } catch (error) {
        console.error('Error in /reset/:token GET:', error);
        res.status(500).send('Server error');
    }
});

app.post('/reset/:token', async (req, res) => {
    try {
        const { password } = req.body;

        const user = await Register.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log('User found for token:', user);

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
});



app.get("/createblog", (req, res) => {
    res.render('createBlog');
});

app.post("/createblog", async (req, res) => {
    try {
        const { title, content } = req.body;
        const newBlog = new Blog({ title, content });
        await newBlog.save();
        res.status(201).json({ success: true, message: "Blog created successfully" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: "Error creating blog" });
    }
});


app.get("/viewblogs", (req, res) => {
    res.render('viewBlogs');
});

app.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching blogs" });
    }
});

app.get('/profile', async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login'); // Redirect to login if not authenticated
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
});

// Render edit profile form
app.get('/edit', async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login'); // Redirect to login if not authenticated
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
});

// Handle edit profile form submission
app.post('/edit', async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login'); // Redirect to login if not authenticated
        }

        // Log received data
        console.log('Received form data:', req.body);

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
});
app.get('/pasthistory', async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login'); // Redirect to login if not authenticated
        }

        // Fetch all support requests for the logged-in user
        const supportRequests = await SupportRequest.find({ userId }).sort({ createdAt: -1 });

        // Format createdAt dates and times
        const formattedSupportRequests = supportRequests.map(request => ({
            ...request.toObject(),
            formattedDate: moment(request.createdAt).format('DD/MM/YY'),
            formattedTime: moment(request.createdAt).format('hh:mm A')
        }));

        // Render pasthistory.hbs with formattedSupportRequests data
        res.render('pasthistory', { supportRequests: formattedSupportRequests });
    } catch (error) {
        console.error('Error fetching support requests:', error);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Listening to the port at ${port}`);
}); */



const express = require('express');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;


require("./db/conn");
const routes = require("../routes/index");
const registerController = require("../controllers/registerController");
const registerCounselorController = require("../controllers/registerCounselorController");

// Paths for static files and templates
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partial_path);

app.use(express.static(static_path));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use routes
app.use('/', routes);
app.post('/signIn', registerController.signInUser);
app.post('/signInCounselor', registerCounselorController.signInCounselor);

app.listen(port, () => {
    console.log(`Listening to the port at ${port}`);
});
