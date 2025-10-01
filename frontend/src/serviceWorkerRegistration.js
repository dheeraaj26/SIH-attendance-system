import { register } from './serviceWorker';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      register();
    });
  }
}
