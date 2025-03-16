from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import pandas as pd
import numpy as np
import json
import logging
from dotenv import load_dotenv
from statistical_analysis import AdvancedStatisticalAnalyzer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class FinancialAnalysisService:
    def __init__(self, data_source=None):
        """
        Initialize the financial analysis service
        
        :param data_source: Optional pandas DataFrame or path to CSV
        """
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Load data
        if data_source is None:
            # Default to a sample dataset or raise an error
            raise ValueError("No data source provided")
        
        # Handle different input types
        if isinstance(data_source, str):
            # Assume it's a file path
            self.df = pd.read_csv(data_source)
        elif isinstance(data_source, pd.DataFrame):
            self.df = data_source
        else:
            raise TypeError("Data source must be a file path or pandas DataFrame")
        
        # Initialize analyzer
        self.analyzer = AdvancedStatisticalAnalyzer(
            self.df, 
            openai_api_key=self.openai_api_key
        )

    def generate_analysis(self, analysis_type='comprehensive'):
        """
        Generate financial analysis based on type
        
        :param analysis_type: Type of analysis to perform
        :return: Analysis results
        """
        try:
            if analysis_type == 'comprehensive':
                # Generate comprehensive report
                report = self.analyzer.generate_comprehensive_report()
                
                # Generate visualizations
                self.analyzer.generate_basic_visualizations()
                
                # Generate advanced AI insights
                ai_insights = self.analyzer.generate_advanced_analysis()
                
                return {
                    'report': report,
                    'ai_insights': ai_insights,
                    'visualizations': self._get_visualization_paths()
                }
            
            elif analysis_type == 'descriptive':
                # Generate descriptive statistics
                return {
                    'descriptive_stats': self.analyzer.descriptive_statistics().to_dict(orient='records')
                }
            
            elif analysis_type == 'advanced':
                # Generate advanced analysis
                return {
                    'advanced_insights': self.analyzer.generate_advanced_analysis()
                }
            
            else:
                raise ValueError(f"Unsupported analysis type: {analysis_type}")
        
        except Exception as e:
            logger.error(f"Analysis generation error: {e}")
            return {'error': str(e)}

    def _get_visualization_paths(self):
        """
        Retrieve paths to generated visualizations
        
        :return: Dictionary of visualization file paths
        """
        base_path = 'financial_analysis_output/charts'
        return {
            'distribution_plot': os.path.join(base_path, 'distribution_plots.png'),
            'boxplot': os.path.join(base_path, 'boxplot_metrics.png'),
            'correlation_heatmap': os.path.join(base_path, 'correlation_heatmap.png'),
            'market_cap_eps_bubble': os.path.join(base_path, 'market_cap_eps_bubble.png')
        }

# Flask Routes
@app.route('/api/financial-analysis', methods=['POST'])
def perform_financial_analysis():
    """
    Endpoint for performing financial analysis
    """
    try:
        # Get request data
        data = request.json or {}
        analysis_type = data.get('type', 'comprehensive')
        
        # Validate data source
        data_source = data.get('data_source')
        if not data_source:
            return jsonify({
                'error': 'No data source provided',
                'message': 'Please upload a valid CSV file or provide a data source'
            }), 400
        
        # Create analysis service
        analysis_service = FinancialAnalysisService(data_source)
        
        # Perform analysis
        results = analysis_service.generate_analysis(analysis_type)
        
        return jsonify(results)
    
    except Exception as e:
        logger.error(f"Financial analysis error: {e}")
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e)
        }), 500

@app.route('/api/visualizations/<filename>', methods=['GET'])
def get_visualization(filename):
    """
    Serve visualization files
    """
    try:
        file_path = os.path.join('financial_analysis_output/charts', filename)
        
        if not os.path.exists(file_path):
            return jsonify({
                'error': 'Visualization not found',
                'message': f'Could not find visualization: {filename}'
            }), 404
        
        return send_file(file_path, mimetype='image/png')
    
    except Exception as e:
        logger.error(f"Visualization retrieval error: {e}")
        return jsonify({
            'error': 'Could not retrieve visualization',
            'message': str(e)
        }), 500

@app.route('/api/download/<report_type>', methods=['GET'])
def download_report(report_type):
    """
    Download various report types
    """
    try:
        # Map report types to file paths
        report_paths = {
            'excel': 'financial_analysis_output/comprehensive_financial_analysis.xlsx',
            'insights': 'advanced_financial_insights.txt',
            'summary': 'financial_analysis_output/summary_report.json'
        }
        
        file_path = report_paths.get(report_type)
        
        if not file_path or not os.path.exists(file_path):
            return jsonify({
                'error': 'Report not found',
                'message': f'Could not find report: {report_type}'
            }), 404
        
        return send_file(file_path, as_attachment=True)
    
    except Exception as e:
        logger.error(f"Report download error: {e}")
        return jsonify({
            'error': 'Could not download report',
            'message': str(e)
        }), 500

# Error Handling
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not found',
        'message': 'The requested resource could not be found'
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

# Main Execution
if __name__ == '__main__':
    # Ensure output directories exist
    os.makedirs('financial_analysis_output/charts', exist_ok=True)
    
    # Run the Flask app
    app.run(debug=True, port=5000)