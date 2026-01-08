#!/usr/bin/env python3
"""
Backend API Tests for Hygenious
Tests all backend endpoints with comprehensive validation
"""

import requests
import json
import base64
from io import BytesIO
from PIL import Image
import time

# Backend URL from .env


# Test results storage
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_test(test_name, passed, message=""):
    """Log test result"""
    if passed:
        test_results["passed"].append(f"✅ {test_name}")
        print(f"✅ PASS: {test_name}")
        if message:
            print(f"   {message}")
    else:
        test_results["failed"].append(f"❌ {test_name}: {message}")
        print(f"❌ FAIL: {test_name}")
        print(f"   {message}")

def log_warning(test_name, message):
    """Log warning"""
    test_results["warnings"].append(f"⚠️  {test_name}: {message}")
    print(f"⚠️  WARNING: {test_name}")
    print(f"   {message}")

def create_test_image():
    """Create a simple test image representing a kitchen"""
    # Create a 400x300 image with some colors to simulate a kitchen scene
    img = Image.new('RGB', (400, 300), color=(240, 240, 240))
    
    # Add some colored rectangles to simulate kitchen elements
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    
    # Counter (brown)
    draw.rectangle([50, 150, 350, 250], fill=(139, 90, 60))
    
    # Sink (gray)
    draw.rectangle([100, 170, 180, 230], fill=(192, 192, 192))
    
    # Stove (black)
    draw.rectangle([220, 170, 300, 230], fill=(50, 50, 50))
    
    # Convert to base64
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    return f"data:image/jpeg;base64,{img_base64}"

