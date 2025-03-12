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
    def __init__(self, dataframe):
        # Import optional dependencies
        self.deps = import_optional_deps()
        
        self.df = dataframe
        self.numeric_columns = None
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
        
        # Drop rows with NA values in critical columns
        self.df = self.df.dropna(subset=self.numeric_columns)

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

def main():
    # Simplified main function for broader compatibility
    try:
        from advanced_financial_analysis import AdvancedFinancialAnalyzer
        import os
    except ImportError:
        print("Could not import AdvancedFinancialAnalyzer. Provide a DataFrame manually.")
        return

    # Initialize the financial analyzer
    analyzer = AdvancedFinancialAnalyzer(os.getenv('OPENAI_API_KEY'))
    
    # Create statistical analyzer
    stat_analyzer = AdvancedStatisticalAnalyzer(analyzer.df)
    
    # Generate basic report
    report = stat_analyzer.generate_comprehensive_report()
    
    # Generate basic visualizations
    stat_analyzer.generate_basic_visualizations()
    
    # Print key insights
    print("Basic Statistical Analysis Complete")
    print("\nKey Insights:")
    for section, data in report.items():
        print(f"\n{section}:")
        print(data)

if __name__ == "__main__":
    main()