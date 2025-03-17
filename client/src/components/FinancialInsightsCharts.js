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
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
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
      const response = await axios.post('/api/financial-analysis/visual-insights');
      
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

  // Sample mock data for development
  const mockChartData = {
    distributionData: [
      { metric: 'Market Cap', mean: 100000000, median: 90000000, stdDev: 30000000 },
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
  const DistributionTable = () => {
    const data = chartData.distributionData.length 
      ? chartData.distributionData 
      : mockChartData.distributionData;

    // Helper function to format values
    const formatValue = (metric, value) => {
      switch(metric) {
        case 'Market Cap':
          return `$${value.toLocaleString()}`;
        case 'Dividend Yield':
          return `${value.toFixed(2)}%`;
        case 'P/E Ratio':
          return value.toFixed(2);
        default:
          return value;
      }
    };

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              <TableCell align="right">Mean</TableCell>
              <TableCell align="right">Median</TableCell>
              <TableCell align="right">Std Deviation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.metric}>
                <TableCell component="th" scope="row">
                  {row.metric}
                </TableCell>
                <TableCell align="right">
                  {formatValue(row.metric, row.mean)}
                </TableCell>
                <TableCell align="right">
                  {formatValue(row.metric, row.median)}
                </TableCell>
                <TableCell align="right">
                  {formatValue(row.metric, row.stdDev)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

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

  const MarketCapTiersChart = () => {
    // Prepare data with correct labels
    const marketCapData = (chartData.marketCapData.length 
      ? chartData.marketCapData 
      : mockChartData.marketCapData).map(item => ({
        ...item,
        name: item.tier // Use 'tier' as 'name' for pie chart labeling
      }));
  
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={marketCapData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {marketCapData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, name]}
            labelFormatter={(label) => label}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

    // Advanced Visualization Components
    const CorrelationHeatmap = () => {
      const correlationData = chartData.correlationData || [];
      
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="category" dataKey="metric1" />
            <YAxis type="category" dataKey="metric2" />
            <ZAxis type="number" dataKey="correlation" range={[0, 500]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter 
              data={correlationData} 
              fill="#8884d8"
              shape="circle"
            >
              {correlationData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.correlation > 0 
                      ? `rgba(135, 206, 235, ${Math.abs(entry.correlation)})` 
                      : `rgba(255, 99, 71, ${Math.abs(entry.correlation)})`
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    };
  
    const AdvancedDistributionAnalysis = () => {
      const distributionData = chartData.distributionData.length 
        ? chartData.distributionData 
        : mockChartData.distributionData;
  
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Mean</TableCell>
                <TableCell align="right">Median</TableCell>
                <TableCell align="right">Std Dev</TableCell>
                <TableCell align="right">Skewness</TableCell>
                <TableCell align="right">Kurtosis</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {distributionData.map((row) => (
                <TableRow key={row.metric}>
                  <TableCell component="th" scope="row">
                    {row.metric}
                  </TableCell>
                  <TableCell align="right">
                    {row.mean?.toLocaleString() || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {row.median?.toLocaleString() || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {row.stdDev?.toLocaleString() || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {row.skewness?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {row.kurtosis?.toFixed(2) || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    };
  
    const RiskProfileScatterPlot = () => {
      // Combine market cap and volatility data
      const riskData = chartData.marketCapData.map((item, index) => ({
        ...item,
        volatility: chartData.volatilityData?.[index]?.volatility || 0
      }));
  
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey="count" 
              name="Number of Stocks" 
            />
            <YAxis 
              type="number" 
              dataKey="volatility" 
              name="Volatility" 
            />
            <ZAxis type="number" range={[20, 500]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter 
              data={riskData} 
              fill="#8884d8"
              shape="circle"
            >
              {riskData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.volatility > 1 
                      ? 'rgba(255, 99, 71, 0.7)' 
                      : 'rgba(135, 206, 235, 0.7)'
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    };

  
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
          {loading ? 'Generating Insights...' : 'Database summary'}
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
                <DistributionTable />
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