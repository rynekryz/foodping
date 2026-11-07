import { haptic } from './lib/haptic.js';
import { openModal, closeModal } from './lib/modal.js';

const FONT_SOURCES = {
  default: null,
  patrickhand: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap',
  gaegu: 'https://fonts.googleapis.com/css2?family=Gaegu&display=swap',
  monocraft: null,
  jetbrains: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap',
};

const FONT_FAMILY = {
  default: '"Google Sans Flex", system-ui, sans-serif',
  patrickhand: '"Patrick Hand", cursive',
  gaegu: '"Gaegu", cursive',
  monocraft: '"Monocraft", monospace',
  jetbrains: '"JetBrains Mono", monospace',
};

const loadedFonts = new Set(['default']);
let allFontsLoaded = false;

function loadFont(fontKey) {
  if (loadedFonts.has(fontKey)) return Promise.resolve();
  loadedFonts.add(fontKey);

  return new Promise(resolve => {
    if (fontKey === 'monocraft') {
      const style = document.createElement('style');
      style.textContent = `@font-face{font-family:'Monocraft';src:url('https://cdn.jsdelivr.net/gh/IdreesInc/Monocraft@main/dist/Monocraft-ttf/Monocraft.ttf') format('truetype');font-weight:normal;font-style:normal;}`;
      document.head.appendChild(style);
      setTimeout(resolve, 100);
    } else if (FONT_SOURCES[fontKey]) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_SOURCES[fontKey];
      link.onload = link.onerror = resolve;
      document.head.appendChild(link);
    } else {
      resolve();
    }
  });
}

function loadAllFonts() {
  if (allFontsLoaded) return Promise.resolve();
  return Promise.all(Object.keys(FONT_SOURCES).filter(k => k !== 'default').map(loadFont))
    .then(() => { allFontsLoaded = true; });
}

function setFontStyle(family) {
  let styleEl = document.getElementById('font-override-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'font-override-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    *{font-family:${family}!important;}
    .material-symbols-outlined{font-family:'Material Symbols Outlined'!important;}
    .material-icons{font-family:'Material Icons'!important;}
    .material-icons-round{font-family:'Material Icons Round'!important;}
    .fa,.fa-solid,.fa-regular,.fa-brands{font-family:'Font Awesome 7 Free','Font Awesome 7 Brands'!important;}
    #font-default .font-preview,#font-default .font-name{font-family:"Google Sans Flex",system-ui,sans-serif!important;}
    #font-patrickhand .font-preview,#font-patrickhand .font-name{font-family:"Patrick Hand",cursive!important;}
    #font-gaegu .font-preview,#font-gaegu .font-name{font-family:"Gaegu",cursive!important;}
    #font-monocraft .font-preview,#font-monocraft .font-name{font-family:"Monocraft",monospace!important;}
    #font-jetbrains .font-preview,#font-jetbrains .font-name{font-family:"JetBrains Mono",monospace!important;}
  `;
}

export function applyFont(fontKey) {
  loadFont(fontKey).then(() => setFontStyle(FONT_FAMILY[fontKey]));
  localStorage.setItem('selectedFont', fontKey);
  document.querySelectorAll('.font-check').forEach(el => el.classList.remove('visible'));
  document.getElementById(`check-font-${fontKey}`)?.classList.add('visible');
  const display = document.getElementById('fontDisplay');
  if (display) display.textContent = document.querySelector(`#font-${fontKey} .font-name`)?.textContent || 'Default';
}

export async function openFontModal() {
  const list = document.getElementById('fontList');
  openModal({ modalId: 'fontModal', boxId: 'fontBox', backdropId: 'fontBackdrop' });

  if (!allFontsLoaded) {
    list.style.cssText = 'opacity:0.4;pointer-events:none;transition:opacity 0.3s ease;';
    const spinner = document.createElement('div');
    spinner.id = 'fontLoadingSpinner';
    spinner.style.cssText = 'position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);font-size:0.75rem;color:var(--md-sys-color-on-surface);opacity:0.5;font-family:"Google Sans Flex",sans-serif!important;white-space:nowrap;';
    spinner.textContent = 'Loading fonts...';
    document.getElementById('fontBox').appendChild(spinner);

    await loadAllFonts();
    list.style.opacity = '1';
    list.style.pointerEvents = '';
    spinner.remove();
  }
}

export function closeFontModal() {
  closeModal({ modalId: 'fontModal', boxId: 'fontBox', backdropId: 'fontBackdrop' });
}

export function initFont() {
  const saved = localStorage.getItem('selectedFont') || 'default';
  loadFont(saved).then(() => setFontStyle(FONT_FAMILY[saved]));
  document.querySelectorAll('.font-check').forEach(el => el.classList.remove('visible'));
  document.getElementById(`check-font-${saved}`)?.classList.add('visible');
  const display = document.getElementById('fontDisplay');
  if (display) display.textContent = document.querySelector(`#font-${saved} .font-name`)?.textContent || 'Default';
}

export function initFontSize() {
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeValue = document.getElementById('fontSizeValue');
  let fontSizeTimer = null;

  const savedSize = localStorage.getItem('fontSize') || '16';
  fontSizeSlider.value = savedSize;
  fontSizeValue.textContent = savedSize;
  document.documentElement.style.fontSize = savedSize + 'px';

  fontSizeSlider.addEventListener('input', () => {
    const size = fontSizeSlider.value;
    fontSizeValue.textContent = size;
    clearTimeout(fontSizeTimer);
    fontSizeTimer = setTimeout(() => {
      document.documentElement.style.fontSize = size + 'px';
      localStorage.setItem('fontSize', size);
      haptic(32);
    }, 500);
  });
}
