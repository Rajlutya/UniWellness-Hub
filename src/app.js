/*const express=require('express');
const path=require('path');
const hbs=require('hbs');
const app=express();
const port=3000;

require("./db/conn");
const Register = require("./models/registers");
const{json}=require("express");

const static_path=path.join(__dirname,"../public")
const template_path=path.join(__dirname,"../templates/views")
const partial_path=path.join(__dirname,"../templates/partials")

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set('view engine','hbs');
app.set('views',template_path);
hbs.registerPartials(partial_path);

app.use(express.static(static_path));

app.get("/",(req,res)=>{
    res.render('index');
})

app.get("/index",(req,res)=>{
    res.render('index');
})

app.get("/signIn",(req,res)=>{
    res.render('signIn');
})

app.get("/registerationpage",(req,res)=>{
    res.render('registerationpage');
})

app.post("/registerationpage",async(req,res)=>{
    try{
        const registerUser = new Register({
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            password:req.body.password
        })
        const registered = await registerUser.save();
        res.status(201).render("index");

    }catch(error){
        res.status(400).send(error);
    }
})

app.get("/forgotpassword",(req,res)=>{
    res.render('forgotpassword');
})

app.listen(port,()=>{
    console.log(`Listening to the port at ${port}`);
})
*/

const express = require('express');
const path = require('path');
const hbs = require('hbs');
const app = express();
const port = 3000;

require("./db/conn");
const Register = require("./models/registers");

// Paths for static files and templates
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partial_path);

app.use(express.static(static_path));

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
    res.render('needhelp');
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

app.listen(port, () => {
    console.log(`Listening to the port at ${port}`);
});
