import { dataRepository } from '../data/repository.js';
import { stateManager } from './stateManager.js';
import { WhatsAppFormatter } from './whatsappFormatter.js';
import { BotResponse, CartItem, Product, Order } from '../types/index.js';

export class BotEngine {
  public static handleIncomingMessage(phone: string, text: string, userName?: string): BotResponse {
    const session = stateManager.getSession(phone, userName);
    const rawText = (text || '').trim();
    const lowerText = rawText.toLowerCase();

    // 1. Check Universal Navigation commands first (Requirement 7)
    if (this.isMainMenuCommand(lowerText)) {
      stateManager.resetToMainMenu(session);
      return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
    }

    if (this.isBackCommand(lowerText)) {
      const prev = stateManager.popState(session);
      if (!prev || prev.flow === 'INITIAL' || prev.flow === 'MAIN_MENU') {
        stateManager.resetToMainMenu(session);
        return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
      }
      return this.renderStateView(session);
    }

    if (this.isCartCommand(lowerText)) {
      stateManager.pushState(session, 'CART_VIEW');
      return WhatsAppFormatter.cartView(session.cart, dataRepository.getStoreInfo());
    }

    if (this.isContactCommand(lowerText)) {
      stateManager.pushState(session, 'CONTACT_VIEW');
      return WhatsAppFormatter.contactView(dataRepository.getStoreInfo());
    }

    if (lowerText === 'action_call_expert' || lowerText.includes('तज्ज्ञाशी बोला') || lowerText.includes('कृषी तज्ज्ञ')) {
      const crop = session.stateData.pesticideCrop || 'कापूस / सोयाबीन';
      const prob = session.stateData.pesticideProblem || 'कीड-रोग';
      return WhatsAppFormatter.pesticideExpertConsult(dataRepository.getStoreInfo(), crop, prob);
    }

    // Initial greeting or reset
    if (session.currentFlow === 'INITIAL' || this.isGreeting(lowerText)) {
      stateManager.resetToMainMenu(session);
      return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
    }

    // 2. Dispatch based on current session flow
    switch (session.currentFlow) {
      case 'MAIN_MENU':
        return this.handleMainMenuInput(session, lowerText, rawText);

      case 'AGRI_MENU':
        return this.handleAgriMenuInput(session, lowerText, rawText);

      case 'SEEDS_CROP_MENU':
        return this.handleSeedsCropInput(session, lowerText, rawText);

      case 'SEEDS_PRODUCT_LIST':
        return this.handleProductListInput(session, lowerText, rawText);

      case 'FERT_MENU':
        return this.handleFertilizerMenuInput(session, lowerText, rawText);

      case 'FERT_PRODUCT_LIST':
        return this.handleProductListInput(session, lowerText, rawText);

      case 'PEST_STEP_1_CROP':
        return this.handlePestStep1Input(session, lowerText, rawText);

      case 'PEST_STEP_2_PROBLEM':
        return this.handlePestStep2Input(session, lowerText, rawText);

      case 'PEST_RECOMMENDED_LIST':
        return this.handleProductListInput(session, lowerText, rawText);

      case 'AGRI_OTHER_LIST':
        return this.handleProductListInput(session, lowerText, rawText);

      case 'CONST_MENU':
        return this.handleConstMenuInput(session, lowerText, rawText);

      case 'CONST_CEMENT_MENU':
        return this.handleCementMenuInput(session, lowerText, rawText);

      case 'STEEL_SELECTOR_MENU':
        return this.handleSteelSelectorMenuInput(session, lowerText, rawText);

      case 'STEEL_SIZE_PICKER':
        return this.handleSteelSizePickerInput(session, lowerText, rawText);

      case 'MATERIAL_QUANTITY_INPUT':
        return this.handleMaterialQuantityInput(session, lowerText, rawText);

      case 'PRODUCT_DETAILS':
        return this.handleProductDetailsInput(session, lowerText, rawText);

      case 'PRODUCT_QUANTITY_INPUT':
        return this.handleProductQuantityInput(session, lowerText, rawText);

      case 'CART_VIEW':
        return this.handleCartViewInput(session, lowerText, rawText);

      case 'CHECKOUT_NAME_INPUT':
        return this.handleCheckoutNameInput(session, rawText);

      case 'CHECKOUT_ADDRESS_INPUT':
        return this.handleCheckoutAddressInput(session, rawText);

      case 'ORDER_TRACKING':
        return this.handleOrderTrackingInput(session, rawText);

      case 'DAILY_RATES':
        return this.handleDailyRatesInput(session, lowerText);

      default:
        stateManager.resetToMainMenu(session);
        return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
    }
  }

  // --- Universal Command Checkers ---
  private static isMainMenuCommand(text: string): boolean {
    return (
      text === '0' ||
      text === '0️⃣' ||
      text === 'nav_home' ||
      text === 'home' ||
      text === 'menu' ||
      text === 'main menu' ||
      text === 'main' ||
      text === 'मुख्य मेनू' ||
      text === 'मेनू'
    );
  }

  private static isBackCommand(text: string): boolean {
    return (
      text === '*' ||
      text === '*️⃣' ||
      text === 'nav_back' ||
      text === 'back' ||
      text === 'मागे' ||
      text === 'मागे जा' ||
      text === 'मागचा पर्याय'
    );
  }

  private static isCartCommand(text: string): boolean {
    return (
      text === '#' ||
      text === '#️⃣' ||
      text === 'nav_cart' ||
      text === 'cart' ||
      text === 'my order' ||
      text === 'order' ||
      text === 'ऑर्डर' ||
      text === 'माझी ऑर्डर' ||
      text === 'कार्ट'
    );
  }

  private static isContactCommand(text: string): boolean {
    return (
      text === '9' ||
      text === '9️⃣' ||
      text === 'nav_contact' ||
      text === 'menu_contact' ||
      text === 'call' ||
      text === 'contact' ||
      text === 'talk' ||
      text === 'talk to us' ||
      text === 'संपर्क' ||
      text === 'फोन' ||
      text === 'दुकान संपर्क'
    );
  }

