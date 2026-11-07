import { haptic, vibrate } from './lib/haptic.js';
import { openModal, closeModal, openAlert, showAlert } from './lib/modal.js';
import { getFoods, saveFoods, parseDate, isValidDate } from './lib/storage.js';

export function addFood() {
  const name = document.getElementById('foodName').value.trim();
  const date = document.getElementById('expiryDate').value.trim();

  if (!name || !date) { showAlert('Please enter the name and expiry date!'); return; }
  if (name.length > 100) { showAlert('Food name is too long.'); return; }
  if (!isValidDate(date)) { showAlert('Date format must be DD/MM/YY'); return; }

  haptic([30, 40, 30]);

  const foods = getFoods();
  foods.push({ name, date });
  saveFoods(foods);
  renderTable();

  document.getElementById('foodName').value = '';
  document.getElementById('expiryDate').value = '';
}

export function renderTable() {
  const table = document.getElementById('foodTable');
  if (!table) return;

  while (table.rows.length > 1) table.deleteRow(1);

  const foods = getFoods();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const card = table.closest('.card');
  let emptyMsg = document.getElementById('emptyMsg');

  if (!foods.length) {
    if (card) card.style.display = 'none';
    if (!emptyMsg) {
      emptyMsg = document.createElement('div');
      emptyMsg.id = 'emptyMsg';
      emptyMsg.textContent = 'Nothing here';
      emptyMsg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.4;font-size:16px;';
      document.getElementById('logs').appendChild(emptyMsg);
    }
    emptyMsg.style.display = 'block';
    return;
  }

  if (card) card.style.display = '';
  if (emptyMsg) emptyMsg.style.display = 'none';

  foods.forEach((food, index) => {
    const diffDays = Math.ceil((parseDate(food.date) - now) / 86400000);
    const [color, icon, label] = diffDays > 3
      ? ['#7bc99a', 'fa-circle-check', `${diffDays} days remaining`]
      : diffDays > 0
        ? ['#f0b97a', 'fa-circle-exclamation', `${diffDays} days remaining`]
        : diffDays === 0
          ? ['#f28b8b', 'fa-circle-xmark', 'Expired Today']
          : ['#f28b8b', 'fa-circle-xmark', 'Expired'];

    const dataRow = table.insertRow();
    dataRow.className = 'data-row';
    dataRow.insertCell(0).textContent = food.name;
    dataRow.insertCell(1).textContent = food.date;

    const statusCell = dataRow.insertCell(2);
    statusCell.style.cssText = 'display:flex;align-items:center;gap:0.4rem;justify-content:flex-end;';
    statusCell.innerHTML = `<span style="color:${color};text-align:right;max-width:80px;">${label}</span><i class="fa-solid ${icon}" style="color:${color};flex-shrink:0;align-self:center;"></i>`;

    const btnRow = table.insertRow();
    btnRow.className = 'btn-row';
    const btnCell = btnRow.insertCell(0);
    btnCell.colSpan = 3;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    Object.assign(delBtn.style, {
      width: '100%', backgroundColor: 'var(--md-sys-color-primary)',
      color: 'var(--md-sys-color-on-primary)', border: 'none',
      borderRadius: '16px', padding: '8px', cursor: 'pointer', marginBottom: '4px'
    });
    delBtn.onclick = () => {
      openAlert({
        title: 'Delete Food',
        msg: `Remove "${food.name}" from your list?`,
        buttons: [
          { label: 'Cancel', subtle: true },
          {
            label: 'Delete', bold: true,
            action: () => {
              haptic([20, 30, 20]);
              const foods = getFoods();
              foods.splice(index, 1);
              saveFoods(foods);
              renderTable();
            }
          }
        ]
      });
    };
    btnCell.appendChild(delBtn);
  });
}

export function deleteAllExpired() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expired = getFoods().filter(f => parseDate(f.date) < now);
  if (!expired.length) { showAlert('No expired items to remove.'); return; }
  openAlert({
    title: 'Delete Expired',
    msg: `Remove ${expired.length} expired item${expired.length > 1 ? 's' : ''}?`,
    buttons: [
      { label: 'Cancel', subtle: true },
      {
        label: 'Delete', bold: true,
        action: () => {
          haptic([20, 30, 20]);
          expired.forEach(f => localStorage.removeItem(`notified_${f.name}_${f.date}`));
          saveFoods(getFoods().filter(f => parseDate(f.date) >= now));
          renderTable();
        }
      }
    ]
  });
}

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

export function saveFood() {
  if (!isLearningEnabled()) return;
  const input = document.getElementById('foodName').value.trim();
  if (!input || input.includes('/learned')) return;
  const data = getStoredFoods();
  data[input] = (data[input] || 0) + 1;
  localStorage.setItem('foodsData', JSON.stringify(data));
}

let learnedIndex = 0;

export function setRandomFood() {
  if (navigator.vibrate) navigator.vibrate(32);
  const input = document.getElementById('foodName');
  if (!isLearningEnabled()) {
    input.value = defaultFoods[Math.floor(Math.random() * defaultFoods.length)];
    return;
  }
  const learned = getLearnedSortedList();
  if (learned.length > 0 && learnedIndex < learned.length) {
    input.value = learned[learnedIndex++];
    return;
  }
  input.value = defaultFoods[Math.floor(Math.random() * defaultFoods.length)];
}

export function openResetLearningModal() {
  vibrate(32);
  openModal({ modalId: 'resetLearningModal', boxId: 'resetLearningBox', backdropId: 'resetLearningBackdrop' });
}

export function closeResetLearningModal() {
  closeModal({ modalId: 'resetLearningModal', boxId: 'resetLearningBox', backdropId: 'resetLearningBackdrop' });
}

export function confirmResetLearning() {
  vibrate(48);
  localStorage.removeItem('foodsData');
  learnedIndex = 0;
  closeResetLearningModal();
}
