import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ComposedChart, 
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { Analytics as AnalyticsIcon } from '@mui/icons-material';

const FinancialInsightsCharts = () => {
  // State for chart data and loading
  const [chartData, setChartData] = useState({
    distributionData: [],
    stockTypeData: [],
    marketCapData: []
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Visual Analysis Data
  const fetchVisualAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Adjust the API endpoint as needed
      const response = await axios.post('/api/financial-analysis/visual-insights');
      
      // Transform response data into chart-friendly format
      const transformedData = {
        distributionData: response.data.distributionData || [],
        stockTypeData: response.data.stockTypeData || [],
        marketCapData: response.data.marketCapData || []
      };

      setChartData(transformedData);
      setOpen(true);
    } catch (err) {
      console.error('Failed to fetch visual analysis', err);
      setError('Failed to retrieve visual analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sample mock data for development (replace with actual backend data)
  const mockChartData = {
    distributionData: [
      { metric: 'Market Cap', mean: 100, median: 90, stdDev: 30 },
      { metric: 'P/E Ratio', mean: 25, median: 20, stdDev: 15 },
      { metric: 'Dividend Yield', mean: 2.5, median: 2.2, stdDev: 1.5 }
    ],
    stockTypeData: [
      { name: 'Stable', value: 150 },
      { name: 'Growth', value: 100 },
      { name: 'Speculative', value: 50 }
    ],
    marketCapData: [
      { tier: 'Small Cap', count: 50 },
      { tier: 'Mid Cap', count: 100 },
      { tier: 'Large Cap', count: 200 },
      { tier: 'Mega Cap', count: 64 }
    ]
  };

  // Color palette for consistent visualization
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', 
    '#FF8042', '#8884D8', '#413EA0'
  ];

  // Comprehensive Chart Components
  const DistributionChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData.distributionData.length ? chartData.distributionData : mockChartData.distributionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="metric" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="mean" fill="#8884d8" name="Mean" />
        <Line type="monotone" dataKey="median" stroke="#82ca9d" name="Median" />
        <Line type="monotone" dataKey="stdDev" stroke="#ffc658" name="Std Deviation" />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const StockTypeDistributionChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData.stockTypeData.length ? chartData.stockTypeData : mockChartData.stockTypeData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {(chartData.stockTypeData.length ? chartData.stockTypeData : mockChartData.stockTypeData).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const MarketCapTiersChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData.marketCapData.length ? chartData.marketCapData : mockChartData.marketCapData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tier" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#413ea0" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Box>
      {/* Visual Analysis Request Button */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AnalyticsIcon />}
          onClick={fetchVisualAnalysis}
          disabled={loading}
        >
          {loading ? 'Generating Insights...' : 'Generate Visual Analysis'}
        </Button>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Handling */}
      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}

      {/* Visualization Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Financial Market Insights Visualization</DialogTitle>
        <DialogContent>
          <Box className="financial-insights-charts">
            <Box className="chart-grid">
              <Box className="chart-container">
                <Typography variant="h6">Metric Distribution Analysis</Typography>
                <DistributionChart />
              </Box>
              
              <Box className="chart-container">
                <Typography variant="h6">Stock Type Distribution</Typography>
                <StockTypeDistributionChart />
              </Box>
              
              <Box className="chart-container">
                <Typography variant="h6">Market Capitalization Tiers</Typography>
                <MarketCapTiersChart />
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FinancialInsightsCharts;