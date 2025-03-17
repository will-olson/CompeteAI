import React from 'react';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import FinancialAnalysisPage from './components/FinancialAnalysisPage';

function App() {
  return (
    <Navbar>
      <FinancialAnalysisPage />
    </Navbar>
  );
}

export default App;