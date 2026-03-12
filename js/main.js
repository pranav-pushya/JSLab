/**
 * JSLab — Main Application Logic
 * Home page: countdowns, progress, streak, recent activity.
 * Author: Pranav Pushya
 * Course: Frontend Engineering-1 (25CSE0105)
 */

/* ========== EXAM DATE CONFIG ========== */
const EXAM_DATES = {
  st1: { completed: true, score: 12, total: 30 },
  st2: "2026-05-07",
  endTerm: null
};

/* ========== NAVIGATION & MENU ========== */
function initNavigation() {
  const topNav = document.querySelector(".top-navbar");
  const hamburger = document.getElementById("hamburger-menu");
  const overlay = document.getElementById("mobile-nav-overlay");
  const closeMenuBtn = document.getElementById("close-mobile-menu");

  // Sticky navbar scroll effect
  if (topNav) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        topNav.classList.add("scrolled");
      } else {
        topNav.classList.remove("scrolled");
      }
    });
  }

  // Hamburger Menu
  if (hamburger && overlay && closeMenuBtn) {
    const toggleMenu = (open) => {
      if (open) {
        overlay.classList.add("open");
      } else {
        overlay.classList.remove("open");
      }
    };

    hamburger.addEventListener("click", () => toggleMenu(true));
    closeMenuBtn.addEventListener("click", () => toggleMenu(false));
    
    // Close when clicking a link
    overlay.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => toggleMenu(false));
    });
  }
}

/** Highlight the active nav link */
function setActiveNav() {
  const path = window.location.pathname;
  const links = document.querySelectorAll(".sidebar-nav a");
  links.forEach(function (link) {
    const href = link.getAttribute("href");
    if (path.endsWith(href) || (href === "../index.html" && (path.endsWith("index.html") || path.endsWith("/")))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* ========== TOP PROGRESS BAR ========== */
function updateTopProgressBar() {
  const fill = document.querySelector(".top-progress-bar .fill");
  if (fill) {
    fill.style.width = getOverallPercentage() + "%";
  }
}

/* ========== COUNTDOWN TIMERS ========== */
function initCountdowns() {
  updateCountdowns();
  setInterval(updateCountdowns, 1000);
}

function updateCountdowns() {
  if (typeof EXAM_DATES.st2 === 'string') {
    renderCountdown("st2", EXAM_DATES.st2);
  }
}

function renderCountdown(id, dateStr) {
  var container = document.getElementById("countdown-" + id);
  if (!container) return;

  var target = new Date(dateStr + "T00:00:00").getTime();
  var now = Date.now();
  var diff = target - now;

  if (diff <= 0) {
    container.innerHTML = '<span style="color:var(--success);font-weight:700;font-size:1.2rem;">Exam Completed ✓</span>';
    return;
  }

  var days = Math.floor(diff / (1000 * 60 * 60 * 24));
  var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  var secs = Math.floor((diff % (1000 * 60)) / 1000);

  container.innerHTML =
    '<div class="timer-unit"><div class="value">' + days + '</div><div class="label">Days</div></div>' +
    '<div class="timer-unit"><div class="value">' + hours + '</div><div class="label">Hours</div></div>' +
    '<div class="timer-unit"><div class="value">' + mins + '</div><div class="label">Mins</div></div>' +
    '<div class="timer-unit"><div class="value">' + secs + '</div><div class="label">Secs</div></div>';
}

/* ========== PROGRESS RING ========== */
function updateProgressRing() {
  const pct = getOverallPercentage();
  const completed = getCompletedCount();
  const ring = document.getElementById("progress-ring-fill");
  const pctText = document.getElementById("progress-pct");
  const countText = document.getElementById("progress-count");

  if (ring) {
    const circumference = 2 * Math.PI * 65;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference - (pct / 100) * circumference;
  }
  if (pctText) pctText.textContent = pct + "%";
  if (countText) countText.textContent = completed + " of " + TOTAL_LECTURES + " lectures completed";
}

function updateUnitBars() {
  var units = ["unit1", "unit2", "unit3"];
  for (var i = 0; i < units.length; i++) {
    var key = units[i];
    var prog = getUnitProgress(key);
    var fill = document.getElementById(key + "-fill");
    var label = document.getElementById(key + "-label");
    if (fill) fill.style.width = (prog.done / prog.total * 100) + "%";
    if (label) label.textContent = prog.done + "/" + prog.total;
  }
}

/* ========== STREAK ========== */
function updateStreakDisplay() {
  var streak = updateStreak();
  var el = document.getElementById("streak-count");
  if (el) el.textContent = streak.count + " Day Streak";
}

/* ========== RECENT ACTIVITY ========== */
function renderRecentActivity() {
  var container = document.getElementById("recent-activity");
  if (!container) return;

  var activities = getRecentActivity(4);
  if (activities.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);font-size:14px;padding:12px;">No activity yet. Start learning to see your progress here!</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < activities.length; i++) {
    var a = activities[i];
    var icon = a.type === "completed" ? "✅" : a.type === "quiz" ? "📝" : "📌";
    html += '<div class="activity-item fade-in">' +
      '<span class="activity-icon">' + icon + '</span>' +
      '<span class="activity-text">' + escapeHtml(a.text) + '</span>' +
      '<span class="activity-time">' + timeAgo(a.time) + '</span>' +
      '</div>';
  }
  container.innerHTML = html;
}

/* ========== BACK TO TOP ========== */
function initBackToTop() {
  var btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ========== KEYBOARD SHORTCUTS ========== */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var modals = document.querySelectorAll(".modal-overlay.active");
      modals.forEach(function (m) { m.classList.remove("active"); });
    }
    if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
      var search = document.getElementById("search-input");
      if (search && document.activeElement !== search) {
        e.preventDefault();
        search.focus();
      }
    }
  });
}

