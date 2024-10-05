import React from 'react';
import './chatMessage.css';

const formatResponse = (response) => {
  // Replace **xyz** with <strong>xyz</strong> for bolding
  let formattedResponse = response.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  
  // Replace * with <br/> for line breaks
  formattedResponse = formattedResponse.replace(/\*/g, '<br/>');

  return formattedResponse;
};

const ChatMessage = ({ msg }) => {
    return (
      <div className="chat-message">
        <pre className="response-content">
          <code
            className="language-cpp"
            dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }}
          />
        </pre>
      </div>
    );
  };
export default ChatMessage;
