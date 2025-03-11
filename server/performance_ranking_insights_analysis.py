# simplified_app.py
import json
import os
import requests
from dotenv import load_dotenv
import logging
import traceback

# More comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('financial_insights.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FinancialInsightsGenerator:
    def __init__(self, openai_api_key):
        self.openai_api_key = openai_api_key
        self.metrics_data = self.load_metrics()

    def load_metrics(self, json_path='financial_metrics.json'):
        """
        Load pre-scraped financial metrics with enhanced error handling
        """
        try:
            # Validate file exists
            if not os.path.exists(json_path):
                raise FileNotFoundError(f"Metrics file not found: {json_path}")
            
            with open(json_path, 'r') as file:
                metrics = json.load(file)
                
                # Validate metrics structure
                if not isinstance(metrics, dict) or len(metrics) == 0:
                    raise ValueError("Metrics file is empty or improperly formatted")
                
                logger.info(f"Loaded {len(metrics)} ticker metrics")
                return metrics
        
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"JSON Parsing Error: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error loading metrics: {e}")
            return {}

    def prepare_metrics_summary(self, max_length=10000):
        """
        Convert metrics to a structured, readable format with length limitation
        """
        summary = "FINANCIAL METRICS OVERVIEW:\n"
        for ticker, metrics in self.metrics_data.items():
            summary += f"\n{ticker} METRICS:\n"
            for key, value in metrics.items():
                summary += f"- {key}: {value}\n"
                
                # Truncate if summary gets too long
                if len(summary) > max_length:
                    summary = summary[:max_length]
                    logger.warning("Metrics summary truncated due to length")
                    break
        
        return summary

    def generate_comparative_analysis(self, analysis_type='cross_sector'):
        """
        Generate AI-powered financial insights with robust error handling
        """
        try:
            # Validate API key
            if not self.openai_api_key:
                raise ValueError("OpenAI API key is missing")
            
            # Prepare metrics summary
            metrics_summary = self.prepare_metrics_summary()
            
            # Robust prompt selection
            analysis_prompts = {
                'cross_sector': (
                    "Perform a comprehensive cross-sector financial analysis. "
                    "Compare and contrast financial metrics across different sectors. "
                    "Highlight unique strengths, potential risks, and intersectoral insights."
                ),
                'performance_ranking': (
                    "Create a data-driven performance ranking of the stocks. "
                    "Use metrics like Market Cap, P/E Ratio, EPS, and Dividend Yield "
                    "to objectively assess and rank stock performance."
                ),
                'investment_potential': (
                    "Evaluate the investment potential of these stocks. "
                    "Consider factors like Beta, EPS, Market Cap, and 52 Week Range. "
                    "Provide a nuanced assessment of risk and potential returns."
                )
            }
            
            # Safely get prompt
            selected_prompt = analysis_prompts.get(
                analysis_type, 
                analysis_prompts['cross_sector']
            )
            
            # Full prompt construction
            full_prompt = (
                f"{metrics_summary}\n\n"
                f"ANALYSIS DIRECTIVE: {selected_prompt}\n\n"
                "Provide a structured, professional analysis with clear insights, "
                "quantitative comparisons, and strategic recommendations."
            )
            
            # Flexible API request configuration
            api_data = {
                "model": "gpt-3.5-turbo",  # Fallback to more reliable model
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are an elite financial analyst providing comprehensive market insights."
                    },
                    {
                        "role": "user", 
                        "content": full_prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 2000  # Reduced to minimize potential issues
            }
            
            # Enhanced logging for API request
            logger.info(f"Attempting to generate {analysis_type} financial insights")
            
            # Send API request with enhanced error handling
            try:
                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.openai_api_key}"
                    },
                    json=api_data,
                    timeout=30  # Reduced timeout
                )
                
                # Detailed error logging
                if response.status_code != 200:
                    logger.error(f"API Error: {response.status_code}")
                    logger.error(f"Response Content: {response.text}")
                    response.raise_for_status()
                
                # Extract insights
                insights = response.json()['choices'][0]['message']['content'].strip()
                
                # Save insights
                output_file = f'{analysis_type}_financial_insights.txt'
                with open(output_file, 'w') as f:
                    f.write(insights)
                
                logger.info(f"Successfully generated {analysis_type} insights")
                return insights
            
            except requests.exceptions.RequestException as req_error:
                logger.error(f"Request Error: {req_error}")
                logger.error(traceback.format_exc())
                return f"Request Error: {req_error}"
        
        except Exception as e:
            logger.error(f"Comprehensive Error in {analysis_type} analysis: {e}")
            logger.error(traceback.format_exc())
            return f"Comprehensive Error: {e}"

def main():
    # Load environment variables with error handling
    try:
        load_dotenv()
    except Exception as e:
        logger.error(f"Error loading environment variables: {e}")
        return
    
    # Validate OpenAI API key
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        logger.error("OpenAI API key is missing. Please check your .env file.")
        return
    
    # Initialize insights generator
    insights_generator = FinancialInsightsGenerator(openai_api_key)
    
    # Generate different types of analyses
    performance_ranking = insights_generator.generate_comparative_analysis('performance_ranking')

if __name__ == "__main__":
    main()