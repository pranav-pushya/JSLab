/**
 * JSLab — Quiz Engine
 * Pulls questions from LECTURES data, supports ST1/ST2/EndTerm/Unit modes.
 */
(function () {
  'use strict';

  var MODES = {
    st1:     { label: 'ST1 Practice', maxLecture: 18, count: 20, time: 25 },
    st2:     { label: 'ST2 Practice', maxLecture: 45, count: 40, time: 45 },
    unit:    { label: 'Unit Practice', count: 15, time: 0 },
    shuffle: { label: 'Shuffle & Practice', count: 10, time: 0 } // count is dynamic
  };

  var state = { mode: null, questions: [], current: 0, answers: [], timer: null, timeLeft: 0, answeredCurrent: false };

  var homeEl = document.getElementById('quiz-home');
  var activeEl = document.getElementById('quiz-active');
  var resultsEl = document.getElementById('quiz-results');
  var questionArea = document.getElementById('quiz-question-area');
  var progressEl = document.getElementById('quiz-progress');
  var timerEl = document.getElementById('quiz-timer');
  var modeLabel = document.getElementById('quiz-mode-label');
  var unitSelector = document.getElementById('unit-selector');
  var shuffleSelector = document.getElementById('shuffle-selector');

  // ── Build Question Pool from Lectures & Exam Bank ───────
  function getQuestionPool(maxLecture, unitFilter) {
    var pool = [];
    LECTURES.forEach(function (lec) {
      if (maxLecture && lec.id > maxLecture) return;
      if (unitFilter && lec.unit !== unitFilter) return;
      if (!lec.miniQuiz) return;
      lec.miniQuiz.forEach(function (q) {
        pool.push({ lecture: lec.id, lectureTitle: lec.title, q: q.q, options: q.options, correct: q.correct, explanation: q.explanation });
      });
    });
    
    if (typeof EXAM_QUESTIONS !== 'undefined') {
      EXAM_QUESTIONS.forEach(function (q) {
        if (maxLecture && Math.floor(q.lecture) > maxLecture) return;
        pool.push({ lecture: q.lecture, lectureTitle: q.topic, q: q.question, options: q.options, correct: q.correct, explanation: q.explanation, code: q.code });
      });
    }
    return validateAndFilterQuestions(pool);
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // ── Question Filter ─────────────────────────
  function validateAndFilterQuestions(arr) {
    return arr.filter((q, i) => {
      if (!q || typeof q !== 'object') {
        console.warn('Bad question at index', i);
        return false;
      }
      if (!Array.isArray(q.options) || 
          q.options.length < 2) {
        console.warn('Missing options:', q.id || i);
        return false;
      }
      // Pad to 4 options if needed
      while (q.options.length < 4) {
        q.options.push('(No option)');
      }
      if (typeof q.correct !== 'number' || 
          q.correct < 0 || 
          q.correct >= q.options.length) {
        q.correct = 0;
      }
      return true;
    });
  }

  // ── Start Quiz ──────────────────────────────
  function startQuiz(mode, filterVal) {
    var cfg = MODES[mode];
    var maxLec = (mode === 'unit' || mode === 'shuffle') ? null : cfg.maxLecture;
    var unitFilter = mode === 'unit' ? filterVal : null;
    var count = mode === 'shuffle' ? filterVal : cfg.count;
    
    var pool = getQuestionPool(maxLec, unitFilter);
    shuffle(pool);
    var questions = pool.slice(0, count);

    // If practicing indefinitely, we can just load the requested count and reshuffle if needed later
    if (questions.length === 0) {
      alert('No questions available for this selection.');
      return;
    }

    state.mode = mode;
    state.questions = questions;
    state.current = 0;
    state.answers = new Array(questions.length).fill(-1);
    state.answeredCurrent = false;
    state.timeLeft = cfg.time * 60;

    var labelText = cfg.label;
    if (mode === 'unit') labelText += ' (Unit ' + filterVal + ')';
    if (mode === 'shuffle') labelText += ' (' + filterVal + ' Qs)';
    modeLabel.textContent = labelText;
    
    homeEl.style.display = 'none';
    resultsEl.style.display = 'none';
    activeEl.style.display = 'block';

    if (cfg.time > 0) {
      timerEl.style.display = '';
      startTimer();
    } else {
      timerEl.style.display = 'none';
    }

    renderQuestion();
  }

  // ── Timer ───────────────────────────────────
  function startTimer() {
    if (state.timer) clearInterval(state.timer);
    updateTimerDisplay();
    state.timer = setInterval(function () {
      state.timeLeft--;
      updateTimerDisplay();
      if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        submitQuiz();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    var m = Math.floor(state.timeLeft / 60);
    var s = state.timeLeft % 60;
    timerEl.textContent = m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
    timerEl.className = 'quiz-timer' + (state.timeLeft <= 60 ? ' warning' : '');
  }

  // ── Render Question ─────────────────────────
  function renderQuestion() {
    var q = state.questions[state.current];
    var total = state.questions.length;
    progressEl.textContent = 'Q ' + (state.current + 1) + ' / ' + total;

    var html = '<div class="glass-card quiz-question">';
    html += '<div class="q-number">Question ' + (state.current + 1) + ' of ' + total;
    html += ' <span style="float:right;font-size:11px;color:var(--text-secondary);">L' + q.lecture + ': ' + q.lectureTitle + '</span></div>';
    html += '<div class="q-text">' + q.q + '</div>';
    if (q.code) {
      html += '<pre style="margin-top:10px;margin-bottom:15px;"><code class="language-javascript">' + escapeHtml(q.code) + '</code></pre>';
    }

    html += '<div class="options-wrap">';
    if (!q.options || q.options.length === 0) {
      html += '<p style="color:#ff5252">No options available</p>';
    } else {
      q.options.forEach(function (opt, oi) {
        var cls = 'opt-btn';
        if (state.answers[state.current] === oi) cls += ' opt-selected';
        
        // If in shuffle mode and we've already answered this question, show correct/wrong
        if (state.mode === 'shuffle' && state.answers[state.current] !== undefined) {
          if (oi === q.correct) cls += ' opt-correct';
          else if (oi === state.answers[state.current]) cls += ' opt-wrong';
        }

        html += '<button class="' + cls + '" data-oi="' + oi + '">';
        html += '<span class="opt-letter">' + String.fromCharCode(65 + oi) + '</span>';
        html += '<span class="opt-text">' + escapeHtml(opt) + '</span>';
        html += '</button>';
      });
    }
    html += '</div>';
    
    // Immediate feedback container for shuffle mode
    html += '<div id="shuffle-feedback" style="display:none; margin-top:20px; padding:15px; border-radius:8px; font-weight:500;"></div>';
    html += '<div id="shuffle-explanation" class="quiz-explanation" style="display:none; margin-top:10px;"></div>';

    html += '</div>';
    questionArea.innerHTML = html;
    
    if (q.code && typeof hljs !== 'undefined') {
      hljs.highlightAll();
    }

    // Nav buttons
    document.getElementById('prev-q').disabled = state.current === 0 || state.mode === 'shuffle';
    
    var isLast = state.current === total - 1;
    var nextBtn = document.getElementById('next-q');
    var subBtn = document.getElementById('submit-quiz');
    
    if (state.mode === 'shuffle') {
      nextBtn.style.display = isLast ? 'none' : '';
      nextBtn.disabled = !state.answeredCurrent; // Must answer to proceed in shuffle
      subBtn.style.display = isLast ? '' : 'none';
      if (isLast) subBtn.textContent = "Finish & Reshuffle";
    } else {
      nextBtn.style.display = isLast ? 'none' : '';
      nextBtn.disabled = false;
      subBtn.style.display = isLast ? '' : 'none';
      subBtn.textContent = "✓ Submit Quiz";
    }
  }

  // ── Submit Quiz ─────────────────────────────
  function submitQuiz() {
    if (state.timer) clearInterval(state.timer);
    var score = 0;
    state.questions.forEach(function (q, i) {
      if (state.answers[i] === q.correct) score++;
    });

    var total = state.questions.length;
    var pct = Math.round((score / total) * 100);
    var passed = pct >= 50;

    // Save score (skip continuous shuffle mode)
    if (typeof ProgressManager !== 'undefined' && state.mode !== 'shuffle') {
      ProgressManager.saveQuizScore(state.mode, score, total);
      ProgressManager.logActivity('Quiz ' + MODES[state.mode].label + ': ' + score + '/' + total);
    }

    // Show results
    activeEl.style.display = 'none';
    var html = '<div class="glass-card scorecard">';
    html += '<h2>Quiz Results</h2>';
    html += '<div class="score-big ' + (passed ? 'pass' : 'fail') + '">' + pct + '%</div>';
    html += '<div class="score-details">';
    html += '<div class="score-detail"><div class="val">' + score + '</div><div class="lbl">Correct</div></div>';
    html += '<div class="score-detail"><div class="val">' + (total - score) + '</div><div class="lbl">Wrong</div></div>';
    html += '<div class="score-detail"><div class="val">' + total + '</div><div class="lbl">Total</div></div>';
    html += '</div>';
    html += '<p style="margin:16px 0;color:var(--text-secondary);">' + (passed ? '🎉 Great job! Keep it up!' : '📚 Keep studying! Review the lectures and try again.') + '</p>';
    html += '</div>';

    // Review section
    html += '<div style="margin-top:24px;"><h3 style="margin-bottom:16px;">📖 Review Answers</h3>';
    state.questions.forEach(function (q, i) {
      var yours = state.answers[i];
      var correct = q.correct;
      var isCorrect = yours === correct;
      html += '<div class="glass-card" style="margin-bottom:12px;">';
      html += '<div class="q-number" style="display:flex;justify-content:space-between;">';
      html += '<span>Q' + (i + 1) + '</span>';
      html += '<span style="color:' + (isCorrect ? 'var(--success)' : 'var(--error)') + ';">' + (isCorrect ? '✅ Correct' : '❌ Wrong') + '</span>';
      html += '</div>';
      html += '<div class="q-text">' + q.q + '</div>';
      q.options.forEach(function (opt, oi) {
        var cls = '';
        if (oi === correct) cls = ' correct';
        else if (oi === yours && yours !== correct) cls = ' wrong';
        html += '<div class="quiz-option' + cls + '" style="cursor:default;pointer-events:none;">';
        html += '<span class="option-letter">' + String.fromCharCode(65 + oi) + '</span>';
        html += opt;
        html += '</div>';
      });
      if (!isCorrect) {
        html += '<div class="quiz-explanation">' + q.explanation + '</div>';
      }
      html += '</div>';
    });
    html += '</div>';

    html += '<div style="text-align:center;margin-top:24px;"><button class="btn btn-primary btn-lg" id="back-home-btn">← Back to Quizzes</button></div>';

    resultsEl.innerHTML = html;
    resultsEl.style.display = 'block';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    loadScoreHistory();
  }

  // ── Score History ───────────────────────────
  function loadScoreHistory() {
    var el = document.getElementById('score-history');
    if (!el) return;
    var scores = [];
    try {
      scores = JSON.parse(localStorage.getItem('jslab_quiz_scores') || '[]');
    } catch(e) {}

    if (!scores.length) {
      el.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:16px;">No quiz attempts yet.</p>';
      return;
    }
    var html = '<table class="score-history-table"><thead><tr><th>Quiz</th><th>Score</th><th>Date</th></tr></thead><tbody>';
    scores.slice(-10).reverse().forEach(function (s) {
      var pct = Math.round((s.score / s.total) * 100);
      html += '<tr><td>' + escapeHtml(String(s.label || s.id || 'Quiz')) + '</td><td>' + escapeHtml(s.score + '/' + s.total + ' (' + pct + '%)') + '</td><td>' + new Date(s.date).toLocaleDateString() + '</td></tr>';
    });
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  // Event Handlers ──────────────────────────
  // Mode selection
  document.querySelectorAll('.quiz-mode-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var mode = this.getAttribute('data-mode');
      
      unitSelector.style.display = 'none';
      shuffleSelector.style.display = 'none';
      
      if (mode === 'unit') {
        unitSelector.style.display = 'block';
      } else if (mode === 'shuffle') {
        shuffleSelector.style.display = 'block';
      } else {
        startQuiz(mode);
      }
    });
  });

  // Unit selection
  document.querySelectorAll('[data-unit-start]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      startQuiz('unit', parseInt(this.getAttribute('data-unit-start')));
    });
  });

  // Shuffle count selection
  document.querySelectorAll('[data-shuffle-count]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      startQuiz('shuffle', parseInt(this.getAttribute('data-shuffle-count')));
    });
  });

  // Answer selection
  questionArea.addEventListener('click', function (e) {
    var opt = e.target.closest('.quiz-option');
    if (!opt) return;
    
    if (state.mode === 'shuffle' && state.answeredCurrent) return; // Prevent re-answering in shuffle mode

    var oi = parseInt(opt.getAttribute('data-oi'));
    state.answers[state.current] = oi;
    
    if (state.mode === 'shuffle') {
      state.answeredCurrent = true;
      var q = state.questions[state.current];
      var isCorrect = oi === q.correct;
      
      // Update UI for options
      document.querySelectorAll('.quiz-option').forEach(function(btn, i) {
        if (i === q.correct) btn.classList.add('correct');
        else if (i === oi && !isCorrect) btn.classList.add('wrong');
        btn.style.pointerEvents = 'none';
      });
      
      // Show feedback
      var fb = document.getElementById('shuffle-feedback');
      fb.style.display = 'block';
      fb.style.backgroundColor = isCorrect ? 'rgba(105, 240, 174, 0.15)' : 'rgba(255, 82, 82, 0.15)';
      fb.style.color = isCorrect ? 'var(--success)' : 'var(--error)';
      fb.innerHTML = isCorrect ? '✅ Correct!' : '❌ Incorrect.';
      
      if (q.explanation && !isCorrect) {
        var exp = document.getElementById('shuffle-explanation');
        exp.style.display = 'block';
        exp.innerHTML = q.explanation;
      }
      
      // Enable Next/Finish button
      var isLast = state.current === state.questions.length - 1;
      if (isLast) {
        document.getElementById('submit-quiz').disabled = false;
      } else {
        document.getElementById('next-q').disabled = false;
      }
    } else {
      renderQuestion();
    }
  });

  // Navigation
  document.getElementById('prev-q').addEventListener('click', function () {
    if (state.mode === 'shuffle') return; // Cannot go back in shuffle mode
    if (state.current > 0) { state.current--; renderQuestion(); }
  });
  document.getElementById('next-q').addEventListener('click', function () {
    if (state.current < state.questions.length - 1) { 
      state.current++; 
      state.answeredCurrent = !!(state.answers[state.current] !== -1);
      renderQuestion(); 
    }
  });
  document.getElementById('submit-quiz').addEventListener('click', function () {
    if (state.mode === 'shuffle') {
      // Reshuffle and start over
      alert("Practice session finished! Let's reshuffle and keep going.");
      var count = state.questions.length;
      startQuiz('shuffle', count);
      return;
    }
    var unanswered = state.answers.filter(function (a) { return a === -1; }).length;
    if (unanswered > 0) {
      if (!confirm(unanswered + ' question(s) unanswered. Submit anyway?')) return;
    }
    submitQuiz();
  });
  document.getElementById('quit-quiz').addEventListener('click', function () {
    if (confirm('Are you sure you want to quit this quiz?')) {
      if (state.timer) clearInterval(state.timer);
      activeEl.style.display = 'none';
      homeEl.style.display = 'block';
    }
  });

  // Back to home from results
  resultsEl.addEventListener('click', function (e) {
    if (e.target.id === 'back-home-btn') {
      resultsEl.style.display = 'none';
      homeEl.style.display = 'block';
    }
  });

  // ── Init ────────────────────────────────────
  loadScoreHistory();
})();
