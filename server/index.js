const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require('axios'); 
const { GoogleAuth } = require('google-auth-library');
require("dotenv").config();  
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public folder

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// POST endpoint to handle chat
app.post("/chat", async (req, res) => {
  try {
    const question = req.body.question; // Get the question from request body
    console.log(req.body);
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Call generateContent with the prompt directly as a string
    const result = await model.generateContent(question);
    
    // Access the text from the response
    const answer = result.response.text(); 
    res.json({ reply: answer });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


// POST endpoint to handle voice chat
app.post("/voicechat", async (req, res) => {
  // Extract 'message' from the request body
 const userMessage = req.body.message;

  // Validate that userMessage exists and is a string
  if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'Invalid message format.' });
  }

  try {
      const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText', {
          message: userMessage
      }, {
          headers: {
              'Authorization': `Bearer ${process.env.API_KEY}`,
              'Content-Type': 'application/json'
          }
      });
      console.log(response);
      // Adjust based on the actual structure of the Gemini API response
      const aiReply = response.data.text; 

      // Validate aiReply
      if (!aiReply || typeof aiReply !== 'string') {
          throw new Error('Invalid response from AI service.');
      }

      res.json({ reply: aiReply });
  } catch (error) {
      console.error('Error communicating with Gemini API:', error.message);
      res.status(500).json({ error: 'Error communicating with AI service.' });
      if (error.response) {
        console.error('Error response from API:', error.response.data);
        res.status(error.response.status).json({ error: error.response.data });
    } else {
        console.error('Error communicating with Gemini API:', error.message);
        res.status(500).json({ error: 'Error communicating with AI service.' });
    }
  }
});

// If you want to check if the server is working, you can define a root endpoint
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Allow CORS for specific origin
app.use(cors({
  origin: 'http://localhost:3000', // React app's URL
}));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
