import os

HTML_FILES = [
    "index.html", "cv.html", "lors.html", "achievements.html",
    "muns.html", "projects.html", "graphics.html", "results.html",
    "family.html", "secret.html"
]

SCRIPT_TAG = '    <script type="module" src="palette.js"></script>\n</body>'

for fname in HTML_FILES:
    if not os.path.exists(fname):
        continue
    with open(fname, "r", encoding="utf-8") as f:
        content = f.read()
    if 'src="palette.js"' not in content and "</body>" in content:
        content = content.replace("</body>", SCRIPT_TAG)
        with open(fname, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[Linked palette.js] {fname}")
    else:
        print(f"[Already Linked] {fname}")

print("\nDone! Every page now has Ctrl+K Spotlight, PWA Manifest & the Music navbar tab.")