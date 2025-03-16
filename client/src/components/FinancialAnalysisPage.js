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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const FinancialAnalysisPage = () => {
  // State Management
  const [analysisResults, setAnalysisResults] = useState(null);
  const [visualizations, setVisualizations] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  
  // New state for data source selection
  const [availableDataSources, setAvailableDataSources] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState(null);

  // Analysis Types
  const analysisTypes = [
    { label: 'Comprehensive', value: 'comprehensive' },
    { label: 'Descriptive', value: 'descriptive' },
    { label: 'Advanced', value: 'advanced' }
  ];

  // Fetch Available Data Sources on Component Mount
  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        // Endpoint to list available financial datasets
        const response = await axios.get('/api/financial-datasets');
        setAvailableDataSources(response.data);
        
        // Optionally set a default data source
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
  const performAnalysis = useCallback(async (analysisType = 'comprehensive') => {
    if (!selectedDataSource) {
      alert('Please select a data source');
      return;
    }

    setLoading(true);
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

  // Render Insights Section (previous implementation)
  const renderInsightsSection = () => { /* ... */ };

  // Render Visualizations (previous implementation)
  const renderVisualizations = () => { /* ... */ };

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

      {/* Rest of the component remains the same */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {analysisResults && renderInsightsSection()}
      {visualizations && renderVisualizations()}

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