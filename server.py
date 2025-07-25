#!/usr/bin/env python3
"""
Simple API server for Vet Dashboard
Handles visitor data sharing between admin and display devices
"""

import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime

class VetDashboardHandler(http.server.SimpleHTTPRequestHandler):
    visitors_cache = None
    visitors_cache_mtime = None

    def do_GET(self):
        # Only log errors
        if self.path == '/api/visitors':
            visitors = self.get_visitors()
            self.send_json_response(visitors)
        elif self.path == '/api/sync-localStorage':
            self.send_json_response({"message": "Send localStorage data via POST"})
        elif self.path.startswith('/api/'):
            self.send_error(404, "API endpoint not found")
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/visitors':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                visitors = json.loads(post_data.decode('utf-8'))
                self.save_visitors(visitors)
                self.send_json_response({"status": "success", "message": "Visitors updated", "count": len(visitors)})
            except Exception as e:
                print(f"[ERROR] Saving data: {e}")
                self.send_error(400, f"Invalid JSON data: {str(e)}")
        elif self.path == '/api/sync-localStorage':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                localStorage_data = json.loads(post_data.decode('utf-8'))
                current_server_data = self.get_visitors()
                if len(current_server_data) == 0 and len(localStorage_data) > 0:
                    self.save_visitors(localStorage_data)
                    self.send_json_response({"status": "synced", "message": f"Synced {len(localStorage_data)} visitors", "count": len(localStorage_data)})
                else:
                    self.send_json_response({"status": "no-sync", "message": "No sync needed", "count": len(current_server_data)})
            except Exception as e:
                print(f"[ERROR] Syncing localStorage: {e}")
                self.send_error(400, f"Invalid sync data: {str(e)}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def get_visitors(self):
        """Load visitors from data.json file, with in-memory caching"""
        try:
            file_path = 'data.json'
            if os.path.exists(file_path):
                mtime = os.path.getmtime(file_path)
                if (self.__class__.visitors_cache is not None and
                    self.__class__.visitors_cache_mtime == mtime):
                    return self.__class__.visitors_cache
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    if data:
                        self.__class__.visitors_cache = data
                        self.__class__.visitors_cache_mtime = mtime
                        return data
            # If data.json is empty or doesn't exist
            print(f"[{datetime.now().strftime('%H:%M:%S')}] data.json is empty, initializing with empty array")
            self.__class__.visitors_cache = []
            self.__class__.visitors_cache_mtime = None
            return []
        except Exception as e:
            print(f"Error reading data.json: {e}")
            self.__class__.visitors_cache = []
            self.__class__.visitors_cache_mtime = None
            return []

    def save_visitors(self, visitors):
        """Save visitors to data.json file and update cache"""
        try:
            with open('data.json', 'w') as f:
                json.dump(visitors, f, indent=2)
            self.__class__.visitors_cache = visitors
            self.__class__.visitors_cache_mtime = os.path.getmtime('data.json')
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Saved {len(visitors)} visitors")
        except Exception as e:
            print(f"Error saving data.json: {e}")
            raise
    
    def send_json_response(self, data):
        """Send JSON response with CORS headers"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.end_headers()
        response_text = json.dumps(data, indent=2)
        self.wfile.write(response_text.encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] OPTIONS {self.path} from {self.client_address[0]}")
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()
    
    def end_headers(self):
        # Add CORS headers to all responses
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

if __name__ == "__main__":
    PORT = 8080
    
    print("🏥 Starting Vet Dashboard API Server...")
    print(f"📡 Server running on port {PORT}")
    print(f"🌐 Admin: http://localhost:{PORT}")
    print(f"📺 TV: http://localhost:{PORT}/tv.html")
    print("📊 API endpoints:")
    print(f"   GET  /api/visitors - Get all visitors")
    print(f"   POST /api/visitors - Update visitors")
    print()
    
    with socketserver.TCPServer(("", PORT), VetDashboardHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n�� Server stopped")
