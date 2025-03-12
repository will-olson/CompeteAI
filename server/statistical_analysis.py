import os
from dotenv import load_dotenv
import json
import requests
import traceback
import logging

load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')

# statistical_analysis.py
try:
    import pandas as pd
    import numpy as np
except ImportError:
    print("Installing required base libraries...")
    import sys
    import subprocess
    
    def install(package):
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    
    install('pandas')
    install('numpy')
    
    import pandas as pd
    import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('statistical_analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Optional: Conditional Import Strategy
def import_optional_deps():
    optional_deps = {
        'scipy.stats': 'scipy',
        'sklearn.preprocessing': 'scikit-learn',
        'matplotlib.pyplot': 'matplotlib',
        'seaborn': 'seaborn'
    }
    
    installed_deps = {}
    for module, package in optional_deps.items():
        try:
            module_parts = module.split('.')
            if len(module_parts) > 1:
                mod = __import__(module_parts[0], fromlist=[module_parts[1]])
                installed_deps[module] = getattr(mod, module_parts[1])
            else:
                installed_deps[module] = __import__(module)
        except ImportError:
            print(f"Optional dependency {package} not found. Some advanced features will be limited.")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                # Retry import
                if len(module_parts) > 1:
                    mod = __import__(module_parts[0], fromlist=[module_parts[1]])
                    installed_deps[module] = getattr(mod, module_parts[1])
                else:
                    installed_deps[module] = __import__(module)
            except:
                print(f"Could not install {package}. Skipping.")
    
    return installed_deps

class AdvancedStatisticalAnalyzer:
    def __init__(self, dataframe, openai_api_key=None):
        # Import optional dependencies
        self.deps = import_optional_deps()
        
        self.df = dataframe
        self.numeric_columns = None
        self.openai_api_key = openai_api_key
        self.prepare_data()

    def prepare_data(self):
        """
        Prepare and clean numeric columns for analysis
        """
        # Select and clean numeric columns
        self.numeric_columns = [
            'Market Cap', 'P/E Ratio', 'EPS', 'Dividend Yield', 
            'Current Price', 'Beta', 'Volume', 'Momentum Score'
        ]
        
        # Ensure numeric conversion and handle potential NA values
        for col in self.numeric_columns:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce')

    def descriptive_statistics(self):
        """
        Generate comprehensive and formatted descriptive statistics
        """
        # Use fallback if scipy.stats is not available
        stats_func = self.deps.get('scipy.stats', None)
        
        def format_scientific(value):
            """
            Format large numbers in scientific notation with meaningful precision
            """
            if pd.isna(value):
                return 'N/A'
            
            if isinstance(value, (int, float)):
                # Handle very large or very small numbers
                if abs(value) > 1e6 or abs(value) < 1e-4:
                    return f'{value:.4e}'
                else:
                    return f'{value:.4f}'
            return str(value)
        
        def generate_comprehensive_stats(column):
            """
            Generate a comprehensive statistical summary for a single column
            """
            data = self.df[column].dropna()
            
            stats = {
                'Metric': column,
                'Count': len(data),
                'Mean': format_scientific(np.mean(data)),
                'Median': format_scientific(np.median(data)),
                'Standard Deviation': format_scientific(np.std(data)),
                'Minimum': format_scientific(np.min(data)),
                'Maximum': format_scientific(np.max(data)),
                'Range': format_scientific(np.max(data) - np.min(data))
            }
            
            # Add additional statistics if scipy is available
            if stats_func:
                stats.update({
                    'Skewness': format_scientific(stats_func.skew(data)),
                    'Kurtosis': format_scientific(stats_func.kurtosis(data)),
                    '25th Percentile': format_scientific(np.percentile(data, 25)),
                    '75th Percentile': format_scientific(np.percentile(data, 75)),
                    'Interquartile Range': format_scientific(np.percentile(data, 75) - np.percentile(data, 25))
                })
            
            return stats
        
        # Generate statistics for each column
        comprehensive_stats = [generate_comprehensive_stats(col) for col in self.numeric_columns]
        
        # Convert to DataFrame for better visualization
        stats_df = pd.DataFrame(comprehensive_stats)
        
        # Optional: Color-coded console output
        def print_colored_stats(df):
            try:
                from termcolor import colored
                import colorama
                colorama.init()
                
                print("\n🔍 Comprehensive Financial Metrics Analysis 🔍")
                print("-" * 80)
                
                for _, row in df.iterrows():
                    print(f"\n{colored(row['Metric'], 'cyan', attrs=['bold'])}")
                    for col, val in row.items():
                        if col != 'Metric':
                            print(f"{col}: {colored(str(val), 'green')}")
                    print("-" * 80)
            
            except ImportError:
                # Fallback to standard print if color libraries are not available
                print("\nComprehensive Financial Metrics Analysis")
                print(df.to_string(index=False))
        
        # Export to CSV for further analysis
        stats_df.to_csv('comprehensive_financial_stats.csv', index=False)
        
        # Print colored stats to console
        print_colored_stats(stats_df)
        
        return stats_df

    def generate_comprehensive_report(self):
        """
        Generate a comprehensive statistical analysis report
        """
        # Generate descriptive statistics with enhanced formatting
        descriptive_stats = self.descriptive_statistics()
        
        # Optional: Generate additional insights
        insights = self.generate_additional_insights(descriptive_stats)
        
        # Combine reports
        report = {
            'Descriptive Statistics': descriptive_stats,
            'Additional Insights': insights
        }
        
        # Export reports
        for section, data in report.items():
            if isinstance(data, pd.DataFrame):
                data.to_csv(f'{section.lower().replace(" ", "_")}_report.csv', index=False)
        
        return report

    def generate_additional_insights(self, stats_df):
        """
        Generate additional insights based on descriptive statistics
        """
        insights = []
        
        # Market Cap Insights
        market_cap_stats = stats_df[stats_df['Metric'] == 'Market Cap'].iloc[0]
        insights.append({
            'Category': 'Market Capitalization',
            'Insight': f"Market cap ranges from {market_cap_stats['Minimum']} to {market_cap_stats['Maximum']}",
            'Interpretation': 'Indicates significant diversity in company sizes'
        })
        
        # P/E Ratio Insights
        pe_ratio_stats = stats_df[stats_df['Metric'] == 'P/E Ratio'].iloc[0]
        insights.append({
            'Category': 'Valuation',
            'Insight': f"P/E Ratio varies from {pe_ratio_stats['Minimum']} to {pe_ratio_stats['Maximum']}",
            'Interpretation': 'Suggests wide range of market valuations'
        })
        
        # Dividend Yield Insights
        div_yield_stats = stats_df[stats_df['Metric'] == 'Dividend Yield'].iloc[0]
        insights.append({
            'Category': 'Dividend Strategy',
            'Insight': f"Dividend yields range from {div_yield_stats['Minimum']}% to {div_yield_stats['Maximum']}%",
            'Interpretation': 'Indicates diverse income generation potential'
        })
        
        return pd.DataFrame(insights)

    def generate_basic_visualizations(self):
        """
        Create basic visualizations with minimal dependencies
        """
        import os
        os.makedirs('statistical_analysis_charts', exist_ok=True)

        # Basic matplotlib visualization
        plt = self.deps.get('matplotlib.pyplot')
        if plt:
            plt.figure(figsize=(15, 10))
            for i, col in enumerate(self.numeric_columns, 1):
                plt.subplot(3, 3, i)
                plt.hist(self.df[col].dropna(), bins=30)
                plt.title(f'Distribution of {col}')
            plt.tight_layout()
            plt.savefig('statistical_analysis_charts/basic_distributions.png')
            plt.close()

    def generate_comprehensive_report(self):
        """
        Generate a basic statistical analysis report
        """
        report = {
            'Descriptive Statistics': self.descriptive_statistics()
        }
        
        # Export report to CSV (more universal than Excel)
        for section, data in report.items():
            data.to_csv(f'{section.lower().replace(" ", "_")}_report.csv')
        
        return report
    def generate_advanced_analysis(self):
        """
        Generate advanced AI-driven financial analysis
        """
        try:
            # Additional derived metrics
            self.df['Market Cap Tier'] = pd.qcut(self.df['Market Cap'], q=5, labels=['Very Small', 'Small', 'Medium', 'Large', 'Very Large'])
            
            # Volatility calculation
            self.df['Price Volatility'] = pd.to_numeric(
                (self.df['52 Week High'] - self.df['52 Week Low']) / self.df['52 Week Low'], 
                errors='coerce'
            )
            
            # Relative valuation metrics
            self.df['EPS Yield'] = pd.to_numeric(self.df['EPS'] / self.df['Current Price'], errors='coerce')
            
            # Momentum indicator
            self.df['Momentum Score'] = pd.to_numeric(
                (self.df['Current Price'] - self.df['52 Week Low']) / (self.df['52 Week High'] - self.df['52 Week Low']), 
                errors='coerce'
            )

            def classify_stock_type(row):
                if pd.isna(row['Beta']) or pd.isna(row['Market Cap']):
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

            # Prepare analysis data
            analysis_data = {
                "Dataset Overview": {
                    "Total Stocks": int(len(self.df)),
                    "Metrics": list(self.df.columns),
                    "Market Cap Tiers": {str(k): int(v) for k, v in dict(self.df['Market Cap Tier'].value_counts()).items()},
                    "Stock Types": {str(k): int(v) for k, v in dict(self.df['Stock Type'].value_counts()).items()}
                },
                "Statistical Summaries": {
                    metric: {
                        k: self.json_serializable(v) 
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

            # Check if OpenAI API key is available
            if not self.openai_api_key:
                logger.warning("OpenAI API key not provided. Skipping AI-driven analysis.")
                return self._generate_local_insights(analysis_data)

            # Prepare AI prompt
            prompt = f"""
            Perform an advanced multi-dimensional financial analysis with the following comprehensive dataset:

            DETAILED DATASET OVERVIEW:
            {json.dumps(analysis_data, indent=2, default=self.json_serializable)}

            ADVANCED ANALYSIS DIRECTIVES:
            1. Provide a holistic market ecosystem analysis
            2. Provide in-depth insights with direct references to the data
            3. Include specific calculations and examples from the Detailed Calculations section
            4. Identify cross-metric correlations and anomalies
            5. Develop nuanced investment strategy recommendations
            6. Highlight up to 5 of the most significant trends to follow
            7. Explain why these trends are the most significant using data and specific calculations
            8. Assess potential market trends and sector dynamics
            9. Highlight stocks with unique or contrarian characteristics
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
            return self._generate_local_insights(analysis_data)

    def _generate_local_insights(self, analysis_data):
        """
        Generate insights locally when AI analysis is not possible
        """
        insights = "Local Financial Analysis Insights\n\n"
        
        # Market Cap Tiers Analysis
        insights += "Market Capitalization Breakdown:\n"
        for tier, count in analysis_data["Dataset Overview"]["Market Cap Tiers"].items():
            insights += f"- {tier} Cap: {count} stocks\n"
        
        # Stock Types Analysis
        insights += "\nStock Type Distribution:\n"
        for stock_type, count in analysis_data["Dataset Overview"]["Stock Types"].items():
            insights += f"- {stock_type}: {count} stocks\n"
        
        # Key Statistical Highlights
        insights += "\nKey Statistical Highlights:\n"
        for metric, stats in analysis_data["Statistical Summaries"].items():
            insights += f"\n{metric}:\n"
            for stat, value in stats.items():
                insights += f"- {stat}: {value}\n"
        
        # Save local insights
        with open('local_financial_insights.txt', 'w') as f:
            f.write(insights)
        
        return insights

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

def main():
    # Simplified main function
    try:
        from advanced_financial_analysis import AdvancedFinancialAnalyzer
        import os
    except ImportError:
        print("Could not import AdvancedFinancialAnalyzer. Provide a DataFrame manually.")
        return

    # Get OpenAI API key
    openai_api_key = os.getenv('OPENAI_API_KEY')

    # Initialize the financial analyzer
    analyzer = AdvancedFinancialAnalyzer(openai_api_key)
    
    # Create statistical analyzer
    stat_analyzer = AdvancedStatisticalAnalyzer(analyzer.df, openai_api_key)
    
    # Generate comprehensive report
    report = stat_analyzer.generate_comprehensive_report()
    
    # Generate basic visualizations
    stat_analyzer.generate_basic_visualizations()
    
    # Generate advanced analysis
    advanced_insights = stat_analyzer.generate_advanced_analysis()
    
    # Print key insights
    print("\n🚀 Statistical Analysis Complete 🚀")
    print("\nAdvanced Insights:")
    print(advanced_insights)

if __name__ == "__main__":
    main()