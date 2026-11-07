import { openModal, closeModal, openAlert } from './lib/modal.js';
import { openExternal } from './lib/safe.js';

export function openCreditsModal() {
  openModal({ modalId: 'creditsModal', boxId: 'creditsBox', backdropId: 'creditsBackdrop' });
}

export function closeCreditsModal() {
  closeModal({ modalId: 'creditsModal', boxId: 'creditsBox', backdropId: 'creditsBackdrop' });
}

export function openLinkAlert(name, url) {
  openAlert({
    title: 'Open Link?',
    msg: `Visit ${name}'s GitHub profile?`,
    buttons: [
      { label: 'Cancel', subtle: true },
      { label: 'Open', bold: true, action: () => openExternal(url) }
    ]
  });
}

export function toggleCredits() {
  const extra = document.getElementById('creditsExtra');
  const button = document.getElementById('creditsMore');
  const expand = extra.hidden;
  extra.hidden = !expand;
  button.setAttribute('aria-expanded', String(expand));
  button.querySelector('.credits-more-label').textContent = expand ? 'See less' : 'See more';
  button.querySelector('.material-symbols-outlined').textContent = expand ? 'expand_less' : 'expand_more';
}
