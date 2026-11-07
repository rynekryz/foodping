import { haptic } from './lib/haptic.js';
import { openModal, closeModal } from './lib/modal.js';

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

export function applyTheme(key) {
  haptic(22);
  const theme = themes[key];
  if (!theme) return;

  const currentTheme = localStorage.getItem('theme') || 'strawberry';
  const duration = (key === 'void' || currentTheme === 'void') ? 0 : 350;

  document.body.style.setProperty('--theme-transition-duration', `${duration}ms`);
  document.body.classList.add('theme-transitioning');
  document.body.style.willChange = 'background-color, color';

  Object.entries(theme).forEach(([prop, val]) => {
    if (prop.startsWith('--')) document.body.style.setProperty(prop, val);
  });

  const surfaceContainer = theme['--md-sys-color-surface-container'];
  document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.setAttribute('content', surfaceContainer));
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

export function initTheme() {
  applyTheme(localStorage.getItem('theme') || 'strawberry');
}

export function openThemeModal() {
  openModal({ modalId: 'themeModal', boxId: 'themeBox', backdropId: 'themeBackdrop' });
  const saved = localStorage.getItem('theme') || 'strawberry';
  document.querySelectorAll('.theme-check').forEach(el => el.classList.remove('visible'));
  document.getElementById(`check-${saved}`)?.classList.add('visible');
}

export function closeThemeModal() {
  closeModal({ modalId: 'themeModal', boxId: 'themeBox', backdropId: 'themeBackdrop' });
}
