import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyCrR6sGSwG4i8GD3yVi0S7XIVIFA5O3C-8", authDomain: "yash-jangid.firebaseapp.com", projectId: "yash-jangid", storageBucket: "yash-jangid.firebasestorage.app", messagingSenderId: "413356747209", appId: "1:413356747209:web:5b7332a06e3865f6e5a018", measurementId: "G-BR856TNGE8" };
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Auto-inject Manifest & Theme Color into <head>
if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest'; link.href = 'manifest.json';
    document.head.appendChild(link);
}
if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color'; meta.content = '#d4af37';
    document.head.appendChild(meta);
}

// 2. Auto-inject "Music" link & Spotlight trigger button into Navbar
const navLinks = document.querySelector('.nav-links');
if (navLinks) {
    if (!navLinks.querySelector('a[href="music.html"]')) {
        const musicLink = document.createElement('a');
        musicLink.href = 'music.html';
        musicLink.textContent = 'Music';
        if (location.pathname.endsWith('music.html')) musicLink.classList.add('active');
        const resultsLink = navLinks.querySelector('a[href="results.html"]');
        if (resultsLink) navLinks.insertBefore(musicLink, resultsLink);
        else navLinks.appendChild(musicLink);
    }
    if (!document.getElementById('nav-cmd-trigger')) {
        const btn = document.createElement('a');
        btn.id = 'nav-cmd-trigger';
        btn.href = 'javascript:void(0)';
        btn.className = 'cmd-nav-pill';
        btn.innerHTML = `🔍 <span style="font-size:0.78rem; opacity:0.85;">Ctrl+Q</span>`;
        btn.onclick = (e) => { e.preventDefault(); window.openCommandPalette(); };
        navLinks.appendChild(btn);
    }
}

// 3. Base Navigation & Quick Actions Index
const staticItems = [
    { title: "Home & Executive Summary", category: "Page", sub: "Profile, Core Competencies & Direct Communiqué", action: () => location.href = "index.html" },
    { title: "Official MUN Curriculum Vitae", category: "Page", sub: "View or download full MUN CV", action: () => location.href = "cv.html" },
    { title: "Download Official MUN CV (.PNG)", category: "Quick Action", sub: "Instant direct file download", action: () => { const a = document.createElement('a'); a.href = 'your_cv_image.png'; a.download = 'Yash_Jangid_MUN_CV.png'; a.click(); } },
    { title: "Letters of Recommendation (LORs)", category: "Page", sub: "Executive references & commendations", action: () => location.href = "lors.html" },
    { title: "Achievements & Certifications", category: "Page", sub: "IIT Madras C.O.D.E., Trinity Grade 4, TISF, Aurellia Soul Studio", action: () => location.href = "achievements.html" },
    { title: "Model United Nations Experience", category: "Page", sub: "Secretariat, Executive Board & Delegate awards", action: () => location.href = "muns.html" },
    { title: "Projects & Python IDLE 3.13.7 Engine", category: "Page", sub: "Execute Contract System Vr2.7 in WebAssembly", action: () => location.href = "projects.html" },
    { title: "Visual Arts & Graphics Portfolio", category: "Page", sub: "Branding, placards, brochures & digital design", action: () => location.href = "graphics.html" },
    { title: "Music & Audio Studio", category: "Page", sub: "Trinity Grade 4 Keyboard performances & event mixes", action: () => location.href = "music.html" },
    { title: "Official MUN Results & Marksheets", category: "Page", sub: "Live delegate scorecards & evaluations", action: () => location.href = "results.html" },
    { title: "My Real Family Vault", category: "Page", sub: "Protected family memories (6-digit PIN)", action: () => location.href = "family.html" },
    { title: "Administrator Secret Vault", category: "Page", sub: "System management, Inbox & Media Coordinator", action: () => location.href = "secret.html" }
];

let dynamicItems = [];
let indexedDynamic = false;

async function buildDynamicIndex() {
    if (indexedDynamic) return;
    indexedDynamic = true;
    try {
        const [evSnap, grSnap, lorSnap, musSnap] = await Promise.all([
            getDocs(collection(db, "mun_events")),
            getDocs(collection(db, "graphics")),
            getDocs(collection(db, "lors")),
            getDocs(collection(db, "music"))
        ]);

        evSnap.forEach(d => {
            const data = d.data();
            if (data.isPublished === false) return;
            dynamicItems.push({
                title: `Marksheet: ${data.displayName}`,
                category: "MUN Event",
                sub: "View official spreadsheet & scores",
                action: () => location.href = `results.html?q=${encodeURIComponent(data.displayName)}`
            });
            if (Array.isArray(data.excelData) && data.excelData.length > 1) {
                const headers = data.excelData[0].rowData || [];
                data.excelData.slice(1).forEach(r => {
                    const rowStr = (r.rowData || []).filter(Boolean).join(" • ");
                    if (rowStr) {
                        dynamicItems.push({
                            title: `${r.rowData[0] || 'Delegate'} — ${data.displayName}`,
                            category: "Delegate Result",
                            sub: headers.map((h, i) => `${h}: ${r.rowData[i] || '-'}`).slice(0, 4).join(" | "),
                            action: () => location.href = `results.html?q=${encodeURIComponent(r.rowData[0] || '')}`
                        });
                    }
                });
            }
        });

        grSnap.forEach(d => {
            const g = d.data();
            if (g.caption) {
                dynamicItems.push({
                    title: g.caption,
                    category: "Graphic Design",
                    sub: g.category ? `Category: ${g.category}` : "Visual Arts & Graphics Portfolio",
                    action: () => location.href = "graphics.html"
                });
            }
        });

        lorSnap.forEach(d => {
            const l = d.data();
            if (l.caption) {
                dynamicItems.push({
                    title: l.caption,
                    category: "LOR",
                    sub: "Official Letter of Recommendation",
                    action: () => location.href = "lors.html"
                });
            }
        });

        musSnap.forEach(d => {
            const m = d.data();
            if (m.title || m.caption) {
                dynamicItems.push({
                    title: m.title || m.caption,
                    category: "Music Track",
                    sub: m.category || "Music & Audio Studio",
                    action: () => location.href = "music.html"
                });
            }
        });
    } catch (e) {}
}

