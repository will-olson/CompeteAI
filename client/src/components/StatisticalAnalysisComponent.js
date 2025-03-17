import React, { useState } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
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
  Paper,
  Grid
} from '@mui/material';
import { 
  Science as ScienceIcon 
} from '@mui/icons-material';

const StatisticalAnalysisComponent = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatisticalAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/statistical-analysis/advanced-metrics');
      
      setAnalysisData(response.data);
      setOpen(true);
    } catch (err) {
      console.error('Failed to fetch statistical analysis', err);
      setError('Failed to retrieve statistical analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const HypothesisTestingTable = () => {
    if (!analysisData?.hypothesisTests) return null;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metric Pair</TableCell>
              <TableCell align="right">T-Statistic</TableCell>
              <TableCell align="right">P-Value</TableCell>
              <TableCell align="right">Significance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analysisData.hypothesisTests.map((test, index) => (
              <TableRow key={index}>
                <TableCell>{test.metricPair}</TableCell>
                <TableCell align="right">{test.tStatistic.toFixed(4)}</TableCell>
                <TableCell align="right">{test.pValue.toFixed(4)}</TableCell>
                <TableCell align="right">
                  {test.pValue < 0.05 ? 'Significant' : 'Not Significant'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const RegressionAnalysisScatterPlot = () => {
    if (!analysisData?.regressionAnalysis) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis 
            type="number" 
            dataKey="independentVar" 
            name={analysisData.regressionAnalysis.independentVariable}
          />
          <YAxis 
            type="number" 
            dataKey="dependentVar" 
            name={analysisData.regressionAnalysis.dependentVariable}
          />
          <Scatter 
            data={analysisData.regressionAnalysis.data} 
            fill="#8884d8"
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const TimeSeriesAnalysisChart = () => {
    if (!analysisData?.timeSeriesAnalysis) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={analysisData.timeSeriesAnalysis.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
            name={analysisData.timeSeriesAnalysis.metric}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const StatisticalSummaryTable = () => {
    if (!analysisData?.statisticalSummary) return null;

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
            {analysisData.statisticalSummary.map((metric, index) => (
              <TableRow key={index}>
                <TableCell>{metric.name}</TableCell>
                <TableCell align="right">{metric.mean.toFixed(2)}</TableCell>
                <TableCell align="right">{metric.median.toFixed(2)}</TableCell>
                <TableCell align="right">{metric.stdDev.toFixed(2)}</TableCell>
                <TableCell align="right">{metric.skewness.toFixed(2)}</TableCell>
                <TableCell align="right">{metric.kurtosis.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<ScienceIcon />}
        onClick={fetchStatisticalAnalysis}
        disabled={loading}
      >
        {loading ? 'Generating Statistical Analysis...' : 'Advanced Statistical Analysis'}
      </Button>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>Advanced Statistical Analysis</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Statistical Summary</Typography>
              <StatisticalSummaryTable />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Hypothesis Testing</Typography>
              <HypothesisTestingTable />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Regression Analysis</Typography>
              <RegressionAnalysisScatterPlot />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Time Series Analysis</Typography>
              <TimeSeriesAnalysisChart />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StatisticalAnalysisComponent;