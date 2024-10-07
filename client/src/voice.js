// Voice.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';

function Voice() {
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition with vendor prefix support
  const initializeRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Your browser does not support Speech Recognition. Please use the latest version of Chrome or Edge.'
      );
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Set language as needed

    return recognition;
  };

  const handleVoiceRecognition = () => {
    if (isListening) {
      // If already listening, stop recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const recognition = initializeRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('Voice recognition started. Speak now.');
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const userSpeech = event.results[0][0].transcript;
      console.log('User said:', userSpeech);
      setTranscript(`You said: ${userSpeech}`);
      const aiReply = await getAIResponse(userSpeech);
      setAiResponse(aiReply);
      speakAIResponse(aiReply);
    };

    recognition.onerror = (event) => {
      console.error('Error occurred in recognition:', event.error);
      alert(`Recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended.');
      setIsListening(false);
    };

    recognition.start();
  };

  const getAIResponse = async (userSpeech) => {
    // Debugging: Log the userSpeech before sending
    console.log('Sending to AI:', userSpeech);

    try {
      const response = await axios.post('http://localhost:5000/voicechat', {
        message: userSpeech, // Ensure 'message' matches server expectation
      });
      console.log('AI Response:', response.data.reply); // Debugging
      return response.data.reply;
    } catch (error) {
      console.error('Error communicating with AI service:', error);
      return 'Sorry, I could not get a response from the AI.';
    }
  };

  const speakAIResponse = (response) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.onend = () => {
        console.log('Speech has finished.');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support Speech Synthesis.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <button
        onClick={handleVoiceRecognition}
        style={{
          height: '3vw',
          fontsize:'1.5vw',
          cursor: isListening ? 'not-allowed' : 'pointer',
          backgroundColor: isListening ? '#ccc' : '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
        }}
        disabled={isListening}
      >
        {isListening ? 'Listening...' : 'Speak'}
      </button>
      <div id="transcript" style={{ marginTop: '20px', width: '80%', textAlign: 'center' }}>
        <h3>Transcript:</h3>
        <p>{transcript}</p>
      </div>
      {aiResponse && (
        <div id="ai-response" style={{ marginTop: '20px', width: '80%', textAlign: 'center' }}>
          <h3>AI Response:</h3>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
}

export default Voice;

