# 🌾 Vallabh Seeds & Fertilizers — WhatsApp Business Bot Suite

> **वल्लभ सीड्स अँड फर्टिलायझर्स (बियाणे, खते, कीटकनाशके व बांधकाम साहित्य दालन)** साठी परिपूर्ण WhatsApp Business Chatbot आणि व्यवस्थापन पोर्टल.

---

## 📌 प्रकल्प विहंगावलोकन (Project Overview)

हे सोल्यूशन शेतकरी, बांधकाम व्यावसायिक, कंत्राटदार आणि सामान्य ग्राहकांसाठी डिझाइन केलेले एक आधुनिक, द्विभाषिक (मराठी + इंग्रजी) **WhatsApp Bot** आहे. यात खालील प्रमुख वैशिष्ट्ये समाविष्ट आहेत:

1. **Meta WhatsApp Cloud API (अधिकृत Graph API v21.0)** व **Twilio WhatsApp** या दोन्हींशी थेट जोडणी (Webhooks).
2. **स्थानिक WhatsApp फोन सिम्युलेटर (Live Web Simulator)** — कोणत्याही बाह्य API की ची वाट न पाहता संपूर्ण बॉट ब्राउझरमध्ये प्रत्यक्ष मोबाईलप्रमाणे वापरता येतो.
3. **व्यवस्थापन डॅशबोर्ड (Admin Management Portal)** — आजचे ताजे बाजारभाव (Daily Rates), साठा (Inventory), नवीन ऑर्डर्स आणि स्टोअर सेटिंग्ज व्यवस्थापित करण्यासाठी.
4. **स्मार्ट कृषी सल्लागार विझार्ड (Pesticide Diagnostic Wizard)** — शेकडो औषधे थेट न दाखवता पीक व समस्येनुसार अचूक मार्गदर्शन आणि कृषी तज्ज्ञांशी थेट फोन संपर्क.
5. **बांधकाम साहित्य परिमाण व युनिट निवड (Steel/Angle/Pipes Custom Size Selector)** — ग्राहकांना कोड माहिती नसले तरी साईझ (उदा. 40×40) व युनिट (Kg/Ton/Nos) सहजपणे निवडता येते.
6. **प्रत्येक टप्प्यावर युनिव्हर्सल नेव्हिगेशन (Universal Navigation at every stage)**:
   - 🏠 `0` किंवा `मुख्य मेनू` (Main Menu)
   - ⬅️ `*` किंवा `मागे जा` (Back)
   - 🛒 `#` किंवा `माझी ऑर्डर` (My Order / Cart)
   - 📞 `9` किंवा `तज्ज्ञ संपर्क` (Talk to Us / Agronomist Call)

---

## 🚀 सुरू कसे करावे (Quick Start)

### आवश्यकता (Prerequisites)
- Node.js (v18 किंवा नवीन)
- npm (v9 किंवा नवीन)

### चालवण्यासाठी कमांड्स:
```bash
# 1. सर्व पॅकेजेस इन्स्टॉल करा (पहिल्यांदाच)
npm install

# 2. प्रकल्प बिल्ड करा
npm run build

# 3. सर्व्हर सुरू करा
npm start
```

सर्व्हर सुरू झाल्यानंतर ब्राउझरमध्ये खालील लिंक उघडा:
👉 **`http://localhost:3000`**

येथे आपल्याला:
- **WhatsApp सिम्युलेटर** (उजवीकडे थेट चॅट, डावीकडे द्रुत चाचणी बटणे)
- **व्यवस्थापन पोर्टल (Admin)** (आजचे भाव, उत्पादने, ऑर्डर्स)
उपलब्ध होईल.

---

## 📋 सर्व संभाषणात्मक प्रवाह (Conversational Flows)

