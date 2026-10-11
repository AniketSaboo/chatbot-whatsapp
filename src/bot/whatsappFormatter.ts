import { Product, DailyRate, StoreInfo, CartItem, BotResponse, InteractiveMessage } from '../types/index.js';

export class WhatsAppFormatter {
  public static readonly NAV_FOOTER_TEXT = `\n────────────────────\n📌 *द्रुत पर्याय:*\n0️⃣ 🏠 मुख्य मेनू | *️⃣ ⬅️ मागे जा | #️⃣ 🛒 माझी ऑर्डर | 9️⃣ 📞 संपर्क\n\n_🤖 असाच WhatsApp Bot आपल्या व्यवसायासाठी हवा असल्यास संपर्क करा:_ *7262842784*`;

  public static readonly NAV_BUTTONS = [
    { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' },
    { id: 'NAV_BACK', title: '⬅️ मागे जा' },
    { id: 'NAV_CART', title: '🛒 माझी ऑर्डर' }
  ];

  public static welcomeMessage(storeInfo: StoreInfo): BotResponse {
    const text = `नमस्कार! 🙏
*${storeInfo.name}* मध्ये आपले मनःपूर्वक स्वागत आहे.

आम्ही शेतकरी, बांधकाम व्यावसायिक आणि ग्राहकांसाठी बियाणे, खते, कीटकनाशके व बांधकाम साहित्य उपलब्ध करून देतो.

कृपया आपल्याला कोणत्या प्रकारची माहिती हवी आहे ते निवडा:

1️⃣ शेतीसाठी साहित्य 🌱
2️⃣ बांधकाम साहित्य 🏗️
3️⃣ दोन्ही पाहायचे आहेत
4️⃣ आजचे भाव / दर जाणून घ्यायचे आहेत 📊
5️⃣ आधीची ऑर्डर / चौकशी 📦
6️⃣ दुकानाशी थेट संपर्क 📞

👉 खालील पर्यायाचा नंबर (उदा. *1* किंवा *2*) पाठवा किंवा बटण निवडा.

_🤖 असाच WhatsApp Bot आपल्या व्यवसायासाठी हवा असल्यास संपर्क करा:_ *7262842784*`;

    const interactive: InteractiveMessage = {
      type: 'list',
      header: '🌾 Vallabh Seeds & Fertilizers',
      body: 'कृपया आपल्याला हवी असलेली सेवा किंवा माहिती निवडा:',
      footer: 'आपली विश्वासू कृषी व बांधकाम बाजारपेठ',
      buttonText: 'मेनू उघडा 📋',
      sections: [
        {
          title: 'उत्पादने व खरेदी',
          rows: [
            { id: 'MENU_AGRI', title: '1️⃣ शेतीसाठी साहित्य 🌱', description: 'बियाणे, खते, औषधे, शेती साहित्य' },
            { id: 'MENU_CONST', title: '2️⃣ बांधकाम साहित्य 🏗️', description: 'सिमेंट, स्टील, अँगल, पाईप, पत्रे' },
            { id: 'MENU_BOTH', title: '3️⃣ दोन्ही पाहायचे आहेत', description: 'शेती व बांधकाम संपूर्ण कॅटलॉग' }
          ]
        },
        {
          title: 'दर व माहिती',
          rows: [
            { id: 'MENU_RATES', title: '4️⃣ आजचे भाव / दर 📊', description: 'सिमेंट, स्टील व खतांचे ताजे दर' },
            { id: 'MENU_ORDER_TRACK', title: '5️⃣ ऑर्डर / चौकशी 📦', description: 'मागील ऑर्डरची स्थिती जाणून घ्या' },
            { id: 'MENU_CONTACT', title: '6️⃣ दुकानाशी थेट संपर्क 📞', description: 'पत्ता, फोन नंबर व कृषी सल्लागार' }
          ]
        }
      ]
    };

    return { text, interactive };
  }

  public static agriMenu(): BotResponse {
    const text = `🌱 *शेतीसाठी कोणते उत्पादन पाहायचे आहे?*

1️⃣ बियाणे 🌾
2️⃣ खते 🧪
3️⃣ कीटकनाशके / औषधे 🌿
4️⃣ शेतीसाठी इतर साहित्य 🚜
5️⃣ सर्व उत्पादने पाहा 📋
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'list',
      header: '🌱 कृषी विभाग',
      body: 'आपल्याला शेतीसाठी कोणत्या प्रकारच्या साहित्याची माहिती हवी आहे?',
      footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
      buttonText: 'पर्याय निवडा 🌾',
      sections: [
        {
          title: 'कृषी वर्गवारी',
          rows: [
            { id: 'AGRI_SEEDS', title: '1️⃣ बियाणे 🌾', description: 'कापूस, सोयाबीन व इतर पिकांचे वाण' },
            { id: 'AGRI_FERT', title: '2️⃣ खते 🧪', description: 'युरिया, डीएपी, एनपीके व सूक्ष्म अन्नद्रव्ये' },
            { id: 'AGRI_PEST', title: '3️⃣ कीटकनाशके / औषधे 🌿', description: 'कीड, रोग व तण नियंत्रणासाठी औषधे' },
            { id: 'AGRI_OTHER', title: '4️⃣ इतर शेती साहित्य 🚜', description: 'मल्चिंग, ताडपत्री, स्प्रे पंप' },
            { id: 'AGRI_ALL', title: '5️⃣ सर्व शेती उत्पादने 📋', description: 'सर्व उपलब्ध शेती साहित्य पाहा' }
          ]
        }
      ]
    };

    return { text, interactive };
  }

  public static seedsCropMenu(): BotResponse {
    const text = `🌾 *बियाण्यांमध्ये कोणते पीक?*

1️⃣ कापूस बियाणे 🌿
2️⃣ सोयाबीन बियाणे 🌱
3️⃣ इतर पिके (बाजरी, मका, हरभरा) 🌽
4️⃣ सर्व बियाणे पाहा 🌾
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'list',
      header: '🌾 बियाणे विभाग',
      body: 'आपल्याला कोणत्या पिकाचे बियाणे पाहायचे आहे?',
      footer: 'प्रमाणित व उच्च उत्पादनक्षम वाण',
      buttonText: 'पीक निवडा 🌾',
      sections: [
        {
          title: 'पिकांची यादी',
          rows: [
            { id: 'SEED_CROP_COTTON', title: '1️⃣ कापूस बियाणे 🌿', description: 'राशी ६५९, यूएस ७०६७, अजित १५५' },
            { id: 'SEED_CROP_SOY', title: '2️⃣ सोयाबीन बियाणे 🌱', description: 'फुले संगम (KDS 726), JS 335' },
            { id: 'SEED_CROP_OTHER', title: '3️⃣ इतर पिके 🌽', description: 'बाजरी, मका, हरभरा, तूर' },
            { id: 'SEED_CROP_ALL', title: '4️⃣ सर्व बियाणे पाहा 🌾', description: 'सर्व उपलब्ध बियाणे यादी' }
          ]
        }
      ]
    };

    return { text, interactive };
  }

