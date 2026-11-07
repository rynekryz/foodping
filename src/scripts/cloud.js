import { vibrate } from './lib/haptic.js';
import { openModal, closeModal, showAlert } from './lib/modal.js';
import { getFoods, parseDate } from './lib/storage.js';

const CLOUD_ID_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;
const syncDelay = 400;
let syncTimer = null;

export function isValidCloudId(id) {
  return CLOUD_ID_PATTERN.test(id);
}

function getCloudUrl() {
  const id = localStorage.getItem('cloud_id');
  if (!id || !isValidCloudId(id)) return null;
  return `https://script.google.com/macros/s/${encodeURIComponent(id)}/exec`;
}

function toExpiryTimestamp(food) {
  const time = parseDate(food.date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export async function cloudSync() {
  const url = getCloudUrl();
  if (!url || !navigator.onLine) return;

  const foods = getFoods().map(f => ({ name: f.name, date: toExpiryTimestamp(f) }));

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ action: 'mirror', foods }),
    });
  } catch {}
}

function scheduleSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(cloudSync, syncDelay);
}

export function initCloudSync() {
  window.addEventListener('online', cloudSync);
  window.addEventListener('foods:changed', scheduleSync);
  cloudSync();
}

// cloud

export function openCloudIdModal() {
  vibrate(32);
  document.getElementById('cloudIdInput').value = localStorage.getItem('cloud_id') || '';
  document.getElementById('cloudUsrInput').value = localStorage.getItem('cloud_user') || '';
  openModal({ modalId: 'cloudIdModal', boxId: 'cloudIdBox', backdropId: 'cloudIdBackdrop' });
}

export function closeCloudIdModal() {
  closeModal({ modalId: 'cloudIdModal', boxId: 'cloudIdBox', backdropId: 'cloudIdBackdrop' });
}

export function saveCloudId() {
  vibrate(48);
  const usr = document.getElementById('cloudUsrInput').value.trim().slice(0, 40);
  const val = document.getElementById('cloudIdInput').value.trim();

  if (val && !isValidCloudId(val)) {
    showAlert('Cloud Sync ID is not valid.');
    return;
  }

  localStorage.setItem('cloud_user', usr);
  localStorage.setItem('cloud_id', val);
  document.getElementById('cloudIdDisplay').textContent = val ? 'Set' : 'Not set';
  closeCloudIdModal();
  cloudSync();
}
