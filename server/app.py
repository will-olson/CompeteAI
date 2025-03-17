from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import logging
import traceback
from dotenv import load_dotenv

# Import the AdvancedStatisticalAnalyzer directly
from statistical_analysis import AdvancedStatisticalAnalyzer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def load_financial_data(file_path):
    """
    Load and parse financial data from JSON file
    
    :param file_path: Path to the JSON file containing financial metrics
    :return: Parsed financial data as a DataFrame
    """
    try:
        # Load JSON data
        with open(file_path, 'r') as f:
            json_data = json.load(f)
        
        # Convert nested dictionary to DataFrame
        import pandas as pd
        import re
        
        # Predefined columns with mapping
        column_mapping = {
            'PE Ratio (TTM)': 'P/E Ratio',
            'EPS (TTM)': 'EPS',
            'Market Cap': 'Market Cap',
            'Previous Close': 'Current Price',
            'Beta': 'Beta',
            'Volume': 'Volume'
        }
        
        # Convert nested dictionary to list of dictionaries
        df_data = []
        for ticker, stock_data in json_data.items():
            stock_entry = {}
            
            # Helper function to clean numeric values
            def clean_numeric_value(value):
                if not value or value == '--' or value == 'N/A':
                    return None
                
                # Remove commas and handle percentage/multiplier suffixes
                value = str(value).replace(',', '').replace('%', '')
                
                # Handle market cap and other suffixes
                multipliers = {
                    'B': 1_000_000_000,    # Billions
                    'M': 1_000_000,        # Millions
                    'T': 1_000_000_000_000 # Trillions
                }
                
                # Check for multiplier suffix
                if value and value[-1] in multipliers:
                    try:
                        return float(value[:-1]) * multipliers[value[-1]]
                    except ValueError:
                        return None
                
                # Attempt direct conversion
                try:
                    return float(value)
                except ValueError:
                    return None
            
            # Predefined columns to extract
            expected_columns = [
                'Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 
                'Current Price', 'Beta', 'Volume', 'Momentum Score'
            ]
            
            # Map and clean columns
            for original_col, mapped_col in column_mapping.items():
                if original_col in stock_data:
                    stock_entry[mapped_col] = clean_numeric_value(stock_data[original_col])
            
            # Robust Dividend Yield Extraction
            if 'Forward Dividend & Yield' in stock_data:
                try:
                    dividend_yield = stock_data['Forward Dividend & Yield']
                    
                    # Multiple extraction strategies
                    extraction_strategies = [
                        # Strategy 1: Extract percentage in parentheses
                        lambda x: float(re.search(r'$$(\d+\.\d+)%$$', x).group(1)) if re.search(r'$$(\d+\.\d+)%$$', x) else None,
                        
                        # Strategy 2: Extract first number followed by %
                        lambda x: float(re.search(r'(\d+\.\d+)%', x).group(1)) if re.search(r'(\d+\.\d+)%', x) else None,
                        
                        # Strategy 3: Split and take second part
                        lambda x: float(x.split()[1].replace('(', '').replace(')', '').replace('%', '')) if len(x.split()) > 1 else None
                    ]
                    
                    # Try each strategy until successful
                    for strategy in extraction_strategies:
                        try:
                            dividend_yield_value = strategy(dividend_yield)
                            if dividend_yield_value is not None:
                                stock_entry['Dividend Yield'] = dividend_yield_value
                                break
                        except Exception:
                            continue
                    else:
                        # If no strategy works, set to None
                        stock_entry['Dividend Yield'] = None
                
                except Exception as e:
                    logger.warning(f"Could not process dividend yield: {e}")
                    stock_entry['Dividend Yield'] = None
            
            # Handle 52 Week Range for Momentum Score
            if '52 Week Range' in stock_data:
                try:
                    low, high = stock_data['52 Week Range'].split(' - ')
                    stock_entry['52 Week Low'] = clean_numeric_value(low)
                    stock_entry['52 Week High'] = clean_numeric_value(high)
                    
                    # Calculate Momentum Score if possible
                    if (stock_entry.get('Current Price') is not None and 
                        stock_entry.get('52 Week Low') is not None and 
                        stock_entry.get('52 Week High') is not None):
                        current_price = stock_entry['Current Price']
                        week_low = stock_entry['52 Week Low']
                        week_high = stock_entry['52 Week High']
                        
                        stock_entry['Momentum Score'] = (current_price - week_low) / (week_high - week_low) if week_high != week_low else 0
                except:
                    pass
            
            # Ensure all expected columns exist
            for col in expected_columns:
                if col not in stock_entry:
                    stock_entry[col] = None
            
            # Additional explicit handling for Volume and Beta
            if 'Avg. Volume' in stock_data:
                stock_entry['Volume'] = clean_numeric_value(stock_data['Avg. Volume'])
            
            df_data.append(stock_entry)
        
        # Create DataFrame
        df = pd.DataFrame(df_data)
        
        # Debugging print
        print("DataFrame Columns:", df.columns.tolist())
        print("\nColumn Value Counts:")
        for col in expected_columns:
            print(f"{col} - Non-Null Count: {df[col].count()}")
        
        return df
    
    except Exception as e:
        logger.error(f"Error loading financial data: {e}")
        logger.error(traceback.format_exc())
        raise

