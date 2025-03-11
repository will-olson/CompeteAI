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
        """
        Convert metrics to a pandas DataFrame for analysis
        """
        try:
            # Prepare data for DataFrame
            data = []
            for ticker, metrics in self.metrics_data.items():
                # Clean and convert metrics
                cleaned_metrics = {
                    'Ticker': ticker,
                    'Market Cap': self._clean_market_cap(metrics.get('Market Cap', 'N/A')),
                    'P/E Ratio': self._clean_float(metrics.get('PE Ratio (TTM)', 'N/A')),
                    'EPS': self._clean_float(metrics.get('EPS (TTM)', 'N/A')),
                    'Dividend Yield': self._clean_percentage(metrics.get('Forward Dividend & Yield', 'N/A').split('(')[-1].rstrip(')') if '(' in metrics.get('Forward Dividend & Yield', 'N/A') else 'N/A'),
                    'Current Price': self._clean_float(metrics.get('Previous Close', 'N/A'))
                }
                data.append(cleaned_metrics)
            
            df = pd.DataFrame(data)
            
            # Convert columns to numeric, coercing errors to NaN
            numeric_columns = ['Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 'Current Price']
            for col in numeric_columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Remove rows with NaN values
            df = df.dropna(subset=numeric_columns)
            
            return df
        except Exception as e:
            logger.error(f"Error converting to DataFrame: {e}")
            return pd.DataFrame()

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

    def _clean_float(self, value):
        """
        Clean and convert to float
        """
        try:
            # Handle special cases like '--'
            if value in ['N/A', '--']:
                return pd.NA
            
            # Remove any non-numeric characters except decimal point and minus sign
            cleaned = ''.join(char for char in str(value) if char in '0123456789.-')
            return float(cleaned) if cleaned else pd.NA
        except (ValueError, TypeError):
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

            logger.info("Visualizations generated successfully")
        except Exception as e:
            logger.error(f"Error generating visualizations: {e}")

    def generate_advanced_analysis(self):
        """
        Generate comprehensive financial analysis
        """
        try:
            # Prepare detailed analysis data
            analysis_data = {
                "Market Cap Summary": self.df['Market Cap'].describe().to_dict(),
                "P/E Ratio Summary": self.df['P/E Ratio'].describe().to_dict(),
                "EPS Summary": self.df['EPS'].describe().to_dict(),
                "Dividend Yield Summary": self.df['Dividend Yield'].describe().to_dict(),
                
                "Top 5 by Market Cap": self.df.nlargest(5, 'Market Cap')[['Ticker', 'Market Cap']].to_dict(orient='records'),
                "Top 5 by EPS": self.df.nlargest(5, 'EPS')[['Ticker', 'EPS']].to_dict(orient='records'),
                "Highest Dividend Yields": self.df.nlargest(5, 'Dividend Yield')[['Ticker', 'Dividend Yield']].to_dict(orient='records')
            }

            # Prepare prompt for AI analysis
            prompt = f"""
            Perform an advanced financial analysis based on the following comprehensive dataset:

            DATASET OVERVIEW:
            {json.dumps(analysis_data, indent=2)}

            ANALYSIS DIRECTIVES:
            1. Provide a deep-dive statistical analysis
            2. Identify key financial trends and patterns
            3. Compare performance across different financial metrics
            4. Offer nuanced insights beyond surface-level observations
            5. Suggest potential investment strategies based on the data

            ADDITIONAL CONTEXT:
            - Visualizations have been generated in the 'financial_analysis_charts' directory
            - Analysis should be comprehensive and data-driven
            - Consider both individual stock performance and comparative insights
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