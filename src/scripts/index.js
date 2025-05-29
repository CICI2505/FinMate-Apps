// scripts/index.js
import '../styles/styles.css';
import '../styles/responsives.css';
import App from './pages/app';
import BookmarkPage from './pages/bookmark/bookmark-page';
import 'leaflet/dist/leaflet.css';

async function safeDefine(name, importPromise) {
  if (!customElements.get(name)) {
    try {
      const { default: Component } = await importPromise;
      if (!customElements.get(name)) {
        customElements.define(name, Component);
      }
    } catch (error) {
      console.error(`Failed to register ${name}:`, error);
      throw error;
    }
  }
}


async function initializeApp() {
  try {
    await Promise.all([
      safeDefine('login-pages', import('./pages/auth/login/login-pages')),
      safeDefine('register-page', import('./pages/auth/register/register-page')),
      safeDefine('home-page', import('./pages/home/home-page')),
      safeDefine('create-page', import('./pages/create/create-page')),
      safeDefine('detail-page', import('./pages/detail/detail-page')),
      safeDefine('bookmark-page', import('./pages/bookmark/bookmark-page')),
    ]);

    if (!customElements.get('bookmark-page')) {
      customElements.define('bookmark-page', BookmarkPage);
    }

    const app = new App({
      content: document.getElementById('mainContent'),
      skipLinkButton: document.querySelector('.skip-link'),
      drawerButton: document.getElementById('drawer-button'),

    });

    app.renderPage();

    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    const token = localStorage.getItem('accessToken');
    if (token && window.location.hash === '#/') {
      window.location.hash = '#/home';
    }

    // for demonstration purpose-only
    console.log('Berhasil mendaftarkan service worker.');

    window.addEventListener('hashchange', () => app.renderPage());
    window.addEventListener('load', () => app.renderPage());

  } catch (error) {
    console.error('Application initialization failed:', error);
    document.getElementById('mainContent').innerHTML = `
      <div style="color: white; text-align: center; padding: 20px;">
        <h2>Application Error</h2>
        <p>Sorry, something went wrong. Please try again later.</p>
      </div>
    `;
  }
}

initializeApp();