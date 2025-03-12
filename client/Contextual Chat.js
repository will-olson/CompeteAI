import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper 
} from '@mui/material';
import axios from 'axios';

const FinancialChatInterface = ({ selectedMetrics }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant', 
      content: `Hello! I'm your AI Financial Analyst. You've selected to explore insights using ${selectedMetrics.join(', ')}. How can I help you understand these metrics?`
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message
    const newMessages = [
      ...messages, 
      { role: 'user', content: userInput }
    ];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      // Prepare context-rich prompt
      const contextualPrompt = `
        Financial Metrics Context:
        Selected Metrics: ${selectedMetrics.join(', ')}
        
        User Query: ${userInput}

        Provide a detailed, data-driven response that:
        1. Directly addresses the user's question
        2. Leverages the selected financial metrics
        3. Offers clear, actionable insights
        4. Explains financial concepts in an accessible manner
      `;

      const response = await axios.post('/api/financial-chat', {
        messages: newMessages,
        context: {
          selectedMetrics,
          prompt: contextualPrompt
        }
      });

      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: response.data.message }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "I'm sorry, but I encountered an error processing your request." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={3} style={{ 
        height: '500px', 
        overflowY: 'auto', 
        padding: '16px' 
      }}>
        {messages.map((msg, index) => (
          <Box 
            key={index} 
            textAlign={msg.role === 'user' ? 'right' : 'left'}
            my={2}
          >
            <Typography 
              variant="body1"
              style={{ 
                backgroundColor: msg.role === 'user' ? '#e6f2ff' : '#f0f0f0',
                display: 'inline-block',
                padding: '10px',
                borderRadius: '10px'
              }}
            >
              {msg.content}
            </Typography>
          </Box>
        ))}
        {isLoading && (
          <Typography variant="body2" color="textSecondary">
            Analyzing...
          </Typography>
        )}
      </Paper>
      <Box mt={2} display="flex">
        <TextField
          fullWidth
          variant="outlined"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about your financial metrics..."
          disabled={isLoading}
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={sendMessage}
          disabled={isLoading || !userInput.trim()}
          style={{ marginLeft: '10px' }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};