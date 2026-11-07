import { haptic } from './haptic.js';

export function openModal({ modalId, boxId, backdropId, duration = 350 }) {
  haptic(32);
  const modal = document.getElementById(modalId);
  const box = document.getElementById(boxId);
  const backdrop = document.getElementById(backdropId);

  modal.style.display = 'flex';
  box.style.animation = '';
  backdrop.style.animation = '';
  requestAnimationFrame(() => {
    box.style.animation = `alertPopIn ${duration}ms cubic-bezier(0.34,1.56,0.64,1) forwards`;
    backdrop.style.animation = 'alertFadeIn 0.25s ease forwards';
  });
}

export function closeModal({ modalId, boxId, backdropId, duration = 200 }) {
  haptic(10);
  const modal = document.getElementById(modalId);
  const box = document.getElementById(boxId);
  const backdrop = document.getElementById(backdropId);

  box.style.animation = `alertPopOut ${duration}ms ease forwards`;
  backdrop.style.animation = `alertFadeOut ${duration}ms ease forwards`;

  setTimeout(() => {
    modal.style.display = 'none';
    box.style.animation = '';
    backdrop.style.animation = '';
  }, duration);
}

export function closeAlert() {
  closeModal({ modalId: 'customAlert', boxId: 'customAlertBox', backdropId: 'customAlertBackdrop' });
  setTimeout(() => {
    document.getElementById('customAlertTitle').textContent = 'FoodPing';
    document.getElementById('customAlertActions').innerHTML = '<button id="customAlertBtn">OK</button>';
  }, 200);
}

export function openAlert({ title = 'FoodPing', msg, buttons }) {
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

  openModal({ modalId: 'customAlert', boxId: 'customAlertBox', backdropId: 'customAlertBackdrop' });
}

export function showAlert(msg) {
  openAlert({ title: 'FoodPing', msg, buttons: [{ label: 'OK' }] });
}