/* ========== HTML SANITIZATION ========== */
/**
 * Sanitize a string for safe use in innerHTML.
 * Prevents XSS by escaping HTML special characters.
 * @param {string} str — untrusted string
 * @returns {string} — safe HTML string
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ========== COPY TO CLIPBOARD ========== */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function () {
    showCopyToast();
  });
}

function showCopyToast() {
  var toast = document.getElementById("copy-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "copy-toast";
    toast.className = "copy-toast";
    toast.textContent = "Copied!";
    document.body.appendChild(toast);
  }
  toast.classList.add("show");
  setTimeout(function () { toast.classList.remove("show"); }, 1500);
}

/* ========== SETTINGS MODAL ========== */
function initSettings() {
  const settingsBtns = document.querySelectorAll('.settings-btn, #drawer-settings-btn');
  const modal = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('close-settings');
  const apiKeyInput = document.getElementById('settings-api-key');
  const toggleKeyBtn = document.getElementById('toggle-api-key');
  const st2DateInput = document.getElementById('settings-st2-date');
  const reduceMotionCb = document.getElementById('settings-reduce-motion');
  const colorSwatches = document.querySelectorAll('.color-swatch');

  if (!modal) return;

  // 1. Data Store Load
  let appSettings = {
    st2Date: "2026-05-07",
    accentColor: "#4fc3f7",
    reduceMotion: false
  };

  function loadSettings() {
    try {
      const saved = localStorage.getItem('jslab_settings');
      if (saved) appSettings = { ...appSettings, ...JSON.parse(saved) };
      
      // Also get API key
      const savedKey = localStorage.getItem('jslab_gemini_key');
      if (savedKey && apiKeyInput) {
        apiKeyInput.value = savedKey;
        apiKeyInput.type = 'password';
      }
    } catch(e){}
    applySettings();
  }

  function applySettings() {
    // DOM Inputs Updates
    if (st2DateInput) st2DateInput.value = appSettings.st2Date;
    if (reduceMotionCb) reduceMotionCb.checked = appSettings.reduceMotion;

    // Apply CSS Variables
    document.documentElement.style.setProperty('--accent-blue', appSettings.accentColor);
    if (appSettings.reduceMotion) {
      document.body.classList.add('reduce-motion');
      document.documentElement.style.setProperty('--transition', 'none');
    } else {
      document.body.classList.remove('reduce-motion');
      document.documentElement.style.setProperty('--transition', '0.3s ease');
    }

    // Sync globals
    window.EXAM_DATES = window.EXAM_DATES || {};
    window.EXAM_DATES.st2 = appSettings.st2Date;

    // Call initCountdowns directly if we are on Home page to refresh instantly
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
       if (typeof initCountdowns === 'function') initCountdowns();
    }
  }

  function saveSettings() {
    if (st2DateInput) appSettings.st2Date = st2DateInput.value;
    if (reduceMotionCb) appSettings.reduceMotion = reduceMotionCb.checked;
    
    if (apiKeyInput) {
      try { localStorage.setItem('jslab_gemini_key', apiKeyInput.value.trim()); } catch(e){}
    }
    
    try {
      localStorage.setItem('jslab_settings', JSON.stringify(appSettings));
    } catch(e){}
    
    applySettings();
  }

  // Bind Open/Close
  settingsBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      loadSettings();
      modal.style.display = 'flex';
    });
  });

  const closeModal = () => {
    saveSettings();
    modal.style.display = 'none';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Bind Swatches
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', e => {
      const col = e.target.dataset.color;
      if (col) {
        appSettings.accentColor = col;
        saveSettings();
      }
    });
  });

  // Export Data
  const exportBtn = document.getElementById('settings-export-data');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = {
        progress: localStorage.getItem('jslab_progress'),
        notes: localStorage.getItem('jslab_notes'),
        snippets: localStorage.getItem('jslab_snippets'),
        settings: localStorage.getItem('jslab_settings'),
        key: localStorage.getItem('jslab_gemini_key')
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `jslab_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    });
  }

  // Import Data
  const importInput = document.getElementById('import-file-input');
  if (importInput) {
    importInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const data = JSON.parse(evt.target.result);
          if (data.progress) localStorage.setItem('jslab_progress', data.progress);
          if (data.notes) localStorage.setItem('jslab_notes', data.notes);
          if (data.snippets) localStorage.setItem('jslab_snippets', data.snippets);
          if (data.settings) localStorage.setItem('jslab_settings', data.settings);
          if (data.key) localStorage.setItem('jslab_gemini_key', data.key);
          alert('Data imported successfully! Reloading...');
          window.location.reload();
        } catch(err) { alert('Invalid backup file.'); }
      };
      reader.readAsText(file);
    });
  }

  // Reset Progress
  const resetBtn = document.getElementById('reset-progress-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Reset ALL JSLab progress, notes, and scores? This cannot be undone.")) {
        const k = localStorage.getItem('jslab_gemini_key');
        localStorage.clear();
        if (k) localStorage.setItem('jslab_gemini_key', k);
        alert("Reset complete. Reloading...");
        window.location.reload();
      }
    });
  }

  // Clear Notes
  const clearNotesBtn = document.getElementById('settings-clear-notes');
  if (clearNotesBtn) {
    clearNotesBtn.addEventListener('click', () => {
      if (confirm("Clear all your saved notes?")) {
        localStorage.removeItem('jslab_notes');
        alert("Notes deleted. Reloading...");
        window.location.reload();
      }
    });
  }

  // Toggle API visibility
  if (toggleKeyBtn && apiKeyInput) {
    toggleKeyBtn.addEventListener('click', e => {
      e.preventDefault();
      const st = apiKeyInput.type === 'password' ? 'text' : 'password';
      apiKeyInput.type = st;
      toggleKeyBtn.textContent = st === 'text' ? '🙈' : '👁️';
    });
  }

  // Auto Load on boot
  loadSettings();
}

/* ========== INIT ========== */
document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  setActiveNav();
  initSettings();
  updateTopProgressBar();
  initCountdowns();
  updateProgressRing();
  updateUnitBars();
  updateStreakDisplay();
  renderRecentActivity();
  initBackToTop();
  initKeyboardShortcuts();
});
