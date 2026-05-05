// some popup ui

const popupEl = document.createElement('div');
popupEl.innerHTML = `
  <div id="customAlert" style="display:none">
    <div id="customAlertBackdrop"></div>
    <div id="customAlertBox">
      <div id="customAlertTitle">FoodPing</div>
      <div id="customAlertMsg"></div>
      <div id="customAlertDivider"></div>
      <div id="customAlertActions">
        <button id="customAlertBtn">OK</button>
      </div>
    </div>
  </div>
`;
document.body.appendChild(popupEl);

const timePickerEl = document.createElement('div');
timePickerEl.innerHTML = `
  <div id="timePicker" style="display:none">
    <div id="timePickerBackdrop"></div>
    <div id="timePickerSheet">
      <div id="timePickerHeader">
        <button id="timePickerCancel">Cancel</button>
        <span id="timePickerTitle">Alert Time</span>
        <button id="timePickerDone">Done</button>
      </div>
      <div id="timePickerBody">
        <div class="drum-wrapper">
          <div class="drum-fade-top"></div>
          <div class="drum-scroll" id="hourDrum"></div>
          <div class="drum-fade-bottom"></div>
        </div>
        <div class="drum-colon">:</div>
        <div class="drum-wrapper">
          <div class="drum-fade-top"></div>
          <div class="drum-scroll" id="minuteDrum"></div>
          <div class="drum-fade-bottom"></div>
        </div>
        <div class="drum-wrapper">
          <div class="drum-fade-top"></div>
          <div class="drum-scroll" id="ampmDrum"></div>
          <div class="drum-fade-bottom"></div>
        </div>
      </div>
      <div id="timePickerSelector"></div>
    </div>
  </div>
`;
document.body.appendChild(timePickerEl);

// nav

const navOrder = ['home', 'logs', 'settings', 'about'];
let currentPage = 'home';

function navigateTo(targetPage) {
  if (targetPage === currentPage) return;

  const currentIndex = navOrder.indexOf(currentPage);
  const targetIndex = navOrder.indexOf(targetPage);
  const goingRight = targetIndex > currentIndex;

  const current = document.getElementById(currentPage);
  const target = document.getElementById(targetPage);

  target.classList.add(goingRight ? 'slide-from-right' : 'slide-from-left');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.classList.remove('slide-from-right', 'slide-from-left');
      target.classList.add('active');
      current.classList.add(goingRight ? 'slide-out-left' : 'slide-out-right');
      current.classList.remove('active');
      setTimeout(() => current.classList.remove('slide-out-left', 'slide-out-right'), 350);
    });
  });

  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === targetPage);
  });

  currentPage = targetPage;
}

// haptic (real)

let hapticEnabled = localStorage.getItem('haptic') !== 'off';

function haptic(pattern = 32) {
  if (!hapticEnabled || !navigator.vibrate) return;
  navigator.vibrate(pattern);
}

function vibrate(ms) {
  haptic(ms);
}

document.querySelectorAll('#cloudUrlActions button, #wifiActions button, #themeActions button, #fontActions button, #creditsActions button').forEach(btn => {
  btn.addEventListener('click', () => haptic(32));
});

// alert

function closeAlert() {
  const box = document.getElementById('customAlertBox');
  const backdrop = document.getElementById('customAlertBackdrop');
  const wrapper = document.getElementById('customAlert');
  haptic(10);
  box.style.animation = 'alertPopOut 0.2s ease forwards';
  backdrop.style.animation = 'alertFadeOut 0.2s ease forwards';
  setTimeout(() => {
    wrapper.style.display = 'none';
    document.getElementById('customAlertTitle').textContent = 'FoodPing';
    document.getElementById('customAlertActions').innerHTML = '<button id="customAlertBtn">OK</button>';
  }, 200);
}

function openAlert({ title = 'FoodPing', msg, buttons }) {
  const wrapper = document.getElementById('customAlert');
  const box = document.getElementById('customAlertBox');
  const backdrop = document.getElementById('customAlertBackdrop');
  const actions = document.getElementById('customAlertActions');

  document.getElementById('customAlertTitle').textContent = title;
  document.getElementById('customAlertMsg').textContent = msg;
  actions.innerHTML = '';

  buttons.forEach((b, i) => {
    if (i > 0) {
      const div = document.createElement('div');
      div.className = 'alert-btn-divider';
      actions.appendChild(div);
    }
    const btn = document.createElement('button');
    btn.textContent = b.label;
    btn.className = 'alert-action-btn';
    btn.style.color = b.subtle ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-primary)';
    btn.style.fontWeight = b.bold ? '600' : '400';
    btn.onclick = () => { closeAlert(); b.action?.(); };
    actions.appendChild(btn);
  });

  wrapper.style.display = 'flex';
  box.style.animation = 'none';
  backdrop.style.animation = 'none';
  requestAnimationFrame(() => {
    box.style.animation = 'alertPopIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards';
    backdrop.style.animation = 'alertFadeIn 0.25s ease forwards';
  });
}

function showAlert(msg) {
  openAlert({ title: 'FoodPing', msg, buttons: [{ label: 'OK' }] });
}

// reset all

function confirmReset() {
  haptic(32);
  openAlert({
    title: 'Reset All Data',
    msg: 'This will delete all foods, settings and saved data. This cannot be undone.',
    buttons: [
      { label: 'Cancel', subtle: true },
      {
        label: 'Reset',
        bold: true,
        danger: true,
        action: () => {
          haptic([30, 50, 30]);
          localStorage.clear();
          renderTable();
          hapticEnabled = true;
          document.getElementById('hapticToggle').checked = true;
          document.getElementById('notifToggle').checked = true;
          document.getElementById('notifTimeDisplay').textContent = '8:00 AM';
        }
      }
    ]
  });
}

// idk me forgot but dont touch

