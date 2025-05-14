import { getAccessToken } from '../data/api';

const routes = {
  '/': {
    template: '<login-pages></login-pages>',
    requiresAuth: false,
  },
  '/register': {
    template: '<register-page></register-page>',
    requiresAuth: false,
  },
  '/home': {
    template: '<home-page></home-page>',
    requiresAuth: true,
  },
  '/create': {
    template: '<create-page></create-page>',
    requiresAuth: true,
  },
  '/detail/:id': {
    template: '<detail-page></detail-page>',
    requiresAuth: true,
  },
  '/bookmarks': {
    template: '<bookmark-page></bookmark-page>',
    requiresAuth: true,
  },
};

function navigateToUrl(url) {
  window.location.hash = url;
}

function checkAuth(route) {
  const isAuthenticated = !!getAccessToken();
  
  if (route.requiresAuth && !isAuthenticated) {
    navigateToUrl('/');
    return false;
  }
  
  if (!route.requiresAuth && isAuthenticated && window.location.hash === '#/') {
    navigateToUrl('/home');
    return false;
  }
  
  return true;
}

export { routes, navigateToUrl, checkAuth };