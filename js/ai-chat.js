const GEMINI_URL = 
  'https://generativelanguage.googleapis.com' +
  '/v1beta/models/gemini-1.5-flash-latest' +
  ':generateContent';

const SYSTEM_PROMPT = `You are a JavaScript tutor 
for Pranav Pushya, CSE-AI/ML student at Chitkara 
University. Course: Frontend Engineering-1 (25CSE0105).

Topics: JS basics, var/let/const, data types, 
operators, loops, functions, scope, closures, HOF,
arrays, objects, ES6+, DOM, events, BOM, async JS,
Promises, async/await, event loop, Git basics.

ST1 score was 12/30. Weak areas: closures, return 
statements, object truthy/falsy, output prediction.

RULES:
- Answer ONLY JS and Git questions
- For anything else: "Bhai yeh JS course hai!"
- Always respond in Hinglish (Hindi+English mix)
- Always include code examples
- Be concise and direct`;

let chatHistory = [];

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input?.value?.trim();
  if (!text) return;

  const key = localStorage.getItem('jslab_gemini_key')
    ?.trim();
  if (!key) {
    appendMsg('ai', 
      '⚠️ API key nahi hai! Upar key daalo pehle.');
    return;
  }

  input.value = '';
  appendMsg('user', text);
  showTyping();

  chatHistory.push({
    role: 'user',
    parts: [{ text }]
  });

  try {
    const res = await fetch(
      GEMINI_URL + '?key=' + key,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: chatHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error?.message || 
        'HTTP ' + res.status
      );
    }

    const data = await res.json();
    const reply = 
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) throw new Error('Empty response');

    chatHistory.push({
      role: 'model',
      parts: [{ text: reply }]
    });

    hideTyping();
    appendMsg('ai', reply);

  } catch(err) {
    hideTyping();
    appendMsg('ai',
      '❌ Error: ' + err.message + '\n\n' +
      'Check karo:\n' +
      '• API key sahi hai?\n' +
      '• aistudio.google.com pe active hai?\n' +
      '• Internet connection theek hai?'
    );
  }
}

function appendMsg(role, text) {
  const chat = document.getElementById('chat-messages');
  if (!chat) return;

  const wrap = document.createElement('div');
  wrap.className = 'msg msg-' + role;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  if (role === 'ai' && window.marked) {
    bubble.innerHTML = marked.parse(text);
  } else {
    bubble.textContent = text;
  }

  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  const chat = document.getElementById('chat-messages');
  if (!chat) return;
  const div = document.createElement('div');
  div.className = 'msg msg-ai';
  div.id = 'typing-ind';
  div.innerHTML = 
    '<div class="msg-bubble typing-dots">' +
    '<span></span><span></span><span></span>' +
    '</div>';
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function hideTyping() {
  document.getElementById('typing-ind')?.remove();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load saved key
  const saved = localStorage.getItem('jslab_gemini_key');
  const keyInput = document.getElementById('api-key-input');
  const keyStatus = document.getElementById('key-status');
  
  if (saved && keyInput) {
    keyInput.value = saved;
    if (keyStatus) {
      keyStatus.textContent = '✓ Key loaded';
      keyStatus.style.color = '#69f0ae';
    }
  }

  // Save key button
  document.getElementById('save-key-btn')
    ?.addEventListener('click', () => {
    const val = keyInput?.value?.trim();
    if (!val) { alert('Key daalo!'); return; }
    localStorage.setItem('jslab_gemini_key', val);
    if (keyStatus) {
      keyStatus.textContent = '✓ Saved!';
      keyStatus.style.color = '#69f0ae';
    }
  });

  // Send button
  document.getElementById('send-btn')
    ?.addEventListener('click', sendMessage);

  // Enter key
  document.getElementById('chat-input')
    ?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Suggested questions
  document.querySelectorAll('.suggested-q')
    .forEach(btn => {
    btn.addEventListener('click', () => {
      const input = 
        document.getElementById('chat-input');
      if (input) input.value = btn.textContent;
      sendMessage();
    });
  });
});
