import React, { useState, useRef, useEffect} from 'react';
import './App.css';
import Prism from 'prismjs';
import ChatMessage from './chatMessage';
import 'prismjs'; // Import Prism functionality
import 'prismjs/themes/prism.css'; // Import Prism's CSS styles for styling
import 'prismjs/components/prism-javascript.min.js'; // Import specific language component (e.g., JavaScript)

function App() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Function to submit question to the server
  const askQuestion = async () => {
    if (!question.trim()) return; // Prevent sending empty questions

    setLoading(true); // Set loading state

    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question }), // Send the question to the server
      });

      // Check if the response is okay
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json(); // Parse the JSON response from the server
      console.log('Server response:', data.reply); // Log the server response for debugging

      // Update the conversation with the user's question and server's reply
      setConversation((prev) => [
        ...prev,
        { role: 'user', content: question }, // Add the user's question
        { role: 'gpt', content: data.reply }, // Add the server's response
      ]);

      // Clear the input field after sending the question
      setQuestion('');
    } catch (error) {
      console.error('Error:', error); // Log any errors
    } finally {
      setLoading(false); // Reset loading state
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scroll to the end of the chat
    }
  };

  useEffect(() => {
    // Highlight the code snippets in the conversation after the component updates
    Prism.highlightAll();
  }, [conversation]);

  return (
    <div className="container">
      <h1>Chat with me</h1>

      {/* Chat container */}
      <div className="chat-container">
      {conversation.map((msg, index) => (
      <div key={index} className={`message ${msg.role}`}>
      <strong>{msg.role === 'user' ? 'You' : 'GPT-4'}:</strong>
      <ChatMessage msg={msg} />
            </div>
       ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input section */}
      <textarea
        className="textarea"
        rows="4"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <br />
      <button className="button" onClick={askQuestion} disabled={loading}>
        {loading ? 'Loading...' : 'Ask'}
      </button>
    </div>
  );
}

export default App;
