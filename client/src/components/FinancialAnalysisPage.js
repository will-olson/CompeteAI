import React, { useState, useCallback, useMemo } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  Upload as UploadIcon, 
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const FinancialAnalysisPage = () => {
  // State Management
  const [file, setFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [visualizations, setVisualizations] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState(null);

  // Analysis Types
  const analysisTypes = [
    { label: 'Comprehensive', value: 'comprehensive' },
    { label: 'Descriptive', value: 'descriptive' },
    { label: 'Advanced', value: 'advanced' }
  ];

  // File Upload Handler
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  // Perform Analysis
  const performAnalysis = useCallback(async (analysisType = 'comprehensive') => {
    if (!file) {
      alert('Please upload a file first');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Perform analysis
      const response = await axios.post('/api/financial-analysis', 
        { 
          data_source: file.name,
          type: analysisType 
        },
        {
          headers: { 'Content-Type': 'multipart/form-data' }
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
      alert('Analysis failed. Please check your file and try again.');
    } finally {
      setLoading(false);
    }
  }, [file]);

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

  // Render Insights Section
  const renderInsightsSection = () => {
    if (!analysisResults) return null;

    // Structured insights rendering
    return (
      <Accordion 
        expanded={expandedPanel}
        onChange={() => setExpandedPanel(!expandedPanel)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="insights-content"
          id="insights-header"
        >
          <Typography variant="h6">AI-Powered Financial Insights</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Market Overview */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Market Overview</Typography>
                  <Typography variant="body2">
                    {analysisResults.ai_insights?.key_sections?.market_overview?.join(' ') || 'No overview available'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Key Trends */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Key Trends</Typography>
                  <Typography variant="body2">
                    {analysisResults.ai_insights?.key_sections?.key_trends?.join(' ') || 'No trends identified'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Investment Strategies */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Investment Strategies</Typography>
                  <Typography variant="body2">
                    {analysisResults.ai_insights?.key_sections?.investment_strategies?.join(' ') || 'No strategies available'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Render Visualizations
  const renderVisualizations = () => {
    if (!visualizations) return null;

    return (
      <Grid container spacing={2}>
        {Object.entries(visualizations).map(([key, src]) => (
          <Grid item xs={12} md={6} key={key}>
            <Card>
              <CardContent>
                <Typography variant="h6">{key.replace(/_/g, ' ').toUpperCase()}</Typography>
                <img 
                  src={src} 
                  alt={key} 
                  style={{ 
                    width: '100%', 
                    height: '300px', 
                    objectFit: 'contain',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedVisualization(src)}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Financial Analysis Dashboard
      </Typography>

      {/* File Upload and Analysis Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
        >
          Upload Financial Data
          <input
            type="file"
            hidden
            accept=".csv,.xlsx,.json"
            onChange={handleFileUpload}
          />
        </Button>
        
        {file && (
          <Typography variant="body2" sx={{ ml: 2 }}>
            {file.name}
          </Typography>
        )}

        {/* Analysis Type Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ ml: 2 }}
        >
          {analysisTypes.map((type, index) => (
            <Tab 
              key={type.value} 
              label={type.label}
              onClick={() => performAnalysis(type.value)}
            />
          ))}
        </Tabs>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Insights Section */}
      {analysisResults && renderInsightsSection()}

      {/* Visualizations */}
      {visualizations && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5" gutterBottom>
            Financial Visualizations
          </Typography>
          {renderVisualizations()}
        </Box>
      )}

      {/* Download Options */}
      {analysisResults && (
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