  private static isGreeting(text: string): boolean {
    return (
      text === 'hi' ||
      text === 'hello' ||
      text === 'hey' ||
      text === 'नमस्कार' ||
      text === 'namaskar' ||
      text === 'start' ||
      text === 'सुप्रभात' ||
      text === 'ram ram' ||
      text === 'राम राम'
    );
  }

  // --- View Re-renderer for Back Navigation ---
  private static renderStateView(session: any): BotResponse {
    switch (session.currentFlow) {
      case 'MAIN_MENU':
        return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
      case 'AGRI_MENU':
        return WhatsAppFormatter.agriMenu();
      case 'SEEDS_CROP_MENU':
        return WhatsAppFormatter.seedsCropMenu();
      case 'FERT_MENU':
        return WhatsAppFormatter.fertilizerCategoryMenu();
      case 'PEST_STEP_1_CROP':
        return WhatsAppFormatter.pesticideStep1Crop();
      case 'PEST_STEP_2_PROBLEM':
        return WhatsAppFormatter.pesticideStep2Problem(session.stateData.pesticideCrop || 'पीक');
      case 'CONST_MENU':
        return WhatsAppFormatter.constructionMainMenu();
      case 'STEEL_SELECTOR_MENU':
        return WhatsAppFormatter.steelSelectorMenu();
      case 'CART_VIEW':
        return WhatsAppFormatter.cartView(session.cart, dataRepository.getStoreInfo());
      case 'DAILY_RATES':
        return WhatsAppFormatter.dailyRatesView(dataRepository.getDailyRates());
      default:
        return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
    }
  }

  // --- Flow Handlers ---