### १. ग्राहक "Hi" पाठवतो (Welcome Greeting)
```text
नमस्कार! 🙏
Vallabh Seeds & Fertilizers मध्ये आपले मनःपूर्वक स्वागत आहे.

आम्ही शेतकरी, बांधकाम व्यावसायिक आणि ग्राहकांसाठी बियाणे, खते, कीटकनाशके व बांधकाम साहित्य उपलब्ध करून देतो.

कृपया आपल्याला कोणत्या प्रकारची माहिती हवी आहे ते निवडा:

1️⃣ शेतीसाठी साहित्य 🌱
2️⃣ बांधकाम साहित्य 🏗️
3️⃣ दोन्ही पाहायचे आहेत
4️⃣ आजचे भाव / दर जाणून घ्यायचे आहेत 📊
5️⃣ आधीची ऑर्डर / चौकशी 📦
6️⃣ दुकानाशी थेट संपर्क 📞
```

### २. शेतीसाठी साहित्य 🌱 (Option 1)
- **1️⃣ बियाणे 🌾**:
  - कापूस (Rasi 659, US 7067, Ajeet 155, Mahyco Balwan)
  - सोयाबीन (Phule Sangam KDS 726, JS 335, JS 9305)
  - इतर पिके (बाजरी, मका, हरभरा, तूर, कांदा)
  - प्रत्येक उत्पादनाचे नाव, ब्रँड, पॅकिंग, चालू दर, उपलब्धता व थेट ऑर्डर.
- **2️⃣ खते 🧪**:
  - Urea (इफको कडुनिंब लेपित ४५ किलो - ₹२६६.५०)
  - DAP (१८:४६:० - ₹१,३५०)
  - NPK (१०:२६:२६, १२:३२:१६, २०:२०:०:१३)
  - Micronutrients (झिंक, बोरॉन, सागरिका सीवीड टॉनिक)
  - इतर खते (पोटॅश MOP, SSP सिंगल सुपर फॉस्फेट)
- **3️⃣ कीटकनाशके व औषधे 🌿 (२-पायरी विझार्ड)**:
  - *पायरी १:* पीक निवडा (कापूस / सोयाबीन / तूर / हरभरा / इतर).
  - *पायरी २:* समस्या निवडा (कीड / रोग / तण / माहिती नाही).
  - *परिणाम:* थेट ढीग न दाखवता अचूक प्रमाणित औषध (उदा. Coragen, Nativo, Odyssey) दाखवले जाते **व** महत्त्वाचा सल्ला दिला जातो:
    > 📞 *योग्य उत्पादनाची निवड करण्यासाठी आमच्या तज्ज्ञाशी संपर्क करा.*  
    > 👨🌾 *तज्ज्ञाशी बोला*
- **4️⃣ शेतीसाठी इतर साहित्य 🚜**:
  - मल्चिंग पेपर (२५ मायक्रॉन), सिल्पॉलिन ताडपत्री (२५० GSM), बॅटरी स्प्रे पंप (१६ लिटर).

### ३. बांधकाम साहित्य 🏗️ (Option 2)
- **1️⃣ Cement**:
  - Ambuja Cement (PPC 50kg)
  - UltraTech Super (50kg)
  - ACC Concrete+ (50kg)
  - Birla A1 Strong (50kg)
  - चालू दर: ₹३५० - ₹३७० / बॅग
- **2️⃣ Steel / TMT**:
  - Tata Tiscon 550D, JSW Neosteel 550D, Rajuri/Polad Steel
  - साईजेस: 8mm, 10mm, 12mm, 16mm, 20mm
- **3️⃣ MS Angle (लोखंडी अँगल - Size & Unit Selector)**:
  - साईजेस: 25×25, 32×32, 40×40, 50×50, 65×65 किंवा इतर साईझ
  - युनिट्स: Kg / Ton / Nos (नग)