function buildDrum(el, items, selectedIndex) {
  el.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'drum-item';
    div.textContent = item;
    el.appendChild(div);
  });
  setTimeout(() => { el.scrollTop = selectedIndex * 44; }, 50);
}

function getDrumIndex(el) {
  return Math.round(el.scrollTop / 44);
}

// choose time

function openTimePicker() {
  haptic(32);
  const saved = localStorage.getItem('notifTime') || '8:00 AM';
  const parts = saved.split(/[: ]/);
  const hour = parseInt(parts[0]);
  const minute = parseInt(parts[1]);
  const ampm = parts[2] || 'AM';

  buildDrum(document.getElementById('hourDrum'), Array.from({length: 12}, (_, i) => String(i + 1)), hour - 1);
  buildDrum(document.getElementById('minuteDrum'), Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')), minute);
  buildDrum(document.getElementById('ampmDrum'), ['AM', 'PM'], ampm === 'AM' ? 0 : 1);

  const picker = document.getElementById('timePicker');
  const sheet = document.getElementById('timePickerSheet');
  const backdrop = document.getElementById('timePickerBackdrop');

  picker.style.display = 'flex';
  sheet.style.animation = 'none';
  backdrop.style.animation = 'none';
  requestAnimationFrame(() => {
    sheet.style.animation = 'sheetSlideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards';
    backdrop.style.animation = 'alertFadeIn 0.25s ease forwards';
  });
}

function closeTimePicker(save) {
  haptic(10);
  const sheet = document.getElementById('timePickerSheet');
  const backdrop = document.getElementById('timePickerBackdrop');
  const picker = document.getElementById('timePicker');

  if (save) {
    const h = getDrumIndex(document.getElementById('hourDrum')) + 1;
    const m = getDrumIndex(document.getElementById('minuteDrum'));
    const a = getDrumIndex(document.getElementById('ampmDrum')) === 0 ? 'AM' : 'PM';
    const formatted = `${h}:${String(m).padStart(2, '0')} ${a}`;
    localStorage.setItem('notifTime', formatted);
    document.getElementById('notifTimeDisplay').textContent = formatted;
  }

  sheet.style.animation = 'sheetSlideDown 0.3s ease forwards';
  backdrop.style.animation = 'alertFadeOut 0.3s ease forwards';
  setTimeout(() => { picker.style.display = 'none'; }, 300);
}

// choose date

function openDatePicker() {
  document.getElementById('datePicker').style.display = 'flex';

  const now = new Date();
  const days = Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0'));
  const months = [
    {label:'Jan',value:'01'},{label:'Feb',value:'02'},{label:'Mar',value:'03'},
    {label:'Apr',value:'04'},{label:'May',value:'05'},{label:'Jun',value:'06'},
    {label:'Jul',value:'07'},{label:'Aug',value:'08'},{label:'Sep',value:'09'},
    {label:'Oct',value:'10'},{label:'Nov',value:'11'},{label:'Dec',value:'12'}
  ];
  const years = Array.from({length: 6}, (_, i) => String(now.getFullYear() + i).slice(-2));

  fillDrum('dayScroll', days, now.getDate() - 1);
  fillDrum('monthScroll', months, now.getMonth());
  fillDrum('yearScroll', years, 0);
}

function fillDrum(id, items, selectedIndex) {
  const scroll = document.getElementById(id);
  scroll.innerHTML = '';

  items.forEach(val => {
    const div = document.createElement('div');
    div.className = 'drum-item';
    div.textContent = val.label ?? val;
    div.dataset.value = val.value ?? val;
    scroll.appendChild(div);
  });

  setTimeout(() => { scroll.scrollTop = selectedIndex * 44; }, 0);
}

function getSelectedDrum(id) {
  const scroll = document.getElementById(id);
  const index = Math.round(scroll.scrollTop / 44);
  const items = scroll.querySelectorAll('.drum-item');
  return items[Math.min(index, items.length - 1)]?.dataset.value || '';
}

function confirmDate() {
  const day = getSelectedDrum('dayScroll');
  const month = getSelectedDrum('monthScroll');
  const year = getSelectedDrum('yearScroll');
  document.getElementById('expiryDate').value = `${day}/${month}/${year}`;
  closeDatePicker();
}

function closeDatePicker() {
  document.getElementById('datePicker').style.display = 'none';
}

// food data

function getFoods() {
  return JSON.parse(localStorage.getItem('foods')) || [];
}

function saveFoods(foods) {
  localStorage.setItem('foods', JSON.stringify(foods));
}

function parseDate(dateStr) {
  const parts = dateStr.split('/');
  let year = parseInt(parts[2]);
  if (year < 100) year += 2000;
  return new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function addFood() {
  const name = document.getElementById('foodName').value.trim();
  const date = document.getElementById('expiryDate').value.trim();

  if (!name || !date) {
    showAlert('Please enter the name and expiry date!');
    return;
  }

  if (date.split('/').length !== 3) {
    showAlert('Date format must be DD/MM/YY');
    return;
  }

  haptic([30, 40, 30]);

  const foods = getFoods();
  foods.push({ name, date });
  saveFoods(foods);
  renderTable();

  cloudSync?.();

  document.getElementById('foodName').value = '';
  document.getElementById('expiryDate').value = '';
}

function renderTable() {
  const table = document.getElementById('foodTable');
  if (!table) return;

  while (table.rows.length > 1) table.deleteRow(1);

  const foods = getFoods();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const card = table.closest('.card');
  let emptyMsg = document.getElementById('emptyMsg');

  if (foods.length === 0) {
    if (card) card.style.display = 'none';
    if (!emptyMsg) {
      emptyMsg = document.createElement('div');
      emptyMsg.id = 'emptyMsg';
      emptyMsg.textContent = 'Nothing here';
      emptyMsg.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.4;
        font-size: 16px;
      `;
      document.getElementById('logs').appendChild(emptyMsg);
    }
    emptyMsg.style.display = 'block';
    return;
  }

  if (card) card.style.display = '';
  if (emptyMsg) emptyMsg.style.display = 'none';


  foods.forEach((food, index) => {
    const diffDays = Math.ceil((parseDate(food.date) - now) / (1000 * 60 * 60 * 24));

    const dataRow = table.insertRow();
    dataRow.className = 'data-row';
    dataRow.insertCell(0).textContent = food.name;
    dataRow.insertCell(1).textContent = food.date;

    const statusCell = dataRow.insertCell(2);
statusCell.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; justify-content: flex-end;';

if (diffDays > 3) {
  statusCell.innerHTML = `
    <span style="color: #7bc99a; text-align: right; max-width: 80px;">${diffDays} days remaining</span>
    <i class="fa-solid fa-circle-check" style="color: #7bc99a; flex-shrink: 0; align-self: center;"></i>`;
} else if (diffDays > 0) {
  statusCell.innerHTML = `
    <span style="color: #f0b97a; text-align: right; max-width: 80px;">${diffDays} days remaining</span>
    <i class="fa-solid fa-circle-exclamation" style="color: #f0b97a; flex-shrink: 0; align-self: center;"></i>`;
} else if (diffDays === 0) {
  statusCell.innerHTML = `
    <span style="color: #f28b8b; text-align: right; max-width: 80px;">Expired Today</span>
    <i class="fa-solid fa-circle-xmark" style="color: #f28b8b; flex-shrink: 0; align-self: center;"></i>`;
} else {
  statusCell.innerHTML = `
    <span style="color: #f28b8b; text-align: right; max-width: 80px;">Expired</span>
    <i class="fa-solid fa-circle-xmark" style="color: #f28b8b; flex-shrink: 0; align-self: center;"></i>`;
}

    const btnRow = table.insertRow();
    btnRow.className = 'btn-row';
    const btnCell = btnRow.insertCell(0);
    btnCell.colSpan = 3;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    Object.assign(delBtn.style, {
      width: '100%',
      backgroundColor: 'var(--md-sys-color-primary)',
      color: 'var(--md-sys-color-on-primary)',
      border: 'none',
      borderRadius: '16px',
      padding: '8px',
      cursor: 'pointer',
      marginBottom: '4px'
    });
    delBtn.onclick = () => {
      haptic([20, 30, 20]);
      const foods = getFoods();
      localStorage.removeItem(`notified_${foods[index].name}_${foods[index].date}`);
      foods.splice(index, 1);
      saveFoods(foods);
      renderTable();
    };
    btnCell.appendChild(delBtn);
  });
}

function deleteAllExpired() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const foods = getFoods();
  foods.filter(f => parseDate(f.date) < now).forEach(f => {
    localStorage.removeItem(`notified_${f.name}_${f.date}`);
  });
  haptic([20, 30, 20]);
  saveFoods(foods.filter(f => parseDate(f.date) >= now));
  renderTable();
}

// if else ahh ai

const defaultFoods = [
  "Apple","Banana","Carrot","Chicken Breast","Rice",
  "Milk","Eggs","Broccoli","Salmon","Cheese",
  "Tomato","Potato","Onion","Spinach","Bread",
  "Pasta","Yogurt","Strawberries","Beef","Cucumber",

  "Rice","Basmati Rice","Glutinous Rice",
  "Chicken Thighs","Chicken Wings","Whole Chicken",
  "Mackerel","Sardines","Anchovies","Tuna Canned",
  "Shrimp","Squid",

  "Coconut Milk","Coconut","Palm Sugar","Brown Sugar","White Sugar",
  "Salt","Cooking Oil","Palm Oil","Butter","Margarine",

  "Garlic","Ginger","Turmeric","Lemongrass","Galangal",
  "Chili","Lime Leaves","Pandan Leaves",

  "Soy Sauce","Sweet Soy Sauce","Oyster Sauce","Fish Sauce","Chili Sauce","Ketchup",
  "Curry Powder","Sambal Paste",

  "Kangkung","Kailan","Long Beans","Okra","Eggplant","Cabbage",
  "Lettuce","Bean Sprouts",

  "Mango","Papaya","Watermelon","Pineapple","Orange","Durian",

  "Tofu","Tempeh","Noodles","Instant Noodles","Maggi",
  "Flour","All-purpose Flour","Rice Flour",

  "Tea","Coffee","Biscuit","Crackers","Ayam Gepuk Set D"
];

function isLearningEnabled() {
  return localStorage.getItem('neuralLearning') === 'true';
}

function getStoredFoods() {
  return JSON.parse(localStorage.getItem('foodsData')) || {};
}

function getLearnedSortedList() {
  return Object.entries(getStoredFoods())
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0]);
}

function saveFood() {
  if (!isLearningEnabled()) return;

  const input = document.getElementById('foodName').value.trim();
  if (!input || input.includes('/learned')) return;

  const data = getStoredFoods();
  data[input] = (data[input] || 0) + 1;
  localStorage.setItem('foodsData', JSON.stringify(data));
}

let learnedIndex = 0;

function setRandomFood() {
  const input = document.getElementById('foodName');

  if (!isLearningEnabled()) {
    input.value = defaultFoods[Math.floor(Math.random() * defaultFoods.length)];
    return;
  }

  const learned = getLearnedSortedList();

  if (learned.length > 0) {
    if (learnedIndex >= learned.length) {
      input.value = defaultFoods[Math.floor(Math.random() * defaultFoods.length)];
      return;
    }
    input.value = learned[learnedIndex];
    learnedIndex++;
    return;
  }

  input.value = defaultFoods[Math.floor(Math.random() * defaultFoods.length)];
}

function openResetLearningModal() {
  vibrate(32);
  document.getElementById('resetLearningModal').style.display = 'flex';
}

function closeResetLearningModal() {
  vibrate(32);
  document.getElementById('resetLearningModal').style.display = 'none';
}

function confirmResetLearning() {
  vibrate(48);
  localStorage.removeItem('foodsData');
  learnedIndex = 0;
  closeResetLearningModal();
}

// setup

  function openWifiModal() {
    document.getElementById("wifiModal").style.display = "flex";
    const saved = JSON.parse(localStorage.getItem("pendingWifi") || "{}");
    if (saved.ssid) document.getElementById("wifiSsid").value = saved.ssid;
    if (saved.password) document.getElementById("wifiPass").value = saved.password;
  }

  function closeWifiModal() {
    document.getElementById("wifiModal").style.display = "none";
  }

  function toggleWifiPass() {
    const input = document.getElementById("wifiPass");
    const icon = document.querySelector(".wifi-eye");
    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "visibility_off";
    } else {
      input.type = "password";
      icon.textContent = "visibility";
    }
  }

  function saveWifi() {
    const ssid = document.getElementById("wifiSsid").value.trim();
    const pass = document.getElementById("wifiPass").value;

    if (!ssid) return;

    localStorage.setItem("pendingWifi", JSON.stringify({ ssid, password: pass }));
    document.getElementById("wifiStatus").textContent = "Connect to FoodPing Setup";
    closeWifiModal();
    startWifiSync();
  }

  async function trySendWifi() {
  const pending = JSON.parse(localStorage.getItem("pendingWifi") || "{}");
  if (!pending.ssid) return;

  const cloudId = localStorage.getItem("cloud_id") || "";

  if (!cloudId) {
    try {
      const test = await fetch("http://192.168.4.1/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ssid: pending.ssid, password: pending.password, script_id: "" }) });
      document.getElementById("wifiStatus").textContent = "Cloud ID not found";
    } catch (e) {
      document.getElementById("wifiStatus").textContent = "Connect to FoodPing Setup";
    }
    return;
  }

  try {
    const res = await fetch("http://192.168.4.1/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssid: pending.ssid,
        password: pending.password,
        script_id: cloudId
      })
    });

    if (res.ok) {
      localStorage.removeItem("pendingWifi");
      document.getElementById("wifiStatus").textContent = "Configured";
      stopWifiSync();
    }
  } catch (e) {}
}

  let wifiSyncInterval = null;

  function startWifiSync() {
    if (wifiSyncInterval) return;
    wifiSyncInterval = setInterval(trySendWifi, 3000);
  }

  function stopWifiSync() {
    clearInterval(wifiSyncInterval);
    wifiSyncInterval = null;
  }

  async function resetWifi() {
    openAlert({
      title: 'Reset WiFi',
      msg: 'This will clear WiFi credentials. ESP will restart as a hotspot. Continue?',
      buttons: [
        { label: 'Cancel', subtle: true },
        {
          label: 'Reset',
          bold: true,
          danger: true,
          action: async () => {
            closeWifiModal();
            localStorage.removeItem("pendingWifi");
            document.getElementById("wifiStatus").textContent = "Not Configured";
            stopWifiSync();
            try {
              await fetch("http://esp32.local/reset-wifi", { method: "POST" });
            } catch (e) {}
            setTimeout(() => {
              openAlert({
                title: 'WiFi Reset',
                msg: "Connect to 'FoodPing-Setup' hotspot, then reopen this app to reconfigure.",
                buttons: [{ label: 'OK' }]
              });
            }, 300);
          }
        }
      ]
    });
  }

  if (localStorage.getItem("pendingWifi")) {
    document.getElementById("wifiStatus").textContent = "Connect to FoodPing Setup";
    startWifiSync();
  }

// cloud

function openCloudIdModal() {
  vibrate(32);
  document.getElementById('cloudIdModal').style.display = 'flex';
  document.getElementById('cloudIdInput').value = localStorage.getItem('cloud_id') || '';
  document.getElementById('cloudUsrInput').value = localStorage.getItem('cloud_user') || '';
}

function closeCloudIdModal() {
  vibrate(10);
  document.getElementById('cloudIdModal').style.display = 'none';
}

function saveCloudId() {
  vibrate(48);
  const usr = document.getElementById('cloudUsrInput').value.trim();
  const val = document.getElementById('cloudIdInput').value.trim();
  localStorage.setItem('cloud_user', usr);
  localStorage.setItem('cloud_id', val);
  document.getElementById('cloudIdDisplay').textContent = val ? 'Set' : 'Not set';
  closeCloudIdModal();
}

// hmm

function initDevsEasterEgg() {
  const el = document.getElementById('devs');
  if (!el) return;
  let toggled = false;

  Object.assign(el.style, {
    fontSize: '15px',
    color: 'var(--md-sys-color-on-surface)',
    opacity: '0.5',
    transition: 'opacity 0.3s'
  });

  el.addEventListener('click', () => {
    el.style.opacity = 0;
    setTimeout(() => {
      toggled = !toggled;
      el.textContent = toggled ? 'Z.' : 'Izatifoodie';
      el.style.opacity = 0.5;
    }, 300);
  });
}

// debug

(function () {
  function printLearnedFoods() {
    const data = JSON.parse(localStorage.getItem('foodsData')) || {};
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    console.clear();
    console.log('What i learned from this user?');
    sorted.forEach(([food, count], i) => {
      console.log(`${i + 1}. ${food} → ${count}`);
    });
  }

  function checkCommand(input) {
    if (input.value.includes('/learned')) {
      printLearnedFoods();
      input.value = input.value.replace('/learned', '').trim();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const foodInput = document.getElementById('foodName');
    if (!foodInput) return;
    foodInput.addEventListener('input', () => checkCommand(foodInput));
  });
})();

// sw

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  }).then(() => {
    navigator.serviceWorker.register('/FoodPingg/sw.js');
  });
}

// greetings

function greetUser() {
  const username = localStorage.getItem('cloud_user');

  const h1 = document.querySelector('#home h1');
  if (!h1) return;

  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else if (hour < 21) greeting = 'Good Evening';
  else greeting = 'Good Night';

  const greetText = username 
    ? `${greeting},<br>${username}!` 
    : `${greeting}!`;

  setTimeout(() => {
    h1.style.transition = 'opacity 0.5s ease';
    h1.style.opacity = '0';

    setTimeout(() => {
      h1.innerHTML = greetText;
      h1.style.opacity = '1';

      setTimeout(() => {
        h1.style.opacity = '0';

        setTimeout(() => {
          h1.innerHTML = 'FoodPing';
          h1.style.opacity = '1';
        }, 500);

      }, 2000);
    }, 500);

  }, 2000);
}

// themes

const themes = {
  strawberry: {
    name: 'Strawberry Cupcake',
    '--md-sys-color-primary':              'rgb(240, 182, 193)',
    '--md-sys-color-on-primary':           'rgb(255, 255, 255)',
    '--md-sys-color-primary-container':    'rgb(255, 210, 220)',
    '--md-sys-color-on-primary-container': 'rgb(90, 35, 55)',
    '--md-sys-color-background':           'rgb(255, 245, 248)',
    '--md-sys-color-on-background':        'rgb(120, 60, 80)',
    '--md-sys-color-surface':              'rgb(255, 245, 248)',
    '--md-sys-color-on-surface':           'rgb(120, 60, 80)',
    '--md-sys-color-outline':              'rgb(255, 182, 193)',
    '--md-sys-color-surface-container':    'rgb(255, 230, 240)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(255, 105, 180, 0.2)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(255, 105, 180, 0.15)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.12)',
    '--md-sys-color-input-border':         'rgba(255, 210, 220, 0.8)',
    '--md-sys-color-input-background':     'rgb(255, 240, 246)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(240, 182, 193, 0.15)',
  },

  tomato: {
    name: 'Tomato Jelly',
    '--md-sys-color-primary':              'rgb(220, 70, 60)',
    '--md-sys-color-on-primary':           'rgb(255, 255, 255)',
    '--md-sys-color-primary-container':    'rgb(255, 210, 205)',
    '--md-sys-color-on-primary-container': 'rgb(90, 20, 15)',
    '--md-sys-color-background':           'rgb(255, 248, 247)',
    '--md-sys-color-on-background':        'rgb(110, 35, 30)',
    '--md-sys-color-surface':              'rgb(255, 248, 247)',
    '--md-sys-color-on-surface':           'rgb(110, 35, 30)',
    '--md-sys-color-outline':              'rgb(240, 160, 155)',
    '--md-sys-color-surface-container':    'rgb(255, 228, 225)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(220, 70, 60, 0.25)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(220, 70, 60, 0.2)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.12)',
    '--md-sys-color-input-border':         'rgba(240, 160, 155, 0.8)',
    '--md-sys-color-input-background':     'rgb(255, 244, 243)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(220, 70, 60, 0.12)',
  },

  honey: {
    name: 'Honey Amber',
    '--md-sys-color-primary':              'rgb(240, 180, 60)',
    '--md-sys-color-on-primary':           'rgb(60, 35, 0)',
    '--md-sys-color-primary-container':    'rgb(255, 225, 160)',
    '--md-sys-color-on-primary-container': 'rgb(70, 45, 0)',
    '--md-sys-color-background':           'rgb(255, 252, 242)',
    '--md-sys-color-on-background':        'rgb(80, 55, 10)',
    '--md-sys-color-surface':              'rgb(255, 252, 242)',
    '--md-sys-color-on-surface':           'rgb(80, 55, 10)',
    '--md-sys-color-outline':              'rgb(235, 200, 110)',
    '--md-sys-color-surface-container':    'rgb(255, 242, 200)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(200, 140, 20, 0.25)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(200, 140, 20, 0.2)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.10)',
    '--md-sys-color-input-border':         'rgba(235, 200, 110, 0.8)',
    '--md-sys-color-input-background':     'rgb(255, 250, 235)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(240, 180, 60, 0.15)',
  },

  mint: {
    name: 'Mint Breeze',
    '--md-sys-color-primary':              'rgb(170, 230, 210)',
    '--md-sys-color-on-primary':           'rgb(0, 60, 50)',
    '--md-sys-color-primary-container':    'rgb(210, 245, 235)',
    '--md-sys-color-on-primary-container': 'rgb(0, 80, 70)',
    '--md-sys-color-background':           'rgb(245, 255, 252)',
    '--md-sys-color-on-background':        'rgb(40, 70, 65)',
    '--md-sys-color-surface':              'rgb(245, 255, 252)',
    '--md-sys-color-on-surface':           'rgb(40, 70, 65)',
    '--md-sys-color-outline':              'rgb(180, 220, 210)',
    '--md-sys-color-surface-container':    'rgb(230, 250, 245)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(0, 150, 120, 0.2)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(0, 150, 120, 0.15)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.10)',
    '--md-sys-color-input-border':         'rgba(180, 220, 210, 0.8)',
    '--md-sys-color-input-background':     'rgb(240, 253, 250)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(170, 230, 210, 0.15)',
  },

  android: {
    name: 'Android Green',
    '--md-sys-color-primary':              'rgb(91, 122, 74)', 
    '--md-sys-color-on-primary':           'rgb(255, 255, 255)', 
    '--md-sys-color-primary-container':    'rgb(221, 241, 208)',
    '--md-sys-color-on-primary-container': 'rgb(40, 60, 30)',
    '--md-sys-color-background':           'rgb(248, 251, 245)',
    '--md-sys-color-on-background':        'rgb(60, 75, 50)',
    '--md-sys-color-surface':              'rgb(248, 251, 245)',
    '--md-sys-color-on-surface':           'rgb(60, 75, 50)',
    '--md-sys-color-outline':              'rgb(195, 210, 185)',
    '--md-sys-color-surface-container':    'rgb(238, 245, 230)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.05)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(91, 122, 74, 0.15)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(91, 122, 74, 0.1)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.06)',
    '--md-sys-color-input-border':         'rgba(195, 210, 185, 0.6)',
    '--md-sys-color-input-background':     'rgb(242, 248, 236)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(91, 122, 74, 0.08)',
},


  blueberry: {
    name: 'Blueberry Muffin',
    '--md-sys-color-primary':              'rgb(100, 120, 200)',
    '--md-sys-color-on-primary':           'rgb(255, 255, 255)',
    '--md-sys-color-primary-container':    'rgb(210, 218, 245)',
    '--md-sys-color-on-primary-container': 'rgb(20, 35, 100)',
    '--md-sys-color-background':           'rgb(247, 248, 255)',
    '--md-sys-color-on-background':        'rgb(35, 45, 110)',
    '--md-sys-color-surface':              'rgb(247, 248, 255)',
    '--md-sys-color-on-surface':           'rgb(35, 45, 110)',
    '--md-sys-color-outline':              'rgb(170, 185, 225)',
    '--md-sys-color-surface-container':    'rgb(228, 232, 250)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(80, 100, 190, 0.25)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(80, 100, 190, 0.2)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.12)',
    '--md-sys-color-input-border':         'rgba(170, 185, 225, 0.8)',
    '--md-sys-color-input-background':     'rgb(242, 244, 255)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(100, 120, 200, 0.15)',
  },

  amethyst: {
    name: 'Amethyst Shard',
    '--md-sys-color-primary':              'rgb(155, 110, 200)',
    '--md-sys-color-on-primary':           'rgb(255, 255, 255)',
    '--md-sys-color-primary-container':    'rgb(225, 210, 248)',
    '--md-sys-color-on-primary-container': 'rgb(55, 20, 100)',
    '--md-sys-color-background':           'rgb(251, 248, 255)',
    '--md-sys-color-on-background':        'rgb(70, 35, 115)',
    '--md-sys-color-surface':              'rgb(251, 248, 255)',
    '--md-sys-color-on-surface':           'rgb(70, 35, 115)',
    '--md-sys-color-outline':              'rgb(200, 175, 230)',
    '--md-sys-color-surface-container':    'rgb(238, 230, 252)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(130, 80, 190, 0.25)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(130, 80, 190, 0.2)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.12)',
    '--md-sys-color-input-border':         'rgba(200, 175, 230, 0.8)',
    '--md-sys-color-input-background':     'rgb(248, 244, 255)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(155, 110, 200, 0.15)',
  },

  coco: {
    name: 'Coco Cream',
    '--md-sys-color-primary':              'rgb(210, 180, 140)',
    '--md-sys-color-on-primary':           'rgb(60, 40, 20)',
    '--md-sys-color-primary-container':    'rgb(240, 220, 190)',
    '--md-sys-color-on-primary-container': 'rgb(80, 55, 30)',
    '--md-sys-color-background':           'rgb(255, 250, 240)',
    '--md-sys-color-on-background':        'rgb(80, 60, 40)',
    '--md-sys-color-surface':              'rgb(255, 250, 240)',
    '--md-sys-color-on-surface':           'rgb(80, 60, 40)',
    '--md-sys-color-outline':              'rgb(220, 200, 170)',
    '--md-sys-color-surface-container':    'rgb(245, 235, 220)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(160, 120, 60, 0.2)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(160, 120, 60, 0.15)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.10)',
    '--md-sys-color-input-border':         'rgba(220, 200, 170, 0.8)',
    '--md-sys-color-input-background':     'rgb(255, 252, 245)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(210, 180, 140, 0.15)',
  },

  white: {
    name: 'Steamed Bun',
    '--md-sys-color-primary':              'rgb(180, 180, 180)',
    '--md-sys-color-on-primary':           'rgb(255, 255, 255)',
    '--md-sys-color-primary-container':    'rgb(220, 220, 220)',
    '--md-sys-color-on-primary-container': 'rgb(40, 40, 40)',
    '--md-sys-color-background':           'rgb(250, 250, 250)',
    '--md-sys-color-on-background':        'rgb(50, 50, 50)',
    '--md-sys-color-surface':              'rgb(250, 250, 250)',
    '--md-sys-color-on-surface':           'rgb(50, 50, 50)',
    '--md-sys-color-outline':              'rgb(210, 210, 210)',
    '--md-sys-color-surface-container':    'rgb(238, 238, 238)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(100, 100, 100, 0.2)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(100, 100, 100, 0.15)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.10)',
    '--md-sys-color-input-border':         'rgba(210, 210, 210, 0.8)',
    '--md-sys-color-input-background':     'rgb(248, 248, 248)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(180, 180, 180, 0.15)',
  },

  void: {
    name: 'The Void',
    '--md-sys-color-primary':              'rgb(170, 170, 170)',
    '--md-sys-color-on-primary':           'rgb(10, 10, 10)',
    '--md-sys-color-primary-container':    'rgb(50, 50, 50)',
    '--md-sys-color-on-primary-container': 'rgb(210, 210, 210)',
    '--md-sys-color-background':           'rgb(18, 18, 18)',
    '--md-sys-color-on-background':        'rgb(195, 195, 195)',
    '--md-sys-color-surface':              'rgb(18, 18, 18)',
    '--md-sys-color-on-surface':           'rgb(195, 195, 195)',
    '--md-sys-color-outline':              'rgb(80, 80, 80)',
    '--md-sys-color-surface-container':    'rgb(28, 28, 28)',
    '--md-sys-color-scrim':                'rgba(0, 0, 0, 0.08)',
    '--md-sys-shadow-settings-icon':       '0 2px 6px rgba(0, 0, 0, 0.5)',
    '--md-sys-shadow-switch-thumb':        '0 2px 4px rgba(0, 0, 0, 0.4)',
    '--md-sys-shadow-modal':               '0 8px 32px rgba(0, 0, 0, 0.5)',
    '--md-sys-color-input-border':         'rgba(80, 80, 80, 0.8)',
    '--md-sys-color-input-background':     'rgb(22, 22, 22)',
    '--md-sys-shadow-home-card':           '0 0 0 2px rgba(170, 170, 170, 0.07)',
  },
};

function applyTheme(key) {
  haptic(20);
  const theme = themes[key];
  if (!theme) return;

  const currentTheme = localStorage.getItem('theme') || 'strawberry';
  const voidInvolved = key === 'void' || currentTheme === 'void';
  const duration = voidInvolved ? 0 : 350;

  document.body.style.setProperty('--theme-transition-duration', `${duration}ms`);
  document.body.classList.add('theme-transitioning');
  document.body.style.willChange = 'background-color, color';

  Object.entries(theme).forEach(([prop, val]) => {
    if (prop.startsWith('--')) document.body.style.setProperty(prop, val);
  });

  const surfaceContainer = theme['--md-sys-color-surface-container'];
  document.querySelectorAll('meta[name="theme-color"]').forEach(el => {
    el.setAttribute('content', surfaceContainer);
  });
  document.querySelector('meta[name="msapplication-navbutton-color"]')?.setAttribute('content', surfaceContainer);
  document.querySelector('meta[name="msapplication-TileColor"]')?.setAttribute('content', surfaceContainer);

  setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
    document.body.style.willChange = 'auto';
  }, duration + 30);

  localStorage.setItem('theme', key);
  document.getElementById('themeDisplay').textContent = theme.name;
  document.querySelectorAll('.theme-check').forEach(el => el.classList.remove('visible'));
  document.getElementById(`check-${key}`)?.classList.add('visible');
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'strawberry';
  applyTheme(saved);
}

function openThemeModal() {
  haptic(32);
  const modal = document.getElementById('themeModal');
  const box   = document.getElementById('themeBox');
  const backdrop = document.getElementById('themeBackdrop');

  modal.style.display = 'flex';
  box.style.animation      = 'alertPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
  backdrop.style.animation = 'alertFadeIn 0.32s ease forwards';

  const saved = localStorage.getItem('theme') || 'strawberry';
  document.querySelectorAll('.theme-check').forEach(el => el.classList.remove('visible'));
  document.getElementById(`check-${saved}`)?.classList.add('visible');
}

function closeThemeModal() {
  haptic(10);
  const box      = document.getElementById('themeBox');
  const backdrop = document.getElementById('themeBackdrop');

  box.style.animation      = 'alertPopOut 0.2s ease forwards';
  backdrop.style.animation = 'alertFadeOut 0.2s ease forwards';

  setTimeout(() => {
    document.getElementById('themeModal').style.display = 'none';
    box.style.animation      = '';
    backdrop.style.animation = '';
  }, 200);
}

// fonts

const FONT_SOURCES = {
  default: null,
  patrickhand: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap',
  gaegu: 'https://fonts.googleapis.com/css2?family=Gaegu&display=swap',
  monocraft: null,
  jetbrains: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap',
};

const FONT_FAMILY = {
  default: '"Google Sans Flex", system-ui, sans-serif',
  patrickhand: '"Patrick Hand", cursive',
  gaegu: '"Gaegu", cursive',
  monocraft: '"Monocraft", monospace',
  jetbrains: '"JetBrains Mono", monospace',
};

const loadedFonts = new Set(['default']);
let allFontsLoaded = false;

function loadFont(fontKey) {
  if (loadedFonts.has(fontKey)) return Promise.resolve();
  loadedFonts.add(fontKey);

  return new Promise((resolve) => {
    if (fontKey === 'monocraft') {
      const style = document.createElement('style');
      style.textContent = `@font-face {
        font-family: 'Monocraft';
        src: url('https://cdn.jsdelivr.net/gh/IdreesInc/Monocraft@main/dist/Monocraft-ttf/Monocraft.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }`;
      document.head.appendChild(style);
      setTimeout(resolve, 100);
    } else if (FONT_SOURCES[fontKey]) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_SOURCES[fontKey];
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    } else {
      resolve();
    }
  });
}

function loadAllFonts() {
  if (allFontsLoaded) return Promise.resolve();
  const keys = Object.keys(FONT_SOURCES).filter(k => k !== 'default');
  return Promise.all(keys.map(loadFont)).then(() => {
    allFontsLoaded = true;
  });
}

function setFontStyle(family) {
  const styleId = 'font-override-style';
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    * { font-family: ${family} !important; }
    .material-symbols-outlined { font-family: 'Material Symbols Outlined' !important; }
    .material-icons { font-family: 'Material Icons' !important; }
    .material-icons-round { font-family: 'Material Icons Round' !important; }
    .fa, .fa-solid, .fa-regular, .fa-brands { font-family: 'Font Awesome 7 Free', 'Font Awesome 7 Brands' !important; }
    #font-default .font-preview, #font-default .font-name { font-family: "Google Sans Flex", system-ui, sans-serif !important; }
    #font-patrickhand .font-preview, #font-patrickhand .font-name { font-family: "Patrick Hand", cursive !important; }
    #font-gaegu .font-preview, #font-gaegu .font-name { font-family: "Gaegu", cursive !important; }
    #font-monocraft .font-preview, #font-monocraft .font-name { font-family: "Monocraft", monospace !important; }
    #font-jetbrains .font-preview, #font-jetbrains .font-name { font-family: "JetBrains Mono", monospace !important; }
  `;
}

function applyFont(fontKey) {
  const family = FONT_FAMILY[fontKey];

  loadFont(fontKey).then(() => {
    setFontStyle(family);
  });

  localStorage.setItem('selectedFont', fontKey);

  document.querySelectorAll('.font-check').forEach(el => el.classList.remove('visible'));
  const check = document.getElementById(`check-font-${fontKey}`);
  if (check) check.classList.add('visible');

  const display = document.getElementById('fontDisplay');
  if (display) display.textContent = document.querySelector(`#font-${fontKey} .font-name`)?.textContent || 'Default';
}

async function openFontModal() {
  const modal = document.getElementById('fontModal');
  const list = document.getElementById('fontList');

  modal.style.display = 'flex';

  if (!allFontsLoaded) {
    list.style.opacity = '0.4';
    list.style.pointerEvents = 'none';
    list.style.transition = 'opacity 0.3s ease';

    const spinner = document.createElement('div');
    spinner.id = 'fontLoadingSpinner';
    spinner.style.cssText = `
      position: absolute;
      bottom: 5rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: var(--md-sys-color-on-surface);
      opacity: 0.5;
      font-family: "Google Sans Flex", sans-serif !important;
      white-space: nowrap;
    `;
    spinner.textContent = 'Loading fonts...';
    document.getElementById('fontBox').appendChild(spinner);

    await loadAllFonts();

    list.style.opacity = '1';
    list.style.pointerEvents = '';
    spinner.remove();
  }
}

function closeFontModal() {
  document.getElementById('fontModal').style.display = 'none';
}

function initFont() {
  const saved = localStorage.getItem('selectedFont') || 'default';

  loadFont(saved).then(() => {
    setFontStyle(FONT_FAMILY[saved]);
  });

  document.querySelectorAll('.font-check').forEach(el => el.classList.remove('visible'));
  const check = document.getElementById(`check-font-${saved}`);
  if (check) check.classList.add('visible');

  const display = document.getElementById('fontDisplay');
  if (display) display.textContent = document.querySelector(`#font-${saved} .font-name`)?.textContent || 'Default';
}

initFont();

const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');

let fontSizeTimer = null;

function applyFontSize(size) {
  document.documentElement.style.fontSize = size + 'px';
}

const savedSize = localStorage.getItem('fontSize') || '16';
fontSizeSlider.value = savedSize;
fontSizeValue.textContent = savedSize;
applyFontSize(savedSize);

fontSizeSlider.addEventListener('input', () => {
  const size = fontSizeSlider.value;
  fontSizeValue.textContent = size;

  clearTimeout(fontSizeTimer);
  fontSizeTimer = setTimeout(() => {
    applyFontSize(size);
    localStorage.setItem('fontSize', size);
    haptic(32);
  }, 1000);
});

// backups

function backupData(){
  const o={};
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    o[k]=localStorage.getItem(k);
  }
  const blob=new Blob([JSON.stringify({v:1,data:o})],{type:"application/octet-stream"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="foodping.foodping-backup";
  a.click();
  URL.revokeObjectURL(a.href);
}

function restoreData(f){
  const r=new FileReader();
  r.onload=()=>{
    const parsed=JSON.parse(r.result);
    const data=parsed.data||parsed;
    localStorage.clear();
    for(const k in data){
      if(data[k]!==null&&data[k]!==undefined) localStorage.setItem(k,data[k]);
    }
    location.reload();
  };
  r.readAsText(f);
}

backupBtn.onclick=backupData;

restoreBtn.onclick=()=>{
  const i=document.createElement("input");
  i.type="file";
  i.accept=".foodping-backup";
  i.onchange=e=>e.target.files[0]&&restoreData(e.target.files[0]);
  i.click();
};

// credits

function openCreditsModal() {
  document.getElementById('creditsModal').style.display = 'flex';
}

function closeCreditsModal() {
  document.getElementById('creditsModal').style.display = 'none';
}

// init

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  initDevsEasterEgg();

  document.getElementById('timePickerCancel').onclick = () => closeTimePicker(false);
  document.getElementById('timePickerDone').onclick = () => closeTimePicker(true);
  document.getElementById('timePickerBackdrop').onclick = () => closeTimePicker(false);

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      haptic(32);
      navigateTo(btn.dataset.page);
    });
  });

  document.querySelectorAll('.md-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      haptic(64);
    });
  });

  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => haptic(10));
  });

  document.querySelectorAll('.settings-row').forEach(row => {
    row.addEventListener('click', () => haptic(20));
  });

  const hapticToggle = document.getElementById('hapticToggle');
  hapticToggle.checked = hapticEnabled;
  hapticToggle.addEventListener('change', () => {
    hapticEnabled = hapticToggle.checked;
    localStorage.setItem('haptic', hapticEnabled ? 'on' : 'off');
    if (hapticEnabled) haptic(32);
  });

  const notifToggle = document.getElementById('notifToggle');
  notifToggle.checked = localStorage.getItem('notifEnabled') !== 'false';
  notifToggle.addEventListener('change', () => {
    haptic(20);
    localStorage.setItem('notifEnabled', notifToggle.checked ? 'true' : 'false');
    if (notifToggle.checked && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  });

  const neuralToggle = document.getElementById('neuralLearning');
  neuralToggle.checked = localStorage.getItem('neuralLearning') === 'true';
  neuralToggle.addEventListener('change', () => {
    localStorage.setItem('neuralLearning', neuralToggle.checked);
  });

  document.getElementById('notifTimeDisplay').textContent = localStorage.getItem('notifTime') || '8:00 AM';
  const cloudId = localStorage.getItem('cloud_id') || '';
document.getElementById('cloudIdDisplay').textContent = cloudId ? 'Set' : 'Not set';
});

greetUser();
initTheme()