  public static fertilizerCategoryMenu(): BotResponse {
    const text = `🧪 *खतांचा प्रकार निवडा:*

1️⃣ Urea (युरिया)
2️⃣ DAP (डीएपी १८:४६:०)
3️⃣ NPK (मिश्र खते - १०:२६:२६, १२:३२:१६, २०:२०:०:१३)
4️⃣ Micronutrients (सूक्ष्म अन्नद्रव्ये - झिंक, बोरॉन, सागरिका)
5️⃣ इतर खते (पोटॅश, एसएसपी, सेंद्रिय खत)
6️⃣ सर्व खते पाहा
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'list',
      header: '🧪 रासायनिक व जैविक खते',
      body: 'कृपया खतांचा प्रकार निवडा:',
      footer: 'IFFCO, महाधन, कोरोमंडल उपलब्ध',
      buttonText: 'खत निवडा 🧪',
      sections: [
        {
          title: 'खतांचे प्रकार',
          rows: [
            { id: 'FERT_UREA', title: '1️⃣ Urea (युरिया)', description: 'इफको कडुनिंब लेपित ४५ किलो' },
            { id: 'FERT_DAP', title: '2️⃣ DAP (डीएपी)', description: '१८:४६:० फॉस्फेट खत ५० किलो' },
            { id: 'FERT_NPK', title: '3️⃣ NPK खते', description: '१०:२६:२६, १२:३२:१६, २०:२०:०:१३' },
            { id: 'FERT_MICRO', title: '4️⃣ Micronutrients', description: 'झिंक, बोरॉन, सागरिका टॉनिक' },
            { id: 'FERT_OTHER', title: '5️⃣ इतर खते', description: 'पोटॅश MOP, SSP सिंगल सुपर' },
            { id: 'FERT_ALL', title: '6️⃣ सर्व खते पाहा', description: 'उपलब्ध सर्व खतांची यादी' }
          ]
        }
      ]
    };

    return { text, interactive };
  }

  public static pesticideStep1Crop(): BotResponse {
    const text = `🌿 *आपल्याला कोणत्या पिकासाठी औषध हवे आहे?*

1️⃣ कापूस
2️⃣ सोयाबीन
3️⃣ तूर / हरभरा
4️⃣ इतर पीक
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'list',
      header: '🌿 औषध व कीटकनाशक सल्ला',
      body: 'योग्य औषधाची शिफारस करण्यासाठी कृपया प्रथम आपले पीक निवडा:',
      footer: 'पायरी १ पैकी २',
      buttonText: 'पीक निवडा 🌿',
      sections: [
        {
          title: 'मुख्य पिके',
          rows: [
            { id: 'PEST_CROP_COTTON', title: '1️⃣ कापूस', description: 'बोंडअळी, रसशोषक किडी, कवडी' },
            { id: 'PEST_CROP_SOYBEAN', title: '2️⃣ सोयाबीन', description: 'खोडकीड, पाने खाणारी अळी, तांबेरा' },
            { id: 'PEST_CROP_PULSES', title: '3️⃣ तूर / हरभरा', description: 'घाटेअळी, मर रोग, बुरशी' },
            { id: 'PEST_CROP_OTHER', title: '4️⃣ इतर पीक', description: 'भाजीपाला, फळबागा, मका' }
          ]
        }
      ]
    };

