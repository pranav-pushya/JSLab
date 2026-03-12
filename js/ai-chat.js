/**
 * JSLab — AI Tutor Engine
 * Handles Google Gemini API communication
 */

document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const btnSend = document.getElementById('send-chat-btn');
  const btnClear = document.getElementById('clear-chat-btn');
  const apiStatus = document.getElementById('api-status');

  let messageHistory = [];

  const SYSTEM_PROMPT = `You are a friendly JavaScript tutor for 
            Pranav Pushya, a CSE-AI/ML student at Chitkara 
            University studying Frontend Engineering-1 
            (25CSE0105).
            
            His syllabus covers: JavaScript basics, ES6+, 
            var/let/const, data types, operators, loops, 
            functions, scope, closures, higher-order functions,
            destructuring, JSON, DOM manipulation, event 
            handling, BOM, async JS (callbacks, Promises, 
            async/await), event loop, Git and GitHub.
            
            His ST1 score was 12/30. He needs to improve on:
            closures, return statements, object truthy/falsy,
            output prediction questions.
            
            RULES:
            - Answer ONLY JavaScript and Git questions
            - Redirect everything else back to JS/Git
            - Talk in Hinglish naturally 
              (mix Hindi and English casually)
            - Be direct, zero fluff
            - Always include runnable code examples
            - Keep answers concise but complete
            - Encourage him when he gets things right`;

  const SUGGESTED_QUESTIONS = [
    "Closure kya hota hai JS mein? 🤔",
    "var vs let vs const difference?",
    "Event loop simply explain karo",
    "Promise.then() kaise kaam karta hai?",
    "Mera ST1 12/30 aaya, kya focus karun?"
  ];

  function checkApiKey() {
    const key = localStorage.getItem('jslab_gemini_key');
    if (key) {
      apiStatus.textContent = 'Key saved ✓';
      apiStatus.style.background = 'rgba(105, 240, 174, 0.2)';
      apiStatus.style.color = '#69f0ae';
      return key;
    } else {
      apiStatus.textContent = 'API Key Missing';
      apiStatus.style.background = 'rgba(255, 82, 82, 0.2)';
      apiStatus.style.color = '#ff5252';
      return null;
    }
  }

  // Check key periodically in case they update Settings
  setInterval(checkApiKey, 2000);
  checkApiKey();

  function appendMessage(role, content, isHtml = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role} fade-in`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? 'ME' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    if (isHtml) {
      bubble.innerHTML = content;
    } else {
      bubble.textContent = content; // initial safe text
    }

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
  }

  function showTyping() {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message assistant typing-indicator-container`;
    msgDiv.innerHTML = `
      <div class="avatar">🤖</div>
      <div class="bubble typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  }

  function renderSuggestedQuestions() {
    chatMessages.innerHTML = '';
    
    const welcomeBubble = document.createElement('div');
    welcomeBubble.className = 'message assistant fade-in';
    welcomeBubble.innerHTML = `<div class="avatar">🤖</div><div class="bubble">Hello! I am your JSLab AI Tutor. What would you like to learn today?</div>`;
    chatMessages.appendChild(welcomeBubble);

    const suggestContainer = document.createElement('div');
    suggestContainer.style.display = 'flex';
    suggestContainer.style.flexWrap = 'wrap';
    suggestContainer.style.gap = '10px';
    suggestContainer.style.marginTop = '20px';

    SUGGESTED_QUESTIONS.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.fontSize = '13px';
      btn.style.padding = '8px 12px';
      btn.style.borderRadius = '20px';
      btn.textContent = q;
      btn.addEventListener('click', () => {
        chatInput.value = q;
        suggestContainer.remove();
        sendMessage();
      });
      suggestContainer.appendChild(btn);
    });

    chatMessages.appendChild(suggestContainer);
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const apiKey = checkApiKey();
    if (!apiKey) {
      alert("Please configure your Gemini API Key in Settings (⚙️ icon).");
      return;
    }

    // Remove suggested questions if they exist
    const suggestContainer = chatMessages.querySelector('div[style*="flexWrap"]');
    if (suggestContainer) suggestContainer.remove();

    // Add User message
    appendMessage('user', text);
    chatInput.value = '';
    
    messageHistory.push({
      role: "user",
      parts: [{ text: text }]
    });

    const typingEl = showTyping();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: messageHistory
          })
        }
      );

      typingEl.remove();

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const reply = data.candidates[0].content.parts[0].text;
      
      messageHistory.push({
        role: "model",
        parts: [{ text: reply }]
      });
      
      let htmlContent = reply;
      if (typeof marked !== 'undefined') {
        htmlContent = marked.parse(reply);
      }
      
      appendMessage('assistant', htmlContent, true);

      // Log activity
      if(window.logActivity) window.logActivity("Chatted with AI Tutor", "chat");

    } catch (e) {
      typingEl.remove();
      const errBubble = appendMessage('assistant', `Error: ${e.message}`);
      errBubble.style.color = 'var(--error)';
      messageHistory.pop();
    }
  }

  btnSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  btnClear.addEventListener('click', () => {
    if(!confirm("Clear chat history?")) return;
    messageHistory = [];
    renderSuggestedQuestions();
  });

  // Initialize
  if (messageHistory.length === 0) {
    renderSuggestedQuestions();
  }
});
