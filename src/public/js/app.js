// ==========================================================================
// Vallabh Seeds & Fertilizers - WhatsApp Bot Web Application
// Client Controller (Simulator, WebSocket, State Inspector & Admin Panel)
// ==========================================================================

const DEFAULT_PHONE = '+919876543210';
let currentPhone = DEFAULT_PHONE;
let socket = null;
let currentInteractiveData = null;
let productsCache = [];
let ratesCache = [];

// DOM References
const chatContainer = document.getElementById('wa-chat-container');
const messageInput = document.getElementById('wa-message-input');
const interactiveTray = document.getElementById('wa-interactive-tray');
const cartCounter = document.getElementById('cart-counter');
const inspectorCartCount = document.getElementById('inspector-cart-count');
const inspectorCartItems = document.getElementById('inspector-cart-items');
const inspectorCartTotalBox = document.getElementById('inspector-cart-total-box');
const inspectorCartTotal = document.getElementById('inspector-cart-total');
const stateCurrentFlow = document.getElementById('state-current-flow');
const stateHistoryDepth = document.getElementById('state-history-depth');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWebSocket();
  loadInitialBotMessage();
  loadAdminRates();
  loadAdminProducts();
  loadAdminOrders();
  loadStoreInfo();
});

// Live clock in phone status bar
function initClock() {
  const clockEl = document.getElementById('status-clock');
  const update = () => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    if (clockEl) clockEl.textContent = `${h}:${m}`;
  };
  update();
  setInterval(update, 30000);
}

// ==========================================================================
// WebSocket & Messaging
// ==========================================================================

function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/simulator`;

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('✅ Simulator WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'BOT_RESPONSE') {
        removeTypingIndicator();
        renderBotResponse(data.response);
        updateInspector(data.session);
      }
    };

    socket.onclose = () => {
      console.log('⚠️ WebSocket closed, will retry in 3s');
      setTimeout(initWebSocket, 3000);
    };
  } catch (err) {
    console.warn('WebSocket init error, fallback to REST API', err);
  }
}

async function loadInitialBotMessage() {
  showTypingIndicator();
  try {
    const res = await fetch('/api/simulator/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, text: 'Hi' })
    });
    const data = await res.json();
    removeTypingIndicator();
    if (data.response) {
      renderBotResponse(data.response);
      updateInspector(data.session);
    }
  } catch (e) {
    removeTypingIndicator();
    console.error('Failed to load initial welcome message:', e);
  }
}

function sendUserMessage(text) {
  if (!text || !text.trim()) return;
  const clean = text.trim();

  // Render outgoing user bubble
  renderUserBubble(clean);

  // Clear inputs & trays
  if (messageInput) messageInput.value = '';
  if (interactiveTray) interactiveTray.innerHTML = '';

  // Show typing indicator
  showTypingIndicator();

  // Send via WebSocket or REST
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'USER_MESSAGE',
      phone: currentPhone,
      text: clean,
      userName: 'शेतकरी मित्र'
    }));
  } else {
    // REST fallback
    fetch('/api/simulator/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, text: clean })
    })
      .then((r) => r.json())
      .then((data) => {
        removeTypingIndicator();
        renderBotResponse(data.response);
        updateInspector(data.session);
      })
      .catch((err) => {
        removeTypingIndicator();
        console.error('Error sending message:', err);
      });
  }
}

function sendMessageFromInput() {
  if (messageInput) {
    sendUserMessage(messageInput.value);
  }
}

function handleInputKeydown(e) {
  if (e.key === 'Enter') {
    sendMessageFromInput();
  }
}

function sendQuickMessage(text) {
  sendUserMessage(text);
}

// ==========================================================================
// Rendering Messages
// ==========================================================================

function renderUserBubble(text) {
  const timeStr = formatCurrentTime();
  const wrapper = document.createElement('div');
  wrapper.className = 'wa-bubble-wrapper user';
  wrapper.innerHTML = `
    <div class="wa-bubble">
      ${escapeHtml(text)}
      <div class="bubble-meta">
        <span>${timeStr}</span>
        <span class="bubble-ticks">✓✓</span>
      </div>
    </div>
  `;
  chatContainer.appendChild(wrapper);
  scrollToBottom();
}

function renderBotResponse(response) {
  const timeStr = formatCurrentTime();
  const wrapper = document.createElement('div');
  wrapper.className = 'wa-bubble-wrapper bot';

  const formattedText = formatWhatsAppMarkdown(response.text);

  let interactiveHtml = '';

  // If response contains interactive buttons
  if (response.interactive) {
    currentInteractiveData = response.interactive;

    if (response.interactive.type === 'button' && response.interactive.buttons) {
      interactiveHtml += `<div class="wa-interactive-buttons">`;
      response.interactive.buttons.forEach((btn) => {
        interactiveHtml += `
          <button class="wa-btn-reply" onclick="sendQuickMessage('${escapeHtml(btn.id)}')">
            ${escapeHtml(btn.title)}
          </button>
        `;
      });
      interactiveHtml += `</div>`;
    } else if (response.interactive.type === 'list' && response.interactive.sections) {
      interactiveHtml += `
        <button class="wa-list-trigger-btn" onclick="openListSheet()">
          <span>📋 ${escapeHtml(response.interactive.buttonText || 'पर्याय निवडा')}</span>
          <span>▼</span>
        </button>
      `;
    }
  }

  wrapper.innerHTML = `
    <div class="wa-bubble">
      ${formattedText}
      ${interactiveHtml}
      <div class="bubble-meta">
        <span>${timeStr}</span>
      </div>
    </div>
  `;

  chatContainer.appendChild(wrapper);
  scrollToBottom();
}

function showTypingIndicator() {
  removeTypingIndicator();
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'wa-bubble-wrapper bot';
  indicator.innerHTML = `
    <div class="typing-bubble">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  chatContainer.appendChild(indicator);
  scrollToBottom();
}

