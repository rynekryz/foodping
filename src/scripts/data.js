import { haptic, setHapticEnabled } from './lib/haptic.js';
import { openAlert } from './lib/modal.js';
import { renderTable } from './foods.js';
import { isValidDate } from './lib/storage.js';
import { isValidCloudId, cloudSync } from './cloud.js';

const MAX_BACKUP_SIZE = 2 * 1024 * 1024;
const BACKUP_KEYS = ['foods', 'foodsData', 'theme', 'selectedFont', 'fontSize', 'haptic', 'notifEnabled', 'notifTime', 'neuralLearning', 'feedEnabled', 'cloud_id', 'cloud_user'];

// reset all

export function confirmReset() {
  haptic(32);
  openAlert({
    title: 'Reset All Data',
    msg: 'This will delete all foods, settings and saved data. This cannot be undone.',
    buttons: [
      { label: 'Cancel', subtle: true },
      {
        label: 'Reset', bold: true, danger: true,
        action: () => {
          haptic([30, 50, 30]);
          localStorage.clear();
          renderTable();
          setHapticEnabled(true);
          document.getElementById('hapticToggle').checked = true;
          document.getElementById('notifToggle').checked = true;
          document.getElementById('notifTimeDisplay').textContent = '8:00 AM';
          localStorage.setItem('notifTime', '8:00 AM');
          cloudSync();
        }
      }
    ]
  });
}

function backupData() {
  const o = {};
  BACKUP_KEYS.forEach(k => {
    const value = localStorage.getItem(k);
    if (value !== null) o[k] = value;
  });
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const stamp = `${pad(now.getDate())}${pad(now.getMonth()+1)}${String(now.getFullYear()).slice(-2)}${pad(now.getHours())}${pad(now.getMinutes())}`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, data: o })], { type: 'application/octet-stream' }));
  a.download = `Foodping_${stamp}.foodping-backup`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function isValidBackupValue(key, value) {
  if (typeof value !== 'string' || value.length > 1024 * 1024) return false;
  if (key === 'cloud_id') return value === '' || isValidCloudId(value);
  if (key === 'foods') {
    try {
      const foods = JSON.parse(value);
      return Array.isArray(foods) && foods.every(f => f && typeof f.name === 'string' && f.name.length <= 100 && isValidDate(f.date));
    } catch {
      return false;
    }
  }
  if (key === 'foodsData') {
    try {
      const data = JSON.parse(value);
      return data !== null && typeof data === 'object' && !Array.isArray(data);
    } catch {
      return false;
    }
  }
  return value.length <= 200;
}

function parseBackup(text) {
  if (text.length > MAX_BACKUP_SIZE) return null;
  try {
    const parsed = JSON.parse(text);
    const data = parsed && typeof parsed.data === 'object' ? parsed.data : parsed;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const clean = {};
    for (const key of BACKUP_KEYS) {
      if (!Object.hasOwn(data, key)) continue;
      if (!isValidBackupValue(key, data[key])) return null;
      clean[key] = data[key];
    }
    return Object.keys(clean).length ? clean : null;
  } catch {
    return null;
  }
}

function showWrongFile() {
  openAlert({ title: 'Wrong File', msg: 'Please select a valid .foodping-backup file.', buttons: [{ label: 'OK' }] });
}

function restoreData(f) {
  const r = new FileReader();
  r.onload = () => {
    const clean = parseBackup(String(r.result));
    if (!clean) {
      showWrongFile();
      return;
    }
    localStorage.clear();
    Object.entries(clean).forEach(([k, v]) => localStorage.setItem(k, v));
    location.reload();
  };
  r.readAsText(f);
}

function openBackupAlert() {
  openAlert({
    title: 'Backup Data',
    msg: 'This will download all your data as a backup file.',
    buttons: [
      { label: 'Cancel', subtle: true },
      { label: 'Backup', bold: true, action: backupData }
    ]
  });
}

function openRestoreAlert() {
  openAlert({
    title: 'Restore Data',
    msg: 'This will replace all current data with the backup. This cannot be undone.',
    buttons: [
      { label: 'Cancel', subtle: true },
      {
        label: 'Restore', bold: true,
        action: () => {
          const i = document.createElement('input');
          i.type = 'file';
          i.accept = '.foodping-backup';
          i.onchange = e => {
            const f = e.target.files[0];
            if (!f) return;
            if (!f.name.endsWith('.foodping-backup') || f.size > MAX_BACKUP_SIZE) {
              showWrongFile();
              return;
            }
            restoreData(f);
          };
          i.click();
        }
      }
    ]
  });
}

export function initData() {
  document.getElementById('backupBtn').onclick = openBackupAlert;
  document.getElementById('restoreBtn').onclick = openRestoreAlert;
}
