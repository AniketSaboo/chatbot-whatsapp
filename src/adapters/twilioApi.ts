import { BotEngine } from '../bot/botEngine.js';

export class TwilioApiAdapter {
  public static handleWebhook(body: any): string {
    const rawFrom = body?.From || '';
    const phone = rawFrom.replace('whatsapp:', '');
    const userText = body?.Body || '';
    const profileName = body?.ProfileName || 'ग्राहक';

    console.log(`📩 [Twilio WhatsApp] Received from ${phone} (${profileName}): "${userText}"`);

    const botResponse = BotEngine.handleIncomingMessage(phone, userText, profileName);

    // Escape XML special characters for TwiML
    const escaped = botResponse.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escaped}</Message>
</Response>`;
  }
}
