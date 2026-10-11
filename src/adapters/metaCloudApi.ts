import axios from 'axios';
import { BotEngine } from '../bot/botEngine.js';
import { BotResponse } from '../types/index.js';

export class MetaCloudApiAdapter {
  private static phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  private static accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  private static verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'vallabh_seeds_secret_token';

  // Webhook Verification (GET /webhook)
  public static verifyWebhook(query: any): string | false {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('✅ Meta WhatsApp Webhook verified successfully!');
      return challenge;
    }
    return false;
  }

  // Incoming Message Webhook (POST /webhook)
  public static async handleWebhook(body: any): Promise<void> {
    try {
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      if (!value?.messages || value.messages.length === 0) {
        return;
      }

      const message = value.messages[0];
      const from = message.from; // User's phone number
      const contact = value.contacts?.[0];
      const userName = contact?.profile?.name || 'ग्राहक';

      let userText = '';

      if (message.type === 'text') {
        userText = message.text.body;
      } else if (message.type === 'interactive') {
        if (message.interactive.type === 'button_reply') {
          userText = message.interactive.button_reply.id;
        } else if (message.interactive.type === 'list_reply') {
          userText = message.interactive.list_reply.id;
        }
      } else if (message.type === 'button') {
        userText = message.button.text;
      }

      console.log(`📩 [Meta WhatsApp] Received from ${from} (${userName}): "${userText}"`);

      // Run through our BotEngine
      const botResponse = BotEngine.handleIncomingMessage(from, userText, userName);

      // Send response back to user
      await this.sendMessage(from, botResponse);
    } catch (error) {
      console.error('❌ Error handling Meta Webhook:', error);
    }
  }

  // Send WhatsApp message to user
  public static async sendMessage(to: string, response: BotResponse): Promise<void> {
    if (!this.phoneNumberId || !this.accessToken) {
      console.log(`⚠️ Meta Cloud API credentials not configured. Message to ${to}:\n${response.text}`);
      return;
    }

    const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    let payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to
    };

    if (response.interactive) {
      if (response.interactive.type === 'button' && response.interactive.buttons) {
        payload.type = 'interactive';
        payload.interactive = {
          type: 'button',
          header: response.interactive.header ? { type: 'text', text: response.interactive.header } : undefined,
          body: { text: response.interactive.body },
          footer: response.interactive.footer ? { text: response.interactive.footer } : undefined,
          action: {
            buttons: response.interactive.buttons.slice(0, 3).map((b) => ({
              type: 'reply',
              reply: { id: b.id, title: b.title.substring(0, 20) }
            }))
          }
        };
      } else if (response.interactive.type === 'list' && response.interactive.sections) {
        payload.type = 'interactive';
        payload.interactive = {
          type: 'list',
          header: response.interactive.header ? { type: 'text', text: response.interactive.header } : undefined,
          body: { text: response.interactive.body },
          footer: response.interactive.footer ? { text: response.interactive.footer } : undefined,
          action: {
            button: (response.interactive.buttonText || 'पर्याय निवडा').substring(0, 20),
            sections: response.interactive.sections.map((s) => ({
              title: s.title.substring(0, 24),
              rows: s.rows.slice(0, 10).map((r) => ({
                id: r.id,
                title: r.title.substring(0, 24),
                description: r.description ? r.description.substring(0, 72) : undefined
              }))
            }))
          }
        };
      }
    } else {
      payload.type = 'text';
      payload.text = { body: response.text };
    }

    try {
      await axios.post(url, payload, { headers });
      console.log(`📤 [Meta WhatsApp] Message successfully sent to ${to}`);
    } catch (err: any) {
      console.error('❌ Failed to send WhatsApp message via Meta Cloud API:', err?.response?.data || err.message);
    }
  }
}
