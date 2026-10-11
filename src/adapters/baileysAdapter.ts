import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  fetchLatestBaileysVersion,
  Browsers
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { BotEngine } from '../bot/botEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authDir = path.join(__dirname, '../../auth_info_baileys');

export class BaileysAdapter {
  private static sock: WASocket | null = null;
  private static currentQR: string | null = null;
  private static connectionStatus: 'DISCONNECTED' | 'SCAN_QR' | 'CONNECTING' | 'CONNECTED' = 'DISCONNECTED';
  private static connectedPhoneNumber: string | null = null;
  private static isStarting = false;
  private static lastPairingCode: string | null = null;

  public static getStatus() {
    return {
      status: this.connectionStatus,
      qr: this.currentQR,
      phoneNumber: this.connectedPhoneNumber,
      pairingCode: this.lastPairingCode
    };
  }

  public static async startClient(): Promise<void> {
    if (this.isStarting || this.connectionStatus === 'CONNECTED') {
      return;
    }
    this.isStarting = true;
    this.connectionStatus = 'CONNECTING';

    try {
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`📡 Connecting to WhatsApp using Web version: v${version.join('.')} (latest: ${isLatest})`);

      // Create Baileys WhatsApp Socket with authentic Windows Chrome browser fingerprint
      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.windows('Chrome'),
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000
      });

      this.sock = sock;

      // Handle connection updates (QR code, connection state)
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.connectionStatus = 'SCAN_QR';
          try {
            this.currentQR = await QRCode.toDataURL(qr, { scale: 7, margin: 2 });
            console.log('📲 Fresh WhatsApp Web QR code generated! Ready to scan.');
          } catch (e) {
            console.error('Failed to generate QR data URL:', e);
          }
        }

        if (connection === 'open') {
          this.connectionStatus = 'CONNECTED';
          this.currentQR = null;
          this.lastPairingCode = null;
          this.isStarting = false;

          const userJid = sock.user?.id || '';
          this.connectedPhoneNumber = userJid.split(':')[0].split('@')[0];
          console.log(`====================================================`);
          console.log(`🎉 WhatsApp Connected to actual account: +${this.connectedPhoneNumber}`);
          console.log(`🤖 Bot is now actively answering incoming WhatsApp messages!`);
          console.log(`====================================================`);
        }

        if (connection === 'close') {
          this.isStarting = false;
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`⚠️ WhatsApp connection closed (code ${statusCode}). Reconnecting: ${shouldReconnect}`);

          if (shouldReconnect) {
            this.connectionStatus = 'CONNECTING';
            setTimeout(() => this.startClient(), 3000);
          } else {
            this.connectionStatus = 'DISCONNECTED';
            this.sock = null;
            this.connectedPhoneNumber = null;
            this.currentQR = null;
            this.lastPairingCode = null;
            // Clean auth state if logged out
            try {
              fs.rmSync(authDir, { recursive: true, force: true });
            } catch (e) {}
          }
        }
      });

      // Save credentials on updates
      sock.ev.on('creds.update', saveCreds);

      // Handle incoming customer messages
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
          try {
            await this.handleIncomingMessage(msg);
          } catch (err) {
            console.error('Error handling WhatsApp message:', err);
          }
        }
      });
    } catch (err) {
      this.isStarting = false;
      this.connectionStatus = 'DISCONNECTED';
      console.error('Failed to start WhatsApp Baileys client:', err);
    }
  }

  // Request an 8-character Pairing Code for direct number linking (alternative to QR scan)
  public static async requestPairingCode(phoneNumber: string): Promise<string> {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      throw new Error('कृपया वैध १० किंवा १२ अंकी मोबाईल नंबर टाका (उदा. 9822012345 किंवा 919822012345)');
    }

    // Ensure country code 91 for Indian numbers
    const formatted = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    if (!this.sock) {
      await this.startClient();
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (this.sock && !this.sock.authState.creds.registered) {
      try {
        const code = await this.sock.requestPairingCode(formatted);
        this.lastPairingCode = code;
        console.log(`🔑 Pairing Code for +${formatted}: ${code}`);
        return code;
      } catch (err: any) {
        console.error('Error requesting pairing code:', err);
        throw err;
      }
    }

    throw new Error('WhatsApp आधीच जोडलेले आहे किंवा सॉकेट तयार नाही.');
  }

  private static async handleIncomingMessage(msg: proto.IWebMessageInfo): Promise<void> {
    const key = msg.key;
    if (!key || key.fromMe || !key.remoteJid) {
      return; // Ignore messages sent by ourselves
    }

    const remoteJid = key.remoteJid;
    // Ignore group chats and status updates
    if (remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') {
      return;
    }

    const messageContent = msg.message;
    if (!messageContent) return;

    // Extract text from text message or button response
    let text = '';
    if (messageContent.conversation) {
      text = messageContent.conversation;
    } else if (messageContent.extendedTextMessage?.text) {
      text = messageContent.extendedTextMessage.text;
    } else if (messageContent.buttonsResponseMessage?.selectedButtonId) {
      text = messageContent.buttonsResponseMessage.selectedButtonId;
    } else if (messageContent.listResponseMessage?.singleSelectReply?.selectedRowId) {
      text = messageContent.listResponseMessage.singleSelectReply.selectedRowId;
    }

    if (!text || !text.trim()) return;

    const customerPhone = remoteJid.replace('@s.whatsapp.net', '');
    const customerName = msg.pushName || 'ग्राहक';

    console.log(`📩 [Actual WhatsApp] Received from ${customerPhone} (${customerName}): "${text}"`);

    // Process through our BotEngine
    const botResponse = BotEngine.handleIncomingMessage(customerPhone, text, customerName);

    // Send the reply back to customer's WhatsApp
    if (this.sock) {
      await this.sock.sendMessage(remoteJid, {
        text: botResponse.text
      });
      console.log(`📤 [Actual WhatsApp] Reply sent to ${customerPhone}`);
    }
  }

  public static async logout(): Promise<void> {
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch (e) {}
      this.sock = null;
    }
    this.connectionStatus = 'DISCONNECTED';
    this.connectedPhoneNumber = null;
    this.currentQR = null;
    this.lastPairingCode = null;
    this.isStarting = false;
    try {
      fs.rmSync(authDir, { recursive: true, force: true });
    } catch (e) {}
  }
}