- **4️⃣ MS Channel**: 75×40, 100×50, 125×65, 150×75
- **5️⃣ MS Pipe**: Square Pipe (1", 1.5", 2", 3"), Round Pipe
- **6️⃣ PVC Pipe**: 2.5", 3", 4", 6" (Supreme / Finolex - 4kg / 6kg प्रेशर)
- **7️⃣ GI Sheet**: टाटा शक्ती पत्रे व कलर प्रोफाइल शीट (8 ते 14 फूट)
- **8️⃣ Binding Wire**: १८ व २० गेज मऊ बांधकाम तार
- **9️⃣ Fencing Material**: काटेरी तार, चेनलिंक जाळी, सिमेंट पोल

### ४. युनिव्हर्सल नेव्हिगेशन (Universal Navigation at every screen)
प्रत्येक स्क्रीनवर खालील पर्याय उपलब्ध असतात:
- `🏠 मुख्य मेनू` (Type `0` / click button)
- `⬅️ मागे जा` (Type `*` / click button)
- `🛒 माझी ऑर्डर` (Type `#` / click button)
- `📞 आमच्याशी बोला` (Type `9` / click button)

### ५. ऑर्डर नोंदणी व पावती निर्मिती (Checkout & Receipt)
ग्राहक कार्टमधील वस्तू तपासून "ऑर्डर कन्फर्म" करतो. बॉट नाव व गाव/पत्ता विचारतो, आणि अधिकृत **Order Invoice ID (`ORD-XXXX`)** तयार करून ऑर्डर सेव्ह करतो:
```text
🎉 आपली ऑर्डर यशस्वीरीत्या नोंदवली गेली आहे! 🙏

🧾 ऑर्डर नंबर: ORD-3220
👤 ग्राहक: गणेश जाधव (शेतकरी)
📱 मोबाईल: +91 99887 76655
📍 डिलिव्हरी पत्ता: मु. पो. मंठा, जि. जालना
────────────────────
📦 ऑर्डर केलेले साहित्य:
1. एमएस अँगल (लोखंडी अँगल) - 40×40 x 50 Kg = ₹2800
────────────────────
💵 एकूण रक्कम: ₹2800
📞 आमचे प्रतिनिधी आपल्या पत्त्यावर साहित्य रवाना करण्यासाठी लवकरच संपर्क करतील.
💳 बिल भरण्यासाठी किंवा आगाऊ पेमेंटसाठी UPI: vallabhseeds@upi
```

---

## 🔌 WhatsApp Cloud API व Twilio जोडणी (Webhook Setup)

