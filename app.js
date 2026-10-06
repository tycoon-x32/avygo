const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';

if ('serviceWorker' in navigator && isSecure) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}

let deferredPrompt = null;
const installToastId = 'avygo-install-toast';

function showInstallToast() {
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (document.getElementById(installToastId)) return;

  const toast = document.createElement('div');
  toast.id = installToastId;
  toast.className = 'pwa-install-toast';
  toast.innerHTML = `
    <div class="install-brand">
      <img src="./avygo%20logo1.jpg" alt="AvyGo logo" />
      <div>
        <strong>Install AvyGo</strong>
        <small>Fast access to your travel app</small>
      </div>
    </div>
    <button type="button" class="install-button">Install</button>
  `;

  const installButton = toast.querySelector('.install-button');
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      hideInstallToast();
    }
    deferredPrompt = null;
  });

  document.body.appendChild(toast);
  setTimeout(() => hideInstallToast(), 10000);
}

function hideInstallToast() {
  const toast = document.getElementById(installToastId);
  if (!toast) return;
  toast.classList.add('hide');
  setTimeout(() => toast.remove(), 300);
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  showInstallToast();
});

window.addEventListener('appinstalled', () => {
  hideInstallToast();
});

const currentPage = location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.nav-links');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    const shouldOpen = !mobileNav.classList.contains('open');
    mobileNav.classList.toggle('open', shouldOpen);
    navToggle.classList.toggle('is-open', shouldOpen);
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      navToggle.classList.remove('is-open');
    });
  });
}

const yearNode = document.querySelector('[data-year]');
if (yearNode) yearNode.textContent = new Date().getFullYear();

const chatMessages = document.getElementById('chat-messages');
const aiForm = document.getElementById('ai-form');

function addMessage(role, text) {
  if (!chatMessages) return;

  const wrap = document.createElement('div');
  wrap.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'Y' : 'A';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  if (role === 'user') {
    wrap.appendChild(bubble);
    wrap.appendChild(avatar);
  } else {
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
  }

  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (aiForm) {
  aiForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const textarea = aiForm.querySelector('textarea');
    const message = textarea.value.trim();
    if (!message) return;

    addMessage('user', message);
    textarea.value = '';

    const sendButton = aiForm.querySelector('button[type="submit"]');
    if (sendButton) {
      sendButton.disabled = true;
      sendButton.textContent = 'Thinking...';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      const reply = data.ok ? data.reply : data.error || 'Something went wrong.';
      addMessage('bot', reply);
    } catch (error) {
      addMessage('bot', 'I could not reach the AI service. Please check your OpenAI API key and server setup.');
    } finally {
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
      }
    }
  });
}

const bookingForms = document.querySelectorAll('[data-booking-form]');
bookingForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const route = data.get('route') || data.get('from') || 'Nairobi → Dubai';
    const type = data.get('type') || form.dataset.service || 'Travel service';
    const date = data.get('date') || data.get('departure') || 'Your selected date';
    const details = Array.from(data.entries())
      .filter(([key]) => key !== 'route' && key !== 'from' && key !== 'to' && key !== 'date' && key !== 'departure')
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');

    const resultBox = form.parentElement.querySelector('.booking-result');
    if (resultBox) {
      resultBox.innerHTML = `
        <h3>Booking request confirmed</h3>
        <p><strong>${type}</strong> • ${route}</p>
        <p>${date}</p>
        <p>${details || 'No extra options selected'}</p>
        <p>Payment integration will be added later. This flow is ready for the next step.</p>
      `;
    }
  });
});
