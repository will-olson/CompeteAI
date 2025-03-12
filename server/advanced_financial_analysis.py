# advanced_financial_analysis.py
import json
import os
import requests
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from dotenv import load_dotenv
import logging
import traceback

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('advanced_financial_insights.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AdvancedFinancialAnalyzer:
    def __init__(self, openai_api_key):
        self.openai_api_key = openai_api_key
        self.metrics_data = self.load_metrics()
        self.df = self.convert_to_dataframe()

    def load_metrics(self, json_path='financial_metrics.json'):
        """
        Load pre-scraped financial metrics with enhanced error handling
        """
        try:
            if not os.path.exists(json_path):
                raise FileNotFoundError(f"Metrics file not found: {json_path}")
            
            with open(json_path, 'r') as file:
                metrics = json.load(file)
                
                if not isinstance(metrics, dict) or len(metrics) == 0:
                    raise ValueError("Metrics file is empty or improperly formatted")
                
                logger.info(f"Loaded {len(metrics)} ticker metrics")
                return metrics
        
        except Exception as e:
            logger.error(f"Error loading metrics: {e}")
            return {}
    def convert_to_dataframe(self):
        try:
            # Prepare data for DataFrame
            data = []
            for ticker, metrics in self.metrics_data.items():
                # Clean and convert metrics with more flexible handling
                cleaned_metrics = {
                    'Ticker': ticker,
                    'Market Cap': self._clean_market_cap(metrics.get('Market Cap', 'N/A')),
                    'P/E Ratio': self._clean_float(metrics.get('PE Ratio (TTM)', 'N/A'), allow_negative=True),
                    'EPS': self._clean_float(metrics.get('EPS (TTM)', 'N/A'), allow_negative=True),
                    'Dividend Yield': self._clean_percentage(
                        metrics.get('Forward Dividend & Yield', 'N/A').split('(')[-1].rstrip(')') 
                        if '(' in metrics.get('Forward Dividend & Yield', 'N/A') 
                        else 'N/A'
                    ),
                    'Current Price': self._clean_float(metrics.get('Previous Close', 'N/A')),
                    'Beta': self._clean_float(metrics.get('Beta', 'N/A')),
                    'Volume': self._clean_float(metrics.get('Volume', 'N/A').replace(',', '')),
                    'Avg Volume': self._clean_float(metrics.get('Avg. Volume', 'N/A').replace(',', '')),
                    '52 Week Low': self._extract_52_week_range(metrics.get('52 Week Range', 'N/A'), 'low'),
                    '52 Week High': self._extract_52_week_range(metrics.get('52 Week Range', 'N/A'), 'high'),
                    'Target Price': self._clean_float(metrics.get('1y Target Est', 'N/A'))
                }
                data.append(cleaned_metrics)
            
            # Create DataFrame
            df = pd.DataFrame(data)
            
            # **Compute additional metrics with robust error handling**
            def safe_momentum_score(row):
                try:
                    current_price = row['Current Price']
                    week_low = row['52 Week Low']
                    week_high = row['52 Week High']
                    
                    # Check for valid numeric values and prevent division by zero
                    if (pd.notna(current_price) and 
                        pd.notna(week_low) and 
                        pd.notna(week_high) and 
                        week_high != week_low):
                        return (current_price - week_low) / (week_high - week_low)
                    return pd.NA
                except Exception:
                    return pd.NA

            def safe_price_to_target_ratio(row):
                try:
                    target_price = row['Target Price']
                    current_price = row['Current Price']
                    
                    # Check for valid numeric values and prevent division by zero
                    if (pd.notna(target_price) and 
                        pd.notna(current_price) and 
                        current_price != 0):
                        return target_price / current_price
                    return pd.NA
                except Exception:
                    return pd.NA

            def safe_volume_trend(row):
                try:
                    volume = row['Volume']
                    avg_volume = row['Avg Volume']
                    
                    # Check for valid numeric values and prevent division by zero
                    if (pd.notna(volume) and 
                        pd.notna(avg_volume) and 
                        avg_volume != 0):
                        return volume / avg_volume
                    return pd.NA
                except Exception:
                    return pd.NA

            # Apply safe calculations
            df['Momentum Score'] = df.apply(safe_momentum_score, axis=1)
            df['Price to Target Ratio'] = df.apply(safe_price_to_target_ratio, axis=1)
            df['Volume Trend'] = df.apply(safe_volume_trend, axis=1)

            # **Convert to numeric with comprehensive error handling**
            numeric_columns = [
                'Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 
                'Current Price', 'Momentum Score', 'Price to Target Ratio', 'Volume Trend'
            ]
            
            # Comprehensive numeric conversion
            for col in numeric_columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

            # More flexible row filtering
            # Keep rows that have at least one valid numeric value in critical columns
            critical_columns = ['Market Cap', 'P/E Ratio', 'EPS', 'Current Price']
            df = df[df[critical_columns].notna().any(axis=1)]
            
            # Optional: Log the number of rows after filtering
            logger.info(f"Converted DataFrame: {len(df)} rows retained")
            
            return df
        
        except Exception as e:
            logger.error(f"Comprehensive error in converting to DataFrame: {e}")
            logger.error(traceback.format_exc())  # Add full traceback for debugging
            return pd.DataFrame()
        
    def get_top_bottom_stocks(self):
        """
        Generate structured stock analysis tables for easier readability.
        """
        if self.df.empty:
            logger.warning("No valid stock data available for analysis.")
            return "No valid stock data available."

        tables = {
            "Top 5 P/E Ratio Stocks": self.df.nlargest(5, "P/E Ratio")[["Ticker", "P/E Ratio", "EPS", "Market Cap"]],
            "Bottom 5 P/E Ratio Stocks": self.df.nsmallest(5, "P/E Ratio")[["Ticker", "P/E Ratio", "EPS", "Market Cap"]],
            "Top 5 Momentum Stocks": self.df.nlargest(5, "Momentum Score")[["Ticker", "Momentum Score", "Current Price"]],
            "Bottom 5 Momentum Stocks": self.df.nsmallest(5, "Momentum Score")[["Ticker", "Momentum Score", "Current Price"]],
            "Most Volatile Stocks": self.df.nlargest(5, "Beta")[["Ticker", "Beta", "Market Cap"]],
            "Stable Stocks": self.df.nsmallest(5, "Beta")[["Ticker", "Beta", "Market Cap"]],
            "Stocks with Negative EPS": self.df[self.df["EPS"] < 0][["Ticker", "EPS", "Market Cap"]].head(5),
        }

        # Format outputs as markdown tables for better readability
        formatted_tables = {title: df.to_markdown() for title, df in tables.items()}

        return formatted_tables

        
    def _extract_52_week_range(self, range_str, mode='low'):
        """
        Extract 52-week low or high from range string
        """
        try:
            if '-' not in range_str:
                return pd.NA
            
            low, high = range_str.split('-')
            return float(low.strip()) if mode == 'low' else float(high.strip())
        except:
            return pd.NA

    def _clean_float(self, value, allow_negative=False):
        """
        Clean and convert to float with more flexible handling
        """
        try:
            # Handle special cases
            if value in ['N/A', '--', '']:
                return pd.NA
            
            # Remove any non-numeric characters except decimal point, minus sign
            cleaned = ''.join(char for char in str(value) if char in '0123456789.-')
            
            # Convert to float
            float_value = float(cleaned)
            
            # Check for negative values if not allowed
            if not allow_negative and float_value < 0:
                return pd.NA
            
            return float_value
        except (ValueError, TypeError):
            return pd.NA

    def _clean_market_cap(self, value):
        """
        Clean and convert market cap to numeric
        """
        if isinstance(value, str):
            # Remove $ and T/B/M indicators
            value = value.replace('$', '').replace(',', '')
            if 'T' in value:
                return float(value.replace('T', '')) * 1_000_000_000_000
            elif 'B' in value:
                return float(value.replace('B', '')) * 1_000_000_000
            elif 'M' in value:
                return float(value.replace('M', '')) * 1_000_000
        return pd.NA

    def _clean_percentage(self, value):
        """
        Clean and convert percentage to float
        """
        try:
            # Handle special cases
            if value in ['N/A', '--']:
                return pd.NA
            
            # Remove % sign and clean
            cleaned = value.replace('%', '').replace(',', '').strip()
            return float(cleaned) if cleaned else pd.NA
        except (ValueError, TypeError):
            return pd.NA

    def generate_raw_data_and_export(self):
        """
        Generate the raw data table with calculated metrics and export to an Excel file
        """
        try:
            # Add derived metrics to the dataframe
            self.df['Market Cap Tier'] = pd.qcut(self.df['Market Cap'], q=5, labels=['Very Small', 'Small', 'Medium', 'Large', 'Very Large'])
            self.df['Price Volatility'] = (self.df['52 Week High'] - self.df['52 Week Low']) / self.df['52 Week Low']
            self.df['EPS Yield'] = self.df['EPS'] / self.df['Current Price']
            self.df['Momentum Score'] = (self.df['Current Price'] - self.df['52 Week Low']) / (self.df['52 Week High'] - self.df['52 Week Low'])

            # Save the dataframe to Excel
            output_file = 'financial_analysis_data.xlsx'
            self.df.to_excel(output_file, index=False)

            logger.info(f"Raw data and metrics exported successfully to {output_file}")

        except Exception as e:
            logger.error(f"Error exporting raw data: {e}")

    def export_key_metric_tables(self):
        """
        Export detailed tables for top/bottom performers in key metrics to an Excel sheet
        with enhanced error handling and additional insights
        """
        try:
            # Ensure numeric conversion and handle potential NA values
            metrics_to_convert = ['P/E Ratio', 'Momentum Score', 'Beta', 'EPS', 'Market Cap', 'Current Price']
            for metric in metrics_to_convert:
                self.df[metric] = pd.to_numeric(self.df[metric], errors='coerce')

            # Function to get top/bottom performers with error handling
            def get_performers(df, metric, n=5, bottom=False):
                try:
                    # Filter out NA values before ranking
                    valid_data = df[df[metric].notna()]
                    
                    # Select top or bottom performers
                    if bottom:
                        performers = valid_data.nsmallest(n, metric)
                    else:
                        performers = valid_data.nlargest(n, metric)
                    
                    # Select and format columns
                    columns = ["Ticker", metric, "EPS", "Market Cap"]
                    return performers[columns]
                except Exception as e:
                    logger.warning(f"Error getting {metric} {'bottom' if bottom else 'top'} performers: {e}")
                    return pd.DataFrame()

            # Comprehensive top/bottom performers analysis
            top_performers = {
                "Top 5 P/E Ratio Stocks": get_performers(self.df, "P/E Ratio"),
                "Bottom 5 P/E Ratio Stocks": get_performers(self.df, "P/E Ratio", bottom=True),
                "Top 5 Momentum Stocks": get_performers(self.df, "Momentum Score"),
                "Bottom 5 Momentum Stocks": get_performers(self.df, "Momentum Score", bottom=True),
                "Most Volatile Stocks": get_performers(self.df, "Beta"),
                "Most Stable Stocks": get_performers(self.df, "Beta", bottom=True),
                "Highest EPS Stocks": get_performers(self.df, "EPS"),
                "Lowest EPS Stocks": get_performers(self.df, "EPS", bottom=True)
            }

            # Additional aggregate insights
            insights = {
                "Market Overview": pd.DataFrame({
                    "Metric": [
                        "Total Stocks", 
                        "Avg P/E Ratio", 
                        "Median Momentum Score", 
                        "Avg Market Cap", 
                        "Median Beta"
                    ],
                    "Value": [
                        len(self.df),
                        self.df['P/E Ratio'].mean(),
                        self.df['Momentum Score'].median(),
                        self.df['Market Cap'].mean(),
                        self.df['Beta'].median()
                    ]
                })
            }

            # Create an Excel writer with multiple sheets
            with pd.ExcelWriter('comprehensive_market_analysis.xlsx') as writer:
                # Write performer tables
                for sheet_name, table in top_performers.items():
                    if not table.empty:
                        table.to_excel(writer, sheet_name=sheet_name, index=False)
                
                # Write insights sheet
                for sheet_name, table in insights.items():
                    table.to_excel(writer, sheet_name=sheet_name, index=False)
                
                # Optional: Add a summary statistics sheet
                summary_stats = self.df[metrics_to_convert].describe()
                summary_stats.to_excel(writer, sheet_name='Summary Statistics')

            # Generate a detailed log of the export
            logger.info("Comprehensive market analysis exported successfully")
            logger.info(f"Total stocks analyzed: {len(self.df)}")
            logger.info(f"Metrics exported: {', '.join(metrics_to_convert)}")

            # Optional: Return some basic statistics for further use
            return {
                "total_stocks": len(self.df),
                "metrics_exported": metrics_to_convert
            }

        except Exception as e:
            logger.error(f"Critical error in exporting key metrics tables: {e}")
            logger.error(traceback.format_exc())  # Full traceback for debugging
            return {}

    def generate_visualizations(self):
        """
        Create insightful visualizations with robust error handling
        """
        # Ensure necessary imports
        import matplotlib.pyplot as plt
        import seaborn as sns
        import numpy as np
        import os

        # Set consistent plotting style
        plt.style.use('seaborn')
        plt.rcParams.update({
            'figure.figsize': (16, 10),
            'font.size': 10,
            'axes.labelsize': 10,
            'axes.titlesize': 12
        })

        # Visualization methods with error handling
        def safe_market_cap_comparison():
            try:
                # Ensure data is numeric and sorted
                plot_data = self.df.copy()
                plot_data['Market Cap'] = pd.to_numeric(plot_data['Market Cap'], errors='coerce')
                top_market_cap = plot_data.nlargest(10, 'Market Cap')

                plt.figure(figsize=(16, 8))
                sns.barplot(x='Ticker', y='Market Cap', data=top_market_cap)
                plt.title('Top 10 Stocks by Market Capitalization', fontsize=15)
                plt.xlabel('Ticker', fontsize=12)
                plt.ylabel('Market Cap', fontsize=12)
                plt.xticks(rotation=45, ha='right')
                plt.tight_layout()
                plt.savefig('financial_analysis_charts/market_cap_comparison.png')
                plt.close()
                return True
            except Exception as e:
                logger.error(f"Market Cap Comparison Chart Error: {e}")
                return False

        def safe_pe_ratio_eps_scatter():
            try:
                # Prepare data
                plot_data = self.df.copy()
                plot_data['P/E Ratio'] = pd.to_numeric(plot_data['P/E Ratio'], errors='coerce')
                plot_data['EPS'] = pd.to_numeric(plot_data['EPS'], errors='coerce')
                plot_data = plot_data.dropna(subset=['P/E Ratio', 'EPS'])

                plt.figure(figsize=(16, 10))
                # Limit to top 50 stocks to prevent overcrowding
                top_stocks = plot_data.nlargest(50, 'Market Cap')
                
                sns.scatterplot(
                    x='P/E Ratio', 
                    y='EPS', 
                    hue='Ticker', 
                    size='Market Cap',
                    data=top_stocks,
                    alpha=0.7
                )
                plt.title('P/E Ratio vs Earnings Per Share (Top 50 Stocks)', fontsize=15)
                plt.xlabel('P/E Ratio', fontsize=12)
                plt.ylabel('Earnings Per Share (EPS)', fontsize=12)
                plt.xscale('log')  # Log scale to handle wide range of values
                plt.tight_layout()
                plt.savefig('financial_analysis_charts/pe_ratio_vs_eps.png')
                plt.close()
                return True
            except Exception as e:
                logger.error(f"P/E Ratio vs EPS Scatter Plot Error: {e}")
                return False

        def safe_dividend_yield_distribution():
            try:
                # Prepare dividend yield data
                dividend_data = pd.to_numeric(self.df['Dividend Yield'], errors='coerce')
                dividend_data = dividend_data.dropna()

                plt.figure(figsize=(16, 8))
                sns.histplot(dividend_data, kde=True)
                plt.title('Dividend Yield Distribution', fontsize=15)
                plt.xlabel('Dividend Yield (%)', fontsize=12)
                plt.ylabel('Frequency', fontsize=12)
                plt.tight_layout()
                plt.savefig('financial_analysis_charts/dividend_yield_distribution.png')
                plt.close()
                return True
            except Exception as e:
                logger.error(f"Dividend Yield Distribution Chart Error: {e}")
                return False

        def safe_correlation_heatmap():
            try:
                # Select and prepare numeric columns
                numeric_columns = ['Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 'Beta', 'Volume']
                correlation_df = self.df[numeric_columns].apply(pd.to_numeric, errors='coerce')
                
                # Compute correlation matrix
                correlation_matrix = correlation_df.corr()

                plt.figure(figsize=(16, 12))
                sns.heatmap(
                    correlation_matrix, 
                    annot=True, 
                    cmap='coolwarm', 
                    center=0, 
                    square=True, 
                    linewidths=0.5, 
                    cbar_kws={"shrink": .8},
                    fmt=".2f"  # Limit decimal places
                )
                plt.title('Financial Metrics Correlation Heatmap', fontsize=15)
                plt.tight_layout()
                plt.savefig('financial_analysis_charts/correlation_heatmap.png')
                plt.close()
                return True
            except Exception as e:
                logger.error(f"Correlation Heatmap Error: {e}")
                return False

        def safe_market_cap_eps_bubble():
            try:
                # Prepare data
                plot_data = self.df.copy()
                plot_data['Market Cap'] = pd.to_numeric(plot_data['Market Cap'], errors='coerce')
                plot_data['EPS'] = pd.to_numeric(plot_data['EPS'], errors='coerce')
                plot_data['Dividend Yield'] = pd.to_numeric(plot_data['Dividend Yield'], errors='coerce')
                plot_data = plot_data.dropna(subset=['Market Cap', 'EPS', 'Dividend Yield'])

                plt.figure(figsize=(16, 10))
                plt.scatter(
                    plot_data['Market Cap'], 
                    plot_data['EPS'], 
                    s=plot_data['Dividend Yield']*100,  # Bubble size based on dividend yield
                    alpha=0.6
                )
                plt.xscale('log')
                plt.title('Market Cap vs EPS (Bubble Size: Dividend Yield)', fontsize=15)
                plt.xlabel('Market Cap (Log Scale)', fontsize=12)
                plt.ylabel('Earnings Per Share', fontsize=12)
                plt.tight_layout()
                plt.savefig('financial_analysis_charts/market_cap_eps_bubble.png')
                plt.close()
                return True
            except Exception as e:
                logger.error(f"Market Cap EPS Bubble Chart Error: {e}")
                return False

        # Ensure output directory exists
        os.makedirs('financial_analysis_charts', exist_ok=True)

        # List of visualization methods to execute
        visualization_methods = [
            safe_market_cap_comparison,
            safe_pe_ratio_eps_scatter,
            safe_dividend_yield_distribution,
            safe_correlation_heatmap,
            safe_market_cap_eps_bubble
        ]

        # Track successful and failed visualizations
        successful_charts = []
        failed_charts = []

        # Execute each visualization method
        for method in visualization_methods:
            try:
                result = method()
                if result:
                    successful_charts.append(method.__name__)
                else:
                    failed_charts.append(method.__name__)
            except Exception as e:
                logger.error(f"Unexpected error in {method.__name__}: {e}")
                failed_charts.append(method.__name__)

        # Log summary
        logger.info(f"Successful Charts: {successful_charts}")
        logger.info(f"Failed Charts: {failed_charts}")

    def _generate_momentum_example(self):
        """
        Generate a detailed example of momentum score calculation
        """
        # Select a representative stock for detailed explanation
        example_stock = self.df.nlargest(1, 'Momentum Score').iloc[0]
        
        return {
            "Ticker": example_stock['Ticker'],
            "Current Price": float(example_stock['Current Price']),
            "52 Week Low": float(example_stock['52 Week Low']),
            "52 Week High": float(example_stock['52 Week High']),
            "Momentum Score": float(example_stock['Momentum Score']),
            "Calculation": f"({example_stock['Current Price']} - {example_stock['52 Week Low']}) / ({example_stock['52 Week High']} - {example_stock['52 Week Low']}) = {example_stock['Momentum Score']:.4f}"
        }
    
    @staticmethod
    def json_serializable(obj):
        """
        Convert non-JSON serializable objects to JSON-friendly types
        """
        import numpy as np
        import pandas as pd
        
        # Handle NumPy types
        if isinstance(obj, (np.int64, np.float64, np.float32)):
            return int(obj) if np.issubdtype(obj, np.integer) else float(obj)
        
        # Handle NumPy arrays
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        
        # Handle Pandas Series
        if isinstance(obj, pd.Series):
            return obj.tolist()
        
        # Handle Pandas Categorical types
        if hasattr(obj, 'categories'):
            return list(obj.categories)
        
        # For any other non-serializable types
        return str(obj)
    
    def generate_advanced_analysis(self):
            try:
                # Additional derived metrics using existing pandas functionality
                self.df['Market Cap Tier'] = pd.qcut(self.df['Market Cap'], q=5, labels=['Very Small', 'Small', 'Medium', 'Large', 'Very Large'])
                
                # Volatility calculation with explicit numeric conversion
                self.df['Price Volatility'] = pd.to_numeric(
                    (self.df['52 Week High'] - self.df['52 Week Low']) / self.df['52 Week Low'], 
                    errors='coerce'
                )
                
                # Relative valuation metrics
                self.df['EPS Yield'] = pd.to_numeric(self.df['EPS'] / self.df['Current Price'], errors='coerce')
                
                # Momentum indicator with explicit numeric conversion
                self.df['Momentum Score'] = pd.to_numeric(
                    (self.df['Current Price'] - self.df['52 Week Low']) / (self.df['52 Week High'] - self.df['52 Week Low']), 
                    errors='coerce'
                )

                def classify_stock_type(row):
                    # Add explicit NA handling
                    if pd.isna(row['Beta']):
                        return 'Unclassified'
                    
                    if pd.isna(row['Market Cap']):
                        return 'Unclassified'
                    
                    if row['Market Cap'] > 100_000_000_000:
                        return 'Mega Cap'
                    elif pd.notna(row['Dividend Yield']) and row['Dividend Yield'] > 3:
                        return 'High Yield'
                    elif row['Beta'] > 1.5:
                        return 'High Volatility'
                    elif pd.notna(row['EPS']) and row['EPS'] < 0:
                        return 'Speculative'
                    else:
                        return 'Stable'
                
                self.df['Stock Type'] = self.df.apply(classify_stock_type, axis=1)

                # Add Detailed Calculation Context
                analysis_data = {
                    "Dataset Overview": {
                        "Total Stocks": int(len(self.df)),
                        "Metrics": list(self.df.columns),
                        "Market Cap Tiers": {str(k): int(v) for k, v in dict(self.df['Market Cap Tier'].value_counts()).items()},
                        "Stock Types": {str(k): int(v) for k, v in dict(self.df['Stock Type'].value_counts()).items()}
                    },
                    "Statistical Summaries": {
                        metric: {
                            k: AdvancedFinancialAnalyzer.json_serializable(v) 
                            for k, v in self.df[metric].describe().to_dict().items()
                        } 
                        for metric in ['Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 'Beta', 'Price Volatility', 'Momentum Score']
                    },
                    "Detailed Calculations": {
                        "Momentum Score": {
                            "Formula": "(Current Price - 52 Week Low) / (52 Week High - 52 Week Low)",
                            "Example Calculation": self._generate_momentum_example()
                        },
                        "Price Volatility": {
                            "Formula": "(52 Week High - 52 Week Low) / 52 Week Low",
                            "Statistical Summary": {
                                "Mean": float(self.df['Price Volatility'].mean()),
                                "Median": float(self.df['Price Volatility'].median()),
                                "Standard Deviation": float(self.df['Price Volatility'].std())
                            }
                        }
                    }
                }

                # Modify prompt to emphasize data-driven insights
                prompt = f"""
                Perform an advanced multi-dimensional financial analysis with the following comprehensive dataset:

                DETAILED DATASET OVERVIEW:
                {json.dumps(analysis_data, indent=2, default=AdvancedFinancialAnalyzer.json_serializable)}

                ADVANCED ANALYSIS DIRECTIVES:
                1. Provide a holistic market ecosystem analysis
                2. Provide in-depth insights with direct references to the data
                3. Include specific calculations and examples from the Detailed Calculations section
                4. Identify cross-metric correlations and anomalies
                5. Develop nuanced investment strategy recommendations
                6. Highlight up to 5 of the most significant trends to follow based on your strategic analysis of the data and the dataset
                7. Explain why these trends are the most significant by using data and include specific calculations
                8. Assess potential market trends and sector dynamics
                9. Highlight stocks with unique or contrarian characteristics

                ANALYTICAL FRAMEWORK:
                - Use the provided calculation examples to explain metric interpretations
                - Examine relationships between market cap, profitability, risk, and momentum
                - Provide transparent reasoning supported by numerical evidence
                - Include specific numerical context for all major claims
                """

                # API request configuration
                api_data = {
                    "model": "gpt-4",
                    "messages": [
                        {
                            "role": "system", 
                            "content": "You are an elite financial analyst providing comprehensive, data-driven market insights."
                        },
                        {
                            "role": "user", 
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 4000
                }

                # Send API request
                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.openai_api_key}"
                    },
                    json=api_data,
                    timeout=45
                )

                # Process and save insights
                insights = response.json()['choices'][0]['message']['content'].strip()
                
                with open('advanced_financial_insights.txt', 'w') as f:
                    f.write(insights)

                logger.info("Advanced financial analysis generated successfully")
                return insights

            except Exception as e:
                logger.error(f"Error in advanced financial analysis: {e}")
                logger.error(traceback.format_exc())
                return f"Error: {e}"

def main():
    # Load environment variables
    load_dotenv()
    
    # Validate OpenAI API key
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        logger.error("OpenAI API key is missing. Please check your .env file.")
        return
    
    # Initialize advanced financial analyzer
    analyzer = AdvancedFinancialAnalyzer(openai_api_key)
    
    # Generate visualizations. data export, and tables
    analyzer.generate_visualizations()
    analyzer.generate_raw_data_and_export()
    analyzer.export_key_metric_tables()
    
    # Generate advanced analysis
    advanced_insights = analyzer.generate_advanced_analysis()
    
    # Print insights
    print(advanced_insights)

if __name__ == "__main__":
    main()