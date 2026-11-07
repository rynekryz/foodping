let hapticEnabled = localStorage.getItem('haptic') !== 'off';

export const isHapticEnabled = () => hapticEnabled;
export const setHapticEnabled = (value) => { hapticEnabled = value; };

export function haptic(pattern = 32) {
  if (!hapticEnabled || !navigator.vibrate) return;
  navigator.vibrate(pattern);
}

export const vibrate = haptic;
