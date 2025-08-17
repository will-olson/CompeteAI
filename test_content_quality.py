#!/usr/bin/env python3
"""
Content Quality Testing Script
Examines actual scraped content for relevance and technical depth
"""

from real_data_scraper import RealDataCompetitiveScraper

def test_content_relevance():
    """Test content relevance and technical depth"""
    print("🎯 CONTENT QUALITY & RELEVANCE TESTING")
    print("=" * 50)
    
    scraper = RealDataCompetitiveScraper()
    
    # Test with companies known to have good technical content
    test_companies = ['PowerBI', 'Databricks', 'Snowflake']
    
    for company in test_companies:
        print(f"\n🔍 ANALYZING: {company}")
        print("-" * 30)
        
        try:
            company_data = scraper.scrape_competitor(company)
            
            if company_data['status'] == 'success':
                docs = company_data.get('scraped_docs', [])
                print(f"✅ Status: Success")
                print(f"📊 Total Documents: {len(docs)}")
                
                for i, doc in enumerate(docs):
                    print(f"\n📄 Document {i+1}:")
                    print(f"  URL: {doc['url']}")
                    
                    content = doc.get('content', '')
                    content_length = len(content)
                    print(f"  📏 Content Length: {content_length:,} characters")
                    
                    # Analyze technical keywords
                    content_lower = content.lower()
                    
                    # API-related keywords
                    api_keywords = ['api', 'endpoint', 'rest', 'graphql', 'sdk', 'authentication', 'oauth']
                    api_matches = [kw for kw in api_keywords if kw in content_lower]
                    print(f"  🔌 API Keywords Found: {len(api_matches)}/{len(api_keywords)}")
                    if api_matches:
                        print(f"     Found: {', '.join(api_matches)}")
                    
                    # Cloud-related keywords
                    cloud_keywords = ['cloud', 'azure', 'aws', 'scaling', 'serverless', 'container', 'kubernetes']
                    cloud_matches = [kw for kw in cloud_keywords if kw in content_lower]
                    print(f"  ☁️  Cloud Keywords Found: {len(cloud_matches)}/{len(cloud_keywords)}")
                    if cloud_matches:
                        print(f"     Found: {', '.join(cloud_matches)}")
                    
                    # Data-related keywords
                    data_keywords = ['database', 'sql', 'etl', 'pipeline', 'connector', 'integration', 'analytics']
                    data_matches = [kw for kw in data_keywords if kw in content_lower]
                    print(f"  📊 Data Keywords Found: {len(data_matches)}/{len(data_keywords)}")
                    if data_matches:
                        print(f"     Found: {', '.join(data_matches)}")
                    
                    # Content preview (first 200 chars)
                    content_preview = content[:200].replace('\n', ' ').strip()
                    print(f"  📝 Content Preview: {content_preview}...")
                    
                    # Calculate technical relevance score
                    total_keywords = len(api_keywords) + len(cloud_keywords) + len(data_keywords)
                    found_keywords = len(api_matches) + len(cloud_matches) + len(data_matches)
                    relevance_score = (found_keywords / total_keywords) * 100
                    print(f"  ⭐ Technical Relevance Score: {relevance_score:.1f}%")
                    
            else:
                print(f"❌ Status: Failed - {company_data.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🏁 CONTENT QUALITY TESTING COMPLETE")

def test_strategic_analysis_accuracy():
    """Test accuracy of strategic analysis scoring"""
    print("\n📈 STRATEGIC ANALYSIS ACCURACY TESTING")
    print("=" * 50)
    
    scraper = RealDataCompetitiveScraper()
    
    # Test with a company that should have high API scores
    test_company = "PowerBI"  # Known to have API=60.0
    
    try:
        company_data = scraper.scrape_competitor(test_company)
        
        if company_data['status'] == 'success':
            strategic = company_data.get('strategic_analysis', {})
            
            print(f"🏢 {test_company} Strategic Analysis Validation:")
            print("-" * 40)
            
            for dimension, analysis in strategic.items():
                score = analysis.get('score', 0)
                indicators = analysis.get('indicators', 0)
                content_count = analysis.get('content_count', 0)
                
                print(f"  📊 {dimension.replace('_', ' ').title()}:")
                print(f"    Score: {score:.1f}/100")
                print(f"    Indicators Found: {indicators}")
                print(f"    Content Analyzed: {content_count}")
                
                # Validate scoring logic
                if content_count > 0:
                    expected_score = min(100, (indicators / content_count) * 20)
                    score_accuracy = "✅" if abs(score - expected_score) < 0.1 else "❌"
                    print(f"    Expected Score: {expected_score:.1f}")
                    print(f"    Score Accuracy: {score_accuracy}")
                print()
                
        else:
            print(f"❌ {test_company} failed: {company_data.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Strategic analysis test failed: {e}")
    
    print("=" * 50)

if __name__ == "__main__":
    test_content_relevance()
    test_strategic_analysis_accuracy()
