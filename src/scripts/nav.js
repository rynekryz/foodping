// nav

import { haptic } from './lib/haptic.js'; = ['home', 'logs', 'feedpage', 'settings', 'about'];
let currentPage = 'home';

export function navigateTo(targetPage) {
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

const pageHooks = {};

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dy) > Math.abs(dx)) return;
  if (Math.abs(dx) < 50) return;

  const feedEnabled = localStorage.getItem('feedEnabled') === 'true';
  const swipeOrder = navOrder.filter(p => feedEnabled || p !== 'feedpage');
  const currentIndex = swipeOrder.indexOf(currentPage);

  if (dx < 0) {
    const next = swipeOrder[currentIndex + 1];
    if (next) enterPage(next);
  } else {
    const prev = swipeOrder[currentIndex - 1];
    if (prev) enterPage(prev);
  }
}, { passive: true });

export const getCurrentPage = () => currentPage;

export function onEnterPage(page, fn) {
  pageHooks[page] = fn;
}

export function enterPage(page) {
  navigateTo(page);
  pageHooks[page]?.();
}

export function initNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      haptic(32);
      enterPage(btn.dataset.page);
    });
  });
}