    return { text, interactive };
  }

  public static pesticideStep2Problem(selectedCrop: string): BotResponse {
    const text = `🌿 *निवडलेले पीक:* ${selectedCrop}

आपल्या पिकामध्ये कोणती समस्या आहे?

1️⃣ कीड (अळी, मावा, तुडतुडे, पांढरी माशी) 🐛
2️⃣ रोग (करपा, तांबेरा, मूळकुज, बुरशी) 🍂
3️⃣ तण (तणनाशक हवे आहे) 🌾
4️⃣ माहिती नाही / तज्ज्ञ मार्गदर्शन हवे आहे 👨🌾
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'list',
      header: `🌿 ${selectedCrop} पीक समस्या`,
      body: 'आपल्या पिकामध्ये नेमकी कोणती अडचण किंवा समस्या दिसत आहे?',
      footer: 'पायरी २ पैकी २',
      buttonText: 'समस्या निवडा 🐛',
      sections: [
        {
          title: 'समस्या प्रकार',
          rows: [
            { id: 'PEST_PROB_PEST', title: '1️⃣ कीड (Pest / Insects) 🐛', description: 'अळी, मावा, तुडतुडे, फुलकिडे' },
            { id: 'PEST_PROB_DISEASE', title: '2️⃣ रोग (Fungus / Disease) 🍂', description: 'करपा, तांबेरा, मूळकुज, बुरशी' },
            { id: 'PEST_PROB_WEED', title: '3️⃣ तण (Weeds) 🌾', description: 'उगवणीपूर्वी व नंतरचे तणनाशक' },
            { id: 'PEST_PROB_EXPERT', title: '4️⃣ माहिती नाही / मार्गदर्शन 👨🌾', description: 'आमच्या कृषी तज्ज्ञांशी थेट बोला' }
          ]
        }
      ]
    };

    return { text, interactive };
  }

  public static pesticideExpertConsult(storeInfo: StoreInfo, cropName: string, problemName?: string): BotResponse {
    const text = `👨🌾 *कृषी तज्ज्ञ सल्ला व मार्गदर्शन*

🌿 पीक: *${cropName}*
${problemName ? `⚠️ समस्या: *${problemName}*\n` : ''}
कीटकनाशके व औषधांचा अवाजवी वापर टाळण्यासाठी अचूक औषध व प्रमाण निवडणे अत्यंत महत्त्वाचे आहे!

📞 *योग्य उत्पादनाची निवड करण्यासाठी आमच्या तज्ज्ञाशी संपर्क करा.*
👨🌾 *तज्ज्ञाशी बोला*

👤 तज्ज्ञ: *${storeInfo.expertName}*
🎓 पद: ${storeInfo.expertRole}
📱 थेट फोन: *${storeInfo.expertPhone}*
🏪 दुकान: *${storeInfo.name}* (${storeInfo.phones[0]})

👉 आपण त्वरित फोन करू शकता किंवा खालील बटण दाबून तज्ज्ञाशी थेट चर्चा करू शकता.
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'button',
      header: '👨🌾 कृषी तज्ज्ञ सल्ला',
      body: `आमचे तज्ज्ञ ${storeInfo.expertName} आपल्या पिकाच्या अचूक समस्येचे मोफत निदान करतील.`,
      footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
      buttons: [
        { id: 'ACTION_CALL_EXPERT', title: '📞 तज्ज्ञाशी बोला' },
        { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' },
        { id: 'NAV_BACK', title: '⬅️ मागे जा' }
      ]
    };

    return { text, interactive };
  }

  public static constructionMainMenu(): BotResponse {
    const text = `🏗️ *बांधकाम साहित्यामध्ये काय पाहायचे आहे?*

1️⃣ Cement (सिमेंट)
2️⃣ Steel / TMT (स्टील बार)
3️⃣ MS Angle (लोखंडी अँगल)
4️⃣ MS Channel (चॅनल)
5️⃣ MS Pipe (चौकोनी / गोल पाईप)
6️⃣ PVC Pipe (शेती व ड्रेनेज पाईप)
7️⃣ GI Sheet (नालीदार पत्रे / प्रोफाइल)
8️⃣ Binding Wire (बांधकाम तार)
9️⃣ Fencing Material (काटेरी तार / जाळी)
🔟 सर्व उत्पादने पाहा
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'list',
      header: '🏗️ बांधकाम साहित्य विभाग',
      body: 'आपल्याला कोणत्या बांधकाम साहित्याची माहिती हवी आहे?',
      footer: 'दर्जेदार, प्रमाणित व होलसेल दर',
      buttonText: 'साहित्य निवडा 🏗️',
      sections: [
        {
          title: 'मुख्य बांधकाम साहित्य',
          rows: [
            { id: 'CONST_CEMENT', title: '1️⃣ Cement (सिमेंट)', description: 'Ambuja, UltraTech, ACC, Birla A1' },
            { id: 'CONST_STEEL', title: '2️⃣ Steel / TMT', description: 'Tata Tiscon, JSW Neo, Polad' },
            { id: 'CONST_ANGLE', title: '3️⃣ MS Angle', description: '25x25, 32x32, 40x40, 50x50' },
            { id: 'CONST_CHANNEL', title: '4️⃣ MS Channel', description: '75x40, 100x50, 125x65' },
            { id: 'CONST_PIPE', title: '5️⃣ MS Pipe', description: 'Square & Round लोखंडी पाईप' },
            { id: 'CONST_PVC', title: '6️⃣ PVC Pipe', description: 'Supreme / Finolex शेती पाईप' },
            { id: 'CONST_GI', title: '7️⃣ GI Sheet', description: 'टाटा शक्ती पत्रे व कलर शीट' },
            { id: 'CONST_WIRE', title: '8️⃣ Binding Wire', description: '१८ व २० गेज बांधकाम तार' },
            { id: 'CONST_FENCE', title: '9️⃣ Fencing Material', description: 'काटेरी तार व कुंपण जाळी' },
            { id: 'CONST_ALL', title: '🔟 सर्व उत्पादने', description: 'सर्व बांधकाम साहित्याची यादी' }
          ]
        }
      ]
    };

    return { text, interactive };
  }

  public static cementBrandsMenu(cementProducts: Product[], rates: DailyRate[]): BotResponse {
    let text = `🏗️ *Cement Brands (सिमेंट ब्रँड्स)*\n\n`;
    cementProducts.forEach((p, idx) => {
      text += `${idx + 1}️⃣ *${p.brand}* (${p.name})\n   💰 चालू दर: ₹${p.price} / ${p.unit}\n`;
    });
    text += `${cementProducts.length + 1}️⃣ आजचे सिमेंट बाजारभाव जाणून घ्या 📊\n${this.NAV_FOOTER_TEXT}`;

    const rows = cementProducts.map((p, idx) => ({
      id: `PROD_VIEW_${p.id}`,
      title: `${idx + 1}️⃣ ${p.brand}`,
      description: `दर: ₹${p.price} / 50kg बॅग`
    }));
    rows.push({
      id: 'MENU_RATES_CEMENT',
      title: `${cementProducts.length + 1}️⃣ आजचे ताजे दर 📊`,
      description: 'सर्व ब्रँड्सचे आजचे दर पाहा'
    });

    const interactive: InteractiveMessage = {
      type: 'list',
      header: '🏗️ सिमेंट ब्रँड्स',
      body: 'ब्रँड निवडून दर व उपलब्धता पाहा किंवा थेट ऑर्डर करा:',
      footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
      buttonText: 'ब्रँड निवडा 🏗️',
      sections: [{ title: 'उपलब्ध सिमेंट', rows }]
    };

    return { text, interactive };
  }

  public static steelSelectorMenu(): BotResponse {
    const text = `🔩 *Steel & MS Material*

आपण काय शोधत आहात?

1️⃣ TMT Steel (८ ते २० mm गज)
2️⃣ MS Angle (लोखंडी अँगल)
3️⃣ MS Channel (चॅनल)
4️⃣ MS Pipe (चौकोनी / गोल पाईप)
5️⃣ GI Pipe / PVC Pipe
6️⃣ Binding Wire (तार)
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'list',
      header: '🔩 Steel & MS Material',
      body: 'आपणास आवश्यक असलेला लोखंडी / स्टील प्रकार निवडा:',
      footer: 'सर्व साईज व मापे उपलब्ध',
      buttonText: 'प्रकार निवडा 🔩',
      sections: [
        {
          title: 'स्टील व लोखंड प्रकार',
          rows: [
            { id: 'STEEL_TMT', title: '1️⃣ TMT Steel', description: 'टाटा, जेएसडब्ल्यू, राजुरी स्टील' },
            { id: 'STEEL_ANGLE', title: '2️⃣ MS Angle', description: '25x25, 32x32, 40x40, 50x50' },
            { id: 'STEEL_CHANNEL', title: '3️⃣ MS Channel', description: '75, 100, 125, 150 ISMC' },
            { id: 'STEEL_PIPE', title: '4️⃣ MS Pipe', description: 'Square / Round लोखंडी पाईप' },
            { id: 'STEEL_GI_PVC', title: '5️⃣ GI / PVC Pipe', description: 'वॉटर पाईप व शेती पाईप' },
            { id: 'STEEL_WIRE', title: '6️⃣ Binding Wire', description: '१८/२० गेज मऊ बांधकाम तार' }
          ]
        }
      ]
    };

    return { text, interactive };
  }

  public static sizePicker(materialName: string, defaultSizes: string[]): BotResponse {
    let text = `📐 *${materialName} - कृपया आवश्यक Size निवडा:*\n\n`;
    defaultSizes.forEach((sz, idx) => {
      text += `${idx + 1}️⃣ ${sz}\n`;
    });
    text += `\n👉 वरीलपैकी नंबर निवडा किंवा आपल्या आवश्यकतेनुसार *Size टाईप करा* (उदा. 40x40 किंवा 12mm).\n${this.NAV_FOOTER_TEXT}`;

    const rows = defaultSizes.slice(0, 8).map((sz, idx) => ({
      id: `SIZE_SELECT_${idx}`,
      title: `${idx + 1}️⃣ ${sz.substring(0, 20)}`,
      description: 'निवडण्यासाठी क्लिक करा'
    }));

    const interactive: InteractiveMessage = {
      type: 'list',
      header: `📐 Size निवड (${materialName})`,
      body: 'कृपया आवश्यक size निवडा किंवा स्वतःची साइज टाईप करा:',
      footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
      buttonText: 'Size निवडा 📐',
      sections: [{ title: 'उपलब्ध Sizes', rows }]
    };

    return { text, interactive };
  }

  public static unitAndQuantityPrompt(productName: string, selectedSize?: string): BotResponse {
    const text = `📦 *${productName}*
${selectedSize ? `📏 निवडलेली Size: *${selectedSize}*\n` : ''}
*किती quantity पाहिजे?*

कृपया संख्या आणि युनिट (Unit) पाठवा.
उदा.:
👉 *50 Kg* किंवा *2 Ton* किंवा *10 Nos (नग)* किंवा *5 बॅग*

(किंवा फक्त संख्या उदा. *10* टाईप करून पाठवा)
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'button',
      header: '📦 Quantity निवडा',
      body: `${productName}${selectedSize ? ` (${selectedSize})` : ''} साठी किती quantity पाहिजे ते टाईप करा.`,
      footer: 'Unit: Kg / Ton / Nos / Bags',
      buttons: [
        { id: 'QTY_QUICK_10', title: '१० नग / बॅग' },
        { id: 'QTY_QUICK_50', title: '५० किलो / नग' },
        { id: 'NAV_BACK', title: '⬅️ मागे जा' }
      ]
    };

    return { text, interactive };
  }

  public static productDetailsCard(product: Product): BotResponse {
    const availText = product.available ? '✅ उपलब्ध आहे (In Stock)' : '❌ सध्या उपलब्ध नाही (Out of Stock)';
    const text = `📦 *${product.nameMarathi || product.name}*

🏢 ब्रँड: *${product.brand}*
📦 पॅकिंग / साईझ: *${product.packSize}*
📍 उपलब्धता: *${availText}*
💰 आजचा दर: *₹${product.price}* / ${product.unit}
📝 माहिती: ${product.description}

🛒 *ऑर्डर करायची असल्यास:*
👉 "ऑर्डर [संख्या]" टाईप करा (उदा. *ऑर्डर 5* किंवा *ऑर्डर 2 टन*) किंवा खालील बटण दाबा.
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'button',
      header: product.brand,
      body: `${product.nameMarathi}\nदर: ₹${product.price} / ${product.unit}`,
      footer: availText,
      buttons: [
        { id: `ACTION_ORDER_PROD_${product.id}`, title: '🛒 ऑर्डर करा' },
        { id: 'NAV_BACK', title: '⬅️ मागे जा' },
        { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' }
      ]
    };

    return { text, interactive };
  }

  public static dailyRatesView(rates: DailyRate[]): BotResponse {
    // Group rates by category
    const groups: Record<string, DailyRate[]> = {};
    rates.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });

    let text = `📊 *आजचे ताजे बाजारभाव (Today's Market Rates)*\n`;
    text += `📅 तारीख: आजचे अपडेटेड दर\n`;
    text += `────────────────────\n`;

    for (const cat in groups) {
      text += `\n🔸 *${cat}:*\n`;
      groups[cat].forEach((item) => {
        text += `• ${item.item}: *${item.rate}* (${item.unit})\n`;
      });
    }

    text += `\n⚠️ _टीप: स्टील व सिमेंटचे भाव बाजारातील चढ-उतारानुसार बदलू शकतात._\n`;
    text += `🛒 ऑर्डर किंवा बुकिंगसाठी थेट नंबर पाठवा.\n`;
    text += this.NAV_FOOTER_TEXT;

    const interactive: InteractiveMessage = {
      type: 'button',
      header: '📊 आजचे बाजारभाव',
      body: 'सर्व चालू दर वर दिले आहेत. साहित्याची ऑर्डर देण्यासाठी बटण निवडा:',
      footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
      buttons: [
        { id: 'MENU_AGRI', title: '🌱 शेती साहित्य' },
        { id: 'MENU_CONST', title: '🏗️ बांधकाम साहित्य' },
        { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' }
      ]
    };

    return { text, interactive };
  }

  public static cartView(cart: CartItem[], storeInfo: StoreInfo): BotResponse {
    if (cart.length === 0) {
      const text = `🛒 *आपली ऑर्डर / कार्ट (My Order)*

आपल्या कार्टमध्ये सध्या कोणतेही उत्पादन नाही.

कृपया मेनूमधून उत्पादने निवडून ऑर्डर करा!
${this.NAV_FOOTER_TEXT}`;

      const interactive: InteractiveMessage = {
        type: 'button',
        header: '🛒 माझी ऑर्डर',
        body: 'आपली कार्ट रिकामी आहे. खरेदी सुरू करण्यासाठी खालील पर्याय निवडा:',
        footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
        buttons: [
          { id: 'MENU_AGRI', title: '🌱 शेती साहित्य' },
          { id: 'MENU_CONST', title: '🏗️ बांधकाम साहित्य' },
          { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' }
        ]
      };

      return { text, interactive };
    }

    let subtotal = 0;
    let text = `🛒 *आपली ऑर्डर सूची (Order Summary)*\n────────────────────\n`;

    cart.forEach((item, idx) => {
      const itemTotal = item.unitPrice > 0 ? item.totalPrice : 'दर चौकशी';
      subtotal += item.totalPrice;
      text += `${idx + 1}. *${item.productName}* (${item.brand})\n`;
      if (item.selectedSize) {
        text += `   📏 साईझ: ${item.selectedSize}\n`;
      }
      text += `   🔢 नग/वजन: *${item.quantity} ${item.unit}*\n`;
      text += `   💰 अंदाजे रक्कम: *₹${itemTotal}*\n\n`;
    });

    text += `────────────────────\n`;
    text += `💵 *एकूण अंदाजे रक्कम: ₹${subtotal}*\n\n`;
    text += `👉 *ऑर्डर निश्चित करण्यासाठी "ऑर्डर कन्फर्म" किंवा खालील बटण दाबा.*\n`;
    text += `👉 उत्पादन काढण्यासाठी "रिमूव्ह [नंबर]" पाठवा (उदा. रिमूव्ह 1).\n`;
    text += this.NAV_FOOTER_TEXT;

    const interactive: InteractiveMessage = {
      type: 'button',
      header: '🛒 ऑर्डर फायनल करा',
      body: `एकूण ${cart.length} वस्तू. एकूण अंदाजे रक्कम: ₹${subtotal}`,
      footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
      buttons: [
        { id: 'ACTION_CONFIRM_ORDER', title: '✅ ऑर्डर कन्फर्म करा' },
        { id: 'ACTION_CLEAR_CART', title: '🗑️ कार्ट रिकामी करा' },
        { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' }
      ]
    };

    return { text, interactive };
  }

  public static contactView(storeInfo: StoreInfo): BotResponse {
    const text = `🏪 *दुकानाशी थेट संपर्क (Store Contact)*

*${storeInfo.name}*
_${storeInfo.tagline}_

📍 *पत्ता:*
${storeInfo.address}

📞 *फोन / WhatsApp:*
• मुख्य दुकान: *${storeInfo.phones[0]}*
• इतर संपर्क: ${storeInfo.phones[1] || ''}

👨🌾 *कृषी तज्ज्ञ व सल्लागार:*
• *${storeInfo.expertName}* (${storeInfo.expertRole})
• फोन: *${storeInfo.expertPhone}*

⏰ *वेळ:*
${storeInfo.timings}

💳 *UPI आयडी:* \`${storeInfo.upiId}\`
🗺️ *गुगल मॅप्स लोकेशन:* ${storeInfo.googleMapsUrl}
${this.NAV_FOOTER_TEXT}`;

    const interactive: InteractiveMessage = {
      type: 'button',
      header: '📞 दुकानाशी संपर्क',
      body: `आपण थेट फोनवर बोलू शकता किंवा दुकानाला भेट देऊ शकता.`,
      footer: storeInfo.name,
      buttons: [
        { id: 'ACTION_CALL_EXPERT', title: '👨🌾 तज्ज्ञाशी बोला' },
        { id: 'MENU_RATES', title: '📊 आजचे भाव' },
        { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' }
      ]
    };

    return { text, interactive };
  }
}