  // 1. Main Menu Handler
  private static handleMainMenuInput(session: any, text: string, raw: string): BotResponse {
    if (text === '1' || text === '1️⃣' || text.includes('शेती') || text === 'menu_agri') {
      stateManager.pushState(session, 'AGRI_MENU');
      return WhatsAppFormatter.agriMenu();
    }
    if (text === '2' || text === '2️⃣' || text.includes('बांधकाम') || text === 'menu_const') {
      stateManager.pushState(session, 'CONST_MENU');
      return WhatsAppFormatter.constructionMainMenu();
    }
    if (text === '3' || text === '3️⃣' || text.includes('दोन्ही') || text === 'menu_both') {
      stateManager.pushState(session, 'BOTH_VIEW');
      const textResponse = `🌾🏗️ *शेती व बांधकाम साहित्य - संपूर्ण कॅटलॉग*\n
*१. शेती साहित्य 🌱*
• बियाणे: कापूस, सोयाबीन, बाजरी, मका
• खते: युरिया, डीएपी, १०:२६:२६, १२:३२:१६, सूक्ष्म अन्नद्रव्ये
• औषधे: बोंडअळी, मावा, करपा, तणनाशके
• इतर: मल्चिंग पेपर, ताडपत्री, स्प्रे पंप

*२. बांधकाम साहित्य 🏗️*
• सिमेंट: Ambuja, UltraTech, ACC, Birla A1
• स्टील / TMT: Tata Tiscon, JSW Neosteel, Polad 550D
• लोखंडी अँगल, चॅनल, पाईप, पत्रे, तार, शेती कुंपण जाळी

👉 कशाची माहिती हवी आहे?
1️⃣ शेतीसाठी साहित्य 🌱
2️⃣ बांधकाम साहित्य 🏗️
${WhatsAppFormatter.NAV_FOOTER_TEXT}`;

      return {
        text: textResponse,
        interactive: {
          type: 'button',
          header: '🌾🏗️ संपूर्ण कॅटलॉग',
          body: 'कृपया पुढे जाण्यासाठी विभाग निवडा:',
          footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
          buttons: [
            { id: 'MENU_AGRI', title: '1️⃣ शेती साहित्य 🌱' },
            { id: 'MENU_CONST', title: '2️⃣ बांधकाम साहित्य 🏗️' },
            { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' }
          ]
        }
      };
    }
    if (text === '4' || text === '4️⃣' || text.includes('भाव') || text.includes('दर') || text === 'menu_rates') {
      stateManager.pushState(session, 'DAILY_RATES');
      return WhatsAppFormatter.dailyRatesView(dataRepository.getDailyRates());
    }
    if (text === '5' || text === '5️⃣' || text.includes('ऑर्डर') || text.includes('चौकशी') || text === 'menu_order_track') {
      stateManager.pushState(session, 'ORDER_TRACKING');
      const customerOrders = dataRepository.getOrders(session.phone);
      if (customerOrders.length > 0) {
        let msg = `📦 *आपल्या मोबाईल नंबरशी संलग्न ऑर्डर:*\n\n`;
        customerOrders.forEach((o) => {
          msg += `🧾 *ऑर्डर ID:* \`${o.orderId}\`\n`;
          msg += `📅 दिनांक: ${new Date(o.createdAt).toLocaleDateString('mr-IN')}\n`;
          msg += `📍 स्थिती: *${this.formatOrderStatus(o.status)}*\n`;
          msg += `💵 रक्कम: ₹${o.totalAmount}\n`;
          msg += `📦 साहित्य: ${o.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}\n\n`;
        });
        msg += `👉 इतर ऑर्डर ट्रॅक करण्यासाठी कृपया *ऑर्डर नंबर* (उदा. ORD-1001) टाईप करा.\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`;
        return { text: msg };
      }
      return {
        text: `📦 *ऑर्डर / चौकशी ट्रॅकिंग*\n\nकृपया आपला *ऑर्डर नंबर* (उदा. *ORD-1001*) किंवा मोबाईल नंबर टाईप करून पाठवा:\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`
      };
    }
    if (text === '6' || text === '6️⃣' || text.includes('संपर्क') || text === 'menu_contact') {
      stateManager.pushState(session, 'CONTACT_VIEW');
      return WhatsAppFormatter.contactView(dataRepository.getStoreInfo());
    }

    return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
  }

  // 2. Agriculture Menu Handler
  private static handleAgriMenuInput(session: any, text: string, raw: string): BotResponse {
    if (text === '1' || text === '1️⃣' || text.includes('बियाणे') || text === 'agri_seeds') {
      stateManager.pushState(session, 'SEEDS_CROP_MENU');
      return WhatsAppFormatter.seedsCropMenu();
    }
    if (text === '2' || text === '2️⃣' || text.includes('खते') || text === 'agri_fert') {
      stateManager.pushState(session, 'FERT_MENU');
      return WhatsAppFormatter.fertilizerCategoryMenu();
    }
    if (text === '3' || text === '3️⃣' || text.includes('कीटकनाशक') || text.includes('औषध') || text === 'agri_pest') {
      stateManager.pushState(session, 'PEST_STEP_1_CROP');
      return WhatsAppFormatter.pesticideStep1Crop();
    }
    if (text === '4' || text === '4️⃣' || text.includes('इतर') || text === 'agri_other') {
      const otherAgri = dataRepository.getProductsBySubcategory('other_agri');
      stateManager.pushState(session, 'AGRI_OTHER_LIST', { products: otherAgri.map((p) => p.id) });
      return this.renderProductListResponse('🚜 शेतीसाठी इतर साहित्य', otherAgri);
    }
    if (text === '5' || text === '5️⃣' || text.includes('सर्व') || text === 'agri_all') {
      const allAgri = dataRepository.getProductsByCategory('agriculture');
      stateManager.pushState(session, 'AGRI_OTHER_LIST', { products: allAgri.map((p) => p.id) });
      return this.renderProductListResponse('🌾 सर्व कृषी उत्पादने', allAgri);
    }

    return WhatsAppFormatter.agriMenu();
  }

  // 3. Seeds Crop Menu Handler
  private static handleSeedsCropInput(session: any, text: string, raw: string): BotResponse {
    let cropName = '';
    let cropTitle = '';

    if (text === '1' || text === '1️⃣' || text.includes('कापूस') || text === 'seed_crop_cotton') {
      cropName = 'कापूस';
      cropTitle = '🌾 कापूस बियाणे (Cotton Seeds)';
    } else if (text === '2' || text === '2️⃣' || text.includes('सोयाबीन') || text === 'seed_crop_soy') {
      cropName = 'सोयाबीन';
      cropTitle = '🌱 सोयाबीन बियाणे (Soybean Seeds)';
    } else if (text === '3' || text === '3️⃣' || text.includes('इतर') || text === 'seed_crop_other') {
      cropName = 'इतर पिके';
      cropTitle = '🌽 इतर पिके (बाजरी, मका, हरभरा)';
    } else if (text === '4' || text === '4️⃣' || text.includes('सर्व') || text === 'seed_crop_all') {
      const allSeeds = dataRepository.getProductsBySubcategory('seeds');
      stateManager.pushState(session, 'SEEDS_PRODUCT_LIST', { products: allSeeds.map((p) => p.id) });
      return this.renderProductListResponse('🌾 सर्व बियाणे', allSeeds);
    } else {
      return WhatsAppFormatter.seedsCropMenu();
    }

    const products = dataRepository.getProductsByCrop(cropName);
    stateManager.pushState(session, 'SEEDS_PRODUCT_LIST', {
      cropName,
      products: products.map((p) => p.id)
    });
    return this.renderProductListResponse(cropTitle, products);
  }

  // 4. Fertilizer Menu Handler
  private static handleFertilizerMenuInput(session: any, text: string, raw: string): BotResponse {
    let filtered: Product[] = [];
    let title = '';

    if (text === '1' || text === '1️⃣' || text.includes('urea') || text.includes('युरिया') || text === 'fert_urea') {
      filtered = dataRepository.getAllProducts().filter((p) => p.id.includes('urea'));
      title = '🧪 Urea (युरिया खते)';
    } else if (text === '2' || text === '2️⃣' || text.includes('dap') || text.includes('डीएपी') || text === 'fert_dap') {
      filtered = dataRepository.getAllProducts().filter((p) => p.id.includes('dap'));
      title = '🧪 DAP (डीएपी खते)';
    } else if (text === '3' || text === '3️⃣' || text.includes('npk') || text.includes('एनपीके') || text === 'fert_npk') {
      filtered = dataRepository.getAllProducts().filter((p) => p.id.includes('npk'));
      title = '🧪 NPK मिश्र खते';
    } else if (text === '4' || text === '4️⃣' || text.includes('micro') || text.includes('सूक्ष्म') || text === 'fert_micro') {
      filtered = dataRepository.getAllProducts().filter((p) => p.id.includes('micro'));
      title = '🧪 Micronutrients (सूक्ष्म अन्नद्रव्ये)';
    } else if (text === '5' || text === '5️⃣' || text.includes('इतर') || text === 'fert_other') {
      filtered = dataRepository.getAllProducts().filter((p) => p.id.includes('oth'));
      title = '🧪 इतर खते (पोटॅश, एसएसपी)';
    } else if (text === '6' || text === '6️⃣' || text.includes('सर्व') || text === 'fert_all') {
      filtered = dataRepository.getProductsBySubcategory('fertilizers');
      title = '🧪 सर्व उपलब्ध खते';
    } else {
      return WhatsAppFormatter.fertilizerCategoryMenu();
    }

    stateManager.pushState(session, 'FERT_PRODUCT_LIST', { products: filtered.map((p) => p.id) });
    return this.renderProductListResponse(title, filtered);
  }

  // 5. Pesticides Diagnostic Wizard - Step 1: Crop Selection
  private static handlePestStep1Input(session: any, text: string, raw: string): BotResponse {
    let selectedCrop = '';
    if (text === '1' || text === '1️⃣' || text.includes('कापूस') || text === 'pest_crop_cotton') {
      selectedCrop = 'कापूस';
    } else if (text === '2' || text === '2️⃣' || text.includes('सोयाबीन') || text === 'pest_crop_soybean') {
      selectedCrop = 'सोयाबीन';
    } else if (text === '3' || text === '3️⃣' || text.includes('तूर') || text.includes('हरभरा') || text === 'pest_crop_pulses') {
      selectedCrop = 'तूर / हरभरा';
    } else if (text === '4' || text === '4️⃣' || text.includes('इतर') || text === 'pest_crop_other') {
      selectedCrop = 'इतर पीक';
    } else {
      return WhatsAppFormatter.pesticideStep1Crop();
    }

    stateManager.pushState(session, 'PEST_STEP_2_PROBLEM', { pesticideCrop: selectedCrop });
    return WhatsAppFormatter.pesticideStep2Problem(selectedCrop);
  }

  // 6. Pesticides Diagnostic Wizard - Step 2: Problem Selection
  private static handlePestStep2Input(session: any, text: string, raw: string): BotResponse {
    const crop = session.stateData.pesticideCrop || 'कापूस';

    if (text === '4' || text === '4️⃣' || text.includes('माहिती नाही') || text.includes('मार्गदर्शन') || text === 'pest_prob_expert') {
      return WhatsAppFormatter.pesticideExpertConsult(dataRepository.getStoreInfo(), crop, 'संपूर्ण पीक तपासणी व सल्ला');
    }

    let problemType: 'pest' | 'disease' | 'weed' = 'pest';
    let problemNameMarathi = 'कीड नियंत्रण';

    if (text === '1' || text === '1️⃣' || text.includes('कीड') || text.includes('अळी') || text === 'pest_prob_pest') {
      problemType = 'pest';
      problemNameMarathi = 'कीड नियंत्रण (अळी, मावा, तुडतुडे, पांढरी माशी)';
    } else if (text === '2' || text === '2️⃣' || text.includes('रोग') || text.includes('करपा') || text === 'pest_prob_disease') {
      problemType = 'disease';
      problemNameMarathi = 'रोग व बुरशी नियंत्रण (करपा, तांबेरा, मूळकुज)';
    } else if (text === '3' || text === '3️⃣' || text.includes('तण') || text === 'pest_prob_weed') {
      problemType = 'weed';
      problemNameMarathi = 'तण नियंत्रण (तणनाशके)';
    } else {
      return WhatsAppFormatter.pesticideStep2Problem(crop);
    }

    const recommended = dataRepository.getPesticidesByCropAndProblem(crop, problemType);
    stateManager.pushState(session, 'PEST_RECOMMENDED_LIST', {
      pesticideCrop: crop,
      pesticideProblem: problemNameMarathi,
      products: recommended.map((p) => p.id)
    });

    let msg = `🌿 *${crop} पिकासाठी शिफारशीत औषधे (${problemNameMarathi}):*\n\n`;
    recommended.forEach((p, idx) => {
      msg += `${idx + 1}️⃣ *${p.brand} ${p.name}*\n`;
      msg += `   📦 पॅकिंग: ${p.packSize}\n`;
      msg += `   💰 अंदाजे दर: ₹${p.price} / ${p.unit}\n`;
      msg += `   📝 कार्य: ${p.description}\n\n`;
    });

    msg += `────────────────────\n`;
    msg += `⚠️ *महत्त्वाची सूचना:* कीटकनाशकाचा अचूक डोस (प्रमाण) जाणून घेण्यासाठी आमच्या कृषी तज्ज्ञाशी चर्चा करा.\n\n`;
    msg += `👉 उत्पादनाचा नंबर पाठवून ऑर्डर करा किंवा खालील बटण निवडा.\n`;
    msg += WhatsAppFormatter.NAV_FOOTER_TEXT;

    const rows = recommended.slice(0, 5).map((p, idx) => ({
      id: `PROD_VIEW_${p.id}`,
      title: `${idx + 1}️⃣ ${p.name.substring(0, 20)}`,
      description: `दर: ₹${p.price} / ${p.unit}`
    }));

    return {
      text: msg,
      interactive: {
        type: 'list',
        header: `🌿 ${crop} शिफारशीत औषधे`,
        body: 'उत्पादन निवडून ऑर्डर करा किंवा तज्ज्ञांशी चर्चा करा:',
        footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
        buttonText: 'उत्पादन निवडा 🌿',
        sections: [
          { title: 'शिफारशीत औषधे', rows },
          {
            title: 'तज्ज्ञ सल्ला',
            rows: [
              { id: 'ACTION_CALL_EXPERT', title: '👨🌾 तज्ज्ञाशी थेट बोला', description: 'मोफत सल्ला व अचूक डोस' }
            ]
          }
        ]
      }
    };
  }

  // 7. Construction Menu Handler
  private static handleConstMenuInput(session: any, text: string, raw: string): BotResponse {
    if (text === '1' || text === '1️⃣' || text.includes('cement') || text.includes('सिमेंट') || text === 'const_cement') {
      stateManager.pushState(session, 'CONST_CEMENT_MENU');
      const cements = dataRepository.getProductsBySubcategory('cement');
      return WhatsAppFormatter.cementBrandsMenu(cements, dataRepository.getDailyRates());
    }

    if (text === '2' || text === '2️⃣' || text.includes('steel') || text.includes('tmt') || text.includes('स्टील') || text === 'const_steel') {
      const steels = dataRepository.getProductsBySubcategory('steel');
      stateManager.pushState(session, 'STEEL_SELECTOR_MENU');
      return WhatsAppFormatter.steelSelectorMenu();
    }

    if (text === '3' || text === '3️⃣' || text.includes('angle') || text.includes('अँगल') || text === 'const_angle') {
      const angleProd = dataRepository.getProductById('const-angle-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'MS Angle (लोखंडी अँगल)',
        productId: angleProd.id,
        sizes: angleProd.sizes
      });
      return WhatsAppFormatter.sizePicker('MS Angle', angleProd.sizes || ['25×25', '32×32', '40×40', '50×50', 'इतर size']);
    }

    if (text === '4' || text === '4️⃣' || text.includes('channel') || text.includes('चॅनल') || text === 'const_channel') {
      const chanProd = dataRepository.getProductById('const-chan-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'MS Channel (चॅनल)',
        productId: chanProd.id,
        sizes: chanProd.sizes
      });
      return WhatsAppFormatter.sizePicker('MS Channel', chanProd.sizes || ['75×40', '100×50', '125×65', 'इतर size']);
    }

