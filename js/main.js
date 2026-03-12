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
  const settingsBtns = document.querySelectorAll('.settings-btn');
  const modal = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('close-settings');
  const apiKeyInput = document.getElementById('settings-api-key');
  const toggleKeyBtn = document.getElementById('toggle-api-key');
  const resetBtn = document.getElementById('reset-progress-btn');

  if (!modal || settingsBtns.length === 0) return;

  // Load saved key
  try {
    const savedKey = localStorage.getItem('jslab_gemini_key');
    if (savedKey && apiKeyInput) {
      apiKeyInput.value = savedKey;
      apiKeyInput.type = 'password';
    }
  } catch(e){}

  if (toggleKeyBtn && apiKeyInput) {
    toggleKeyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleKeyBtn.textContent = '🙈';
      } else {
        apiKeyInput.type = 'password';
        toggleKeyBtn.textContent = '👁️';
      }
    });
  }

  settingsBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      modal.style.display = 'flex';
      
      // Close mobile menu if open
      const overlay = document.getElementById("mobile-nav-overlay");
      if(overlay) overlay.classList.remove("open");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
      if (apiKeyInput) {
        try { localStorage.setItem('jslab_gemini_key', apiKeyInput.value.trim()); } catch(e){}
      }
    });
  }

  // Close on outside click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      if (apiKeyInput) {
        try { localStorage.setItem('jslab_gemini_key', apiKeyInput.value.trim()); } catch(e){}
      }
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      if (confirm("Are you sure you want to completely RESET your progress? This cannot be undone.")) {
        if (confirm("Double checking: Delete all scores, notes, and progress?")) {
          try {
            // Keep the API key though
            const key = localStorage.getItem('jslab_gemini_key');
            localStorage.clear();
            if (key) localStorage.setItem('jslab_gemini_key', key);
            alert("Progress reset successful. Reloading page.");
            location.reload();
          } catch(e){
            alert("Error resetting progress.");
          }
        }
      }
    });
  }
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