function removeTypingIndicator() {
  const existing = document.getElementById('typing-indicator');
  if (existing) existing.remove();
}

function scrollToBottom() {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 50);
}

function formatCurrentTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// Convert WhatsApp Markdown (*bold*, _italic_, `code`, newline) to HTML
function formatWhatsAppMarkdown(text) {
  if (!text) return '';
  let str = escapeHtml(text);

  // Bold *text*
  str = str.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  // Italic _text_
  str = str.replace(/_(.*?)_/g, '<em>$1</em>');
  // Monospace `code`
  str = str.replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:2px 4px;border-radius:4px;color:#25d366;">$1</code>');
  // Newlines
  str = str.replace(/\n/g, '<br>');

  return str;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// Interactive Bottom Sheet (WhatsApp List Picker)
// ==========================================

function openListSheet() {
  if (!currentInteractiveData || !currentInteractiveData.sections) return;
  const modal = document.getElementById('list-sheet-modal');
  const title = document.getElementById('sheet-title');
  const container = document.getElementById('sheet-items-container');

  title.textContent = currentInteractiveData.header || 'पर्याय निवडा';
  container.innerHTML = '';

  currentInteractiveData.sections.forEach((sec) => {
    const secTitle = document.createElement('div');
    secTitle.style.cssText = 'font-size:12px;font-weight:700;color:#00a884;text-transform:uppercase;margin:8px 0 4px;';
    secTitle.textContent = sec.title;
    container.appendChild(secTitle);

    sec.rows.forEach((row) => {
      const btn = document.createElement('button');
      btn.className = 'sheet-row-btn';
      btn.onclick = () => {
        closeListSheet();
        sendQuickMessage(row.id);
      };
      btn.innerHTML = `
        <span class="sheet-row-title">${escapeHtml(row.title)}</span>
        ${row.description ? `<span class="sheet-row-desc">${escapeHtml(row.description)}</span>` : ''}
      `;
      container.appendChild(btn);
    });
  });

  modal.classList.add('active');
}

function closeListSheet(e) {
  const modal = document.getElementById('list-sheet-modal');
  if (modal) modal.classList.remove('active');
}

// ==========================================
// State Inspector & Cart
// ==========================================

function updateInspector(session) {
  if (!session) return;

  if (stateCurrentFlow) stateCurrentFlow.textContent = session.currentFlow || 'MAIN_MENU';
  if (cartCounter) cartCounter.textContent = session.cartCount || 0;
  if (inspectorCartCount) inspectorCartCount.textContent = `${session.cartCount || 0} वस्तू`;

  // Update Cart Preview List
  if (inspectorCartItems) {
    if (!session.cart || session.cart.length === 0) {
      inspectorCartItems.innerHTML = `<p class="empty-state-text">सध्या कार्टमध्ये काहीही नाही. उत्पादने निवडून ऑर्डर करा.</p>`;
      if (inspectorCartTotalBox) inspectorCartTotalBox.style.display = 'none';
    } else {
      let html = '';
      let subtotal = 0;
      session.cart.forEach((item, idx) => {
        subtotal += item.totalPrice;
        html += `
          <div class="cart-item-card">
            <div class="cart-item-details">
              <strong>${item.productName} (${item.brand})</strong>
              <span>${item.selectedSize ? item.selectedSize + ' • ' : ''}${item.quantity} ${item.unit}</span>
            </div>
            <span class="cart-item-price">₹${item.totalPrice}</span>
          </div>
        `;
      });
      inspectorCartItems.innerHTML = html;
      if (inspectorCartTotal) inspectorCartTotal.textContent = `₹${subtotal}`;
      if (inspectorCartTotalBox) inspectorCartTotalBox.style.display = 'block';
    }
  }

  // Update Back Stack Depth
  fetch(`/api/simulator/session/${currentPhone}`)
    .then((r) => r.json())
    .then((data) => {
      if (stateHistoryDepth) {
        stateHistoryDepth.textContent = `${data.historyDepth || 0} पायऱ्या`;
      }
    })
    .catch(() => {});
}

async function resetConversation() {
  chatContainer.innerHTML = `
    <div class="wa-encryption-notice">
      🔒 वल्लभ सीड्स अँड फर्टिलायझर्स व्यावसायिक चॅट. आपले संभाषण सुरक्षित आहे.
    </div>
  `;
  showTypingIndicator();
  try {
    const res = await fetch('/api/simulator/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone })
    });
    const data = await res.json();
    removeTypingIndicator();
    if (data.response) {
      renderBotResponse(data.response);
    }
    updateInspector({ currentFlow: 'MAIN_MENU', cart: [], cartCount: 0 });
    showNotification('चॅट यशस्वीरीत्या रीसेट केले!');
  } catch (err) {
    removeTypingIndicator();
    console.error('Reset error:', err);
  }
}

