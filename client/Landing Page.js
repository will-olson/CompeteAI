import React, { useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

const LandingPage = () => {
  return (
    <Container maxWidth="md">
      <Box textAlign="center" my={10}>
        <Typography variant="h2">
          Financial Insights AI Assistant
        </Typography>
        <Typography variant="subtitle1" paragraph>
          Unlock powerful financial insights through conversational AI
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          href="/chat"
        >
          Start Exploring
        </Button>
      </Box>
    </Container>
  );
};