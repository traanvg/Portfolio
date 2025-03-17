require("dotenv").config();  // Load environment variables from .env
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(express.json());  // Parse incoming JSON requests
app.use(cors());  // Allow cross-origin requests
app.use(express.static("public")); // Serve static files (e.g., projects.json)

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.MONGO_URI) {
    console.error("Missing required credentials in .env file");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("MongoDB connection established"));

// Define Message Schema
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// Email Transporter Setup (Gmail)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Gmail address
        pass: process.env.EMAIL_PASS   // Gmail app password
    }
});

// Contact Form API Endpoint (POST)
app.post("/send-email", async (req, res) => {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const mailOptions = {
        from: `Your Website <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,  // Your email address
        subject: `New Contact Form Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);

        // Save the message to MongoDB
        const newMessage = new Message({ name, email, message });
        await newMessage.save();

        res.status(200).json({ success: true, message: "Email sent and saved successfully!" });
    } catch (error) {
        console.error("Error sending email or saving message:", error);
        res.status(500).json({ success: false, message: "Failed to send email or save message." });
    }
});

// Retrieve Contact Messages (GET)
app.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find();  // Retrieve all messages from MongoDB
        res.status(200).json(messages);  // Send the messages as a JSON response
    } catch (error) {
        console.error("Error retrieving messages:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve messages." });
    }
});

// Serve projects.json file (GET)
app.get("/projects.json", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "projects.json"));
});

// Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