// ==========================================
// Scenario Testers (Step-by-step simulations)
// ==========================================

async function runScenarioCotton() {
  sendUserMessage('1'); // Agri Menu
  await delay(700);
  sendUserMessage('1'); // Seeds
  await delay(700);
  sendUserMessage('1'); // Cotton
  await delay(700);
  sendUserMessage('1'); // Rasi 659
}

async function runScenarioFertilizers() {
  sendUserMessage('1'); // Agri Menu
  await delay(700);
  sendUserMessage('2'); // Fertilizers
  await delay(700);
  sendUserMessage('1'); // Urea
}

async function runScenarioPesticides() {
  sendUserMessage('1'); // Agri Menu
  await delay(700);
  sendUserMessage('3'); // Pesticides
  await delay(700);
  sendUserMessage('1'); // Cotton Crop
  await delay(700);
  sendUserMessage('1'); // कीड (Bollworm/Aphids)
}

async function runScenarioSteelAngle() {
  sendUserMessage('2'); // Construction
  await delay(700);
  sendUserMessage('3'); // MS Angle
  await delay(700);
  sendUserMessage('3'); // 40x40 size
  await delay(700);
  sendUserMessage('50 Kg'); // 50 Kg Quantity
}

async function runScenarioCementRates() {
  sendUserMessage('4'); // Today's Rates
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==========================================
// Admin Dashboard Controller
// ==========================================

function switchView(viewName) {
  const simView = document.getElementById('view-simulator');
  const adminView = document.getElementById('view-admin');
  const simBtn = document.getElementById('tab-simulator-btn');
  const adminBtn = document.getElementById('tab-admin-btn');

  if (viewName === 'simulator') {
    simView.classList.add('active');
    adminView.classList.remove('active');
    simBtn.classList.add('active');
    adminBtn.classList.remove('active');
  } else {
    simView.classList.remove('active');
    adminView.classList.add('active');
    simBtn.classList.remove('active');
    adminBtn.classList.add('active');
    loadAdminRates();
    loadAdminProducts();
    loadAdminOrders();
  }
}

function switchAdminTab(tabName) {
  const tabs = document.querySelectorAll('.admin-tab-content');
  const btns = document.querySelectorAll('.admin-subnav .admin-tab-btn');

  tabs.forEach((t) => t.classList.remove('active'));
  btns.forEach((b) => b.classList.remove('active'));

  const targetTab = document.getElementById(`admin-tab-${tabName}`);
  if (targetTab) targetTab.classList.add('active');

  const activeBtn = Array.from(btns).find((b) => b.getAttribute('onclick')?.includes(tabName));
  if (activeBtn) activeBtn.classList.add('active');
}

// Load Today's Rates into Admin Table
async function loadAdminRates() {
  try {
    const res = await fetch('/api/rates');
    ratesCache = await res.json();
    const tbody = document.getElementById('rates-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    ratesCache.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${r.category}</strong></td>
        <td>${r.item}</td>
        <td>
          <input type="text" class="rate-input" id="rate-input-${r.id}" value="${r.rate}">
        </td>
        <td>${r.unit}</td>
        <td><span class="badge">${r.updatedAt}</span></td>
        <td>
          <button class="btn-primary" style="padding:6px 12px;font-size:12px;" onclick="saveSingleRate('${r.id}')">
            सेव्ह करा
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load rates:', err);
  }
}

async function saveSingleRate(id) {
  const input = document.getElementById(`rate-input-${id}`);
  if (!input) return;
  const newRate = input.value.trim();

  try {
    const res = await fetch(`/api/rates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate: newRate })
    });
    const data = await res.json();
    if (data.success) {
      showNotification(`दर अद्ययावत केला: ${newRate}`);
    }
  } catch (e) {
    showNotification('दर सेव्ह करताना त्रुटी आली!');
  }
}

// Load Products into Admin Table
async function loadAdminProducts() {
  try {
    const res = await fetch('/api/products');
    productsCache = await res.json();
    renderProductsTable(productsCache);
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  products.forEach((p) => {
    const tr = document.createElement('tr');
    const availBadge = p.available
      ? `<span class="badge" style="color:#25d366;">उपलब्ध (In Stock)</span>`
      : `<span class="badge" style="color:#ff5252;">संपले (Out of Stock)</span>`;

    tr.innerHTML = `
      <td><strong>${p.nameMarathi || p.name}</strong><br><small class="text-muted">${p.name}</small></td>
      <td>${p.brand}</td>
      <td>${p.packSize}</td>
      <td><strong>₹${p.price}</strong> / ${p.unit}</td>
      <td>${availBadge}</td>
      <td>
        <button class="btn-secondary" style="padding:4px 10px;font-size:12px;" onclick="toggleProductStock('${p.id}')">
          साठा बदला
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterProductsTable() {
  const filter = document.getElementById('product-category-filter')?.value;
  if (!filter || filter === 'ALL') {
    renderProductsTable(productsCache);
  } else {
    const filtered = productsCache.filter((p) => p.subcategory === filter || p.category === filter);
    renderProductsTable(filtered);
  }
}

async function toggleProductStock(productId) {
  const prod = productsCache.find((p) => p.id === productId);
  if (!prod) return;

  const newStatus = !prod.available;
  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      prod.available = newStatus;
      renderProductsTable(productsCache);
      showNotification(`साठा स्थिती अद्ययावत केली!`);
    }
  } catch (e) {
    console.error(e);
  }
}

// Load Orders into Admin Table
async function loadAdminOrders() {
  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    orders.forEach((o) => {
      const itemsList = o.items.map((i) => `${i.productName} x ${i.quantity} ${i.unit}`).join('<br>');
      const dateStr = new Date(o.createdAt).toLocaleDateString('mr-IN');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color:#00a884;">${o.orderId}</strong></td>
        <td><strong>${o.customerName}</strong><br><small class="text-muted">${o.customerPhone}</small></td>
        <td>${o.address}</td>
        <td><small>${itemsList}</small></td>
        <td><strong style="color:#25d366;">₹${o.totalAmount}</strong></td>
        <td><span class="badge">${o.status}</span></td>
        <td>${dateStr}</td>
        <td>
          <select class="form-select" style="padding:4px 8px;font-size:12px;" onchange="updateOrderStatus('${o.orderId}', this.value)">
            <option value="PENDING" ${o.status === 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="CONFIRMED" ${o.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
            <option value="DISPATCHED" ${o.status === 'DISPATCHED' ? 'selected' : ''}>Dispatched</option>
            <option value="DELIVERED" ${o.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
            <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load orders:', err);
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showNotification(`ऑर्डर ${orderId} स्थिती: ${newStatus}`);
    }
  } catch (err) {
    showNotification('ऑर्डर स्थिती बदलताना त्रुटी!');
  }
}

// Load Store Info
async function loadStoreInfo() {
  try {
    const res = await fetch('/api/store');
    const store = await res.json();
    if (document.getElementById('store-name')) document.getElementById('store-name').value = store.name;
    if (document.getElementById('store-name-mr')) document.getElementById('store-name-mr').value = store.nameMarathi;
    if (document.getElementById('store-address')) document.getElementById('store-address').value = store.address;
    if (document.getElementById('store-phone-1')) document.getElementById('store-phone-1').value = store.phones[0] || '';
    if (document.getElementById('store-phone-2')) document.getElementById('store-phone-2').value = store.phones[1] || '';
    if (document.getElementById('store-expert-name')) document.getElementById('store-expert-name').value = store.expertName;
    if (document.getElementById('store-expert-phone')) document.getElementById('store-expert-phone').value = store.expertPhone;
    if (document.getElementById('store-timings')) document.getElementById('store-timings').value = store.timings;
    if (document.getElementById('store-upi')) document.getElementById('store-upi').value = store.upiId;
  } catch (err) {
    console.error(err);
  }
}

async function saveStoreInfo() {
  const payload = {
    name: document.getElementById('store-name')?.value,
    nameMarathi: document.getElementById('store-name-mr')?.value,
    address: document.getElementById('store-address')?.value,
    phones: [
      document.getElementById('store-phone-1')?.value || '',
      document.getElementById('store-phone-2')?.value || ''
    ],
    expertName: document.getElementById('store-expert-name')?.value,
    expertPhone: document.getElementById('store-expert-phone')?.value,
    timings: document.getElementById('store-timings')?.value,
    upiId: document.getElementById('store-upi')?.value
  };

  try {
    const res = await fetch('/api/store', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showNotification('दुकानाची माहिती यशस्वीरीत्या सेव्ह केली!');
    }
  } catch (e) {
    showNotification('माहिती सेव्ह करताना त्रुटी आली!');
  }
}

// UI Helpers
function toggleTheme() {
  document.body.classList.toggle('light-theme');
}

function showNotification(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// ==========================================
// Actual WhatsApp Phone QR Linking Controller
// ==========================================
let qrPollInterval = null;

async function checkWhatsAppStatus() {
  try {
    const res = await fetch('/api/whatsapp/status');
    const data = await res.json();

    const pill = document.getElementById('baileys-status-pill');
    const qrArea = document.getElementById('qr-display-area');
    const qrImg = document.getElementById('qr-image');
    const banner = document.getElementById('qr-connected-banner');
    const startBtn = document.getElementById('btn-start-qr');
    const logoutBtn = document.getElementById('btn-logout-qr');
    const phoneDisplay = document.getElementById('connected-phone-display');

    if (!pill) return;

    if (data.status === 'CONNECTED') {
      pill.textContent = '🟢 प्रत्यक्ष फोन जोडला (Active)';
      pill.style.background = '#25d366';
      pill.style.color = '#0b141a';
      if (qrArea) qrArea.style.display = 'none';
      if (banner) banner.style.display = 'block';
      if (startBtn) startBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (phoneDisplay) phoneDisplay.textContent = `+${data.phoneNumber}`;
    } else if (data.status === 'SCAN_QR') {
      pill.textContent = '🟡 QR कोड स्कॅन करा';
      pill.style.background = '#ffb300';
      pill.style.color = '#0b141a';
      if (qrArea) qrArea.style.display = 'block';
      if (banner) banner.style.display = 'none';
      if (startBtn) startBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (qrImg && data.qr) qrImg.src = data.qr;
    } else if (data.status === 'CONNECTING') {
      pill.textContent = '⏳ कनेक्ट होत आहे...';
      pill.style.background = '#34b7f1';
      pill.style.color = '#0b141a';
    } else {
      pill.textContent = '⚪ जोडलेले नाही (Disconnected)';
      pill.style.background = 'rgba(255,255,255,0.1)';
      pill.style.color = 'var(--text-muted)';
      if (qrArea) qrArea.style.display = 'none';
      if (banner) banner.style.display = 'none';
      if (startBtn) startBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  } catch (err) {
    console.error('Failed to check WhatsApp status:', err);
  }
}

async function startWhatsAppQR() {
  showNotification('WhatsApp QR कोड तयार करत आहे...');
  try {
    await fetch('/api/whatsapp/start', { method: 'POST' });
    checkWhatsAppStatus();
    if (!qrPollInterval) {
      qrPollInterval = setInterval(checkWhatsAppStatus, 2500);
    }
  } catch (err) {
    showNotification('QR कोड तयार करताना त्रुटी आली.');
  }
}

async function logoutWhatsAppQR() {
  if (!confirm('आपण प्रत्यक्ष WhatsApp फोन डिस्कनेक्ट करू इच्छिता?')) return;
  try {
    await fetch('/api/whatsapp/logout', { method: 'POST' });
    showNotification('WhatsApp खाते डिस्कनेक्ट केले.');
    checkWhatsAppStatus();
  } catch (err) {
    showNotification('त्रुटी आली.');
  }
}

async function requestPairingCodeUI() {
  const input = document.getElementById('pairing-phone-input');
  const codeBox = document.getElementById('pairing-code-box');
  const codeDisplay = document.getElementById('pairing-code-display');

  if (!input || !input.value.trim()) {
    showNotification('कृपया आपला १०-अंकी व्हॉट्सअ‍ॅप नंबर टाका.');
    return;
  }

  showNotification('पेअरिंग कोड तयार करत आहे...');
  try {
    const res = await fetch('/api/whatsapp/pairing-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: input.value.trim() })
    });
    const data = await res.json();
    if (data.success && data.pairingCode) {
      if (codeBox) codeBox.style.display = 'block';
      if (codeDisplay) codeDisplay.textContent = data.pairingCode;
      showNotification('८-अंकी कोड तयार झाला! आपल्या फोनमध्ये टाका.');
      if (!qrPollInterval) {
        qrPollInterval = setInterval(checkWhatsAppStatus, 2500);
      }
    } else {
      showNotification(data.error || 'कोड मिळवताना अडचण आली.');
    }
  } catch (e) {
    showNotification('पेअरिंग कोड मिळवताना त्रुटी आली.');
  }
}

// Start polling on startup
setInterval(checkWhatsAppStatus, 4000);

