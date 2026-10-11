import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';

import { MetaCloudApiAdapter } from './adapters/metaCloudApi.js';
import { TwilioApiAdapter } from './adapters/twilioApi.js';
import { BaileysAdapter } from './adapters/baileysAdapter.js';
import { BotEngine } from './bot/botEngine.js';
import { stateManager } from './bot/stateManager.js';
import { dataRepository } from './data/repository.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/simulator' });

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. WhatsApp Webhook Endpoints
// ==========================================

// Meta WhatsApp Cloud API Verification
app.get('/webhook', (req, res) => {
  const challenge = MetaCloudApiAdapter.verifyWebhook(req.query);
  if (challenge) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verification failed');
  }
});

// Meta WhatsApp Cloud API Inbound Messages
app.post('/webhook', async (req, res) => {
  res.status(200).send('EVENT_RECEIVED');
  await MetaCloudApiAdapter.handleWebhook(req.body);
});

// Twilio WhatsApp Inbound Messages
app.post('/webhook/twilio', (req, res) => {
  const twiml = TwilioApiAdapter.handleWebhook(req.body);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml);
});

// ==========================================
// 2. Simulator REST & WebSocket Endpoints
// ==========================================

app.post('/api/simulator/message', (req, res) => {
  const { phone = '+919876543210', text = '', userName = 'शेतकरी मित्र' } = req.body;
  const botResponse = BotEngine.handleIncomingMessage(phone, text, userName);
  const session = stateManager.getSession(phone, userName);

  res.json({
    success: true,
    response: botResponse,
    session: {
      phone: session.phone,
      currentFlow: session.currentFlow,
      cartCount: session.cart.length,
      cart: session.cart,
      stateData: session.stateData
    }
  });
});

app.get('/api/simulator/session/:phone', (req, res) => {
  const session = stateManager.getSession(req.params.phone);
  res.json({
    phone: session.phone,
    userName: session.userName,
    currentFlow: session.currentFlow,
    cart: session.cart,
    stateData: session.stateData,
    historyDepth: session.historyStack.length
  });
});

app.post('/api/simulator/reset', (req, res) => {
  const { phone = '+919876543210' } = req.body;
  const session = stateManager.getSession(phone);
  stateManager.resetToMainMenu(session);
  stateManager.clearCart(session);
  const welcome = BotEngine.handleIncomingMessage(phone, 'Hi');
  res.json({ success: true, response: welcome });
});

// WebSocket Handler for live interactive simulation
wss.on('connection', (ws: WebSocket) => {
  console.log('🔌 Simulator client connected to WebSocket');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'USER_MESSAGE') {
        const phone = data.phone || '+919876543210';
        const userText = data.text || '';
        const userName = data.userName || 'शेतकरी मित्र';

        // Simulate typing delay for realistic WhatsApp feel
        setTimeout(() => {
          const response = BotEngine.handleIncomingMessage(phone, userText, userName);
          const session = stateManager.getSession(phone);

          ws.send(
            JSON.stringify({
              type: 'BOT_RESPONSE',
              response,
              session: {
                currentFlow: session.currentFlow,
                cart: session.cart,
                cartCount: session.cart.length
              }
            })
          );
        }, 350);
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });
});

// ==========================================
// Admin Authentication Middleware
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required');
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).send('Invalid credentials');
}

// 3. Admin Dashboard REST Endpoints
// ==========================================

// Today's Rates
app.get('/api/rates', (req, res) => {
  res.json(dataRepository.getDailyRates());
});

app.put('/api/rates/:id', (req, res) => {
  const { rate, notes } = req.body;
  const updated = dataRepository.updateDailyRate(req.params.id, rate, notes);
  if (updated) {
    res.json({ success: true, rate: updated });
  } else {
    res.status(404).json({ error: 'Rate item not found' });
  }
});

// Products & Inventory
app.get('/api/products', (req, res) => {
  res.json(dataRepository.getAllProducts());
});

app.put('/api/products/:id', (req, res) => {
  const updated = dataRepository.updateProduct(req.params.id, req.body);
  if (updated) {
    res.json({ success: true, product: updated });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products', (req, res) => {
  const created = dataRepository.addProduct(req.body);
  res.status(201).json({ success: true, product: created });
});

// Orders & Inquiries
app.get('/api/orders', (req, res) => {
  res.json(dataRepository.getOrders());
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const updated = dataRepository.updateOrderStatus(req.params.id, status);
  if (updated) {
    res.json({ success: true, order: updated });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Store Settings
app.get('/api/store', (req, res) => {
  res.json(dataRepository.getStoreInfo());
});

app.put('/api/store', (req, res) => {
  const updated = dataRepository.updateStoreInfo(req.body);
  res.json({ success: true, store: updated });
});

// ==========================================
// 4. Actual WhatsApp Account QR Connection (Baileys)
// ==========================================
app.get('/api/whatsapp/status', (req, res) => {
  res.json(BaileysAdapter.getStatus());
});

app.post('/api/whatsapp/start', async (req, res) => {
  await BaileysAdapter.startClient();
  res.json({ success: true, ...BaileysAdapter.getStatus() });
});

app.post('/api/whatsapp/pairing-code', async (req, res) => {
  try {
    const { phone } = req.body;
    const code = await BaileysAdapter.requestPairingCode(phone);
    res.json({ success: true, pairingCode: code });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/logout', async (req, res) => {
  await BaileysAdapter.logout();
  res.json({ success: true, message: 'Logged out successfully' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Vallabh Seeds WhatsApp Bot Server Running!`);
  console.log(`📍 Web Simulator & Admin: http://localhost:${PORT}`);
  console.log(`🔗 Meta Webhook Endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🔗 Twilio Webhook Endpoint: http://localhost:${PORT}/webhook/twilio`);
  console.log(`====================================================`);
});
