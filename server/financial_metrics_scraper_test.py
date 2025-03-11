# financial_metrics_scraper_test.py
import os
import json
import random
import pandas as pd
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinancialMetricsScraper:
    def __init__(self):
        # Set up Chrome options
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-notifications')
        # chrome_options.add_argument('--headless')  # Uncomment for headless mode
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)

    def load_tickers(self, json_path='tickers.json'):
        """
        Load a comprehensive list of stock tickers
        """
        try:
            with open(json_path, 'r') as file:
                return json.load(file)
        except Exception as e:
            logger.error(f"Error loading tickers: {str(e)}")
            return {}

    def extract_financial_metrics(self, ticker):
        """
        Extract financial metrics for a given stock ticker using targeted scraping
        """
        try:
            # Navigate to Yahoo Finance
            url = f'https://finance.yahoo.com/quote/{ticker}'
            self.driver.get(url)
            time.sleep(3)  # Allow page to load
            
            # Find the statistics div
            stats_div = self.driver.find_element(By.CSS_SELECTOR, 'div[data-testid="quote-statistics"]')
            
            # Extract metrics from the div
            metrics = {
                'Ticker': ticker,
                'Previous Close': self._extract_metric_value(stats_div, 'Previous Close'),
                'Open': self._extract_metric_value(stats_div, 'Open'),
                'Day\'s Range': self._extract_metric_value(stats_div, 'Day\'s Range'),
                '52 Week Range': self._extract_metric_value(stats_div, '52 Week Range'),
                'Volume': self._extract_metric_value(stats_div, 'Volume'),
                'Avg. Volume': self._extract_metric_value(stats_div, 'Avg. Volume'),
                'Market Cap': self._extract_metric_value(stats_div, 'Market Cap (intraday)'),
                'Beta': self._extract_metric_value(stats_div, 'Beta (5Y Monthly)'),
                'PE Ratio (TTM)': self._extract_metric_value(stats_div, 'PE Ratio (TTM)'),
                'EPS (TTM)': self._extract_metric_value(stats_div, 'EPS (TTM)'),
                'Earnings Date': self._extract_metric_value(stats_div, 'Earnings Date'),
                'Forward Dividend & Yield': self._extract_metric_value(stats_div, 'Forward Dividend & Yield'),
                '1y Target Est': self._extract_metric_value(stats_div, '1y Target Est')
            }
            
            return metrics
        
        except Exception as e:
            logger.error(f"Error scraping {ticker}: {str(e)}")
            return {'Ticker': ticker, 'Error': str(e)}

    def _extract_metric_value(self, stats_div, label):
        """
        Extract value for a specific metric label
        """
        try:
            # Find the span with the specific label
            label_element = stats_div.find_element(By.XPATH, f".//span[@title='{label}']")
            
            # Find the corresponding value element
            value_element = label_element.find_element(By.XPATH, "./following-sibling::span[@class='value yf-1jj98ts']")
            
            # Check for fin-streamer element within the value span
            fin_streamer = value_element.find_elements(By.TAG_NAME, 'fin-streamer')
            
            if fin_streamer:
                return fin_streamer[0].get_attribute('data-value')
            else:
                return value_element.text
        
        except Exception as e:
            logger.warning(f"Could not extract {label}: {str(e)}")
            return 'N/A'

    def batch_scrape_stocks(self, tickers):
        """
        Batch scrape multiple stock tickers
        """
        results = {}
        for ticker in tickers:
            try:
                logger.info(f"Scraping metrics for {ticker}")
                metrics = self.extract_financial_metrics(ticker)
                results[ticker] = metrics
                time.sleep(2)  # Rate limiting
            except Exception as e:
                logger.error(f"Error processing {ticker}: {str(e)}")
                results[ticker] = {'Ticker': ticker, 'Error': str(e)}
        
        return results

    def scrape_tickers(self, selection_method='random', count=5, sector=None):
        """
        Scrape metrics based on different selection methods
        
        Args:
            selection_method (str): 'random', 'sector', or 'all'
            count (int): Number of tickers to scrape if random
            sector (str, optional): Specific sector to scrape
        """
        try:
            # Load tickers
            tickers_dict = self.load_tickers()
            
            # Select tickers based on method
            if selection_method == 'random':
                # Combine all tickers and select randomly
                all_tickers = []
                for sector_tickers in tickers_dict.values():
                    all_tickers.extend(sector_tickers)
                tickers_to_scrape = random.sample(all_tickers, min(count, len(all_tickers)))
            
            elif selection_method == 'sector' and sector:
                # Scrape specific sector
                tickers_to_scrape = tickers_dict.get(sector, [])[:count]
            
            elif selection_method == 'all':
                # Combine all tickers
                tickers_to_scrape = []
                for sector_tickers in tickers_dict.values():
                    tickers_to_scrape.extend(sector_tickers)
            
            else:
                raise ValueError("Invalid selection method")
            
            # Batch scrape selected tickers
            all_metrics = self.batch_scrape_stocks(tickers_to_scrape)
            
            # Save metrics to JSON
            with open('financial_metrics.json', 'w') as f:
                json.dump(all_metrics, f, indent=2)
            
            # Create a summary Excel file
            metrics_df = pd.DataFrame.from_dict(all_metrics, orient='index')
            metrics_df.to_excel('financial_metrics.xlsx', index=False)
            
            logger.info(f"Scraped metrics for {len(tickers_to_scrape)} tickers")
        
        except Exception as e:
            logger.error(f"Error in ticker scraping: {str(e)}")
        finally:
            # Ensure browser is closed
            self.driver.quit()

def main():
    # Load environment variables
    load_dotenv()
    
    # Initialize scraper
    scraper = FinancialMetricsScraper()
    
    # Example usage:
    # 1. Scrape 5 random tickers
    # scraper = FinancialMetricsScraper()
    # scraper.scrape_tickers(selection_method='random', count=5)
    
    # 2. Scrape all tickers in tech sector
    # scraper = FinancialMetricsScraper()
    # scraper.scrape_tickers(selection_method='sector', sector='tech')
    
    # 3. Scrape all tickers
    scraper = FinancialMetricsScraper()
    scraper.scrape_tickers(selection_method='all')

if __name__ == "__main__":
    main()