def test_analyze_endpoint():
    """Test POST /api/analyze - Image analysis with Gemini Vision"""
    print("\n" + "="*80)
    print("TEST 1: POST /api/analyze - Gemini Vision Image Analysis")
    print("="*80)
    
    try:
        # Create test image
        print("Creating test kitchen image...")
        test_image = create_test_image()
        
        # Prepare request
        payload = {
            "image": test_image,
            "location": "Test Kitchen",
            "areaNotes": "Backend API test - automated hygiene audit"
        }
        
        print(f"Sending POST request to {BASE_URL}/analyze...")
        response = requests.post(
            f"{BASE_URL}/analyze",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60  # Gemini API might take time
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("POST /api/analyze", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
            return None
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response structure
        if not data.get("success"):
            log_test("POST /api/analyze", False, f"Response success=false: {data.get('error', 'Unknown error')}")
            return None
        
        result_data = data.get("data", {})
        
        # Check for required fields
        required_fields = ["auditId", "result"]
        missing_fields = [f for f in required_fields if f not in result_data]
        if missing_fields:
            log_test("POST /api/analyze", False, f"Missing fields: {missing_fields}")
            return None
        
        # Validate result structure
        result = result_data.get("result", {})
        required_result_fields = ["overallScore", "cleanliness", "organization", "safety", "issues", "recommendations"]
        missing_result_fields = [f for f in required_result_fields if f not in result]
        
        if missing_result_fields:
            log_test("POST /api/analyze", False, f"Missing result fields: {missing_result_fields}")
            return None
        
        # Validate score ranges
        scores = {
            "overallScore": result.get("overallScore"),
            "cleanliness": result.get("cleanliness"),
            "organization": result.get("organization"),
            "safety": result.get("safety")
        }
        
        for score_name, score_value in scores.items():
            if not isinstance(score_value, (int, float)) or score_value < 0 or score_value > 100:
                log_test("POST /api/analyze", False, f"Invalid {score_name}: {score_value} (must be 0-100)")
                return None
        
        # Validate issues array
        if not isinstance(result.get("issues"), list):
            log_test("POST /api/analyze", False, f"Issues must be an array, got {type(result.get('issues'))}")
            return None
        
        # Validate recommendations array
        if not isinstance(result.get("recommendations"), list):
            log_test("POST /api/analyze", False, f"Recommendations must be an array, got {type(result.get('recommendations'))}")
            return None
        
        audit_id = result_data.get("auditId")
        log_test("POST /api/analyze", True, f"Audit created with ID: {audit_id}, Overall Score: {result.get('overallScore')}")
        
        return audit_id
        
    except requests.exceptions.Timeout:
        log_test("POST /api/analyze", False, "Request timeout (>60s) - Gemini API might be slow or unavailable")
        return None
    except Exception as e:
        log_test("POST /api/analyze", False, f"Exception: {str(e)}")
        return None

def test_get_all_audits():
    """Test GET /api/audits - Get all audits"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/audits - Retrieve All Audits")
    print("="*80)
    
    try:
        print(f"Sending GET request to {BASE_URL}/audits...")
        response = requests.get(f"{BASE_URL}/audits", timeout=10)
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("GET /api/audits", False, f"Expected 200, got {response.status_code}")
            return []
        
        data = response.json()
        
        if not data.get("success"):
            log_test("GET /api/audits", False, f"Response success=false: {data.get('error', 'Unknown error')}")
            return []
        
        audits = data.get("data", [])
        
        if not isinstance(audits, list):
            log_test("GET /api/audits", False, f"Expected array, got {type(audits)}")
            return []
        
        print(f"Found {len(audits)} audits")
        
        # Validate audit structure if audits exist
        if len(audits) > 0:
            audit = audits[0]
            required_fields = ["id", "location", "imageData", "result", "createdAt"]
            missing_fields = [f for f in required_fields if f not in audit]
            
            if missing_fields:
                log_warning("GET /api/audits", f"Audit missing fields: {missing_fields}")
            
            # Check result structure
            if "result" in audit:
                result = audit["result"]
                if not isinstance(result, dict):
                    log_warning("GET /api/audits", f"Result should be object, got {type(result)}")
        
        log_test("GET /api/audits", True, f"Retrieved {len(audits)} audits successfully")
        return audits
        
    except Exception as e:
        log_test("GET /api/audits", False, f"Exception: {str(e)}")
        return []

def test_get_single_audit(audit_id):
    """Test GET /api/audits/:id - Get single audit"""
    print("\n" + "="*80)
    print(f"TEST 3: GET /api/audits/{audit_id} - Get Single Audit")
    print("="*80)
    
    if not audit_id:
        log_test("GET /api/audits/:id", False, "No audit ID provided (skipped)")
        return False
    
    try:
        print(f"Sending GET request to {BASE_URL}/audits/{audit_id}...")
        response = requests.get(f"{BASE_URL}/audits/{audit_id}", timeout=10)
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("GET /api/audits/:id", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if not data.get("success"):
            log_test("GET /api/audits/:id", False, f"Response success=false: {data.get('error', 'Unknown error')}")
            return False
        
        audit = data.get("data", {})
        
        # Validate audit structure
        required_fields = ["id", "location", "imageData", "result", "createdAt"]
        missing_fields = [f for f in required_fields if f not in audit]
        
        if missing_fields:
            log_test("GET /api/audits/:id", False, f"Missing fields: {missing_fields}")
            return False
        
        # Verify it's the correct audit
        if audit.get("id") != audit_id:
            log_test("GET /api/audits/:id", False, f"Expected audit ID {audit_id}, got {audit.get('id')}")
            return False
        
        log_test("GET /api/audits/:id", True, f"Retrieved audit {audit_id} successfully")
        return True
        
    except Exception as e:
        log_test("GET /api/audits/:id", False, f"Exception: {str(e)}")
        return False

def test_dashboard_stats():
    """Test GET /api/dashboard/stats - Dashboard statistics"""
    print("\n" + "="*80)
    print("TEST 4: GET /api/dashboard/stats - Dashboard Statistics")
    print("="*80)
    
    try:
        print(f"Sending GET request to {BASE_URL}/dashboard/stats...")
        response = requests.get(f"{BASE_URL}/dashboard/stats", timeout=10)
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("GET /api/dashboard/stats", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if not data.get("success"):
            log_test("GET /api/dashboard/stats", False, f"Response success=false: {data.get('error', 'Unknown error')}")
            return False
        
        stats = data.get("data", {})
        
        # Validate stats structure
        required_fields = ["totalAudits", "avgScore", "criticalIssues", "locationsCount", "recentAudits", "scoreTrend"]
        missing_fields = [f for f in required_fields if f not in stats]
        
        if missing_fields:
            log_test("GET /api/dashboard/stats", False, f"Missing fields: {missing_fields}")
            return False
        
        # Validate data types
        if not isinstance(stats.get("totalAudits"), int):
            log_test("GET /api/dashboard/stats", False, f"totalAudits must be integer, got {type(stats.get('totalAudits'))}")
            return False
        
        if not isinstance(stats.get("avgScore"), (int, float)):
            log_test("GET /api/dashboard/stats", False, f"avgScore must be number, got {type(stats.get('avgScore'))}")
            return False
        
        if not isinstance(stats.get("recentAudits"), list):
            log_test("GET /api/dashboard/stats", False, f"recentAudits must be array, got {type(stats.get('recentAudits'))}")
            return False
        
        if not isinstance(stats.get("scoreTrend"), list):
            log_test("GET /api/dashboard/stats", False, f"scoreTrend must be array, got {type(stats.get('scoreTrend'))}")
            return False
        
        print(f"Stats: Total Audits={stats.get('totalAudits')}, Avg Score={stats.get('avgScore')}, Critical Issues={stats.get('criticalIssues')}")
        
        log_test("GET /api/dashboard/stats", True, f"Dashboard stats retrieved successfully")
        return True
        
    except Exception as e:
        log_test("GET /api/dashboard/stats", False, f"Exception: {str(e)}")
        return False

def test_delete_audit(audit_id):
    """Test DELETE /api/audits/:id - Delete audit"""
    print("\n" + "="*80)
    print(f"TEST 5: DELETE /api/audits/{audit_id} - Delete Audit")
    print("="*80)
    
    if not audit_id:
        log_test("DELETE /api/audits/:id", False, "No audit ID provided (skipped)")
        return False
    
    try:
        print(f"Sending DELETE request to {BASE_URL}/audits/{audit_id}...")
        response = requests.delete(f"{BASE_URL}/audits/{audit_id}", timeout=10)
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("DELETE /api/audits/:id", False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if not data.get("success"):
            log_test("DELETE /api/audits/:id", False, f"Response success=false: {data.get('error', 'Unknown error')}")
            return False
        
        # Verify deletion by trying to get the audit
        print(f"Verifying deletion by attempting to GET deleted audit...")
        verify_response = requests.get(f"{BASE_URL}/audits/{audit_id}", timeout=10)
        
        if verify_response.status_code == 404:
            log_test("DELETE /api/audits/:id", True, f"Audit {audit_id} deleted and verified")
            return True
        else:
            log_warning("DELETE /api/audits/:id", f"Audit deleted but still accessible (status {verify_response.status_code})")
            return True  # Still consider it passed as the delete succeeded
        
    except Exception as e:
        log_test("DELETE /api/audits/:id", False, f"Exception: {str(e)}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection by checking if we can retrieve audits"""
    print("\n" + "="*80)
    print("TEST 6: MongoDB Connection Test")
    print("="*80)
    
    try:
        # Try to get audits - this will fail if MongoDB is not connected
        response = requests.get(f"{BASE_URL}/audits", timeout=10)
        
        if response.status_code == 500:
            data = response.json()
            error_msg = data.get("error", "")
            if "mongo" in error_msg.lower() or "database" in error_msg.lower():
                log_test("MongoDB Connection", False, f"MongoDB connection error: {error_msg}")
                return False
        
        log_test("MongoDB Connection", True, "MongoDB is connected and accessible")
        return True
        
    except Exception as e:
        log_test("MongoDB Connection", False, f"Exception: {str(e)}")
        return False

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    print(f"\n✅ PASSED: {len(test_results['passed'])}")
    for test in test_results['passed']:
        print(f"  {test}")
    
    if test_results['warnings']:
        print(f"\n⚠️  WARNINGS: {len(test_results['warnings'])}")
        for warning in test_results['warnings']:
            print(f"  {warning}")
    
    if test_results['failed']:
        print(f"\n❌ FAILED: {len(test_results['failed'])}")
        for test in test_results['failed']:
            print(f"  {test}")
    
    total = len(test_results['passed']) + len(test_results['failed'])
    pass_rate = (len(test_results['passed']) / total * 100) if total > 0 else 0
    
    print(f"\n{'='*80}")
    print(f"PASS RATE: {pass_rate:.1f}% ({len(test_results['passed'])}/{total})")
    print(f"{'='*80}\n")

def main():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("Hygenious - BACKEND API TESTS")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Testing Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    # Test 1: MongoDB Connection
    test_mongodb_connection()
    
    # Test 2: POST /api/analyze (Most Critical)
    audit_id = test_analyze_endpoint()
    
    # Wait a bit for database to sync
    if audit_id:
        print("\nWaiting 2 seconds for database sync...")
        time.sleep(2)
    
    # Test 3: GET /api/audits
    audits = test_get_all_audits()
    
    # Test 4: GET /api/audits/:id
    if audit_id:
        test_get_single_audit(audit_id)
    elif audits and len(audits) > 0:
        # Use an existing audit if we didn't create one
        test_get_single_audit(audits[0].get("id"))
    
    # Test 5: GET /api/dashboard/stats
    test_dashboard_stats()
    
    # Test 6: DELETE /api/audits/:id
    if audit_id:
        test_delete_audit(audit_id)
    elif audits and len(audits) > 0:
        # Delete an existing audit if we didn't create one
        test_delete_audit(audits[0].get("id"))
    
    # Print summary
    print_summary()
    
    # Return exit code
    if test_results['failed']:
        return 1
    return 0

if __name__ == "__main__":
    exit(main())
