import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCacheThreadingHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent aggressive browser & tunnel caching so mobile & devtunnels always see latest updates
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        # Strip caching request headers so SimpleHTTPRequestHandler NEVER sends 304
        for header_key in list(self.headers.keys()):
            if header_key.lower() in ('if-modified-since', 'if-none-match'):
                del self.headers[header_key]
        super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()

def run_server():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    port = 8000
    server_address = ('0.0.0.0', port)
    httpd = ThreadingHTTPServer(server_address, NoCacheThreadingHandler)
    httpd.daemon_threads = True
    print(f"B.Y.T.E. Admin Portal Multi-Threaded Server running at http://0.0.0.0:{port} (serving from {base_dir})")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