    if (text === '5' || text === '5️⃣' || text.includes('pipe') || text.includes('पाईप') || text === 'const_pipe') {
      const pipeProd = dataRepository.getProductById('const-pipe-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'MS Pipe (लोखंडी चौकोनी/गोल पाईप)',
        productId: pipeProd.id,
        sizes: pipeProd.sizes
      });
      return WhatsAppFormatter.sizePicker('MS Pipe', pipeProd.sizes || ['1"×1"', '1.5"×1.5"', '2"×2"', '3"×3', 'इतर size']);
    }

    if (text === '6' || text === '6️⃣' || text.includes('pvc') || text === 'const_pvc') {
      const pvcProd = dataRepository.getProductById('const-pvc-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'PVC Pipe (शेती व ड्रेनेज पाईप)',
        productId: pvcProd.id,
        sizes: pvcProd.sizes
      });
      return WhatsAppFormatter.sizePicker('PVC Pipe', pvcProd.sizes || ['2.5 inch', '3 inch', '4 inch', '6 inch', 'इतर size']);
    }

    if (text === '7' || text === '7️⃣' || text.includes('gi') || text.includes('पत्रे') || text === 'const_gi') {
      const giProd = dataRepository.getProductById('const-gi-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'GI Sheet / पत्रे',
        productId: giProd.id,
        sizes: giProd.sizes
      });
      return WhatsAppFormatter.sizePicker('GI Sheet (पत्रे)', giProd.sizes || ['8 ft', '10 ft', '12 ft', '14 ft']);
    }

    if (text === '8' || text === '8️⃣' || text.includes('wire') || text.includes('तार') || text === 'const_wire') {
      const wireProd = dataRepository.getProductById('const-wire-01')!;
      stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: wireProd.id });
      return WhatsAppFormatter.productDetailsCard(wireProd);
    }

    if (text === '9' || text === '9️⃣' || text.includes('fence') || text.includes('कुंपण') || text === 'const_fence') {
      const fenceProd = dataRepository.getProductById('const-fence-01')!;
      stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: fenceProd.id });
      return WhatsAppFormatter.productDetailsCard(fenceProd);
    }

    if (text === '10' || text === '🔟' || text.includes('सर्व') || text === 'const_all') {
      const allConst = dataRepository.getProductsByCategory('construction');
      stateManager.pushState(session, 'CONST_ALL_LIST', { products: allConst.map((p) => p.id) });
      return this.renderProductListResponse('🏗️ सर्व बांधकाम साहित्य', allConst);
    }

    return WhatsAppFormatter.constructionMainMenu();
  }

  // 8. Cement Brands Menu Handler
  private static handleCementMenuInput(session: any, text: string, raw: string): BotResponse {
    const cements = dataRepository.getProductsBySubcategory('cement');

    if (text.startsWith('prod_view_')) {
      const id = text.replace('prod_view_', '');
      const prod = dataRepository.getProductById(id);
      if (prod) {
        stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: prod.id });
        return WhatsAppFormatter.productDetailsCard(prod);
      }
    }

    if (text === 'menu_rates_cement' || text.includes('दर') || text.includes('भाव')) {
      stateManager.pushState(session, 'DAILY_RATES');
      return WhatsAppFormatter.dailyRatesView(dataRepository.getDailyRates());
    }

    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1 && num <= cements.length) {
      const selected = cements[num - 1];
      stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: selected.id });
      return WhatsAppFormatter.productDetailsCard(selected);
    } else if (num === cements.length + 1) {
      stateManager.pushState(session, 'DAILY_RATES');
      return WhatsAppFormatter.dailyRatesView(dataRepository.getDailyRates());
    }

    // Try name match
    const matched = cements.find((c) => text.includes(c.brand.toLowerCase()) || text.includes(c.name.toLowerCase()));
    if (matched) {
      stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: matched.id });
      return WhatsAppFormatter.productDetailsCard(matched);
    }

    return WhatsAppFormatter.cementBrandsMenu(cements, dataRepository.getDailyRates());
  }

  // 9. Steel Selector Menu Handler
  private static handleSteelSelectorMenuInput(session: any, text: string, raw: string): BotResponse {
    if (text === '1' || text === '1️⃣' || text.includes('tmt') || text === 'steel_tmt') {
      const steels = dataRepository.getProductsBySubcategory('steel');
      stateManager.pushState(session, 'STEEL_TMT_LIST', { products: steels.map((p) => p.id) });
      return this.renderProductListResponse('🔩 TMT Steel Rebars (८ ते २० mm)', steels);
    }

    if (text === '2' || text === '2️⃣' || text.includes('angle') || text === 'steel_angle') {
      const angleProd = dataRepository.getProductById('const-angle-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'MS Angle',
        productId: angleProd.id,
        sizes: angleProd.sizes
      });
      return WhatsAppFormatter.sizePicker('MS Angle', angleProd.sizes || ['25×25', '32×32', '40×40', '50×50', 'इतर size']);
    }

    if (text === '3' || text === '3️⃣' || text.includes('channel') || text === 'steel_channel') {
      const chanProd = dataRepository.getProductById('const-chan-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'MS Channel',
        productId: chanProd.id,
        sizes: chanProd.sizes
      });
      return WhatsAppFormatter.sizePicker('MS Channel', chanProd.sizes || ['75×40', '100×50', '125×65', 'इतर size']);
    }

    if (text === '4' || text === '4️⃣' || text.includes('pipe') || text === 'steel_pipe') {
      const pipeProd = dataRepository.getProductById('const-pipe-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'MS Pipe',
        productId: pipeProd.id,
        sizes: pipeProd.sizes
      });
      return WhatsAppFormatter.sizePicker('MS Pipe', pipeProd.sizes || ['1"×1"', '1.5"×1.5"', '2"×2', 'इतर size']);
    }

    if (text === '5' || text === '5️⃣' || text.includes('pvc') || text.includes('gi') || text === 'steel_gi_pvc') {
      const pvcProd = dataRepository.getProductById('const-pvc-01')!;
      stateManager.pushState(session, 'STEEL_SIZE_PICKER', {
        selectedMaterial: 'PVC Pipe',
        productId: pvcProd.id,
        sizes: pvcProd.sizes
      });
      return WhatsAppFormatter.sizePicker('PVC Pipe', pvcProd.sizes || ['2.5"', '3"', '4"', '6"']);
    }

    if (text === '6' || text === '6️⃣' || text.includes('wire') || text === 'steel_wire') {
      const wireProd = dataRepository.getProductById('const-wire-01')!;
      stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: wireProd.id });
      return WhatsAppFormatter.productDetailsCard(wireProd);
    }

    return WhatsAppFormatter.steelSelectorMenu();
  }

  // 10. Steel & Material Size Picker Handler (Requirement 6)
  private static handleSteelSizePickerInput(session: any, text: string, raw: string): BotResponse {
    const sizes: string[] = session.stateData.sizes || [];
    let selectedSize = '';

    if (text.startsWith('size_select_')) {
      const idx = parseInt(text.replace('size_select_', ''), 10);
      if (!isNaN(idx) && sizes[idx]) {
        selectedSize = sizes[idx];
      }
    } else {
      const num = parseInt(text, 10);
      if (!isNaN(num) && num >= 1 && num <= sizes.length) {
        selectedSize = sizes[num - 1];
      } else {
        // User typed a custom size like "40x40" or "50x5" or "100"
        selectedSize = raw;
      }
    }

    session.stateData.selectedSize = selectedSize;
    stateManager.pushState(session, 'MATERIAL_QUANTITY_INPUT', {
      ...session.stateData,
      selectedSize
    });

    const materialName = session.stateData.selectedMaterial || 'साहित्य';
    return WhatsAppFormatter.unitAndQuantityPrompt(materialName, selectedSize);
  }

  // 11. Material Quantity & Unit Input Handler
  private static handleMaterialQuantityInput(session: any, text: string, raw: string): BotResponse {
    const prodId = session.stateData.productId || 'const-angle-01';
    const prod = dataRepository.getProductById(prodId);
    const selectedSize = session.stateData.selectedSize || '';

    // Quick quantity buttons
    if (text === 'qty_quick_10') {
      return this.addMaterialToCart(session, prod, selectedSize, 10, 'नग');
    }
    if (text === 'qty_quick_50') {
      return this.addMaterialToCart(session, prod, selectedSize, 50, 'Kg');
    }

    // Parse quantity and unit from input like "50 kg", "2 ton", "10", "5 nos"
    const parsed = this.parseQuantityAndUnit(raw);
    return this.addMaterialToCart(session, prod, selectedSize, parsed.qty, parsed.unit);
  }

  private static addMaterialToCart(
    session: any,
    prod: Product | undefined,
    size: string,
    quantity: number,
    unit: string
  ): BotResponse {
    const unitPrice = prod?.price || 56;
    const item: CartItem = {
      productId: prod?.id || 'custom-item',
      productName: prod?.nameMarathi || prod?.name || 'MS साहित्य',
      brand: prod?.brand || 'Standard',
      selectedSize: size,
      quantity,
      unit,
      unitPrice,
      totalPrice: quantity * unitPrice
    };

    stateManager.addToCart(session, item);
    stateManager.pushState(session, 'CART_VIEW');

    const confirmationText = `✅ *कार्टमध्ये समाविष्ट करण्यात आले!*\n\n📦 उत्पादन: *${item.productName}*\n📏 साईझ: *${item.selectedSize}*\n🔢 संख्या: *${quantity} ${unit}*\n💰 अंदाजे दर: ₹${item.unitPrice}/${unit}\n💵 एकूण रक्कम: *₹${item.totalPrice}*\n\n👉 आपली पूर्ण ऑर्डर पाहण्यासाठी खालील बटण दाबा किंवा आणखी खरेदी करा:\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`;

    return {
      text: confirmationText,
      interactive: {
        type: 'button',
        header: '✅ कार्ट अपडेट झाले',
        body: `${item.productName} (${quantity} ${unit}) जोडले गेले आहे.`,
        footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
        buttons: [
          { id: 'NAV_CART', title: '🛒 माझी ऑर्डर पाहा' },
          { id: 'MENU_CONST', title: '🏗️ आणखी बांधकाम साहित्य' },
          { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' }
        ]
      }
    };
  }

  // 12. Generic Product List Input Handler
  private static handleProductListInput(session: any, text: string, raw: string): BotResponse {
    const productIds: string[] = session.stateData.products || [];

    if (text.startsWith('prod_view_') || text.startsWith('action_order_prod_')) {
      const id = text.replace('prod_view_', '').replace('action_order_prod_', '');
      const prod = dataRepository.getProductById(id);
      if (prod) {
        stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: prod.id });
        return WhatsAppFormatter.productDetailsCard(prod);
      }
    }

    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1 && num <= productIds.length) {
      const prodId = productIds[num - 1];
      const prod = dataRepository.getProductById(prodId);
      if (prod) {
        stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: prod.id });
        return WhatsAppFormatter.productDetailsCard(prod);
      }
    }

    // Direct search by product name/brand
    const allProd = productIds.map((id) => dataRepository.getProductById(id)).filter(Boolean) as Product[];
    const matched = allProd.find(
      (p) => text.includes(p.name.toLowerCase()) || text.includes(p.brand.toLowerCase()) || text.includes(p.nameMarathi.toLowerCase())
    );
    if (matched) {
      stateManager.pushState(session, 'PRODUCT_DETAILS', { productId: matched.id });
      return WhatsAppFormatter.productDetailsCard(matched);
    }

    // Default: re-render list
    return this.renderProductListResponse('उपलब्ध उत्पादने', allProd);
  }

  // 13. Product Details Input Handler
  private static handleProductDetailsInput(session: any, text: string, raw: string): BotResponse {
    const prodId = session.stateData.productId;
    const prod = dataRepository.getProductById(prodId);
    if (!prod) {
      stateManager.resetToMainMenu(session);
      return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
    }

    if (text.startsWith('action_order_prod_') || text.includes('ऑर्डर') || text.includes('order') || text === '1') {
      stateManager.pushState(session, 'PRODUCT_QUANTITY_INPUT', { productId: prod.id });
      return WhatsAppFormatter.unitAndQuantityPrompt(prod.nameMarathi || prod.name);
    }

    return WhatsAppFormatter.productDetailsCard(prod);
  }

  // 14. Product Quantity Input Handler
  private static handleProductQuantityInput(session: any, text: string, raw: string): BotResponse {
    const prodId = session.stateData.productId;
    const prod = dataRepository.getProductById(prodId);
    if (!prod) {
      stateManager.resetToMainMenu(session);
      return WhatsAppFormatter.welcomeMessage(dataRepository.getStoreInfo());
    }

    let qty = 1;
    let unit = prod.unit;

    if (text === 'qty_quick_10') {
      qty = 10;
    } else if (text === 'qty_quick_50') {
      qty = 50;
    } else {
      const parsed = this.parseQuantityAndUnit(raw);
      qty = parsed.qty;
      if (parsed.unit && parsed.unit !== 'नग') {
        unit = parsed.unit;
      }
    }

    const item: CartItem = {
      productId: prod.id,
      productName: prod.nameMarathi || prod.name,
      brand: prod.brand,
      quantity: qty,
      unit,
      unitPrice: prod.price,
      totalPrice: qty * prod.price
    };

    stateManager.addToCart(session, item);
    stateManager.pushState(session, 'CART_VIEW');

    const msg = `✅ *ऑर्डरमध्ये समाविष्ट झाले!*\n\n📦 *${item.productName}* (${item.brand})\n🔢 नग/संख्या: *${qty} ${unit}*\n💰 चालू दर: ₹${prod.price} / ${unit}\n💵 एकूण अंदाजे रक्कम: *₹${item.totalPrice}*\n\n👉 ऑर्डर निश्चित करण्यासाठी "ऑर्डर कन्फर्म" पाठवा किंवा खालील बटण निवडा:\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`;

    return {
      text: msg,
      interactive: {
        type: 'button',
        header: '✅ कार्टमध्ये समाविष्ट',
        body: `${item.productName} (${qty} ${unit}) जोडले गेले आहे.`,
        footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
        buttons: [
          { id: 'NAV_CART', title: '🛒 माझी ऑर्डर पाहा' },
          { id: 'ACTION_CONFIRM_ORDER', title: '✅ ऑर्डर कन्फर्म करा' },
          { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' }
        ]
      }
    };
  }

  // 15. Cart View Handler
  private static handleCartViewInput(session: any, text: string, raw: string): BotResponse {
    if (session.cart.length === 0) {
      return WhatsAppFormatter.cartView(session.cart, dataRepository.getStoreInfo());
    }

    if (text === 'action_confirm_order' || text.includes('कन्फर्म') || text.includes('confirm') || text.includes('बुक')) {
      stateManager.pushState(session, 'CHECKOUT_NAME_INPUT');
      return {
        text: `📝 *ऑर्डर नोंदणी - पायरी १/२*\n\nकृपया आपले *पूर्ण नाव* टाईप करून पाठवा:\n(उदा. *सचिन पाटील*)\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`
      };
    }

    if (text === 'action_clear_cart' || text.includes('क्लियर') || text.includes('रिकामी')) {
      stateManager.clearCart(session);
      return WhatsAppFormatter.cartView(session.cart, dataRepository.getStoreInfo());
    }

    if (text.includes('रिमूव्ह') || text.includes('remove') || text.includes('delete')) {
      const match = text.match(/\d+/);
      if (match) {
        const idx = parseInt(match[0], 10) - 1;
        stateManager.removeFromCart(session, idx);
        return WhatsAppFormatter.cartView(session.cart, dataRepository.getStoreInfo());
      }
    }

    return WhatsAppFormatter.cartView(session.cart, dataRepository.getStoreInfo());
  }

  // 16. Checkout Handlers
  private static handleCheckoutNameInput(session: any, raw: string): BotResponse {
    session.customerName = raw;
    stateManager.pushState(session, 'CHECKOUT_ADDRESS_INPUT');
    return {
      text: `📍 *ऑर्डर नोंदणी - पायरी २/२*\n\nधन्यवाद *${raw}* जी! 🙏\n\nकृपया आपला *डिलिव्हरी पत्ता व गाव / तालुका* टाईप करून पाठवा:\n(उदा. *मु. पो. अंबड, ता. अंबड, जि. जालना*)\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`
    };
  }

  private static handleCheckoutAddressInput(session: any, raw: string): BotResponse {
    session.customerAddress = raw;

    let subtotal = 0;
    session.cart.forEach((i: CartItem) => {
      subtotal += i.totalPrice;
    });

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      orderId,
      customerPhone: session.phone,
      customerName: session.customerName || 'सन्माननीय ग्राहक',
      address: session.customerAddress || 'दुकान पिकअप',
      items: [...session.cart],
      totalAmount: subtotal,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    dataRepository.createOrder(newOrder);
    stateManager.clearCart(session);
    stateManager.resetToMainMenu(session);

    const storeInfo = dataRepository.getStoreInfo();
    let msg = `🎉 *आपली ऑर्डर यशस्वीरीत्या नोंदवली गेली आहे!* 🙏\n\n`;
    msg += `🧾 *ऑर्डर नंबर:* \`${orderId}\`\n`;
    msg += `👤 ग्राहक: *${newOrder.customerName}*\n`;
    msg += `📱 मोबाईल: *${newOrder.customerPhone}*\n`;
    msg += `📍 डिलिव्हरी पत्ता: ${newOrder.address}\n`;
    msg += `────────────────────\n`;
    msg += `📦 *ऑर्डर केलेले साहित्य:*\n`;
    newOrder.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.productName} (${item.brand})${item.selectedSize ? ` - ${item.selectedSize}` : ''} x *${item.quantity} ${item.unit}* = ₹${item.totalPrice}\n`;
    });
    msg += `────────────────────\n`;
    msg += `💵 *एकूण रक्कम: ₹${newOrder.totalAmount}*\n\n`;
    msg += `📞 *आमचे प्रतिनिधी आपल्या पत्त्यावर साहित्य रवाना करण्यासाठी लवकरच संपर्क करतील.*\n`;
    msg += `💳 बिल भरण्यासाठी किंवा आगाऊ पेमेंटसाठी UPI: \`${storeInfo.upiId}\`\n\n`;
    msg += `🏪 *${storeInfo.name}* वर विश्वास ठेवल्याबद्दल धन्यवाद!\n`;
    msg += WhatsAppFormatter.NAV_FOOTER_TEXT;

    return {
      text: msg,
      interactive: {
        type: 'button',
        header: '🎉 ऑर्डर नोंदणी यशस्वी',
        body: `ऑर्डर ID: ${orderId} नोंदवला गेला आहे.`,
        footer: storeInfo.name,
        buttons: [
          { id: 'MENU_ORDER_TRACK', title: '📦 ऑर्डर स्थिती पाहा' },
          { id: 'NAV_HOME', title: '🏠 मुख्य मेनू' },
          { id: 'NAV_CONTACT', title: '📞 दुकानाशी संपर्क' }
        ]
      }
    };
  }

  // 17. Order Tracking Handler
  private static handleOrderTrackingInput(session: any, raw: string): BotResponse {
    const input = raw.trim();
    const order = dataRepository.getOrderById(input);

    if (order) {
      let msg = `📦 *ऑर्डर तपशील (${order.orderId})*\n\n`;
      msg += `👤 ग्राहक: *${order.customerName}*\n`;
      msg += `📅 तारीख: ${new Date(order.createdAt).toLocaleDateString('mr-IN')}\n`;
      msg += `📍 स्थिती: *${this.formatOrderStatus(order.status)}*\n`;
      msg += `🚚 पत्ता: ${order.address}\n`;
      msg += `────────────────────\n`;
      order.items.forEach((item, idx) => {
        msg += `${idx + 1}. ${item.productName} - ${item.quantity} ${item.unit} (₹${item.totalPrice})\n`;
      });
      msg += `────────────────────\n`;
      msg += `💵 एकूण रक्कम: *₹${order.totalAmount}*\n\n`;
      msg += `अधिक माहितीसाठी आमच्या दुकानाशी संपर्क करा.\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`;
      return { text: msg };
    }

    const byPhone = dataRepository.getOrders(input);
    if (byPhone.length > 0) {
      let msg = `📦 *या मोबाईल क्रमांकावरील ऑर्डर्स (${input}):*\n\n`;
      byPhone.forEach((o) => {
        msg += `🧾 *ID:* \`${o.orderId}\` | स्थिती: *${this.formatOrderStatus(o.status)}* | एकूण: ₹${o.totalAmount}\n`;
      });
      msg += `\nतपशील पाहण्यासाठी संबंधित *ऑर्डर ID* पाठवा.\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`;
      return { text: msg };
    }

    return {
      text: `❌ दिलगीर आहोत, *"${input}"* या क्रमांकावर कोणतीही ऑर्डर सापडली नाही.\n\nकृपया बरोबर ऑर्डर नंबर (उदा. *ORD-1001*) किंवा मोबाईल नंबर तपासा.\n${WhatsAppFormatter.NAV_FOOTER_TEXT}`
    };
  }

  // 18. Daily Rates Handler
  private static handleDailyRatesInput(session: any, text: string): BotResponse {
    if (text === 'menu_agri' || text === '1') {
      stateManager.pushState(session, 'AGRI_MENU');
      return WhatsAppFormatter.agriMenu();
    }
    if (text === 'menu_const' || text === '2') {
      stateManager.pushState(session, 'CONST_MENU');
      return WhatsAppFormatter.constructionMainMenu();
    }
    return WhatsAppFormatter.dailyRatesView(dataRepository.getDailyRates());
  }

  // --- Helpers ---
  private static renderProductListResponse(title: string, products: Product[]): BotResponse {
    let msg = `🌾 *${title}*\n\n`;
    products.forEach((p, idx) => {
      const avail = p.available ? '✅ उपलब्ध' : '❌ संपले';
      msg += `${idx + 1}️⃣ *${p.brand} ${p.name}*\n`;
      msg += `   📦 पॅकिंग: ${p.packSize} | ${avail}\n`;
      msg += `   💰 आजचा दर: *₹${p.price}* / ${p.unit}\n`;
      msg += `   📝 ${p.description.substring(0, 60)}...\n\n`;
    });

    msg += `👉 उत्पादनाचा नंबर निवडा (उदा. *1* किंवा *2*) अथवा उत्पादनाचे नाव पाठवा.\n`;
    msg += WhatsAppFormatter.NAV_FOOTER_TEXT;

    const rows = products.slice(0, 9).map((p, idx) => ({
      id: `PROD_VIEW_${p.id}`,
      title: `${idx + 1}️⃣ ${p.name.substring(0, 20)}`,
      description: `₹${p.price}/${p.unit} - ${p.brand}`
    }));

    return {
      text: msg,
      interactive: {
        type: 'list',
        header: title,
        body: 'तपशील पाहण्यासाठी किंवा खरेदी करण्यासाठी उत्पादन निवडा:',
        footer: 'वल्लभ सीड्स अँड फर्टिलायझर्स',
        buttonText: 'उत्पादन निवडा 📦',
        sections: [{ title: 'उपलब्ध उत्पादने', rows }]
      }
    };
  }

  private static parseQuantityAndUnit(text: string): { qty: number; unit: string } {
    const clean = text.trim();
    const numMatch = clean.match(/(\d+(\.\d+)?)/);
    const qty = numMatch ? parseFloat(numMatch[1]) : 1;

    let unit = 'नग';
    const lower = clean.toLowerCase();
    if (lower.includes('kg') || lower.includes('kilo') || lower.includes('किलो')) {
      unit = 'Kg';
    } else if (lower.includes('ton') || lower.includes('टन')) {
      unit = 'Ton';
    } else if (lower.includes('bag') || lower.includes('बॅग') || lower.includes('बोरी')) {
      unit = 'बॅग';
    } else if (lower.includes('पाकीट') || lower.includes('packet')) {
      unit = 'पाकीट';
    } else if (lower.includes('लिटर') || lower.includes('litre') || lower.includes('lit')) {
      unit = 'लिटर';
    } else if (lower.includes('फूट') || lower.includes('ft') || lower.includes('feet')) {
      unit = 'फूट';
    }

    return { qty, unit };
  }

  private static formatOrderStatus(status: Order['status']): string {
    switch (status) {
      case 'PENDING':
        return '⏳ ऑर्डर स्वीकारली (प्रलंबित / Pending)';
      case 'CONFIRMED':
        return '✅ ऑर्डर निश्चित झाली (Confirmed)';
      case 'DISPATCHED':
        return '🚚 वाहतुकीसाठी रवाना (Dispatched)';
      case 'DELIVERED':
        return '🎉 पोहोच झाली (Delivered)';
      case 'CANCELLED':
        return '❌ रद्द झाली (Cancelled)';
      default:
        return status;
    }
  }
}
