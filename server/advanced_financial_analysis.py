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
            
            df = pd.DataFrame(data)
            
         # **Compute additional metrics**
            df['Momentum Score'] = (df['Current Price'] - df['52 Week Low']) / (df['52 Week High'] - df['52 Week Low'])
            df['Price to Target Ratio'] = df['Target Price'] / df['Current Price']
            df['Volume Trend'] = df['Volume'] / df['Avg Volume']

            # **Convert to numeric and drop invalid rows**
            numeric_columns = ['Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 'Current Price']
            df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric, errors='coerce')
            df = df.dropna(subset=numeric_columns, how='all')
            
            return df
        except Exception as e:
            logger.error(f"Error converting to DataFrame: {e}")
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

    def generate_visualizations(self):
        """
        Create insightful visualizations
        """
        try:
            # Ensure output directory exists
            os.makedirs('financial_analysis_charts', exist_ok=True)

            # 1. Market Cap Comparison
            plt.figure(figsize=(12, 6))
            top_market_cap = self.df.nlargest(10, 'Market Cap')
            sns.barplot(x='Ticker', y='Market Cap', data=top_market_cap)
            plt.title('Top 10 Stocks by Market Capitalization')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig('financial_analysis_charts/market_cap_comparison.png')
            plt.close()

            # 2. P/E Ratio vs EPS Scatter Plot
            plt.figure(figsize=(12, 6))
            sns.scatterplot(x='P/E Ratio', y='EPS', hue='Ticker', data=self.df)
            plt.title('P/E Ratio vs Earnings Per Share')
            plt.tight_layout()
            plt.savefig('financial_analysis_charts/pe_ratio_vs_eps.png')
            plt.close()

            # 3. Dividend Yield Distribution
            plt.figure(figsize=(12, 6))
            sns.histplot(self.df['Dividend Yield'].dropna(), kde=True)
            plt.title('Dividend Yield Distribution')
            plt.tight_layout()
            plt.savefig('financial_analysis_charts/dividend_yield_distribution.png')
            plt.close()

            # Correlation Heatmap
            plt.figure(figsize=(12, 10))
            correlation_matrix = self.df[['Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 'Beta', 'Volume']].corr()
            sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
            plt.title('Financial Metrics Correlation Heatmap')
            plt.tight_layout()
            plt.savefig('financial_analysis_charts/correlation_heatmap.png')
            plt.close()

            # Bubble Chart: Market Cap vs EPS vs Dividend Yield
            plt.figure(figsize=(15, 8))
            scatter = plt.scatter(
                self.df['Market Cap'], 
                self.df['EPS'], 
                s=self.df['Dividend Yield']*100, 
                alpha=0.5
            )
            plt.xlabel('Market Cap')
            plt.ylabel('EPS')
            plt.title('Market Cap vs EPS (Bubble Size: Dividend Yield)')
            plt.xscale('log')
            plt.tight_layout()
            plt.savefig('financial_analysis_charts/market_cap_eps_bubble.png')
            plt.close()

            logger.info("Visualizations generated successfully")
        except Exception as e:
            logger.error(f"Error generating visualizations: {e}")

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

                # Enhanced Stock Type Classification
                def classify_stock_type(row):
                    if pd.isna(row['Market Cap']):
                        return 'Unclassified'
                    
                    if row['Market Cap'] > 100_000_000_000:
                        return 'Mega Cap'
                    elif row['Dividend Yield'] > 3:
                        return 'High Yield'
                    elif row['Beta'] > 1.5:
                        return 'High Volatility'
                    elif row['EPS'] < 0:
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
                6. Assess potential market trends and sector dynamics
                7. Highlight stocks with unique or contrarian characteristics

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
    
    # Generate visualizations
    analyzer.generate_visualizations()
    
    # Generate advanced analysis
    advanced_insights = analyzer.generate_advanced_analysis()
    
    # Print insights
    print(advanced_insights)

if __name__ == "__main__":
    main()