@app.route('/api/financial-analysis', methods=['POST'])
def perform_financial_analysis():
    """
    Perform financial analysis on a specific dataset
    """
    try:
        # Get request data
        data = request.json
        data_source = data.get('data_source')
        analysis_type = data.get('type', 'comprehensive')
        
        # Validate data source
        if not data_source:
            return jsonify({
                'error': 'No data source provided'
            }), 400
        
        # Potential search paths
        search_paths = [
            os.path.join(os.getcwd(), 'server', data_source),
            os.path.join(os.getcwd(), data_source),
            os.path.join(os.getcwd(), 'data', data_source),
            os.path.join(os.getcwd(), 'server', 'data', data_source)
        ]
        
        # Find the first existing file
        file_path = None
        for path in search_paths:
            logger.info(f"Checking path: {path}")
            if os.path.exists(path):
                file_path = path
                break
        
        # Raise error if no file found
        if not file_path:
            logger.error(f"Could not find file: {data_source}")
            return jsonify({
                'error': 'File not found',
                'message': f'Could not locate {data_source}',
                'searched_paths': search_paths
            }), 404
        
        # Log found file path
        logger.info(f"Found file at: {file_path}")
        
        # Load financial data
        df = load_financial_data(file_path)
        
        # Check OpenAI API key
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if not openai_api_key:
            logger.error("OpenAI API key is not set")
            return jsonify({
                'error': 'OpenAI API key is not configured',
                'message': 'Please set the OPENAI_API_KEY environment variable'
            }), 500
        
        # Initialize analyzer using the method from statistical_analysis.py
        analyzer = AdvancedStatisticalAnalyzer(df, openai_api_key=openai_api_key)
        
        # Perform analysis based on type
        try:
            if analysis_type == 'comprehensive':
                # Generate comprehensive report
                results = analyzer.generate_comprehensive_report()
                
                # Generate visualizations
                analyzer.generate_basic_visualizations()
                
                # Generate advanced AI insights
                ai_insights = analyzer.generate_advanced_analysis()
                
                return jsonify({
                    'report': results,
                    'ai_insights': ai_insights,
                    'visualizations': _get_visualization_paths()
                })
            
            elif analysis_type == 'descriptive':
                # Generate descriptive statistics
                results = analyzer.descriptive_statistics()
                return jsonify(results.to_dict(orient='records'))
            
            elif analysis_type == 'advanced':
                # Generate advanced analysis
                results = analyzer.generate_advanced_analysis()
                return jsonify(results)
            
            else:
                raise ValueError(f"Unsupported analysis type: {analysis_type}")
        
        except Exception as analysis_error:
            logger.error(f"Analysis generation error: {analysis_error}")
            logger.error(traceback.format_exc())
            return jsonify({
                'error': 'Failed to generate analysis',
                'message': str(analysis_error),
                'traceback': traceback.format_exc()
            }), 500
    
    except Exception as e:
        logger.error(f"Financial analysis route error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e),
            'traceback': traceback.format_exc()
        }), 500

def _get_visualization_paths():
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

@app.route('/api/financial-datasets', methods=['GET'])
def list_financial_datasets():
    """
    List available financial datasets
    """
    try:
        # Get current working directory
        current_dir = os.getcwd()
        logger.info(f"Current working directory: {current_dir}")

        # Potential directories to search
        search_paths = [
            current_dir,
            os.path.join(current_dir, 'server'),
            os.path.join(current_dir, 'data'),
            os.path.join(current_dir, 'server', 'data')
        ]

        # Collect all datasets
        datasets = []

        # Search through potential paths
        for search_path in search_paths:
            logger.info(f"Checking directory: {search_path}")
            
            try:
                # List files in the directory
                all_files = os.listdir(search_path)
                logger.info(f"Files in {search_path}: {all_files}")

                # Find JSON files starting with financial_metrics
                path_datasets = [
                    f for f in all_files 
                    if f.endswith('.json') and f.startswith('financial_metrics')
                ]

                # Add found datasets with full path
                datasets.extend([
                    os.path.join(search_path, dataset) for dataset in path_datasets
                ])
            
            except FileNotFoundError:
                logger.warning(f"Directory not found: {search_path}")
            except Exception as dir_error:
                logger.error(f"Error searching {search_path}: {dir_error}")

        # Log final datasets
        logger.info(f"Detected datasets: {datasets}")

        # Return just the filenames, not full paths
        dataset_names = [os.path.basename(dataset) for dataset in datasets]

        return jsonify(dataset_names)
    
    except Exception as e:
        logger.error(f"Error listing datasets: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Could not list datasets',
            'message': str(e)
        }), 500

# Main Execution
if __name__ == '__main__':
    # Ensure output directories exist
    os.makedirs('financial_analysis_output/charts', exist_ok=True)
    
    # Run the Flask app
    app.run(debug=True, port=5000)