import { openModal, closeModal, openAlert } from './lib/modal.js';
import { readJson } from './lib/storage.js';
import { isValidCloudId } from './cloud.js';

const PENDING_TTL = 15 * 60 * 1000;

function getPendingWifi() {
  const pending = readJson('pendingWifi', {});
  if (!pending || typeof pending.ssid !== 'string' || Date.now() - (pending.savedAt || 0) > PENDING_TTL) {
    localStorage.removeItem('pendingWifi');
    return {};
  }
  return pending;
}

// setup

export function openWifiModal() {
  const saved = getPendingWifi();
  if (saved.ssid) document.getElementById('wifiSsid').value = saved.ssid;
  if (saved.password) document.getElementById('wifiPass').value = saved.password;
  openModal({ modalId: 'wifiModal', boxId: 'wifiBox', backdropId: 'wifiBackdrop' });
}

export function closeWifiModal() {
  closeModal({ modalId: 'wifiModal', boxId: 'wifiBox', backdropId: 'wifiBackdrop' });
}

export function toggleWifiPass() {
  const input = document.getElementById('wifiPass');
  const icon = document.querySelector('.wifi-eye');
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  icon.textContent = isPass ? 'visibility_off' : 'visibility';
}

export function saveWifi() {
  const ssid = document.getElementById('wifiSsid').value.trim();
  const pass = document.getElementById('wifiPass').value;
  if (!ssid || ssid.length > 32 || pass.length > 63) return;
  localStorage.setItem('pendingWifi', JSON.stringify({ ssid, password: pass, savedAt: Date.now() }));
  document.getElementById('wifiStatus').textContent = 'Connect to FoodPing Setup';
  closeWifiModal();
  startWifiSync();
}

async function trySendWifi() {
  const pending = getPendingWifi();
  if (!pending.ssid) {
    stopWifiSync();
    return;
  }
  const cloudId = localStorage.getItem('cloud_id') || '';

  if (!isValidCloudId(cloudId)) {
    try {
      await fetch('http://192.168.4.1/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ssid: pending.ssid, password: pending.password, script_id: '' }) });
    } catch {}
    document.getElementById('wifiStatus').textContent = 'Cloud ID not found';
    return;
  }

  try {
    const res = await fetch('http://192.168.4.1/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssid: pending.ssid, password: pending.password, script_id: cloudId })
    });
    if (res.ok) {
      localStorage.removeItem('pendingWifi');
      document.getElementById('wifiStatus').textContent = 'Configured';
      stopWifiSync();
    }
  } catch {}
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

export async function resetWifi() {
  openAlert({
    title: 'Reset WiFi',
    msg: 'This will clear WiFi credentials. ESP will restart as a hotspot. Continue?',
    buttons: [
      { label: 'Cancel', subtle: true },
      {
        label: 'Reset', bold: true, danger: true,
        action: async () => {
          closeWifiModal();
          localStorage.removeItem('pendingWifi');
          document.getElementById('wifiStatus').textContent = 'Not Configured';
          stopWifiSync();
          try { await fetch('http://esp32.local/reset-wifi', { method: 'POST' }); } catch {}
          setTimeout(() => openAlert({
            title: 'WiFi Reset',
            msg: "Connect to 'FoodPing-Setup' hotspot, then reopen this app to reconfigure.",
            buttons: [{ label: 'OK' }]
          }), 300);
        }
      }
    ]
  });
}

export function initWifi() {
  if (getPendingWifi().ssid) {
    document.getElementById('wifiStatus').textContent = 'Connect to FoodPing Setup';
    startWifiSync();
  }
}
