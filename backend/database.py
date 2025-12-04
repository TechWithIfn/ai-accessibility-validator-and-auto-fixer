"""
Database setup and models for storing accessibility scan reports
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

# Database file path
DB_PATH = Path(__file__).parent / "accessibility_reports.db"


class Database:
    """SQLite database manager for accessibility reports"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or str(DB_PATH)
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        return conn
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create reports table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                domain TEXT,
                scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                score REAL NOT NULL,
                wcag_level TEXT NOT NULL,
                total_issues INTEGER NOT NULL,
                issues_json TEXT NOT NULL,
                severity_breakdown TEXT,
                scan_duration REAL,
                html_content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_domain ON reports(domain)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_scan_date ON reports(scan_date)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_url ON reports(url)
        """)
        
        conn.commit()
        conn.close()
        print(f"✅ Database initialized at {self.db_path}")
    
    def save_report(
        self,
        url: str,
        score: float,
        wcag_level: str,
        total_issues: int,
        issues: List[Dict[str, Any]],
        scan_duration: Optional[float] = None,
        html_content: Optional[str] = None
    ) -> int:
        """
        Save a scan report to the database
        
        Returns:
            Report ID
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Extract domain from URL
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc or url
        
        # Calculate severity breakdown
        severity_breakdown = {
            "critical": len([i for i in issues if i.get("severity") == "critical"]),
            "high": len([i for i in issues if i.get("severity") == "high"]),
            "medium": len([i for i in issues if i.get("severity") == "medium"]),
            "low": len([i for i in issues if i.get("severity") == "low"])
        }
        
        # Convert issues and severity breakdown to JSON
        issues_json = json.dumps(issues)
        severity_json = json.dumps(severity_breakdown)
        
        # Insert report
        cursor.execute("""
            INSERT INTO reports (
                url, domain, score, wcag_level, total_issues,
                issues_json, severity_breakdown, scan_duration, html_content
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            url,
            domain,
            score,
            wcag_level,
            total_issues,
            issues_json,
            severity_json,
            scan_duration,
            html_content[:10000] if html_content else None  # Limit HTML size
        ))
        
        report_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"✅ Report saved to database (ID: {report_id})")
        return report_id
    
    def get_report(self, report_id: int) -> Optional[Dict[str, Any]]:
        """Get a single report by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM reports WHERE id = ?
        """, (report_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        return self._row_to_dict(row)
    
    def get_all_reports(
        self,
        limit: int = 100,
        offset: int = 0,
        domain: Optional[str] = None,
        order_by: str = "scan_date",
        order_dir: str = "DESC"
    ) -> List[Dict[str, Any]]:
        """
        Get all reports with optional filtering
        
        Args:
            limit: Maximum number of reports to return
            offset: Number of reports to skip
            domain: Filter by domain
            order_by: Column to order by
            order_dir: Order direction (ASC/DESC)
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM reports"
        params = []
        
        if domain:
            query += " WHERE domain LIKE ?"
            params.append(f"%{domain}%")
        
        # Validate order_by to prevent SQL injection
        valid_columns = ["scan_date", "score", "total_issues", "domain", "created_at"]
        if order_by not in valid_columns:
            order_by = "scan_date"
        
        order_dir = "DESC" if order_dir.upper() == "DESC" else "ASC"
        
        query += f" ORDER BY {order_by} {order_dir} LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        return [self._row_to_dict(row) for row in rows]
    
    def get_reports_by_url(self, url: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get all reports for a specific URL"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM reports 
            WHERE url = ? 
            ORDER BY scan_date DESC 
            LIMIT ?
        """, (url, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [self._row_to_dict(row) for row in rows]
    
    def get_reports_by_domain(self, domain: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all reports for a specific domain"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM reports 
            WHERE domain = ? 
            ORDER BY scan_date DESC 
            LIMIT ?
        """, (domain, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [self._row_to_dict(row) for row in rows]
    
    def delete_report(self, report_id: int) -> bool:
        """Delete a report by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM reports WHERE id = ?", (report_id,))
        deleted = cursor.rowcount > 0
        
        conn.commit()
        conn.close()
        
        return deleted
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Total reports
        cursor.execute("SELECT COUNT(*) as total FROM reports")
        total = cursor.fetchone()["total"]
        
        # Average score
        cursor.execute("SELECT AVG(score) as avg_score FROM reports")
        avg_score = cursor.fetchone()["avg_score"] or 0
        
        # Total issues
        cursor.execute("SELECT SUM(total_issues) as total_issues FROM reports")
        total_issues = cursor.fetchone()["total_issues"] or 0
        
        # Unique domains
        cursor.execute("SELECT COUNT(DISTINCT domain) as unique_domains FROM reports")
        unique_domains = cursor.fetchone()["unique_domains"]
        
        # Recent scans (last 24 hours)
        cursor.execute("""
            SELECT COUNT(*) as recent FROM reports 
            WHERE scan_date > datetime('now', '-1 day')
        """)
        recent = cursor.fetchone()["recent"]
        
        conn.close()
        
        return {
            "total_reports": total,
            "average_score": round(avg_score, 2),
            "total_issues": total_issues,
            "unique_domains": unique_domains,
            "recent_scans_24h": recent
        }
    
    def _row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        """Convert database row to dictionary"""
        report = dict(row)
        
        # Parse JSON fields
        if report.get("issues_json"):
            report["issues"] = json.loads(report["issues_json"])
        else:
            report["issues"] = []
        
        if report.get("severity_breakdown"):
            report["severity_breakdown"] = json.loads(report["severity_breakdown"])
        else:
            report["severity_breakdown"] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        
        # Format dates
        if report.get("scan_date"):
            report["date"] = report["scan_date"]
        
        # Calculate top issues
        issues = report.get("issues", [])
        issue_counts = {}
        for issue in issues:
            issue_type = issue.get("type", "unknown")
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
        
        report["topIssues"] = [
            {"type": issue_type, "count": count}
            for issue_type, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        # Remove JSON fields (already parsed)
        report.pop("issues_json", None)
        report.pop("html_content", None)  # Don't send HTML to frontend
        
        return report


# Global database instance
db = Database()

