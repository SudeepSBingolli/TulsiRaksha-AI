"""
Unified API Server - Complete Integration of Smartwatch Data + ML Predictions
Combines Flask API with HealthDataBridge for real-time health monitoring
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
from functools import wraps

# Import bridge
try:
    from api_bridge import HealthDataBridge
except ImportError:
    print("Error: api_bridge.py not found. Make sure it's in the same directory.")
    exit(1)

# ============================================================================
# FLASK APPLICATION SETUP
# ============================================================================

app = Flask(__name__)
CORS(app)

# Initialize bridge
bridge = HealthDataBridge(use_mock=False)  # Set to True for mock data testing

# ============================================================================
# MIDDLEWARE & UTILITIES
# ============================================================================

def ensure_bridge_running(f):
    """Decorator to ensure bridge is running"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not bridge.is_running and bridge.smartwatch.is_connected is False:
            return jsonify({
                "error": "Bridge not initialized",
                "message": "Please start the bridge first. Call /api/bridge/start"
            }), 503
        return f(*args, **kwargs)
    return decorated_function

def success_response(data, message="Success", status_code=200):
    """Helper to create success response"""
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }), status_code

def error_response(error, message="Error", status_code=400):
    """Helper to create error response"""
    return jsonify({
        "success": False,
        "error": error,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }), status_code

# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.route('/api', methods=['GET'])
def api_root():
    """API information"""
    return success_response({
        "name": "TulsiRaksha-AI Health Monitoring API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "live": "/api/live-health",
            "history": "/api/health-history",
            "predict": "/api/predict",
            "stats": "/api/stats",
            "bridge": {
                "status": "/api/bridge/status",
                "start": "/api/bridge/start",
                "stop": "/api/bridge/stop"
            }
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """General health check"""
    status = bridge.get_status()
    return success_response(status)

# ============================================================================
# LIVE HEALTH DATA ENDPOINTS
# ============================================================================

@app.route('/api/live-health', methods=['GET'])
def live_health():
    """
    Get latest real-time health data from smartwatch
    
    Returns:
        {
            "heart_rate": number,
            "battery": number,
            "steps": number,
            "timestamp": string,
            "is_connected": boolean
        }
    """
    try:
        data = bridge.get_live_health_data()
        return success_response(data, "Live health data retrieved")
    except Exception as e:
        return error_response(str(e), "Failed to get live health data")

@app.route('/api/health-history', methods=['GET'])
def health_history():
    """
    Get health data history
    
    Query parameters:
        limit: Number of records to return (default: 50, max: 500)
    
    Returns:
        List of health data points with timestamps
    """
    try:
        limit = request.args.get('limit', default=50, type=int)
        limit = min(limit, 500)  # Cap at 500
        
        history = bridge.get_health_history(limit)
        return success_response({
            "count": len(history),
            "limit": limit,
            "data": history
        }, f"Retrieved {len(history)} health records")
    except Exception as e:
        return error_response(str(e), "Failed to get health history")

# ============================================================================
# PREDICTION ENDPOINTS
# ============================================================================

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict health risk based on health metrics
    
    Request body:
        {
            "heart_rate": number,
            "steps": number,
            "sleep": number (hours),
            "medicine": number (0/1)
        }
    
    Returns:
        {
            "risk": "LOW" | "NORMAL" | "HIGH",
            "confidence": number,
            "timestamp": string
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", "Invalid request")
        
        # Validate required fields
        required_fields = ['heart_rate', 'steps', 'sleep', 'medicine']
        for field in required_fields:
            if field not in data:
                return error_response(
                    f"Missing field: {field}",
                    f"Request must include: {', '.join(required_fields)}"
                )
        
        # Make prediction
        prediction = bridge.predict_health_risk(data)
        
        return success_response(prediction, "Prediction completed")
    except Exception as e:
        return error_response(str(e), "Prediction failed")

@app.route('/api/predict-live', methods=['GET'])
def predict_live():
    """
    Get prediction for latest live health data
    
    Returns:
        Prediction based on current real-time data from smartwatch
    """
    try:
        # Get latest data
        live_data = bridge.get_live_health_data()
        
        if live_data['heart_rate'] == 0:
            return error_response("No data available", "Smartwatch not providing data")
        
        # Make prediction
        prediction = bridge.predict_health_risk({
            'heart_rate': live_data['heart_rate'],
            'steps': live_data['steps'],
            'sleep': 7,
            'medicine': 1
        })
        
        prediction['live_data'] = live_data
        
        return success_response(prediction, "Live prediction completed")
    except Exception as e:
        return error_response(str(e), "Live prediction failed")

@app.route('/api/predictions-history', methods=['GET'])
def predictions_history():
    """
    Get prediction history
    
    Query parameters:
        limit: Number of predictions to return (default: 20, max: 100)
    
    Returns:
        List of past predictions
    """
    try:
        limit = request.args.get('limit', default=20, type=int)
        limit = min(limit, 100)
        
        predictions = bridge.get_predictions_history(limit)
        
        return success_response({
            "count": len(predictions),
            "limit": limit,
            "predictions": predictions
        }, f"Retrieved {len(predictions)} predictions")
    except Exception as e:
        return error_response(str(e), "Failed to get prediction history")

# ============================================================================
# STATISTICS & ANALYTICS ENDPOINTS
# ============================================================================

@app.route('/api/stats', methods=['GET'])
def stats():
    """
    Get health statistics and analytics
    
    Returns:
        {
            "total_samples": number,
            "avg_heart_rate": number,
            "min_heart_rate": number,
            "max_heart_rate": number,
            "latest_timestamp": string
        }
    """
    try:
        stats_data = bridge.get_health_stats()
        return success_response(stats_data, "Statistics retrieved")
    except Exception as e:
        return error_response(str(e), "Failed to get statistics")

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    """
    Get comprehensive dashboard data (combines multiple endpoints)
    
    Returns:
        Complete dashboard with live data, stats, and latest predictions
    """
    try:
        dashboard_data = {
            "live": bridge.get_live_health_data(),
            "stats": bridge.get_health_stats(),
            "recent_history": bridge.get_health_history(10),
            "recent_predictions": bridge.get_predictions_history(5),
            "bridge_status": bridge.get_status()
        }
        
        return success_response(dashboard_data, "Dashboard data retrieved")
    except Exception as e:
        return error_response(str(e), "Failed to get dashboard data")

# ============================================================================
# BRIDGE CONTROL ENDPOINTS
# ============================================================================

@app.route('/api/bridge/status', methods=['GET'])
def bridge_status():
    """Get bridge status"""
    return success_response(bridge.get_status(), "Bridge status retrieved")

@app.route('/api/bridge/start', methods=['POST'])
def bridge_start():
    """Start the data collection bridge"""
    try:
        if bridge.is_running:
            return success_response(
                bridge.get_status(),
                "Bridge already running"
            )
        
        # Start bridge in background
        bridge.start_async()
        
        return success_response(
            bridge.get_status(),
            "Bridge started successfully"
        )
    except Exception as e:
        return error_response(str(e), "Failed to start bridge")

@app.route('/api/bridge/stop', methods=['POST'])
def bridge_stop():
    """Stop the data collection bridge"""
    try:
        bridge.is_running = False
        return success_response(
            bridge.get_status(),
            "Bridge stopped"
        )
    except Exception as e:
        return error_response(str(e), "Failed to stop bridge")

# ============================================================================
# BATCH OPERATIONS
# ============================================================================

@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    """
    Predict health risk for multiple data points
    
    Request body:
        {
            "data": [
                {"heart_rate": number, "steps": number, "sleep": number, "medicine": number},
                ...
            ]
        }
    
    Returns:
        List of predictions
    """
    try:
        payload = request.get_json()
        
        if not payload or 'data' not in payload:
            return error_response("No data provided", "Request must include 'data' field")
        
        data_list = payload['data']
        
        if not isinstance(data_list, list):
            return error_response("Invalid format", "'data' must be a list")
        
        predictions = [bridge.predict_health_risk(data) for data in data_list]
        
        return success_response({
            "count": len(predictions),
            "predictions": predictions
        }, f"Processed {len(predictions)} predictions")
    except Exception as e:
        return error_response(str(e), "Batch prediction failed")

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return error_response("Not found", "Endpoint not found", 404)

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return error_response("Server error", "Internal server error", 500)

@app.before_request
def log_request():
    """Log incoming requests"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {request.method} {request.path}")

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("TulsiRaksha-AI Unified API Server")
    print("=" * 60)
    print("Starting bridge...")
    
    # Auto-start bridge if using mock data
    bridge.start_async()
    
    print("Bridge started in background")
    print("\nAPI Documentation:")
    print("  • GET  /api                    - API information")
    print("  • GET  /api/health             - Health check")
    print("  • GET  /api/live-health        - Live health data")
    print("  • GET  /api/health-history     - Health history")
    print("  • POST /api/predict            - Predict health risk")
    print("  • GET  /api/predict-live       - Predict for live data")
    print("  • GET  /api/predictions-history- Prediction history")
    print("  • GET  /api/stats              - Health statistics")
    print("  • GET  /api/dashboard          - Complete dashboard")
    print("  • POST /api/batch-predict      - Batch predictions")
    print("\n" + "=" * 60)
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False
    )