// 4. Build Modal DOM
const overlay = document.createElement('div');
overlay.id = 'cmd-palette-overlay';
overlay.className = 'cmd-overlay';
overlay.innerHTML = `
    <div class="cmd-modal" onclick="event.stopPropagation()">
        <div class="cmd-header">
            <span class="cmd-search-icon">🔍</span>
            <input type="text" id="cmd-search-input" placeholder="Search pages, MUN delegates, scores, graphics, or actions..." autocomplete="off">
            <kbd class="cmd-esc-badge" onclick="window.closeCommandPalette()">ESC</kbd>
        </div>
        <div id="cmd-results-list" class="cmd-results"></div>
        <div class="cmd-footer">
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>Enter</kbd> to open</span>
            <span><kbd>Ctrl + Q</kbd> anytime</span>
        </div>
    </div>
`;
document.body.appendChild(overlay);

const searchInput = document.getElementById('cmd-search-input');
const resultsList = document.getElementById('cmd-results-list');
let activeIndex = 0;
let currentFiltered = [];

function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

function renderResults(queryText = "") {
    const q = queryText.trim().toLowerCase();
    const all = [...staticItems, ...dynamicItems];
    currentFiltered = q
        ? all.filter(item => item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)).slice(0, 18)
        : staticItems;

    if (activeIndex >= currentFiltered.length) activeIndex = 0;

    if (currentFiltered.length === 0) {
        resultsList.innerHTML = `<div style="padding: 28px; text-align: center; color: var(--text-muted);">No matching pages, delegates, or media found.</div>`;
        return;
    }

    resultsList.innerHTML = currentFiltered.map((item, idx) => `
        <div class="cmd-item ${idx === activeIndex ? 'active' : ''}" data-idx="${idx}">
            <div>
                <div class="cmd-item-title">${escapeHTML(item.title)}</div>
                <div class="cmd-item-sub">${escapeHTML(item.sub)}</div>
            </div>
            <span class="cmd-item-badge">${escapeHTML(item.category)}</span>
        </div>
    `).join('');

    resultsList.querySelectorAll('.cmd-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            activeIndex = parseInt(el.dataset.idx, 10);
            updateHighlight();
        });
        el.addEventListener('click', () => {
            const item = currentFiltered[parseInt(el.dataset.idx, 10)];
            if (item) { window.closeCommandPalette(); item.action(); }
        });
    });
}

function updateHighlight() {
    resultsList.querySelectorAll('.cmd-item').forEach((el, i) => {
        el.classList.toggle('active', i === activeIndex);
        if (i === activeIndex) el.scrollIntoView({ block: 'nearest' });
    });
}

window.openCommandPalette = function() {
    overlay.classList.add('open');
    searchInput.value = '';
    activeIndex = 0;
    renderResults('');
    setTimeout(() => searchInput.focus(), 40);
    buildDynamicIndex().then(() => {
        if (overlay.classList.contains('open') && searchInput.value.trim()) {
            renderResults(searchInput.value);
        }
    });
};

window.closeCommandPalette = function() {
    overlay.classList.remove('open');
};

overlay.addEventListener('click', window.closeCommandPalette);

searchInput.addEventListener('input', (e) => {
    activeIndex = 0;
    renderResults(e.target.value);
});

document.addEventListener('keydown', (e) => {
    // Remapped to Ctrl + Q (and prevents default browser actions)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        if (overlay.classList.contains('open')) window.closeCommandPalette();
        else window.openCommandPalette();
        return;
    }
    if (!overlay.classList.contains('open')) return;

    if (e.key === 'Escape') {
        e.preventDefault();
        window.closeCommandPalette();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentFiltered.length > 0) {
            activeIndex = (activeIndex + 1) % currentFiltered.length;
            updateHighlight();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentFiltered.length > 0) {
            activeIndex = (activeIndex - 1 + currentFiltered.length) % currentFiltered.length;
            updateHighlight();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFiltered[activeIndex]) {
            const target = currentFiltered[activeIndex];
            window.closeCommandPalette();
            target.action();
        }
    }
});