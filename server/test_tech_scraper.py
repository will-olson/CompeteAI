# test_tech_scraper.py
# Simple test script for the tech companies scraper
import json
import time
from tech_companies_scraper import TechCompaniesScraper

def test_single_company():
    """Test scraping a single company"""
    print("Testing single company scraping...")
    
    scraper = TechCompaniesScraper()
    try:
        # Test with a well-known company
        company_data = scraper.scrape_company_data(
            company_name="Salesforce",
            categories=['marketing', 'docs'],
            max_pages=2
        )
        
        print(f"Successfully scraped {company_data['company_name']}")
        print(f"Categories processed: {list(company_data['categories'].keys())}")
        print(f"Total words: {company_data['summary']['total_words']}")
        
        # Save results
        with open('test_salesforce_scraping.json', 'w') as f:
            json.dump(company_data, f, indent=2)
        print("Results saved to test_salesforce_scraping.json")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        scraper.cleanup()

def test_category_scraping():
    """Test scraping companies from a specific category"""
    print("Testing category-based scraping...")
    
    scraper = TechCompaniesScraper()
    try:
        # Test with collaboration tools category
        results = scraper.scrape_by_category(
            category='collaboration_tools',
            company_limit=3
        )
        
        print(f"Successfully scraped {results['summary']['successful_companies']} companies")
        print(f"Total pages: {results['summary']['total_pages']}")
        print(f"Total words: {results['summary']['total_words']}")
        
        # Save results
        with open('test_collaboration_tools.json', 'w') as f:
            json.dump(results, f, indent=2)
        print("Results saved to test_collaboration_tools.json")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        scraper.cleanup()

def test_random_companies():
    """Test scraping random companies"""
    print("Testing random company scraping...")
    
    scraper = TechCompaniesScraper()
    try:
        # Test with 3 random companies
        results = scraper.scrape_random_companies(
            count=3,
            categories=['marketing', 'docs']
        )
        
        print(f"Successfully scraped {results['summary']['successful_companies']} companies")
        print(f"Companies processed: {list(results['companies'].keys())}")
        
        # Save results
        with open('test_random_companies.json', 'w') as f:
            json.dump(results, f, indent=2)
        print("Results saved to test_random_companies.json")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        scraper.cleanup()

def test_url_generation():
    """Test URL generation for companies"""
    print("Testing URL generation...")
    
    scraper = TechCompaniesScraper()
    
    test_companies = ["Salesforce", "HubSpot", "Slack", "Notion"]
    
    for company in test_companies:
        urls = scraper.generate_company_urls(company)
        print(f"\n{company}:")
        for category, url_list in urls.items():
            print(f"  {category}: {url_list[0]}")  # Show first URL for each category

def main():
    """Main test function"""
    print("Tech Companies Scraper Test Suite")
    print("=" * 40)
    
    # Test URL generation first (no web scraping)
    test_url_generation()
    
    print("\n" + "=" * 40)
    print("Starting web scraping tests...")
    print("Note: These tests will take time and require internet connection")
    
    # Uncomment the tests you want to run
    # test_single_company()
    # test_category_scraping()
    # test_random_companies()
    
    print("\nTests completed!")
    print("Check the generated JSON files for detailed results")

if __name__ == "__main__":
    main() 