const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Intialize Google Generative AI
const apikey = process.env.API_KEY
if(!apikey){
    console.error("API key is missing. Please check your .env file. ");
}
const genAI = new GoogleGenerativeAI(apikey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
let answer = "";
// POST endpoint to handle chat
app.post("/chat", async (req, res) => {
  // TODO: Implement the chat functionality
  try {
    const question = req.body; // get the question from request body
    console.log(req.body);
      if(!question) {
          return res.status(400).json({ error: "Question is required" });
      }

      const result = await model.generateContent(question);
      answer=result.response.text();
      res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({error: "Something went wrong" });
  }
});

// GET endpoint to handle chat

// Streaming is typically used to handle real-time responses, such as sending parts of the generated
// text incrementally rather thatn waiting for the entire message to be complete


app.get("/stream", async (req, res) => {
  // TODO: Stream the response back to the client
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Simulate real-time data stream (you can replace this with the actual AI response logic)
  const exampleData = [
    "This is part 1 of the response...",
    "Here is part 2 of the response...",
    "Finally, part 3!"
  ];

  // Function to send data in chunks
  const sendChunk = (chunk) => {
    res.write(`data: ${chunk}\n\n`);
  };

  // Simulate sending the data incrementally
  let i = 0;
  const interval = setInterval(() => {
    if (i >= exampleData.length) {
      clearInterval(interval);
      res.write("data: [STREAM END]\n\n");  // Notify the end of the stream
      res.end();
    } else {
      sendChunk(exampleData[i]);
      i++;
    }
  }, 1000);  // Send each chunk every second

  // In case the client closes the connection before completion
  req.on("close", () => {
    console.log("Client closed the connection.");
    clearInterval(interval);
    res.end();
  });
});



// const apikey = process.env.API_KEY
// console.log(apikey);
// const genAI = new GoogleGenerativeAI(apikey);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const prompt = "Write a story about a magic backpack.";
// async function get(){
// const result = await model.generateContent(prompt);
// console.log(result);
// console.log(result.response.text());
// console.log(result.response.functionCalls());

//get();