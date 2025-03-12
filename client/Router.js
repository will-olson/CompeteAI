import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MetricSelector from './components/MetricSelector';
import FinancialChatInterface from './components/FinancialChatInterface';

const App = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/select-metrics" 
          element={
            <MetricSelector 
              onMetricsSelected={(metrics) => {
                setSelectedMetrics(metrics);
                // Navigate to chat
                window.location.href = '/chat';
              }} 
            />
          } 
        />
        <Route 
          path="/chat" 
          element={
            <FinancialChatInterface 
              selectedMetrics={selectedMetrics} 
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};