#!/usr/bin/env python3
"""
Competitive Intelligence Database Management

This module handles the SQLite database operations for storing and retrieving
competitive intelligence data across companies and dimensions.
"""

import sqlite3
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CompetitiveIntelligenceDB:
    """Database manager for competitive intelligence data"""
    
    def __init__(self, db_path: str = "competitive_intelligence.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Create companies table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS companies (
                        id INTEGER PRIMARY KEY,
                        name TEXT UNIQUE NOT NULL,
                        domain TEXT,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Create dimensions table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS dimensions (
                        id INTEGER PRIMARY KEY,
                        name TEXT UNIQUE NOT NULL,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Create competitive intelligence data table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS competitive_intelligence (
                        id INTEGER PRIMARY KEY,
                        company_id INTEGER,
                        dimension_id INTEGER,
                        source_type TEXT NOT NULL,
                        source_url TEXT,
                        title TEXT,
                        content TEXT,
                        sentiment TEXT,
                        rating REAL,
                        relevance_score REAL,
                        confidence_score REAL,
                        extraction_date TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (company_id) REFERENCES companies(id),
                        FOREIGN KEY (dimension_id) REFERENCES dimensions(id)
                    )
                """)
                
                # Create aggregated scores table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS dimension_scores (
                        id INTEGER PRIMARY KEY,
                        company_id INTEGER,
                        dimension_id INTEGER,
                        aggregated_score REAL,
                        data_points_count INTEGER,
                        last_updated TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (company_id) REFERENCES companies(id),
                        FOREIGN KEY (dimension_id) REFERENCES dimensions(id),
                        UNIQUE(company_id, dimension_id)
                    )
                """)
                
                # Create indexes for better performance
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_company_dimension 
                    ON competitive_intelligence(company_id, dimension_id)
                """)
                
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_source_type 
                    ON competitive_intelligence(source_type)
                """)
                
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_extraction_date 
                    ON competitive_intelligence(extraction_date)
                """)
                
                conn.commit()
                logger.info("Database initialized successfully")
                
                # Insert default dimensions if they don't exist
                self._insert_default_dimensions()
                
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise
    
    def _insert_default_dimensions(self):
        """Insert the 10 strategic dimensions if they don't exist"""
        dimensions = [
            ('spreadsheet_interface', 'Excel-like functionality and user experience'),
            ('semantic_layer_integration', 'Data modeling and business logic capabilities'),
            ('data_app_development', 'Custom application building and deployment'),
            ('multi_modal_development', 'Support for various development approaches'),
            ('writeback', 'Data modification and write capabilities'),
            ('ai_model_flexibility', 'AI/ML integration and customization options'),
            ('unstructured_data_querying', 'Text, image, and document analysis'),
            ('governed_collaboration', 'Team collaboration with governance controls'),
            ('materialization_controls', 'Data pipeline and caching management'),
            ('lineage', 'Data provenance and audit trail capabilities')
        ]
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                for name, description in dimensions:
                    cursor.execute("""
                        INSERT OR IGNORE INTO dimensions (name, description)
                        VALUES (?, ?)
                    """, (name, description))
                
                conn.commit()
                logger.info("Default dimensions inserted")
                
        except Exception as e:
            logger.error(f"Error inserting default dimensions: {e}")
    
    def insert_company(self, name: str, domain: str = None, description: str = None) -> int:
        """Insert a new company and return its ID"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT OR REPLACE INTO companies (name, domain, description, updated_at)
                    VALUES (?, ?, ?, ?)
                """, (name, domain, description, datetime.now()))
                
                if cursor.rowcount == 0:
                    # Get existing company ID
                    cursor.execute("SELECT id FROM companies WHERE name = ?", (name,))
                    company_id = cursor.fetchone()[0]
                else:
                    company_id = cursor.lastrowid
                
                conn.commit()
                logger.info(f"Company {name} inserted/updated with ID {company_id}")
                return company_id
                
        except Exception as e:
            logger.error(f"Error inserting company {name}: {e}")
            raise
    
    def get_company_id(self, name: str) -> Optional[int]:
        """Get company ID by name"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("SELECT id FROM companies WHERE name = ?", (name,))
                result = cursor.fetchone()
                
                return result[0] if result else None
                
        except Exception as e:
            logger.error(f"Error getting company ID for {name}: {e}")
            return None
    
    def get_dimension_id(self, name: str) -> Optional[int]:
        """Get dimension ID by name"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("SELECT id FROM dimensions WHERE name = ?", (name,))
                result = cursor.fetchone()
                
                return result[0] if result else None
                
        except Exception as e:
            logger.error(f"Error getting dimension ID for {name}: {e}")
            return None
    
    def insert_competitive_intelligence(self, company_name: str, dimension: str, 
                                     data: List[Dict[str, Any]]) -> int:
        """Insert competitive intelligence data for a company and dimension"""
        try:
            company_id = self.insert_company(company_name)
            dimension_id = self.get_dimension_id(dimension)
            
            if not dimension_id:
                logger.error(f"Dimension {dimension} not found")
                return 0
            
            inserted_count = 0
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                for item in data:
                    cursor.execute("""
                        INSERT INTO competitive_intelligence (
                            company_id, dimension_id, source_type, source_url,
                            title, content, sentiment, rating, relevance_score,
                            confidence_score, extraction_date
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        company_id, dimension_id,
                        item.get('source_type', 'unknown'),
                        item.get('source_url'),
                        item.get('title'),
                        item.get('content', ''),
                        item.get('sentiment'),
                        item.get('rating'),
                        item.get('relevance_score', 0.0),
                        item.get('confidence_score', 0.0),
                        item.get('extraction_date', datetime.now().isoformat())
                    ))
                    
                    inserted_count += 1
                
                conn.commit()
                logger.info(f"Inserted {inserted_count} competitive intelligence records for {company_name} - {dimension}")
                
                # Update aggregated scores
                self._update_aggregated_scores(company_id, dimension_id)
                
                return inserted_count
                
        except Exception as e:
            logger.error(f"Error inserting competitive intelligence for {company_name} - {dimension}: {e}")
            raise
    
    def _update_aggregated_scores(self, company_id: int, dimension_id: int):
        """Update aggregated scores for a company and dimension"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Calculate aggregated score
                cursor.execute("""
                    SELECT AVG(relevance_score), COUNT(*)
                    FROM competitive_intelligence
                    WHERE company_id = ? AND dimension_id = ?
                """, (company_id, dimension_id))
                
                result = cursor.fetchone()
                if result and result[0]:
                    avg_score = result[0]
                    count = result[1]
                    
                    # Insert or update aggregated score
                    cursor.execute("""
                        INSERT OR REPLACE INTO dimension_scores 
                        (company_id, dimension_id, aggregated_score, data_points_count, last_updated)
                        VALUES (?, ?, ?, ?, ?)
                    """, (company_id, dimension_id, avg_score, count, datetime.now()))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"Error updating aggregated scores: {e}")
    
    def get_competitive_intelligence(self, company_name: str, dimension: str) -> List[Dict[str, Any]]:
        """Get competitive intelligence data for a company and dimension"""
        try:
            company_id = self.get_company_id(company_name)
            dimension_id = self.get_dimension_id(dimension)
            
            if not company_id or not dimension_id:
                return []
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT ci.*, c.name as company_name, d.name as dimension_name
                    FROM competitive_intelligence ci
                    JOIN companies c ON ci.company_id = c.id
                    JOIN dimensions d ON ci.dimension_id = d.id
                    WHERE ci.company_id = ? AND ci.dimension_id = ?
                    ORDER BY ci.relevance_score DESC, ci.extraction_date DESC
                """, (company_id, dimension_id))
                
                columns = [description[0] for description in cursor.description]
                results = []
                
                for row in cursor.fetchall():
                    result = dict(zip(columns, row))
                    results.append(result)
                
                return results
                
        except Exception as e:
            logger.error(f"Error getting competitive intelligence for {company_name} - {dimension}: {e}")
            return []
    
    def get_company_dimension_score(self, company_name: str, dimension: str) -> Optional[Dict[str, Any]]:
        """Get aggregated score for a company and dimension"""
        try:
            company_id = self.get_company_id(company_name)
            dimension_id = self.get_dimension_id(dimension)
            
            if not company_id or not dimension_id:
                return None
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT ds.*, c.name as company_name, d.name as dimension_name
                    FROM dimension_scores ds
                    JOIN companies c ON ds.company_id = c.id
                    JOIN dimensions d ON ds.dimension_id = d.id
                    WHERE ds.company_id = ? AND ds.dimension_id = ?
                """, (company_id, dimension_id))
                
                result = cursor.fetchone()
                if result:
                    columns = [description[0] for description in cursor.description]
                    return dict(zip(columns, result))
                
                return None
                
        except Exception as e:
            logger.error(f"Error getting dimension score for {company_name} - {dimension}: {e}")
            return None
    
    def get_all_companies(self) -> List[Dict[str, Any]]:
        """Get all companies in the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("SELECT * FROM companies ORDER BY name")
                
                columns = [description[0] for description in cursor.description]
                results = []
                
                for row in cursor.fetchall():
                    result = dict(zip(columns, row))
                    results.append(result)
                
                return results
                
        except Exception as e:
            logger.error(f"Error getting all companies: {e}")
            return []
    
    def get_all_dimensions(self) -> List[Dict[str, Any]]:
        """Get all dimensions in the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("SELECT * FROM dimensions ORDER BY name")
                
                columns = [description[0] for description in cursor.description]
                results = []
                
                for row in cursor.fetchall():
                    result = dict(zip(columns, row))
                    results.append(result)
                
                return results
                
        except Exception as e:
            logger.error(f"Error getting all dimensions: {e}")
            return []
    
    def get_company_overview(self, company_name: str) -> Dict[str, Any]:
        """Get comprehensive overview for a company across all dimensions"""
        try:
            company_id = self.get_company_id(company_name)
            if not company_id:
                return {}
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get company info
                cursor.execute("SELECT * FROM companies WHERE id = ?", (company_id,))
                company_result = cursor.fetchone()
                
                if not company_result:
                    return {}
                
                company_columns = [description[0] for description in cursor.description]
                company_info = dict(zip(company_columns, company_result))
                
                # Get scores for all dimensions
                cursor.execute("""
                    SELECT ds.*, d.name as dimension_name, d.description as dimension_description
                    FROM dimension_scores ds
                    JOIN dimensions d ON ds.dimension_id = d.id
                    WHERE ds.company_id = ?
                    ORDER BY d.name
                """, (company_id,))
                
                dimension_scores = []
                columns = [description[0] for description in cursor.description]
                
                for row in cursor.fetchall():
                    score_info = dict(zip(columns, row))
                    dimension_scores.append(score_info)
                
                # Get recent competitive intelligence
                cursor.execute("""
                    SELECT ci.*, d.name as dimension_name
                    FROM competitive_intelligence ci
                    JOIN dimensions d ON ci.dimension_id = d.id
                    WHERE ci.company_id = ?
                    ORDER BY ci.extraction_date DESC
                    LIMIT 20
                """, (company_id,))
                
                recent_intelligence = []
                columns = [description[0] for description in cursor.description]
                
                for row in cursor.fetchall():
                    intel_info = dict(zip(columns, row))
                    recent_intelligence.append(intel_info)
                
                return {
                    'company_info': company_info,
                    'dimension_scores': dimension_scores,
                    'recent_intelligence': recent_intelligence,
                    'total_dimensions': len(dimension_scores),
                    'total_intelligence_items': len(recent_intelligence)
                }
                
        except Exception as e:
            logger.error(f"Error getting company overview for {company_name}: {e}")
            return {}
    
    def export_company_data_json(self, company_name: str, output_file: str = None) -> str:
        """Export company data to JSON format"""
        try:
            company_data = self.get_company_overview(company_name)
            
            if not company_data:
                return ""
            
            if not output_file:
                output_file = f"{company_name.lower().replace(' ', '_')}_competitive_intelligence.json"
            
            with open(output_file, 'w') as f:
                json.dump(company_data, f, indent=2, default=str)
            
            logger.info(f"Exported {company_name} data to {output_file}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error exporting company data for {company_name}: {e}")
            return ""
    
    def cleanup_old_data(self, days_old: int = 90):
        """Clean up competitive intelligence data older than specified days"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_old)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    DELETE FROM competitive_intelligence
                    WHERE extraction_date < ?
                """, (cutoff_date.isoformat(),))
                
                deleted_count = cursor.rowcount
                conn.commit()
                
                logger.info(f"Cleaned up {deleted_count} old competitive intelligence records")
                
                # Update aggregated scores for affected companies/dimensions
                self._update_all_aggregated_scores()
                
        except Exception as e:
            logger.error(f"Error cleaning up old data: {e}")
    
    def _update_all_aggregated_scores(self):
        """Update aggregated scores for all company-dimension combinations"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get all company-dimension combinations
                cursor.execute("""
                    SELECT DISTINCT company_id, dimension_id
                    FROM competitive_intelligence
                """)
                
                combinations = cursor.fetchall()
                
                for company_id, dimension_id in combinations:
                    self._update_aggregated_scores(company_id, dimension_id)
                
        except Exception as e:
            logger.error(f"Error updating all aggregated scores: {e}")

def main():
    """Test the database functionality"""
    db = CompetitiveIntelligenceDB("test_competitive_intelligence.db")
    
    # Test inserting a company
    company_id = db.insert_company("Test Company", "https://test.com", "A test company")
    print(f"Inserted company with ID: {company_id}")
    
    # Test getting dimensions
    dimensions = db.get_all_dimensions()
    print(f"Found {len(dimensions)} dimensions")
    
    # Test getting companies
    companies = db.get_all_companies()
    print(f"Found {len(companies)} companies")
    
    # Clean up test database
    os.remove("test_competitive_intelligence.db")
    print("Test completed successfully")

if __name__ == "__main__":
    main()
