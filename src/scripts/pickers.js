import { haptic } from './lib/haptic.js';

function buildDrum(el, items, selectedIndex) {
  el.innerHTML = items.map(item => `<div class="drum-item">${item}</div>`).join('');
  setTimeout(() => { el.scrollTop = selectedIndex * 44; }, 50);
}

function getDrumIndex(el) {
  return Math.round(el.scrollTop / 44);
}

export function openTimePicker() {
  haptic(32);
  const saved = localStorage.getItem('notifTime') || '8:00 AM';
  const parts = saved.split(/[: ]/);
  const hour = parseInt(parts[0]);
  const minute = parseInt(parts[1]);
  const ampm = parts[2] || 'AM';

  buildDrum(document.getElementById('hourDrum'), Array.from({length: 12}, (_, i) => i + 1), hour - 1);
  buildDrum(document.getElementById('minuteDrum'), Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')), minute);
  buildDrum(document.getElementById('ampmDrum'), ['AM', 'PM'], ampm === 'AM' ? 0 : 1);

  const picker = document.getElementById('timePicker');
  const sheet = document.getElementById('timePickerSheet');
  const backdrop = document.getElementById('timePickerBackdrop');

  picker.style.display = 'flex';
  sheet.style.animation = '';
  backdrop.style.animation = '';
  requestAnimationFrame(() => {
    sheet.style.animation = 'sheetSlideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards';
    backdrop.style.animation = 'alertFadeIn 0.25s ease forwards';
  });
}

export function closeTimePicker(save) {
  haptic(20);
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

export function openDatePicker() {
  if (navigator.vibrate) navigator.vibrate(32);

  const picker = document.getElementById('datePicker');
  const sheet = document.getElementById('datePickerSheet');
  const backdrop = document.getElementById('datePickerBackdrop');

  picker.style.display = 'flex';
  sheet.style.animation = 'none';
  backdrop.style.animation = 'none';
  void sheet.offsetWidth;
  void backdrop.offsetWidth;
  sheet.style.animation = 'sheetSlideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards';
  backdrop.style.animation = 'alertFadeIn 0.25s ease forwards';

  const now = new Date();
  const months = [
    {label:'Jan',value:'01'},{label:'Feb',value:'02'},{label:'Mar',value:'03'},
    {label:'Apr',value:'04'},{label:'May',value:'05'},{label:'Jun',value:'06'},
    {label:'Jul',value:'07'},{label:'Aug',value:'08'},{label:'Sep',value:'09'},
    {label:'Oct',value:'10'},{label:'Nov',value:'11'},{label:'Dec',value:'12'}
  ];

  fillDrum('dayScroll', Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0')), now.getDate() - 1);
  fillDrum('monthScroll', months, now.getMonth());
  fillDrum('yearScroll', Array.from({length: 6}, (_, i) => String(now.getFullYear() + i).slice(-2)), 0);
}

function fillDrum(id, items, selectedIndex) {
  const scroll = document.getElementById(id);
  scroll.innerHTML = items.map(val =>
    `<div class="drum-item" data-value="${val.value ?? val}">${val.label ?? val}</div>`
  ).join('');
  setTimeout(() => { scroll.scrollTop = selectedIndex * 44; }, 0);
}

function getSelectedDrum(id) {
  const scroll = document.getElementById(id);
  const index = Math.round(scroll.scrollTop / 44);
  const items = scroll.querySelectorAll('.drum-item');
  return items[Math.min(index, items.length - 1)]?.dataset.value || '';
}

export function confirmDate() {
  document.getElementById('expiryDate').value =
    `${getSelectedDrum('dayScroll')}/${getSelectedDrum('monthScroll')}/${getSelectedDrum('yearScroll')}`;
  closeDatePicker();
}

export function closeDatePicker() {
  const sheet = document.getElementById('datePickerSheet');
  const backdrop = document.getElementById('datePickerBackdrop');
  const picker = document.getElementById('datePicker');

  sheet.style.animation = 'sheetSlideDown 0.3s ease forwards';
  backdrop.style.animation = 'alertFadeOut 0.3s ease forwards';
  setTimeout(() => { picker.style.display = 'none'; }, 300);
}

export function initPickers() {
  document.getElementById('timePickerCancel').onclick = () => closeTimePicker(false);
  document.getElementById('timePickerDone').onclick = () => closeTimePicker(true);
  document.getElementById('timePickerBackdrop').onclick = () => closeTimePicker(false);
}
