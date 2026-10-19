import os
from PIL import Image

# Creates a 'thumbs' folder and generates 300x300 .webp HD previews (~15KB-25KB each)
THUMB_DIR = "thumbs"
os.makedirs(THUMB_DIR, exist_ok=True)

SUPPORTED_EXTS = ('.jpg', '.jpeg', '.png', '.webp', '.bmp')
count = 0

for root, dirs, files in os.walk("."):
    if THUMB_DIR in root or ".git" in root:
        continue
    for file in files:
        if file.lower().endswith(SUPPORTED_EXTS):
            src_path = os.path.join(root, file)
            base_name = os.path.splitext(file)[0]
            dest_path = os.path.join(THUMB_DIR, f"{base_name}.webp")
            
            if os.path.exists(dest_path):
                continue
            try:
                with Image.open(src_path) as img:
                    img = img.convert("RGB")
                    # Center-crop to square and resize to 300x300 HD
                    w, h = img.size
                    min_dim = min(w, h)
                    left = (w - min_dim) // 2
                    top = (h - min_dim) // 2
                    img = img.crop((left, top, left + min_dim, top + min_dim))
                    img = img.resize((300, 300), Image.Resampling.LANCZOS)
                    # Quality set to 85 for sharp hover zooming without bloating file size
                    img.save(dest_path, "WEBP", quality=85, method=6)
                    count += 1
                    print(f"[Created 300x300 WebP] {dest_path}")
            except Exception as e:
                print(f"[Skipped] {file}: {e}")

print(f"\nDone! Generated {count} HD 300x300 .webp thumbnails in '/{THUMB_DIR}'.")