### पर्याय १: Meta WhatsApp Business Cloud API (अधिकृत)
1. [Meta for Developers](https://developers.facebook.com) वर आपले App उघडा.
2. **WhatsApp > Configuration** मध्ये जा:
   - **Callback URL:** `https://<your-domain>/webhook`
   - **Verify Token:** `vallabh_seeds_secret_token`
3. **Webhook fields:** `messages` व `messaging_postbacks` निवडून Verify & Save करा.
4. `.env` फाईलमध्ये आपली क्रेडेन्शियल्स प्रविष्ट करा:
   ```env
   PORT=3000
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
   WHATSAPP_VERIFY_TOKEN=vallabh_seeds_secret_token
   ```

### पर्याय २: Twilio WhatsApp Webhook
1. Twilio कन्सोलमध्ये **Messaging > Settings > WhatsApp Sandbox** उघडा.
2. **WHEN A MESSAGE COMES IN:**  
   `https://<your-domain>/webhook/twilio` (HTTP POST) सेट करा.

---

## 🧪 स्वयंचलित चाचणी (Automated Testing)

सर्व १४ संभाषण प्रवाह तपासण्यासाठी चाचणी स्क्रिप्ट चालवा:
```bash
node test_flows.js
```

**चाचणी निकाल:**
```text
🧪 Starting Vallabh Seeds WhatsApp Bot Automated Flow Tests...

✅ [PASS] 1. Customer sends "Hi" -> Marathi welcome message with 6 options
✅ [PASS] 2. Customer selects "1" (शेतीसाठी साहित्य) -> Agriculture subcategories
✅ [PASS] 3. Customer selects "1" (बियाणे) -> Crop selection (कापूस, सोयाबीन, इतर पिके)
✅ [PASS] 4. Customer selects "1" (कापूस) -> Showcase Rasi 659 & US 7067 with price & stock
✅ [PASS] 5. Universal Navigation: Send "*" (Back) -> Returns to Crop Selection
✅ [PASS] 6. Universal Navigation: Send "0" (Main Menu) -> Returns to Home Screen
✅ [PASS] 7. Fertilizers Flow: 1 -> 2 -> 1 (Urea) -> Shows Urea details
✅ [PASS] 8. Pesticides Wizard: Crop -> Problem -> Expert Consultation & Targeted Products
✅ [PASS] 9. Construction: Cement Brands & Rates
✅ [PASS] 10. Steel/MS Angle: Size Selector (40x40) & Quantity Prompt
✅ [PASS] 11. Cart View & Complete Order Placement with Invoice Details
✅ [PASS] 12. Order Tracking: Check status by phone
✅ [PASS] 13. Meta Webhook: GET /webhook hub.challenge verification
✅ [PASS] 14. Admin API: Update and retrieve Today's Rates

========================================
🎉 Automated Test Suite Finished: 14 / 14 Passed!
========================================
```

---

## 📂 डिरेक्टरी रचना (Directory Structure)

```text
e:/chatbot-whatsapp/
├── .env                          # ऍक्टिव्ह पर्यावरण व्हेरिएबल्स
├── .env.example                  # कॉन्फिगरेशन टेम्पलेट
├── package.json                  # Scripts & Dependencies
├── tsconfig.json                 # TypeScript कॉन्फिग
├── test_flows.js                 # १४ स्वयंचलित फ्लो चाचण्या
├── src/
│   ├── types/
│   │   └── index.ts              # Product, Cart, Order, Session, Interactive Types
│   ├── data/
│   │   ├── catalog.json          # बियाणे, खते, औषधे, सिमेंट, स्टील, पाईप्स
│   │   ├── rates.json            # आजचे ताजे बाजारभाव (Daily Rates Sheet)
│   │   ├── storeInfo.json        # पत्ता, फोन, कृषी सल्लागार, UPI आयडी
│   │   ├── orders.json           # ग्राहकांच्या ऑर्डर्स डेटाबेस
│   │   └── repository.ts         # डेटा लोड व व्यवस्थापन रिपॉझिटरी
│   ├── bot/
│   │   ├── stateManager.ts       # युझर सेशन्स, कार्ट, बॅक-स्टॅक मॅनेजर
│   │   ├── whatsappFormatter.ts  # मराठी मजकूर व Meta Cloud API इंटरअ‍ॅक्टिव्ह पेलोड्स
│   │   └── botEngine.ts          # मुख्य संभाषण इंजिन व सर्व फ्लो हँडलर्स
│   ├── adapters/
│   │   ├── metaCloudApi.ts       # अधिकृत Meta WhatsApp Cloud API हँडलर
│   │   └── twilioApi.ts          # Twilio WhatsApp Webhook & TwiML हँडलर
│   ├── server.ts                 # Express सर्व्हर, WebSockets, Admin REST APIs
│   └── public/                   # वेब सिम्युलेटर आणि ॲडमिन पोर्टल
│       ├── index.html            # मुख्य वेब ॲप इंटरफेस
│       ├── css/
│       │   └── style.css         # WhatsApp नेटिव्ह डिझाइन + ग्लासमोर्फिक स्टाईल्स
│       └── js/
│           └── app.js            # सिम्युलेटर, वेबसॉकेट व ॲडमिन डॅशबोर्ड लॉजिक
```

---
**Vallabh Seeds & Fertilizers** — *शेतकरी व बांधकाम व्यावसायिकांसाठी सर्वोत्कृष्ट व विश्वासू दालन!*
