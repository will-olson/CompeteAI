import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Tabs, 
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider
} from '@mui/material';
import { 
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

import FinancialInsightsCharts from './FinancialInsightsCharts';
import StatisticalAnalysisComponent from './StatisticalAnalysisComponent';

const FinancialAnalysisPage = () => {
  // State Management
  const [analysisResults, setAnalysisResults] = useState(null);
  const [visualizations, setVisualizations] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null);
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  
  // New state for data source selection
  const [availableDataSources, setAvailableDataSources] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState(null);

  // Fetch Available Data Sources on Component Mount
  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const response = await axios.get('/api/financial-datasets');
        setAvailableDataSources(response.data);
        
        if (response.data.length > 0) {
          setSelectedDataSource(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch data sources', error);
      }
    };

    fetchDataSources();
  }, []);

  // Perform Analysis
  const performAnalysis = useCallback(async (analysisType) => {
    if (!selectedDataSource) {
      alert('Please select a data source');
      return;
    }

    setLoading(true);
    setSelectedAnalysisType(analysisType);
    try {
      // Perform analysis using selected data source
      const response = await axios.post('/api/financial-analysis', 
        { 
          data_source: selectedDataSource,
          type: analysisType 
        }
      );

      // Set analysis results
      setAnalysisResults(response.data);

      // Fetch and process visualizations
      if (response.data.visualizations) {
        const visualizationPromises = Object.entries(response.data.visualizations).map(
          async ([key, path]) => {
            const imgResponse = await axios.get(`/api/visualizations/${path.split('/').pop()}`, {
              responseType: 'blob'
            });
            return [key, URL.createObjectURL(imgResponse.data)];
          }
        );

        const visualizationResults = await Promise.all(visualizationPromises);
        setVisualizations(Object.fromEntries(visualizationResults));
      }
    } catch (error) {
      console.error('Analysis failed', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDataSource]);

  // Download Report
  const downloadReport = useCallback(async (reportType) => {
    try {
      const response = await axios.get(`/api/download/${reportType}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${reportType}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Download failed', error);
      alert('Download failed. Please try again.');
    }
  }, []);

  // Visualization Preview Dialog
  const VisualizationPreview = ({ visualization, onClose }) => (
    <Dialog open={!!visualization} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Visualization Preview</DialogTitle>
      <DialogContent>
        <img 
          src={visualization} 
          alt="Visualization Preview" 
          style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
        />
      </DialogContent>
    </Dialog>
  );

  // Render Visualizations
  const renderVisualizations = () => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {Object.entries(visualizations).map(([key, src]) => (
        <Grid item xs={12} md={6} key={key}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Typography>
            <img 
              src={src} 
              alt={key} 
              style={{ 
                width: '100%', 
                maxHeight: '400px', 
                objectFit: 'contain' 
              }}
              onClick={() => setSelectedVisualization(src)}
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // Render Analysis Results
  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    // Determine the type of analysis and render accordingly
    if (selectedAnalysisType === 'comprehensive') {
      return (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Comprehensive Financial Analysis
            </Typography>
            <Typography 
              variant="body1" 
              component="div" 
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {/* Render comprehensive analysis as a text block */}
              {typeof analysisResults === 'string' ? (
                analysisResults
              ) : (
                JSON.stringify(analysisResults, null, 2)
              )}
          </Typography>
        </CardContent>
      </Card>
      );
    }

    if (selectedAnalysisType === 'advanced') {
      return (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Advanced AI-Driven Insights
            </Typography>
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              {analysisResults}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Financial Analysis Dashboard
      </Typography>

      {/* Data Source Selection */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControl variant="outlined" sx={{ minWidth: 250, mr: 2 }}>
          <InputLabel>Select Data Source</InputLabel>
          <Select
            value={selectedDataSource || ''}
            label="Select Data Source"
            onChange={(e) => setSelectedDataSource(e.target.value)}
          >
            {availableDataSources.map((source) => (
              <MenuItem key={source} value={source}>
                {source}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Analysis Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          '& > *': { 
            height: '40px'
          } 
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PsychologyIcon />}
            sx={{
              backgroundColor: '#6a1b9a',  // Custom purple
              '&:hover': {
                backgroundColor: '#4a148c'  // Darker shade on hover
              },
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',  // Optional: add some depth
              transition: 'all 0.3s ease'  // Smooth transition
            }}
            onClick={() => performAnalysis('advanced')}
            disabled={!selectedDataSource || loading}
          >
            Advanced AI Insights
          </Button>
          <FinancialInsightsCharts />
          <StatisticalAnalysisComponent ></StatisticalAnalysisComponent>
        </Box>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <>
          {renderAnalysisResults()}

          {/* Visualizations */}
          {Object.keys(visualizations).length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h5" gutterBottom>
                Financial Visualizations
              </Typography>
              {renderVisualizations()}
            </>
          )}

          {/* Download Options */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => downloadReport('excel')}
            >
              Download Excel Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => downloadReport('insights')}
            >
              Download AI Insights
            </Button>
          </Box>
        </>
      )}

      {/* Visualization Preview Dialog */}
      <VisualizationPreview 
        visualization={selectedVisualization}
        onClose={() => setSelectedVisualization(null)}
      />
    </Container>
  );
};

export default FinancialAnalysisPage;