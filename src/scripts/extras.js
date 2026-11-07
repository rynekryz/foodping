import { setLines } from './lib/safe.js';
import { readJson } from './lib/storage.js';

// hmm

export function initDevsEasterEgg() {
  const el = document.getElementById('devs');
  if (!el) return;
  let toggled = false;
  Object.assign(el.style, {transition: 'opacity 0.3s' });
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    el.style.opacity = 0;
    setTimeout(() => {
      toggled = !toggled;
      el.textContent = toggled ? 'Ryne' : 'Izatifoodie';
      el.style.opacity = 0.5;
    }, 300);
  });
}

// debug

function printLearnedFoods() {
  const sorted = Object.entries(readJson('foodsData', {})).sort((a, b) => b[1] - a[1]);
  console.clear();
  console.log('What i learned from this user?');
  sorted.forEach(([food, count], i) => console.log(`${i + 1}. ${food} → ${count}`));
}

export function initLearnedDebug() {
  const foodInput = document.getElementById('foodName');
  if (!foodInput) return;
  foodInput.addEventListener('input', () => {
    if (foodInput.value.includes('/learned')) {
      printLearnedFoods();
      foodInput.value = foodInput.value.replace('/learned', '').trim();
    }
  });
}

let shakeReady = false;
setTimeout(() => { shakeReady = true; }, 5000);

// greetings

export function greetUser() {
  const h1 = document.querySelector('#home h1');
  if (!h1) return;

  const username = localStorage.getItem('cloud_user');
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? 'Good Morning' :
    hour < 17 ? 'Good Afternoon' :
    hour < 21 ? 'Good Evening' :
    'Good Night';

  const greetText = username ? `${greeting},\n${username}!` : `${greeting}!`;

  let isBusy = false;

  const fade = (content, delay) => setTimeout(() => {
    h1.style.transition = 'opacity 0.5s ease';
    h1.style.opacity = '0';
    setTimeout(() => { setLines(h1, content); h1.style.opacity = '1'; }, 500);
  }, delay);

  setTimeout(() => {
    isBusy = true;
    fade(greetText, 0);
    setTimeout(() => {
      fade('FoodPing', 2000);
      setTimeout(() => { isBusy = false; }, 3000);
    }, 500);
  }, 2000);

  const saveOriginals = () => {
    document.querySelectorAll('.home-bg .material-symbols-outlined').forEach(icon => {
      if (!icon.dataset.original) icon.dataset.original = icon.textContent.trim();
    });
  };

  const iconsAtOriginal = () => {
    const icons = document.querySelectorAll('.home-bg .material-symbols-outlined');
    return [...icons].every(icon => !icon.dataset.original || icon.textContent.trim() === icon.dataset.original);
  };

  const swapIcons = (to) => {
    document.querySelectorAll('.home-bg .material-symbols-outlined').forEach((icon, i) => {
      setTimeout(() => {
        icon.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        icon.style.transform = `rotate(var(--r, 0deg)) rotateY(90deg)`;
        icon.style.opacity = '0';
        setTimeout(() => {
          icon.textContent = to === 'original' ? icon.dataset.original : to;
          icon.style.transform = `rotate(var(--r, 0deg)) rotateY(0deg)`;
          icon.style.opacity = '1';
        }, 300);
      }, i * 40);
    });
  };

  const showMessage = (text, iconName) => {
    isBusy = true;
    const original = h1.dataset.text || 'FoodPing';
    h1.style.transition = 'opacity 0.3s ease';
    h1.style.opacity = '0';
    setTimeout(() => { setLines(h1, text); h1.style.opacity = '1'; }, 300);
    setTimeout(() => {
      h1.style.opacity = '0';
      setTimeout(() => {
        setLines(h1, original);
        h1.style.opacity = '1';
        setTimeout(() => { isBusy = false; }, 500);
      }, 300);
    }, 2000);

    saveOriginals();
    swapIcons(iconName);
    setTimeout(() => swapIcons('original'), 2600);
  };

  const isGreeting = () => {
    const current = h1.textContent;
    return current.includes('Good Morning') || current.includes('Good Afternoon') ||
           current.includes('Good Evening') || current.includes('Good Night');
  };

  if (hour >= 0 && hour < 4) {
    setTimeout(() => {
      if (!isBusy) showMessage("Shouldn't you\nbe sleeping?", 'bedtime');
    }, 7000);
  }

  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      battery.addEventListener('chargingchange', () => {
        showMessage(battery.charging ? 'Yummy!' : 'Ouch!',
          battery.charging ? 'bolt' : (battery.level * 100 > 20 ? 'error' : 'sentiment_very_dissatisfied'));
      });
      if (battery.charging) showMessage('Yummy!', 'bolt');
    });
  }

  let idleTimer = null;

  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!isBusy && iconsAtOriginal()) showMessage('Still there?', 'sentiment_calm');
    }, 120000);
  };

  document.addEventListener('touchstart', resetIdle);
  resetIdle();

  let shakeIndex = 0;
  let lastShake = 0;
  let shakeCount = 0;
  let shakeWindowTimer = null;

  const shakeStates = [
    { message: 'Hey, you made\nme dizzy!', icon: 'sentiment_stressed' },
    { message: 'Stop itt!',                  icon: 'sentiment_neutral' },
    { message: 'My "head" hurts\nT-T',     icon: 'sick' },
  ];

  const handleShake = (force) => {
    if (!shakeReady || isBusy || !iconsAtOriginal()) return;
    if (isGreeting() && force < 64) return;

    const now = Date.now();
    if (now - lastShake > 1500) shakeCount = 0;
    shakeCount++;
    lastShake = now;

    clearTimeout(shakeWindowTimer);
    shakeWindowTimer = setTimeout(() => { shakeCount = 0; }, 1500);

    if (shakeCount < 3) return;
    shakeCount = 0;
    clearTimeout(shakeWindowTimer);

    const { message, icon } = shakeStates[shakeIndex];
    shakeIndex = (shakeIndex + 1) % shakeStates.length;

    showMessage(message, icon);
    if (navigator.vibrate) navigator.vibrate([32, 30, 48]);
  };

  function onMotion(e) {
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (!a) return;
    const force = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
    if (force > 48) handleShake(force);
  }

  document.addEventListener('click', function initMotion() {
    document.removeEventListener('click', initMotion);
    window.addEventListener('devicemotion', onMotion);
  }, { once: true });
}
