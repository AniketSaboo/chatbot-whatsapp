// Automated Verification Script for Vallabh Seeds & Fertilizers WhatsApp Bot
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const TEST_PHONE = '+919988776655';

async function runTests() {
  console.log('🧪 Starting Vallabh Seeds WhatsApp Bot Automated Flow Tests...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ [FAIL] ${name}`);
      console.error('   Error:', e.message || e);
    }
  }

  // Reset session first
  await axios.post(`${BASE_URL}/api/simulator/reset`, { phone: TEST_PHONE });

  // Test 1: Customer sends "Hi"
  await test('1. Customer sends "Hi" -> Marathi welcome message with 6 options', async () => {
    const res = await axios.post(`${BASE_URL}/api/simulator/message`, {
      phone: TEST_PHONE,
      text: 'Hi'
    });
    const text = res.data.response.text;
    if (!text.includes('नमस्कार') || !text.includes('Vallabh Seeds') || !text.includes('शेतीसाठी साहित्य')) {
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }
  });

  // Test 2: Select Option 1: शेतीसाठी साहित्य 🌱
  await test('2. Customer selects "1" (शेतीसाठी साहित्य) -> Agriculture subcategories', async () => {
    const res = await axios.post(`${BASE_URL}/api/simulator/message`, {
      phone: TEST_PHONE,
      text: '1'
    });
    const text = res.data.response.text;
    if (!text.includes('बियाणे') || !text.includes('खते') || !text.includes('कीटकनाशके')) {
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }
  });

  // Test 3: Select Biyane -> Crop Selection
  await test('3. Customer selects "1" (बियाणे) -> Crop selection (कापूस, सोयाबीन, इतर पिके)', async () => {
    const res = await axios.post(`${BASE_URL}/api/simulator/message`, {
      phone: TEST_PHONE,
      text: '1'
    });
    const text = res.data.response.text;
    if (!text.includes('कापूस') || !text.includes('सोयाबीन')) {
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }
  });

  // Test 4: Select Cotton Seeds -> Showcase Rasi 659, US 7067
  await test('4. Customer selects "1" (कापूस) -> Showcase Rasi 659 & US 7067 with price & stock', async () => {
    const res = await axios.post(`${BASE_URL}/api/simulator/message`, {
      phone: TEST_PHONE,
      text: '1'
    });
    const text = res.data.response.text;
    if (!text.includes('Rasi') || !text.includes('659') || !text.includes('864')) {
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }
  });

  // Test 5: Universal Back Button (⬅️ Back)
  await test('5. Universal Navigation: Send "*" (Back) -> Returns to Crop Selection', async () => {
    const res = await axios.post(`${BASE_URL}/api/simulator/message`, {
      phone: TEST_PHONE,
      text: '*'
    });
    const text = res.data.response.text;
    if (!text.includes('बियाण्यांमध्ये कोणते पीक')) {
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }
  });

  // Test 6: Universal Main Menu (0 / 🏠 Main Menu)
  await test('6. Universal Navigation: Send "0" (Main Menu) -> Returns to Home Screen', async () => {
    const res = await axios.post(`${BASE_URL}/api/simulator/message`, {
      phone: TEST_PHONE,
      text: '0'
    });
    const text = res.data.response.text;
    if (!text.includes('Vallabh Seeds & Fertilizers') || !text.includes('मनःपूर्वक स्वागत आहे')) {
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }
  });

  // Test 7: Fertilizer flow (Urea / DAP)
  await test('7. Fertilizers Flow: 1 -> 2 -> 1 (Urea) -> Shows Urea details', async () => {
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '1' });
    const fertRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '2' });
    if (!fertRes.data.response.text.includes('Urea') || !fertRes.data.response.text.includes('DAP')) {
      throw new Error('Fertilizer menu not shown');
    }
    const ureaRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '1' });
    if (!ureaRes.data.response.text.includes('IFFCO Neem Coated Urea') && !ureaRes.data.response.text.includes('युरिया')) {
      throw new Error('Urea details not shown');
    }
  });

  // Test 8: Pesticides 2-Step Diagnostic Wizard (Crop -> Problem -> Expert consultation)
  await test('8. Pesticides Wizard: Crop -> Problem -> Expert Consultation & Targeted Products', async () => {
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '0' }); // Main menu
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '1' }); // Agri
    const pestStep1 = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '3' }); // Pesticides
    if (!pestStep1.data.response.text.includes('कोणत्या पिकासाठी औषध हवे आहे')) {
      throw new Error('Pesticide step 1 crop selector failed');
    }

    const pestStep2 = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '1' }); // Cotton
    if (!pestStep2.data.response.text.includes('कोणती समस्या आहे')) {
      throw new Error('Pesticide step 2 problem selector failed');
    }

    // Select Guidance / Don't know -> Directly triggers Expert Call
    const expertRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '4' });
    if (!expertRes.data.response.text.includes('योग्य उत्पादनाची निवड करण्यासाठी आमच्या तज्ज्ञाशी संपर्क करा') ||
        !expertRes.data.response.text.includes('तज्ज्ञाशी बोला')) {
      throw new Error('Expert recommendation callout failed');
    }
  });

  // Test 9: Construction Materials -> Cement Brands & Today's Rates
  await test('9. Construction: Cement Brands & Rates', async () => {
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '0' }); // Main menu
    const constRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '2' }); // Construction
    if (!constRes.data.response.text.includes('Cement') || !constRes.data.response.text.includes('MS Angle')) {
      throw new Error('Construction menu failed');
    }

    const cemRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '1' }); // Cement
    if (!cemRes.data.response.text.includes('Ambuja') || !cemRes.data.response.text.includes('UltraTech')) {
      throw new Error('Cement brands failed');
    }
  });

  // Test 10: Steel & MS Materials (Size Selector & Custom Dimensions - Requirement 6)
  await test('10. Steel/MS Angle: Size Selector (40x40) & Quantity Prompt', async () => {
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '0' });
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '2' }); // Construction
    const angleRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '3' }); // MS Angle
    if (!angleRes.data.response.text.includes('आवश्यक Size निवडा')) {
      throw new Error('Size picker failed');
    }

    const qtyPrompt = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '3' }); // 40x40
    if (!qtyPrompt.data.response.text.includes('किती quantity पाहिजे')) {
      throw new Error('Quantity prompt failed');
    }

    // Add quantity
    const addedRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '50 Kg' });
    if (!addedRes.data.response.text.includes('कार्टमध्ये समाविष्ट करण्यात आले') && !addedRes.data.response.text.includes('50 Kg')) {
      throw new Error('Adding MS angle to cart failed');
    }
  });

  // Test 11: Cart & Checkout Order Completion
  await test('11. Cart View & Complete Order Placement with Invoice Details', async () => {
    const cartRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '#' });
    if (!cartRes.data.response.text.includes('आपली ऑर्डर सूची')) {
      throw new Error('Cart view failed');
    }

    // Confirm order
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: 'ऑर्डर कन्फर्म' });
    // Step 1: Customer Name
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: 'गणेश जाधव (शेतकरी)' });
    // Step 2: Customer Address
    const finalOrderRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: 'मु. पो. मंठा, जि. जालना' });
    const orderText = finalOrderRes.data.response.text;

    if (!orderText.includes('आपली ऑर्डर यशस्वीरीत्या नोंदवली गेली आहे') || !orderText.includes('ORD-')) {
      throw new Error('Order confirmation invoice failed');
    }
  });

  // Test 12: Order Tracking
  await test('12. Order Tracking: Check status by phone', async () => {
    await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '0' });
    const trackRes = await axios.post(`${BASE_URL}/api/simulator/message`, { phone: TEST_PHONE, text: '5' });
    if (!trackRes.data.response.text.includes('ORD-')) {
      throw new Error('Order tracking failed to find recently placed order');
    }
  });

  // Test 13: Meta WhatsApp Webhook Challenge Verification
  await test('13. Meta Webhook: GET /webhook hub.challenge verification', async () => {
    const challengeRes = await axios.get(`${BASE_URL}/webhook`, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'vallabh_seeds_secret_token',
        'hub.challenge': 'CHALLENGE_ACCEPTED_12345'
      }
    });
    if (challengeRes.data !== 'CHALLENGE_ACCEPTED_12345') {
      throw new Error(`Unexpected challenge response: ${challengeRes.data}`);
    }
  });

  // Test 14: Admin API: Update and retrieve Today's Rates
  await test('14. Admin API: Update and retrieve Today\'s Rates', async () => {
    const putRes = await axios.put(`${BASE_URL}/api/rates/rate-cement-ambuja`, {
      rate: '₹३६५'
    });
    if (!putRes.data.success || putRes.data.rate.rate !== '₹३६५') {
      throw new Error('Rate update failed');
    }
    const getRes = await axios.get(`${BASE_URL}/api/rates`);
    const ambuja = getRes.data.find(r => r.id === 'rate-cement-ambuja');
    if (!ambuja || ambuja.rate !== '₹३६५') {
      throw new Error('Updated rate not reflected');
    }
  });

  console.log(`\n========================================`);
  console.log(`🎉 Automated Test Suite Finished: ${passed} / ${total} Passed!`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
