const express = require('express');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
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



app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/', routes);


app.listen(port, () => {
    console.log(`Listening to the port at ${port}`);
});
