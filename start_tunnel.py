import subprocess
import re
import os
import sys
import time
import io

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED = os.path.join(SCRIPT_DIR, "cloudflared.exe")
URL_FILE = os.path.join(SCRIPT_DIR, "ONLINE_SERVER_URL.txt")

if not os.path.exists(CLOUDFLARED):
    print(f"[!] Error: cloudflared.exe not found at {CLOUDFLARED}")
    sys.exit(1)

print("=" * 65)
print("   B.Y.T.E 2.0 - Starting Free Cloudflare Tunnel...")
print("=" * 65)
print("[*] Connecting http://127.0.0.1:8090 to the global internet...")

cmd = [CLOUDFLARED, "tunnel", "--url", "http://127.0.0.1:8090"]
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, encoding='utf-8', errors='replace')

url = None
start_time = time.time()
while time.time() - start_time < 30:
    line = proc.stdout.readline()
    if not line:
        time.sleep(0.1)
        continue
    m = re.search(r"https://[a-zA-Z0-9\-]+\.trycloudflare\.com", line)
    if m:
        url = m.group(0)
        break

if not url:
    print("[!] Failed to get Cloudflare tunnel URL within 30 seconds.")
    proc.terminate()
    sys.exit(1)

# Save to ONLINE_SERVER_URL.txt in both locations
for dest_dir in [SCRIPT_DIR, r"C:\Users\daisy\Desktop\B.Y.T.E Admin Portal"]:
    try:
        with open(os.path.join(dest_dir, "ONLINE_SERVER_URL.txt"), "w", encoding="utf-8") as f:
            f.write(url)
    except Exception:
        pass

print("\n" + "=" * 65)
print("     [+] B.Y.T.E 2.0 ONLINE CLOUDFLARE TUNNEL IS ACTIVE!")
print("=" * 65)
print(f"\n[*] PUBLIC ONLINE URL:")
print(f"     {url}")
print(f"\n[*] POCKETBASE CLOUD ADMIN UI:")
print(f"     {url}/_/")
print(f"\n[*] GODOT GAME API SYNC URL:")
print(f"     {url}/api/collections/questions/records")
print(f"\n[*] Naka-save din ang URL sa file na:")
print(f"     {URL_FILE}")
print("\n" + "=" * 65)
print("[!] PAALALA: Hayaang BUKAS ang window na ito habang ginagamit")
print("    ng Prof ang Admin Portal o habang nagse-sync ang Game App!")
print("    (Kapag sinarado mo ito, mawawala ang online link)")
print("=" * 65 + "\n")

try:
    while proc.poll() is None:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.5)
except KeyboardInterrupt:
    print("\nStopping Cloudflare Tunnel...")
finally:
    proc.terminate()
    print("Cloudflare Tunnel stopped.")
