import App from './App.svelte';
import './global.css';

// Follow the OS light/dark setting. Chromium's prefers-color-scheme tracks
// the system theme (nativeTheme defaults to 'system'), so the app matches
// the desktop with no in-app toggle.
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const applyTheme = () => {
  document.documentElement.dataset.theme = darkQuery.matches ? 'dark' : 'light';
};
applyTheme();
darkQuery.addEventListener('change', applyTheme);

// When the window is drawn with the acrylic material, switch the backdrop
// to a translucent tint so what's behind the window shows through
if (window.api?.glass) {
  document.documentElement.dataset.glass = 'true';
}

const app = new App({ target: document.getElementById('app') });

export default app;
