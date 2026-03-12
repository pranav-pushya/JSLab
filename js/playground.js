/**
 * JSLab — Code Playground Logic
 * Monaco Editor integration, code execution, challenges, and snippet management.
 */
(function () {
  'use strict';

  // ── Challenges Data ─────────────────────────
  var CHALLENGES = [
    { title: 'Hello World', unit: 1, code: '// Challenge: Print "Hello, World!" to the console\n\n' },
    { title: 'Variables Practice', unit: 1, code: '// Challenge: Create variables using let and const\n// 1. Create a let variable called "age" with your age\n// 2. Create a const called "name" with your name\n// 3. Print both using template literals\n\n' },
    { title: 'Even or Odd', unit: 1, code: '// Challenge: Write a function that checks if a number is even or odd\n// Return "Even" or "Odd"\n\nfunction evenOrOdd(num) {\n  // your code here\n}\n\nconsole.log(evenOrOdd(4)); // Even\nconsole.log(evenOrOdd(7)); // Odd\n' },
    { title: 'FizzBuzz', unit: 1, code: '// Challenge: Print numbers 1-30\n// If divisible by 3, print "Fizz"\n// If divisible by 5, print "Buzz"\n// If divisible by both, print "FizzBuzz"\n\nfor (let i = 1; i <= 30; i++) {\n  // your code here\n}\n' },
    { title: 'Factorial', unit: 1, code: '// Challenge: Write a recursive factorial function\n\nfunction factorial(n) {\n  // your code here\n}\n\nconsole.log(factorial(5)); // 120\nconsole.log(factorial(0)); // 1\n' },
    { title: 'Array Filter', unit: 1, code: '// Challenge: Use filter() to get only numbers > 50\nconst scores = [23, 87, 45, 92, 51, 38, 76, 100, 12, 65];\n\nconst highScores = scores.filter(/* your code */);\nconsole.log(highScores);\n' },
    { title: 'Object Destructuring', unit: 2, code: '// Challenge: Destructure this object to extract name, age, and city\nconst person = {\n  name: "Pranav",\n  age: 20,\n  address: {\n    city: "Chandigarh",\n    state: "Punjab"\n  }\n};\n\n// Use destructuring here\n\nconsole.log(name, age, city);\n' },
    { title: 'DOM Manipulation', unit: 2, code: '// Challenge: Create a styled button that changes text on click\n// (This would run in a browser with a document)\n\nconsole.log("DOM challenges work best in an actual HTML page!");\nconsole.log("Try creating elements with document.createElement()");\n' },
    { title: 'Promise Practice', unit: 3, code: '// Challenge: Create a function that returns a Promise\n// It should resolve after 1 second with "Data loaded!"\n\nfunction loadData() {\n  return new Promise((resolve, reject) => {\n    // your code here\n  });\n}\n\nloadData().then(result => console.log(result));\n' },
    { title: 'Async/Await', unit: 3, code: '// Challenge: Rewrite the promise chain using async/await\nfunction delay(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}\n\nasync function runTasks() {\n  // Wait 500ms, log "Task 1 done"\n  // Wait 500ms, log "Task 2 done"\n  // Wait 500ms, log "All done!"\n}\n\nrunTasks();\n' }
  ];

  var editor = null;
  var consoleOutput = document.getElementById('console-output');
  var consolePanel = document.getElementById('console-panel');
  var consoleHeader = document.getElementById('console-header');

  // ── Initialize Monaco Editor ────────────────
  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs' } });

  require(['vs/editor/editor.main'], function () {
    monaco.editor.defineTheme('jslab-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a9955' },
        { token: 'keyword', foreground: 'c586c0' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'number', foreground: 'b5cea8' }
      ],
      colors: {
        'editor.background': '#0d1529',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#4fc3f744',
        'editorCursor.foreground': '#4fc3f7',
        'editor.selectionBackground': '#4fc3f722',
        'editor.lineHighlightBackground': '#ffffff06'
      }
    });

    editor = monaco.editor.create(document.getElementById('editor-container'), {
      value: '// Welcome to JSLab Playground!\n// Write your JavaScript code here and click "Run" or press Ctrl+Enter\n\nconsole.log("Hello, Pranav! 🚀");\nconsole.log("Start coding JavaScript here...");\n',
      language: 'javascript',
      theme: 'jslab-dark',
      fontSize: 14,
      fontFamily: "'Fira Code', Consolas, monospace",
      minimap: { enabled: false },
      padding: { top: 16 },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      suggest: { showWords: true }
    });

    // Ctrl+Enter to run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
      runCode();
    });

    // Ctrl+S to save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
      saveSnippet();
    });
  });

  // ── Console Output Helper ──────────────────
  function addOutput(type, args) {
    var line = document.createElement('div');
    line.className = 'console-line ' + type;
    var ts = document.createElement('span');
    ts.className = 'timestamp';
    var d = new Date();
    ts.textContent = d.getHours().toString().padStart(2, '0') + ':' +
                     d.getMinutes().toString().padStart(2, '0') + ':' +
                     d.getSeconds().toString().padStart(2, '0');
    line.appendChild(ts);
    var content = document.createElement('span');
    content.textContent = args.map(function (a) {
      if (typeof a === 'object') {
        try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
      }
      return String(a);
    }).join(' ');
    line.appendChild(content);
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  // ── Run Code (sandboxed iframe) ─────────────
  var runIframe = null;
  var runTimeout = null;

  function runCode() {
    if (!editor) return;
    var code = editor.getValue();
    consoleOutput.innerHTML = '';

    // Remove previous iframe if exists
    if (runIframe && runIframe.parentNode) {
      runIframe.parentNode.removeChild(runIframe);
    }
function runCode(code) {
  const iframe = document.getElementById(
    'output-iframe');
  const consoleOutput = document.getElementById(
    'console-output');
  
  if (!iframe || !consoleOutput) return;
  consoleOutput.innerHTML = '';

  const escapedCode = code
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d0d1a;
    color: #e0e0e0;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 12px;
  }
</style>
</head>
<body>
<script>
(function() {
  var _log = console.log.bind(console);
  var _warn = console.warn.bind(console);
  var _err = console.error.bind(console);

  function serialize(val) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'function') 
      return val.toString();
    if (typeof val === 'object') {
      try { return JSON.stringify(val, null, 2); }
      catch(e) { return String(val); }
    }
    return String(val);
  }

  function post(level, args) {
    var msg = Array.from(args).map(serialize).join(' ');
    window.parent.postMessage(
      { type: 'jslab-console', level: level, msg: msg },
      '*'
    );
  }

  console.log = function() { 
    post('log', arguments); 
    _log.apply(console, arguments); 
  };
  console.warn = function() { 
    post('warn', arguments); 
    _warn.apply(console, arguments); 
  };
  console.error = function() { 
    post('error', arguments); 
    _err.apply(console, arguments); 
  };
  console.info = function() { 
    post('info', arguments); 
  };

  window.onerror = function(msg, src, line, col) {
    window.parent.postMessage({
      type: 'jslab-console',
      level: 'error',
      msg: msg + ' (line ' + line + 
           (col ? ', col ' + col : '') + ')'
    }, '*');
    return true;
  };

  window.addEventListener(
    'unhandledrejection', function(e) {
    window.parent.postMessage({
      type: 'jslab-console',
      level: 'error',
      msg: 'Unhandled Promise: ' + 
           (e.reason?.message || e.reason)
    }, '*');
  });
})();
<\/script>
<script>
try {
  ${code}
} catch(e) {
  window.parent.postMessage({
    type: 'jslab-console',
    level: 'error',
    msg: e.name + ': ' + e.message
  }, '*');
}
<\/script>
</body>
</html>`;

  iframe.srcdoc = html;
}

// Message listener — add ONCE at file top level
// (not inside any function)
window.addEventListener('message', function(e) {
  if (!e.data || e.data.type !== 'jslab-console') 
    return;
  
  const panel = document.getElementById(
    'console-output');
  if (!panel) return;

  const line = document.createElement('div');
  line.className = 'c-line c-' + e.data.level;
  
  const icon = e.data.level === 'error' ? '✕' :
               e.data.level === 'warn'  ? '⚠' :
               e.data.level === 'info'  ? 'ℹ' : '›';
  
  line.innerHTML = 
    '<span class="c-icon">' + icon + '</span>' +
    '<span class="c-msg">' + 
    e.data.msg
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;') + 
    '</span>';
  
  panel.appendChild(line);
  panel.scrollTop = panel.scrollHeight;
});

    if (typeof ProgressManager !== 'undefined') {
      ProgressManager.logActivity('Ran code in Playground');
    }
}

  // ── Save / Load Snippets ────────────────────
  function saveSnippet() {
    if (!editor) return;
    var name = prompt('Enter a name for this snippet:', 'Snippet ' + new Date().toLocaleTimeString());
    if (!name) return;
    if (typeof ProgressManager !== 'undefined') {
      ProgressManager.saveSnippet(name, editor.getValue());
    }
    var toast = document.getElementById('copy-toast');
    if (toast) {
      toast.textContent = 'Saved!';
      toast.classList.add('show');
      setTimeout(function () {
        toast.classList.remove('show');
        toast.textContent = 'Copied!';
      }, 2000);
    }
  }

  function showPrograms() {
    var overlay = document.getElementById('programs-drawer-overlay');
    var list = document.getElementById('snippets-list');
    var snippets = typeof ProgressManager !== 'undefined' ? ProgressManager.getSnippets() : [];

    if (!snippets.length) {
      list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">No saved programs yet. Write code and click 💾 Save Program.</p>';
    } else {
      var html = '';
      snippets.forEach(function (s, i) {
        html += '<div class="glass-card" style="padding:16px;margin-bottom:12px;background:rgba(255,255,255,0.03);" data-idx="' + i + '">';
        html += '<div style="margin-bottom:12px;"><strong>' + escapeHtml(s.name) + '</strong><br><span style="font-size:12px;color:var(--text-secondary);">' + new Date(s.date).toLocaleString() + '</span></div>';
        html += '<div style="display:flex;gap:8px;"><button class="btn btn-sm btn-primary snippet-load" data-idx="' + i + '">Load</button>';
        html += '<button class="btn btn-sm btn-error snippet-delete" data-idx="' + i + '">🗑 Delete</button></div>';
        html += '</div>';
      });
      list.innerHTML = html;
    }
    overlay.classList.add('open');
  }

  // ── Build Challenges Menu ───────────────────
  function buildChallengesMenu() {
    var menu = document.getElementById('challenges-menu');
    var html = '';
    CHALLENGES.forEach(function (ch, i) {
      html += '<div class="challenge-item" data-idx="' + i + '">';
      html += '<div class="challenge-unit">Unit ' + ch.unit + '</div>';
      html += ch.title;
      html += '</div>';
    });
    menu.innerHTML = html;
  }
  buildChallengesMenu();

  // ── Event Handlers ──────────────────────────
  document.getElementById('run-btn').addEventListener('click', runCode);

  document.getElementById('clear-btn').addEventListener('click', function () {
    consoleOutput.innerHTML = '';
  });

  document.getElementById('save-btn').addEventListener('click', saveSnippet);
  document.getElementById('snippets-btn').addEventListener('click', showPrograms);
  
  var exportBtn = document.getElementById('export-js-btn');
  if(exportBtn) {
    exportBtn.addEventListener('click', function() {
      if(!editor) return;
      var code = editor.getValue();
      if(!code.trim()) return;
      var blob = new Blob([code], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'jslab_program_' + Date.now() + '.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  document.getElementById('programs-close').addEventListener('click', function () {
    document.getElementById('programs-drawer-overlay').classList.remove('open');
  });
  document.getElementById('programs-drawer-overlay').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });

  // Snippets load/delete
  document.getElementById('snippets-list').addEventListener('click', function (e) {
    var loadBtn = e.target.closest('.snippet-load');
    var delBtn = e.target.closest('.snippet-delete');
    if (loadBtn) {
      var snippets = ProgressManager.getSnippets();
      var idx = parseInt(loadBtn.getAttribute('data-idx'));
      if (editor && snippets[idx]) {
        editor.setValue(snippets[idx].code);
        document.getElementById('programs-drawer-overlay').classList.remove('open');
      }
    }
    if (delBtn) {
      if(!confirm("Delete this saved program?")) return;
      var idx = parseInt(delBtn.getAttribute('data-idx'));
      var snippets = ProgressManager.getSnippets();
      snippets.splice(idx, 1);
      try { localStorage.setItem('jslab_snippets', JSON.stringify(snippets)); } catch(err) {}
      showPrograms();
    }
  });

  // Challenges dropdown
  var challengesBtn = document.getElementById('challenges-btn');
  var challengesMenu = document.getElementById('challenges-menu');

  challengesBtn.addEventListener('click', function () {
    challengesMenu.classList.toggle('open');
  });

  challengesMenu.addEventListener('click', function (e) {
    var item = e.target.closest('.challenge-item');
    if (item && editor) {
      var idx = parseInt(item.getAttribute('data-idx'));
      editor.setValue(CHALLENGES[idx].code);
      challengesMenu.classList.remove('open');
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.challenges-dropdown')) {
      challengesMenu.classList.remove('open');
    }
  });

  // Console toggle
  consoleHeader.addEventListener('click', function () {
    consolePanel.classList.toggle('collapsed');
    document.getElementById('console-toggle').textContent = consolePanel.classList.contains('collapsed') ? '▸' : '▾';
  });

  // Font size
  document.getElementById('font-size-select').addEventListener('change', function () {
    if (editor) editor.updateOptions({ fontSize: parseInt(this.value) });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.getElementById('snippets-modal').classList.remove('active');
      challengesMenu.classList.remove('open');
    }
  });
})();
