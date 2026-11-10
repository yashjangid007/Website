import os

HTML_FILES = [
    "index.html", "cv.html", "lors.html", "achievements.html",
    "muns.html", "projects.html", "graphics.html", "results.html",
    "family.html", "secret.html", "music.html", "404.html"
]

SCRIPT_TAG = '    <script type="module" src="palette.js"></script>\n</body>'

print("--- Running Phase 1 Palette Injector ---")
for fname in HTML_FILES:
    if not os.path.exists(fname):
        print(f"[Skipped - Not Found] {fname}")
        continue
    
    with open(fname, "r", encoding="utf-8") as f:
        content = f.read()
        
    if 'src="palette.js"' in content:
        print(f"[Already Injected] {fname}")
        continue
        
    # Case-insensitive check for closing body tag
    if "</body>" in content.lower():
        # Replace the first occurrence of closing body tag case-insensitively
        idx = content.lower().rfind("</body>")
        content = content[:idx] + SCRIPT_TAG + content[idx + 7:]
        
        with open(fname, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[Successfully Updated!] {fname}")
    else:
        print(f"[Warning - No </body> found] {fname}")

print("\nInjection check complete! Run 'firebase deploy' when ready.")