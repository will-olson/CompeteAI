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
    
    def generate_additional_insights(self, stats_df):
        """
        Generate more comprehensive additional insights
        """
        insights = []
        
        # Ensure the method can handle the input
        if not isinstance(stats_df, pd.DataFrame):
            logger.warning("Invalid input for additional insights. Returning empty insights.")
            return pd.DataFrame()

        # Market Cap Insights with percentile information
        try:
            market_cap_stats = stats_df[stats_df['Metric'] == 'Market Cap'].iloc[0]
            market_cap_percentiles = np.percentile(self.df['Market Cap'].dropna(), [25, 50, 75])
            insights.append({
                'Category': 'Market Capitalization',
                'Insight': f"Market cap ranges from {market_cap_stats['Minimum']} to {market_cap_stats['Maximum']}",
                'Percentiles': {
                    '25th': f"{market_cap_percentiles[0]:,.0f}",
                    '50th (Median)': f"{market_cap_percentiles[1]:,.0f}",
                    '75th': f"{market_cap_percentiles[2]:,.0f}"
                },
                'Interpretation': 'Indicates significant diversity in company sizes'
            })
        except Exception as e:
            logger.error(f"Error processing Market Cap insights: {e}")

        # P/E Ratio Insights with risk assessment
        try:
            pe_ratio_stats = stats_df[stats_df['Metric'] == 'P/E Ratio'].iloc[0]
            pe_ratio_percentiles = np.percentile(self.df['P/E Ratio'].dropna(), [25, 50, 75])
            insights.append({
                'Category': 'Valuation',
                'Insight': f"P/E Ratio varies from {pe_ratio_stats['Minimum']} to {pe_ratio_stats['Maximum']}",
                'Percentiles': {
                    '25th': f"{pe_ratio_percentiles[0]:.2f}",
                    '50th (Median)': f"{pe_ratio_percentiles[1]:.2f}",
                    '75th': f"{pe_ratio_percentiles[2]:.2f}"
                },
                'Risk Assessment': 'Suggests wide range of market valuations',
                'Potential Overvaluation Threshold': f"{pe_ratio_percentiles[2]:.2f}"
            })
        except Exception as e:
            logger.error(f"Error processing P/E Ratio insights: {e}")

        # Dividend Yield Insights with income potential
        try:
            div_yield_stats = stats_df[stats_df['Metric'] == 'Dividend Yield'].iloc[0]
            div_yield_percentiles = np.percentile(self.df['Dividend Yield'].dropna(), [25, 50, 75])
            insights.append({
                'Category': 'Dividend Strategy',
                'Insight': f"Dividend yields range from {div_yield_stats['Minimum']}% to {div_yield_stats['Maximum']}%",
                'Percentiles': {
                    '25th': f"{div_yield_percentiles[0]:.2f}%",
                    '50th (Median)': f"{div_yield_percentiles[1]:.2f}%",
                    '75th': f"{div_yield_percentiles[2]:.2f}%"
                },
                'Income Potential': 'Indicates diverse income generation potential',
                'High Yield Threshold': f"{div_yield_percentiles[2]:.2f}%"
            })
        except Exception as e:
            logger.error(f"Error processing Dividend Yield insights: {e}")

        # Beta (Risk) Insights
        try:
            beta_stats = stats_df[stats_df['Metric'] == 'Beta'].iloc[0]
            beta_percentiles = np.percentile(self.df['Beta'].dropna(), [25, 50, 75])
            insights.append({
                'Category': 'Market Risk',
                'Insight': f"Beta ranges from {beta_stats['Minimum']} to {beta_stats['Maximum']}",
                'Percentiles': {
                    '25th': f"{beta_percentiles[0]:.2f}",
                    '50th (Median)': f"{beta_percentiles[1]:.2f}",
                    '75th': f"{beta_percentiles[2]:.2f}"
                },
                'Risk Interpretation': 'Indicates market sensitivity and volatility',
                'High Volatility Threshold': f"{beta_percentiles[2]:.2f}"
            })
        except Exception as e:
            logger.error(f"Error processing Beta insights: {e}")

        # Create DataFrame with insights
        insights_df = pd.DataFrame(insights)

        # Export insights to CSV for additional reference
        try:
            insights_df.to_csv('financial_analysis_output/market_insights.csv', index=False)
        except Exception as e:
            logger.error(f"Error exporting insights to CSV: {e}")

        return insights_df

    def generate_comprehensive_report(self):
        """
        Generate a comprehensive statistical analysis report with multiple Excel sheets
        """
        # Ensure matplotlib and seaborn are imported
        import matplotlib.pyplot as plt
        import seaborn as sns
        import os
        import re

        # Create output directory
        os.makedirs('financial_analysis_output', exist_ok=True)

        # Function to sanitize sheet names
        def sanitize_sheet_name(name):
            """
            Remove or replace invalid characters in Excel sheet names
            """
            # Remove or replace characters not allowed in sheet names
            sanitized = re.sub(r'[\/\\\?\*$$$$]', '_', name)
            
            # Truncate to 31 characters (Excel sheet name limit)
            sanitized = sanitized[:31]
            
            # Ensure name is not empty
            return sanitized if sanitized else 'Sheet'

        # Prepare Excel writer
        excel_path = 'financial_analysis_output/comprehensive_financial_analysis.xlsx'
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            # 1. Descriptive Statistics
            descriptive_stats = self.descriptive_statistics()
            descriptive_stats.to_excel(writer, sheet_name='Descriptive Statistics', index=False)

            # 2. Additional Insights
            insights = self.generate_additional_insights(descriptive_stats)
            insights.to_excel(writer, sheet_name='Market Insights', index=False)

            # 3. Top Performers Across Different Metrics
            top_performers = {
                'Highest Momentum Stocks': self.df.nlargest(10, 'Momentum Score'),
                'Lowest PE Ratio Stocks': self.df.nsmallest(10, 'P/E Ratio'),
                'Highest Dividend Yield Stocks': self.df.nlargest(10, 'Dividend Yield'),
                'Most Stable Stocks': self.df.nsmallest(10, 'Beta'),
                'Highest Market Cap Stocks': self.df.nlargest(10, 'Market Cap')
            }

            # Write top performers with sanitized sheet names
            for sheet_name, top_df in top_performers.items():
                # Sanitize sheet name
                safe_sheet_name = sanitize_sheet_name(sheet_name)
                
                # Write to Excel
                top_df.to_excel(writer, sheet_name=safe_sheet_name, index=False)

            # 4. Correlation Matrix
            correlation_matrix = self.df[self.numeric_columns].corr()
            correlation_matrix.to_excel(writer, sheet_name='Correlation Matrix')

        # Advanced Visualizations
        def create_advanced_visualizations():
            # Ensure output directory exists
            os.makedirs('financial_analysis_output/charts', exist_ok=True)

            # Rest of the visualization code remains the same...
            # (previous visualization methods)

        # Generate advanced visualizations
        try:
            create_advanced_visualizations()
        except Exception as e:
            logger.error(f"Error creating visualizations: {e}")

        # Generate a comprehensive summary report
        summary_report = {
            'Total Stocks': len(self.df),
            'Metrics Analyzed': self.numeric_columns,
            'Statistical Summary': descriptive_stats.to_dict(orient='records'),
            'Top Performers': {k: v.to_dict(orient='records') for k, v in top_performers.items()}
        }

        # Save summary report as JSON
        import json
        with open('financial_analysis_output/summary_report.json', 'w') as f:
            json.dump(summary_report, f, indent=2)

        # Log completion
        logger.info(f"Comprehensive financial analysis completed. Output saved to {excel_path}")

        return {
            'excel_path': excel_path,
            'summary_report': summary_report
        }
    
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
    
    def generate_basic_visualizations(self):
        """
        Create basic visualizations with minimal dependencies
        """
        try:
            # Attempt to import visualization libraries
            import matplotlib
            matplotlib.use('Agg')  # Use non-interactive backend
            import matplotlib.pyplot as plt
            import seaborn as sns
            import os
            import numpy as np

            # Ensure output directory exists
            os.makedirs('financial_analysis_output/charts', exist_ok=True)

            # Set plot style with deprecation warning handling
            try:
                plt.style.use('seaborn-v0_8-whitegrid')
            except Exception:
                plt.style.use('default')

            # Prepare visualization-friendly data
            def prepare_visualization_data(column):
                """
                Prepare data for visualization, handling potential issues
                """
                # Convert to numeric, removing any non-numeric values
                data = pd.to_numeric(self.df[column], errors='coerce')
                
                # Remove extreme outliers (beyond 3 standard deviations)
                mean = data.mean()
                std = data.std()
                return data[(data > mean - 3*std) & (data < mean + 3*std)].dropna()

            # 1. Distribution Plots for Numeric Columns
            plt.figure(figsize=(20, 15))
            for i, col in enumerate(self.numeric_columns, 1):
                plt.subplot(3, 3, i)
                
                # Prepare data
                data = prepare_visualization_data(col)
                
                if len(data) > 0:
                    try:
                        # Use histogram with kernel density estimation
                        sns.histplot(data, kde=True)
                        plt.title(f'Distribution of {col}')
                        plt.xlabel(col)
                        plt.ylabel('Frequency')
                    except Exception as plot_error:
                        logger.warning(f"Could not create histogram for {col}: {plot_error}")
                        # Fallback to basic histogram if seaborn fails
                        plt.hist(data, bins='auto')
                        plt.title(f'Distribution of {col} (Fallback)')
            
            plt.tight_layout()
            plt.savefig('financial_analysis_output/charts/distribution_plots.png')
            plt.close()

            # 2. Box Plots with Robust Data Handling
            plt.figure(figsize=(15, 8))
            # Prepare data for box plot
            box_data = pd.DataFrame({
                col: prepare_visualization_data(col) for col in self.numeric_columns
            })
            
            box_data.boxplot()
            plt.title('Box Plot of Financial Metrics')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig('financial_analysis_output/charts/boxplot_metrics.png')
            plt.close()

            # 3. Correlation Heatmap
            plt.figure(figsize=(12, 10))
            
            # Compute correlation matrix with robust numeric conversion
            correlation_columns = [col for col in self.numeric_columns if pd.api.types.is_numeric_dtype(self.df[col])]
            correlation_data = self.df[correlation_columns].apply(pd.to_numeric, errors='coerce')
            correlation_matrix = correlation_data.corr()
            
            sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, 
                        square=True, linewidths=0.5, cbar_kws={"shrink": .8})
            plt.title('Correlation Heatmap of Financial Metrics')
            plt.tight_layout()
            plt.savefig('financial_analysis_output/charts/correlation_heatmap.png')
            plt.close()

            # 4. Scatter Plot: Market Cap vs EPS
            plt.figure(figsize=(15, 10))
            
            # Prepare scatter plot data
            scatter_data = self.df.copy()
            scatter_data['Market Cap'] = pd.to_numeric(scatter_data['Market Cap'], errors='coerce')
            scatter_data['EPS'] = pd.to_numeric(scatter_data['EPS'], errors='coerce')
            scatter_data['Dividend Yield'] = pd.to_numeric(scatter_data['Dividend Yield'], errors='coerce')
            
            # Remove rows with NA values
            scatter_data = scatter_data.dropna(subset=['Market Cap', 'EPS', 'Dividend Yield'])
            
            plt.scatter(
                scatter_data['Market Cap'], 
                scatter_data['EPS'], 
                s=scatter_data['Dividend Yield']*100,  # Bubble size based on dividend yield
                alpha=0.5
            )
            plt.xlabel('Market Cap (log scale)')
            plt.ylabel('Earnings Per Share')
            plt.title('Market Cap vs EPS (Bubble Size: Dividend Yield)')
            plt.xscale('log')
            plt.tight_layout()
            plt.savefig('financial_analysis_output/charts/market_cap_eps_bubble.png')
            plt.close()

            logger.info("Basic visualizations generated successfully")

        except ImportError as import_error:
            # Detailed logging for import failures
            logger.error(f"Visualization library import failed: {import_error}")
            logger.warning("Please install the following dependencies:")
            logger.warning("pip install matplotlib seaborn")
        
        except Exception as e:
            # Comprehensive error logging
            logger.error(f"Unexpected error in visualization generation: {e}")
            logger.error(traceback.format_exc())

    def import_optional_deps():
        """
        Enhanced dependency import with more flexible handling
        """
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
                # Create mock objects for critical dependencies
                if module == 'scipy.stats':
                    class MockStats:
                        @staticmethod
                        def skew(data):
                            return np.mean([(x - np.mean(data))**3 for x in data]) / (np.std(data)**3)
                        
                        @staticmethod
                        def kurtosis(data):
                            return np.mean([(x - np.mean(data))**4 for x in data]) / (np.std(data)**4) - 3
                    
                    installed_deps[module] = MockStats
                
                logger.warning(f"Optional dependency {package} not found. Some advanced features will be limited.")
        
        return installed_deps
    
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
    
    # # Generate basic visualizations
    try:
        stat_analyzer.generate_basic_visualizations()
    except Exception as viz_error:
        logger.error(f"Visualization generation failed: {viz_error}")
        logger.warning("Some visualizations may not have been created")
    
    # Generate advanced analysis
    advanced_insights = stat_analyzer.generate_advanced_analysis()
    
    # Print key insights
    print("\n🚀 Statistical Analysis Complete 🚀")
    print("\nAdvanced Insights:")
    print(advanced_insights)

if __name__ == "__main__":
    main()