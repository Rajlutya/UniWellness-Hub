const Blog = require('../src/models/blogs');

exports.createBlogForm = (req, res) => {
    res.render('createBlog');
};

exports.createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newBlog = new Blog({ title, content });
        await newBlog.save();
        res.status(201).json({ success: true, message: "Blog created successfully" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: "Error creating blog" });
    }
};

exports.viewBlogs = (req, res) => {
    res.render('viewBlogs');
};

exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching blogs" });
    }
};


exports.counselorCreateBlogForm = (req, res) => {
    res.render('counselorCreateBlog');
};
