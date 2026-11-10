import os
import re

# Complete list of all required navigation tabs
CANONICAL_LINKS = [
    ("index.html", "Home"),
    ("cv.html", "MUN CV"),
    ("lors.html", "LORs"),
    ("achievements.html", "Achievements"),
    ("muns.html", "MUNs"),
    ("projects.html", "Projects"),
    ("graphics.html", "Graphics"),
    ("music.html", "Music"),
    ("results.html", "Results"),
    ("family.html", "My Real Family"),
    ("secret.html", "Secret Vault")
]

def generate_nav_html(current_filename):
    html_parts = []
    for href, label in CANONICAL_LINKS:
        # Check if this link corresponds to the current page
        if href == current_filename:
            html_parts.append(f'            <a href="{href}" class="active">{label}</a>')
        else:
            html_parts.append(f'            <a href="{href}">{label}</a>')
    return "\n".join(html_parts)

def sync_file(filepath):
    filename = os.path.basename(filepath)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the nav-links block using regex
    nav_pattern = re.compile(r'(<div\s+class=["\']nav-links["\'][^>]*>)(.*?)(</div>)', re.DOTALL | re.IGNORECASE)
    match = nav_pattern.search(content)

    if not match:
        print(f"[Skipped - No nav-links found] {filename}")
        return False

    start_tag, inner_nav, end_tag = match.groups()

    # Extract all existing hrefs inside this nav block
    existing_hrefs = re.findall(r'href=["\']([^"\']+)["\']', inner_nav, re.IGNORECASE)
    
    # Check if any canonical link is missing
    canonical_hrefs = [item[0] for item in CANONICAL_LINKS]
    missing_links = [h for h in canonical_hrefs if h not in existing_hrefs]

    if not missing_links:
        print(f"[Up to date - No changes needed] {filename}")
        return False

    # Reconstruct the nav links block with all required tabs, keeping active state correct
    new_inner_nav = "\n" + generate_nav_html(filename) + "\n        "
    new_nav_block = start_tag + new_inner_nav + end_tag

    # Replace old nav block in content
    updated_content = content.replace(match.group(0), new_nav_block)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(updated_content)
    
    print(f"[Updated & Synced Missing Tabs!] {filename} (Added: {', '.join(missing_links)})")
    return True

def main():
    print("--- Scanning and Syncing Navbar Links Across All Pages ---")
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    
    updated_count = 0
    for file in html_files:
        if sync_file(file):
            updated_count += 1
            
    print(f"\nSync complete! {updated_count} file(s) updated.")

if __name__ == "__main__":
    main()