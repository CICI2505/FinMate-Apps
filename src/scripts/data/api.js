const BASE_URL = 'https://story-api.dicoding.dev/v1';

async function fetchWithToken(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
  });
}

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function putAccessToken(token) {
  return localStorage.setItem('accessToken', token);
}

async function login({ email, password }) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const responseJson = await response.json();

  if (responseJson.error) {
    return { error: true, data: null };
  }

  return { error: false, data: responseJson.loginResult };
}

async function register({ name, email, password }) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const responseJson = await response.json();

  if (responseJson.error) {
    return { error: true, data: null };
  }

  return { error: false, data: responseJson };
}

async function addNewStory({ formData }) {
  const response = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: formData,
  });

  const responseJson = await response.json();

  if (responseJson.error) {
    return { error: true, message: responseJson.message };
  }

  return { error: false, data: responseJson };
}

async function logout() {
  const toast = document.createElement('div');
  toast.className = 'logout-toast';
  toast.textContent = 'Logout successful!';
  document.body.appendChild(toast);
  
  toast.offsetHeight;
  toast.style.display = 'block';
  
  if (document.startViewTransition) {
    await document.startViewTransition(() => {
      localStorage.removeItem('accessToken');
      localStorage.setItem('showLogoutMessage', 'true');
    }).finished;
  } else {
    localStorage.removeItem('accessToken');
    localStorage.setItem('showLogoutMessage', 'true');
  }
  
  setTimeout(() => {
    toast.style.animation = 'slide-down 0.3s ease-out';
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 2000);
}

export { getAccessToken, putAccessToken, login, register, fetchWithToken, logout, addNewStory };