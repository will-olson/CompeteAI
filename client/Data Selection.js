import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Grid, 
  Button 
} from '@mui/material';

const MetricSelector = ({ onMetricsSelected }) => {
  const [availableMetrics, setAvailableMetrics] = useState([
    'Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 
    'Current Price', 'Beta', 'Volume', 'Momentum Score'
  ]);
  
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const proceedToChat = () => {
    onMetricsSelected(selectedMetrics);
  };

  return (
    <Box>
      <Typography variant="h4">
        Select Financial Metrics for Analysis
      </Typography>
      <Grid container spacing={2}>
        {availableMetrics.map(metric => (
          <Grid item xs={12} sm={6} md={4} key={metric}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMetrics.includes(metric)}
                  onChange={() => handleMetricToggle(metric)}
                />
              }
              label={metric}
            />
          </Grid>
        ))}
      </Grid>
      <Button 
        variant="contained" 
        color="primary"
        onClick={proceedToChat}
        disabled={selectedMetrics.length === 0}
      >
        Continue to Chat
      </Button>
    </Box>
  );
};