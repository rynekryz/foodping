import './notifs.js';
import { haptic, isHapticEnabled, setHapticEnabled } from './lib/haptic.js';
import { initNav, navigateTo, getCurrentPage, onEnterPage } from './nav.js';
import { initPickers, openTimePicker, openDatePicker, confirmDate, closeDatePicker } from './pickers.js';
import {
  addFood, renderTable, deleteAllExpired, saveFood, setRandomFood,
  openResetLearningModal, closeResetLearningModal, confirmResetLearning,
} from './foods.js';
import { initCloudSync, openCloudIdModal, closeCloudIdModal, saveCloudId } from './cloud.js';
import { initWifi, openWifiModal, closeWifiModal, toggleWifiPass, saveWifi, resetWifi } from './wifi.js';
import { initTheme, applyTheme, openThemeModal, closeThemeModal } from './theme.js';
import { initFont, initFontSize, applyFont, openFontModal, closeFontModal } from './fonts.js';
import { initData, confirmReset } from './data.js';
import { openCreditsModal, closeCreditsModal, openLinkAlert, toggleCredits } from './credits.js';
import { openExternal } from './lib/safe.js';
import { initDevsEasterEgg, initLearnedDebug, greetUser } from './extras.js';

// lazy feed
const loadFeedModule = () => import('./feed.js');
onEnterPage('feedpage', () => loadFeedModule().then(m => m.ensureFeed()));

const actions = {
  saveFood,
  setRandomFood,
  openDatePicker,
  addFood,
  deleteAllExpired,
  openThemeModal,
  openFontModal,
  openWifiModal,
  openCloudIdModal,
  openTimePicker,
  confirmReset,
  openResetLearningModal,
  openCreditsModal,
  refreshFeed: () => loadFeedModule().then(m => m.loadFeed(true)),
  closeDatePicker,
  confirmDate,
  closeResetLearningModal,
  confirmResetLearning,
  closeCloudIdModal,
  saveCloudId,
  toggleWifiPass,
  resetWifi,
  closeWifiModal,
  saveWifi,
  closeThemeModal,
  applyTheme: key => applyTheme(key),
  applyFont: key => applyFont(key),
  closeFontModal,
  closeCreditsModal,
  toggleCredits,
  openUrl: openExternal,
};

function bindActions() {
  document.querySelectorAll('[data-action]').forEach(el => {
    const run = actions[el.dataset.action];
    if (!run) return console.warn('Unknown action:', el.dataset.action);
    el.addEventListener(el.dataset.event || 'click', () => run(el.dataset.arg));
  });
}

function applyFeedToggle() {
  const enabled = localStorage.getItem('feedEnabled') === 'true';
  document.getElementById('feedNavBtn').style.display = enabled ? 'flex' : 'none';
  if (!enabled && getCurrentPage() === 'feedpage') navigateTo('home');
}

function initSettings() {
  const hapticToggle = document.getElementById('hapticToggle');
  hapticToggle.checked = isHapticEnabled();
  hapticToggle.addEventListener('change', () => {
    setHapticEnabled(hapticToggle.checked);
    localStorage.setItem('haptic', isHapticEnabled() ? 'on' : 'off');
    if (isHapticEnabled()) haptic(32);
  });

  const notifToggle = document.getElementById('notifToggle');
  notifToggle.checked = localStorage.getItem('notifEnabled') !== 'false';
  notifToggle.addEventListener('change', () => {
    haptic(22);
    localStorage.setItem('notifEnabled', notifToggle.checked);
    if (notifToggle.checked && Notification.permission === 'default') Notification.requestPermission();
  });

  const neuralToggle = document.getElementById('neuralLearning');
  neuralToggle.checked = localStorage.getItem('neuralLearning') === 'true';
  neuralToggle.addEventListener('change', () => localStorage.setItem('neuralLearning', neuralToggle.checked));

  const feedsToggle = document.getElementById('feeds');
  feedsToggle.checked = localStorage.getItem('feedEnabled') === 'true';
  applyFeedToggle();
  feedsToggle.addEventListener('change', () => {
    haptic(22);
    localStorage.setItem('feedEnabled', feedsToggle.checked);
    applyFeedToggle();
  });

  document.getElementById('notifTimeDisplay').textContent = localStorage.getItem('notifTime') || '8:00 AM';
  const cloudId = localStorage.getItem('cloud_id') || '';
  document.getElementById('cloudIdDisplay').textContent = cloudId ? 'Set' : 'Not set';
}

function initHapticFeedback() {
  document.querySelectorAll('#cloudUrlActions button, #wifiActions button, #themeActions button, #fontActions button, #creditsActions button')
    .forEach(btn => btn.addEventListener('click', () => haptic(32)));

  document.querySelectorAll('.md-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); haptic(64); });
  });
  document.querySelectorAll('input').forEach(input => input.addEventListener('focus', () => haptic(20)));
  document.querySelectorAll('.settings-row').forEach(row => row.addEventListener('click', () => haptic(22)));
}

// sw

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  navigator.serviceWorker.getRegistrations()
    .then(regs => Promise.all(regs.map(r => r.unregister())))
    .then(() => navigator.serviceWorker.register(`${base}sw.js`, { scope: base }));
}

// init

initNav();
initPickers();
initWifi();
registerServiceWorker();
initFont();
initFontSize();
initData();
bindActions();
initHapticFeedback();
initSettings();
renderTable();
initDevsEasterEgg();
initLearnedDebug();
initCloudSync();

document.getElementById('foodName').addEventListener('blur', saveFood);
document.getElementById('rowDev').addEventListener('click', () => openLinkAlert('Izatifoodie', 'https://github.com/Izatifoodie'));
document.getElementById('rowDesigner').addEventListener('click', () => openLinkAlert('rynekryz', 'https://github.com/rynekryz'));

greetUser();
initTheme();
