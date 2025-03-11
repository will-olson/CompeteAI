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
            
            df['Price to Target Ratio'] = df['Target Price'] / df['Current Price']
            df['Volume Trend'] = df['Volume'] / df['Avg Volume']

            # Convert columns to numeric, with more lenient approach
            numeric_columns = ['Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 'Current Price']
            for col in numeric_columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Only drop rows if ALL numeric columns are NaN
            df = df.dropna(subset=numeric_columns, how='all')
            
            return df
        except Exception as e:
            logger.error(f"Error converting to DataFrame: {e}")
            return pd.DataFrame()
        
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

    def generate_advanced_analysis(self):
        """
        Generate comprehensive financial analysis with enhanced insights
        """
        try:
            # Prepare more comprehensive analysis data
            analysis_data = {
                "Dataset Overview": {
                    "Total Stocks": len(self.df),
                    "Metrics": list(self.df.columns)
                },
                "Statistical Summaries": {
                    metric: self.df[metric].describe().to_dict() 
                    for metric in ['Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 'Beta']
                },
                "Performance Metrics": {
                    "Top Performers": {
                        "Highest Market Cap": self.df.nlargest(5, 'Market Cap')[['Ticker', 'Market Cap']].to_dict(orient='records'),
                        "Highest EPS": self.df.nlargest(5, 'EPS')[['Ticker', 'EPS']].to_dict(orient='records'),
                        "Highest Dividend Yields": self.df.nlargest(5, 'Dividend Yield')[['Ticker', 'Dividend Yield']].to_dict(orient='records')
                    },
                    "Risk Metrics": {
                        "Highest Beta Stocks": self.df.nlargest(5, 'Beta')[['Ticker', 'Beta']].to_dict(orient='records'),
                        "Lowest Beta Stocks": self.df.nsmallest(5, 'Beta')[['Ticker', 'Beta']].to_dict(orient='records')
                    }
                },
                "Derived Insights": {
                    "Price to Target Analysis": self.df.nlargest(5, 'Price to Target Ratio')[['Ticker', 'Price to Target Ratio']].to_dict(orient='records'),
                    "Volume Trend Outliers": self.df.nlargest(5, 'Volume Trend')[['Ticker', 'Volume Trend']].to_dict(orient='records')
                }
            }

            prompt = f"""
            Perform a multi-dimensional financial analysis with the following comprehensive dataset:

            DETAILED DATASET OVERVIEW:
            {json.dumps(analysis_data, indent=2)}

            ADVANCED ANALYSIS DIRECTIVES:
            1. Provide a holistic market ecosystem analysis
            2. Identify cross-metric correlations and anomalies
            3. Develop nuanced investment strategy recommendations
            4. Assess potential market trends and sector dynamics
            5. Highlight stocks with unique or contrarian characteristics

            ANALYTICAL FRAMEWORK:
            - Examine relationships between market cap, profitability, and risk
            - Identify potential undervalued or overvalued stocks
            - Consider macroeconomic implications of the data
            - Provide forward-looking strategic insights

            VISUALIZATION CONTEXT:
            - Correlation heatmap and bubble charts have been generated
            - Consider visual insights in your comprehensive analysis
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