import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { logout } from '../../data/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default class HomePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.classList.add('home-page');
    this.maps = {};
    this.resizeObservers = {};
    this._initTemplate();
  }

  _initTemplate() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100vh;
          background-color:rgb(244, 245, 245);
          color: #eeeeee;
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        .page-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 100vw;
          overflow: hidden;
        }
        
        .navbar {
          background-color:rgb(48, 91, 4);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(42, 220, 57, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
          flex-shrink: 0;
        }

        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding: 2rem 0;
          -webkit-overflow-scrolling: touch;
          min-height: 0;
          width: 100%;
          box-sizing: border-box;
        }
        
        .content {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
          box-sizing: border-box;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color:rgb(222, 233, 215);
          text-decoration: none;
        }
        
        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        
        .nav-link {
          color:rgb(238, 238, 238);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .nav-link:hover {
          color:rgb(63, 218, 15);
        }
        
        .logout-btn {
          background: linear-gradient(135deg,rgb(57, 74, 99) 0%,rgb(194, 219, 173) 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
          background: linear-gradient(135deg,rgb(174, 207, 147) 0%,rgb(134, 180, 96) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px #BDCDD6;
        }

        .logout-btn:active {
          transform: scale(0.95) translateY(-2px);
          transition: transform 0.1s ease;
        }

        .logout-btn.clicked {
          animation: pulse 0.5s ease;
        }

        .welcome-message {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.8rem;
          color:rgb(168, 207, 147);
        }
        
        .stories-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .story-card {
          background-color:rgb(48, 91, 4);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(190, 178, 178, 0.2);
          transition: transform 0.3s ease;
        }
        
        .story-card:hover {
          transform: translateY(-5px);
        }
        
        .story-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .story-content {
          padding: 1rem;
        }
        
        .story-title {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color:rgb(177, 207, 147);
        }
        
        .story-description {
          color: rgb(238, 238, 238);
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .story-date {
          color: rgb(156, 163, 175);
          font-size: 0.8rem;
        }
        
        .story-map {
          position: relative;
          z-index: 0;
          height: 200px;
          width: 100%;
          min-height: 200px;
          margin-top: 1rem;
          border-radius: 8px;
          overflow: hidden;
          background: #dddddd;
        }
        
        .map-container {
          height: 100%;
          width: 100%;
          position: relative;
        }

        .main-map-container {
          height: 400px;
          width: 100%;
          margin-bottom: 2rem;
          border-radius: 8px;
          overflow: hidden;
        }

        .main-map-container .map-container {
          height: 100%;
          width: 100%;
        }
        
        .leaflet-container {
          background: #dddddd !important;
          height: 100% !important;
          width: 100% !important;
        }
        
        .leaflet-tile {
          position: absolute;
          left: 0;
          top: 0;
          filter: none !important;
          -webkit-filter: none !important;
          image-rendering: crisp-edges;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
          background:rgb(50, 77, 39) !important;
          color: #eeeeee !important;
        }
        
        .leaflet-popup-content {
          margin: 8px !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
        }
        
        .leaflet-popup-tip {
          background:rgb(52, 77, 39) !important;
        }
        
        .leaflet-marker-icon {
          filter: hue-rotate(180deg) brightness(1.2);
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          color:rgb(176, 207, 147);
        }
        
        .error-message {
          text-align: center;
          padding: 2rem;
          color: #ff6b6b;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(149, 207, 147, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(147, 191, 207, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(148, 207, 147, 0);
          }
        }

        .skip-link-container {
          position: relative;
          width: 100%;
          height: 0;
        }

        .skip-link {
          display: none;
          width: 100%;
          background-color:rgb(160, 207, 147);
          color:rgb(39, 77, 42);
          text-align: center;
          padding: 12px 40px 12px 16px;
          font-weight: 500;
          text-decoration: none;
          position: absolute;
          left: 0;
          top: 0;
          z-index: 9999;
          line-height: 1.5;
        }

        .skip-link:focus {
          display: block;
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
          outline: 2px solid #eeeeee;
          outline-offset: -2px;
        }

        .skip-close-btn {
          position: absolute;
          right: 8px;
          top: 70%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color:rgb(55, 77, 39);
          font-size: 1.25rem;
          font-weight: bold;
          cursor: pointer;
          padding: 0 5px;
          z-index: 10000;
          opacity: 0;
          pointer-events: none;
        }

        .notification-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .notification-btn {
          background: linear-gradient(135deg,rgb(91, 165, 74) 0%, #166088 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .notification-btn:hover {
          background: linear-gradient(135deg,rgb(22, 136, 22) 0%,rgb(89, 165, 74) 100%);
        }

        .notification-btn svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }
      
        @media (max-width: 1024px) {
          .content {
            padding: 0 1.5rem;
            max-width: calc(100vw - 3rem);
          }
          
          .stories-container {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }
          
          .story-image {
            height: 180px;
          }
          
          .story-map {
            height: 180px;
          }
          
          .welcome-message {
            font-size: 1.6rem;
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }

          .nav-links {
            width: 100%;
            justify-content: space-around;
          }

          .stories-container {
            grid-template-columns: 1fr;
          }
          
          .content {
            padding: 0 1rem;
          }
          
          .welcome-message {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .story-card {
            max-width: 100%;
          }
          
          .story-image {
            height: 220px;
          }
          
          .story-map {
            height: 220px;
          }
        }

        @media (max-width: 685px) {
          .page-container {
            height: auto;
            min-height: 100vh;
          }
          
          .scrollable-content {
            padding: 1.5rem 0;
          }
          
          .welcome-message {
            font-size: 1.4rem;
            margin-bottom: 1rem;
          }
          
          .story-content {
            padding: 0.8rem;
          }
          
          .story-title {
            font-size: 1.1rem;
          }
          
          .story-description {
            -webkit-line-clamp: 2;
            font-size: 0.9rem;
          }
          
          .logout-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }
          
          .nav-link {
            font-size: 0.9rem;
          }
          
          .logo {
            font-size: 1.3rem;
          }
        }
      </style>
      <div class="page-container">
        <nav class="navbar">
        
          <a href="#/home" class="logo">FinMate Apps</a>
          <div class="nav-links">
            <a href="#/home" class="nav-link">Home</a>
            <a href="#/create" class="nav-link">Create</a>
            
            
            <button class="logout-btn">Logout</button>
          </div>

          
        </nav>
        <div class="skip-link-container">
            <a href="#storiesContainer" class="skip-link" id="skipLink">Skip to Content</a>
            <button class="skip-close-btn" id="skipCloseBtn" aria-label="Close skip link">×</button>
        </div>
        <div class="scrollable-content">
          <div class="main-map-container">
            <div class="map-container" id="mainMap"></div>
          </div>
          <div class="content">
            <h1 class="welcome-message">Welcome to Story FinMate Apps!</h1>
            <div id="storiesContainer"></div>
          </div>
        </div>
      </div>
    `;
  }

  async connectedCallback() {
    if (document.startViewTransition) {
      document.documentElement.style.viewTransitionName = 'home-page';
      this.style.contain = 'layout paint';
    }

    this.shadowRoot.querySelector('a[href="#/create"]').addEventListener('click', async (e) => {
      e.preventDefault();
      if (document.startViewTransition) {
        document.documentElement.classList.add('create-transition');
        await document.startViewTransition(() => {
          window.location.hash = '#/create';
        }).finished;
        document.documentElement.classList.remove('create-transition');
      } else {
        window.location.hash = '#/create';
      }
    });

    this.shadowRoot.querySelector('.logout-btn').addEventListener('click', (e) => {
      const btn = e.target;
      btn.animate([
        { transform: 'scale(1)', boxShadow: '0 4px 8px rgba(147, 191, 207, 0)' },
        { transform: 'scale(1.05)', boxShadow: '0 4px 15px rgba(147, 191, 207, 0.4)' },
        { transform: 'scale(1)', boxShadow: '0 4px 8px rgba(147, 191, 207, 0)' }
      ], {
        duration: 500,
        easing: 'ease-out'
      });

      this._handleLogout();
    });

    const updateSubscriptionButtons = async () => {
      try {
        const { isCurrentPushSubscriptionAvailable } = await import('../../utils/notification-helper');
        const isSubscribed = await isCurrentPushSubscriptionAvailable();
        const subscribeBtn = this.shadowRoot.getElementById('subscribeBtn');
        const unsubscribeBtn = this.shadowRoot.getElementById('unsubscribeBtn');

        if (subscribeBtn && unsubscribeBtn) {
          subscribeBtn.style.display = isSubscribed ? 'none' : 'block';
          unsubscribeBtn.style.display = isSubscribed ? 'block' : 'none';
        }
      } catch (error) {
        console.error('Error updating subscription buttons:', error);
      }
    };

    const subscribeBtn = this.shadowRoot.getElementById('subscribeBtn');
    const unsubscribeBtn = this.shadowRoot.getElementById('unsubscribeBtn');

    subscribeBtn?.addEventListener('click', async () => {
      try {
        const { subscribe } = await import('../../utils/notification-helper');
        await subscribe();
        await updateSubscriptionButtons();
        alert('Berhasil subscribe notifikasi');
      } catch (error) {
        console.error('Subscription error:', error);
        alert(`Gagal subscribe: ${error.message}`);
      }
    });

    unsubscribeBtn?.addEventListener('click', async () => {
      try {
        const { unsubscribe } = await import('../../utils/notification-helper');
        await unsubscribe();
        await updateSubscriptionButtons();
        alert('Berhasil unsubscribe notifikasi');
      } catch (error) {
        console.error('Unsubscription error:', error);
        alert(`Gagal unsubscribe: ${error.message}`);
      }
    });

    // Panggil pertama kali
    await updateSubscriptionButtons();

    const skipLink = this.shadowRoot.getElementById('skipLink');
    const skipCloseBtn = this.shadowRoot.getElementById('skipCloseBtn');
    const storiesContainer = this.shadowRoot.getElementById('storiesContainer');

    const showSkipLink = () => {
      skipLink.style.display = 'block';
      skipCloseBtn.style.display = 'block';
      skipLink.focus();
    };

    const hideSkipLink = () => {
      skipLink.style.display = 'none';
      skipCloseBtn.style.display = 'none';
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && skipLink.style.display !== 'block') {
        showSkipLink();
        e.preventDefault();
      }
    });

    const handleSkip = (e) => {
      if (e) e.preventDefault();
      storiesContainer.tabIndex = -1;
      storiesContainer.focus();
      hideSkipLink();
      setTimeout(() => {
        storiesContainer.removeAttribute('tabIndex');
      }, 1000);
    };

    const closeSkipLink = () => {
      hideSkipLink();
      this.shadowRoot.querySelector('.navbar').focus();
    };

    skipLink.addEventListener('click', handleSkip);
    skipLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleSkip(e);
      }
    });

    skipCloseBtn.addEventListener('click', closeSkipLink);
    skipCloseBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeSkipLink();
      }
    });

    const adjustCloseButton = () => {
      const skipLink = this.shadowRoot.getElementById('skipLink');
      const skipCloseBtn = this.shadowRoot.getElementById('skipCloseBtn');

      if (skipLink && skipCloseBtn) {
        const linkHeight = skipLink.offsetHeight;
        const btnSize = window.innerWidth < 768 ? 22 : 24;
        skipCloseBtn.style.top = `${linkHeight / 2}px`;
        skipCloseBtn.style.height = `${btnSize}px`;
        skipCloseBtn.style.width = `${btnSize}px`;
      }
    };

    setTimeout(() => {
      adjustCloseButton();
      window.addEventListener('resize', adjustCloseButton);

      skipLink.focus();
      skipLink.addEventListener('blur', () => {
        setTimeout(() => {
          if (!this.shadowRoot.activeElement || this.shadowRoot.activeElement === this.shadowRoot) {
            skipLink.focus();
          }
        }, 10);
      });
    }, 100);

    this.shadowRoot.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && skipLink.style.display !== 'none') {
        closeSkipLink();
      }
    });

    this._loadStories();
  }

  async _loadStories() {
    const container = this.shadowRoot.getElementById('storiesContainer');
    const token = localStorage.getItem('accessToken');
    container.innerHTML = '<div class="loading">Loading stories...</div>';

    if (!token) {
      this.showError('Silakan login terlebih dahulu');
      window.location.hash = '#/';
      return;
    }

    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/stories?location=1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response bukan JSON');
      }

      const data = await response.json();

      if (!response.ok || data.error) {
        if (response.status === 401) {
          this._handleLogout();
          return;
        }
        throw new Error(data.message || 'Gagal memuat cerita');
      }

      this._displayStories(data.listStory);
    } catch (error) {
      console.error('Error:', error);
      this.showError(error.message.includes('JSON') ? 'Terjadi kesalahan server' : error.message);
    }
  }

  // Update the _displayStories method in home-page.js:

  _displayStories(stories) {
    const container = this.shadowRoot.getElementById('storiesContainer');

    if (!stories || stories.length === 0) {
      container.innerHTML = '<div class="error-message">No stories found</div>';
      return;
    }

    container.innerHTML = '<div class="stories-container"></div>';
    const storiesContainer = container.querySelector('.stories-container');

    stories.forEach((story, index) => {
      const storyElement = document.createElement('div');
      storyElement.className = 'story-card';
      storyElement.setAttribute('data-story-id', story.id);

      // Make story card clickable
      storyElement.style.cursor = 'pointer';
      storyElement.addEventListener('click', () => {
        window.location.hash = `#/detail/${story.id}`;
      });

      storyElement.animate([
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 400,
        delay: index * 50,
        easing: 'ease-out',
        fill: 'backwards'
      });

      const mapHtml = story.lat && story.lon ? `
      <div class="story-map">
        <div class="map-container" id="map-container-${story.id}"></div>
      </div>
    ` : '';

      storyElement.innerHTML = `
      <img src="${story.photoUrl}" alt="${story.name}" class="story-image" loading="lazy">
      <div class="story-content">
        <h3 class="story-title">${story.name}</h3>
        <p class="story-description">${story.description}</p>
        <p class="story-date">${new Date(story.createdAt).toLocaleDateString()}</p>
        ${mapHtml}
      </div>
    `;

      storiesContainer.appendChild(storyElement);

      if (story.lat && story.lon) {
        requestAnimationFrame(() => {
          this._initMap(story.id, story.lat, story.lon, story.name);
        });
      }
    });
  }

  _initMap(id, lat, lon, title) {
    const mapContainer = this.shadowRoot.getElementById(`map-container-${id}`);

    if (!mapContainer) return;

    const loadingAnim = mapContainer.animate([
      { opacity: 0.5, backgroundColor: '#dddddd' },
      { opacity: 1, backgroundColor: '#eeeeee' }
    ], {
      duration: 1000,
      iterations: Infinity,
      direction: 'alternate'
    });

    if (this.maps[id]) {
      this.maps[id].remove();
      delete this.maps[id];
    }

    if (this.resizeObservers[id]) {
      this.resizeObservers[id].disconnect();
      delete this.resizeObservers[id];
    }

    mapContainer.innerHTML = '';

    try {
      const map = L.map(mapContainer, {
        preferCanvas: true,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        zoomSnap: 0.1
      }).setView([lat, lon], 15);

      this.maps[id] = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        minZoom: 13,
        crossOrigin: true
      }).addTo(map);

      const marker = L.marker([lat, lon]).addTo(map);

      const popupContent = `
        <div style="font-family: 'Poppins', sans-serif; padding: 8px; max-width: 200px;">
          <strong>${title}</strong><br>
          <small>Lat: ${lat.toFixed(4)}</small><br>
          <small>Lng: ${lon.toFixed(4)}</small>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: 'custom-popup'
      }).openPopup();

      const resizeObserver = new ResizeObserver(() => {
        if (this.resizeTimeouts && this.resizeTimeouts[id]) {
          clearTimeout(this.resizeTimeouts[id]);
        }

        this.resizeTimeouts = this.resizeTimeouts || {};
        this.resizeTimeouts[id] = setTimeout(() => {
          map.invalidateSize({ pan: false });
        }, 100);
      });

      resizeObserver.observe(mapContainer);
      this.resizeObservers[id] = resizeObserver;

      setTimeout(() => {
        map.invalidateSize({ pan: false });
      }, 300);

      map.whenReady(() => {
        loadingAnim.cancel();
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      loadingAnim.cancel();
      mapContainer.innerHTML = `
        <div style="
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eee;
          color: #333;
          font-family: sans-serif;
          text-align: center;
          padding: 1rem;
        ">
          <div>
            <p>Map unavailable</p>
            <small>Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}</small>
          </div>
        </div>
      `;
    }
  }

  _initMainMap(stories) {
    const mainMapContainer = this.shadowRoot.getElementById('mainMap');
    if (!mainMapContainer) return;

    if (this._mainMap) {
      this._mainMap.remove();
    }

    this._mainMap = L.map(mainMapContainer).setView([-2.5489, 118.0149], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this._mainMap);

    stories.filter(story => story.lat && story.lon).forEach(story => {
      L.marker([story.lat, story.lon])
        .addTo(this._mainMap)
        .bindPopup(`<b>${story.name}</b><br>${story.description.substring(0, 50)}...`);
    });

    this._mainMapResizeObserver = new ResizeObserver(() => {
      setTimeout(() => this._mainMap.invalidateSize(), 100);
    });
    this._mainMapResizeObserver.observe(mainMapContainer);
  }

  _handleLogout() {
    if (!document.startViewTransition) {
      logout();
      window.location.hash = '#/';
      return;
    }

    document.documentElement.classList.add('logout-transition');

    const transition = document.startViewTransition(async () => {
      await logout();
      window.location.hash = '#/';
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove('logout-transition');
    });
  }

  setNavigateHandler(handler) {
    this._navigateTo = handler;
  }

  initMainMap(stories) {
    this._initMainMap(stories);
  }

  handleLogout() {
    this._handleLogout();
  }

  showError(message) {
    const container = this.shadowRoot.getElementById('storiesContainer');
    container.innerHTML = `<div class="error-message">${message}</div>`;
  }

  displayStories(stories) {
    this._displayStories(stories);
  }

  disconnectedCallback() {
    if (document.startViewTransition) {
      document.documentElement.style.viewTransitionName = 'home-page';
      this.style.contain = 'layout paint';
    }

    Object.values(this.maps).forEach(map => {
      map.remove();
    });
    this.maps = {};

    Object.values(this.resizeObservers).forEach(observer => {
      observer.disconnect();
    });
    this.resizeObservers = {};

    if (this.resizeTimeouts) {
      Object.values(this.resizeTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
      this.resizeTimeouts = {};
    }
  }
}