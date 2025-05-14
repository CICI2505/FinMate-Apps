import 'leaflet/dist/leaflet.css';
import DetailPresenter from './detail-presenter.js';
import StoryDatabase from '../../data/database';

// Global Leaflet options
const initLeaflet = () => {
  if (typeof L === 'undefined') return;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

export default class DetailPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.story = null;
    this.isLoading = true;
    this.map = null;
    this.resizeObserver = null;
    this._initTemplate();
  }

  _initTemplate() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background-color:rgb(34, 49, 36);
          color: #eeeeee;
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          max-width: 100vw;
        }
        
        .navbar {
          background-color:rgb(47, 77, 39);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
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
          width: 100%;
          box-sizing: border-box;
        }

        .main-content {
          flex: 1;
          margin-top: 70px; 
          padding-bottom: 2rem;
          width: 100%;
        }

        .content {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1rem;
          box-sizing: border-box;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color:rgb(164, 207, 147);
          text-decoration: none;
        }
        
        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        
        .nav-link {
          color: #eeeeee;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .nav-link:hover {
          color:rgb(151, 207, 147);
        }
        
        .back-btn {
          background: linear-gradient(135deg, rgb(64, 99, 57) 0%,rgb(44, 39, 77) 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .back-btn:hover {
          background: linear-gradient(135deg,rgb(147, 207, 155) 0%,rgb(104, 180, 96) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 8pxrgb(192, 214, 189);
        }

        .back-btn:active {
          transform: scale(0.95) translateY(-2px);
          transition: transform 0.1s ease;
        }

        .story-container {
          display: block !important; 
          background-color:rgb(57, 70, 58);
          border-radius: 8px;
          max-width: 700px;
          overflow: visible !important; 
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          margin: 2rem auto;
        }

        .bookmark-btn {
          background: linear-gradient(135deg,rgb(74, 165, 74) 0%,rgb(22, 136, 28) 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .bookmark-btn:hover {
          background: linear-gradient(135deg,rgb(22, 136, 37) 0%,rgb(126, 140, 160) 100%);
          transform: translateY(-2px);
        }

        .bookmark-btn svg {
          width: 20px;
          height: 20px;
        }
        
        .story-image {
          width: 100%;
          max-height: 70vh;
          object-fit: contain;
          display: block;
          margin-bottom: 1rem !important;
          border-radius: 8px 8px 0 0;
        }
        
        .story-content {
          padding: 1.5rem;
        }
        
        .story-title {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color:rgb(160, 207, 147);
          word-break: break-word;
        }
        
        .story-description {
          color: #eeeeee;
          margin-bottom: 1.5rem;
          line-height: 1.6;
          font-size: 1rem;
          word-break: break-word;
        }
        
        .story-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 0.5rem;
          color: #9ca3af;
          font-size: 0.9rem;
          border-top: 1px solidrgb(74, 87, 77);
          padding-top: 1rem;
          margin-top: 1rem;
        }
        
        .story-author {
          font-weight: 500;
        }
        
        .story-date {
          font-style: italic;
        }
        
        .story-map-container {
          width: 100%;
          height: 400px;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 1.5rem;
          background:rgb(34, 49, 38);
          position: relative;
          border: 2px solidrgb(74, 87, 77);
        }

        .map-container {
          height: 100%;
          width: 100%;
          position: relative;
        }

        .leaflet-container {
          background:rgb(36, 49, 34) !important;
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
          background:rgb(39, 77, 47) !important;
          color: #eeeeee !important;
        }
        
        .leaflet-popup-content {
          margin: 8px !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
        }
        
        .leaflet-popup-tip {
          background:rgb(39, 77, 43) !important;
        }
        
        .leaflet-marker-icon {
          filter: hue-rotate(180deg) brightness(1.2);
        }

        .loading {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 300px;
          color: #93BFCF;
          gap: 1rem;
        }

        .loading-spinner {
          border: 4px solid rgba(147, 207, 149, 0.3);
          border-radius: 50%;
          border-top: 4px solid #93BFCF;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        .error-message {
          text-align: center;
          padding: 2rem;
          color: #ff6b6b;
          background-color: rgba(255, 107, 107, 0.1);
          border-radius: 8px;
          margin: 1rem 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .story-content {
            padding: 1rem;
          }

          .story-title {
            font-size: 1.5rem;
          }

          .story-map-container {
            height: 350px;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            flex-direction: column;
            gap: 1rem;
            padding: 0.75rem;
          }

          .nav-links {
            width: 100%;
            justify-content: space-between;
          }

          .story-map-container {
            height: 300px;
          }
        }
      </style>
      <div class="page-container">
        <nav class="navbar">
          <a href="#/home" class="logo">Story Apps Dicoding</a>
          <div class="nav-links">
            <a href="#/home" class="nav-link">Home</a>
            <a href="#/create" class="nav-link">Create</a>
            <button class="back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              Back to Home
            </button>
          </div>
        </nav>
        <main class="main-content">
          <div class="content">
            <div id="storyContainer">
              <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading story...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  connectedCallback() {
    const urlParts = window.location.hash.split('/');
    const storyId = urlParts[urlParts.length - 1];

    this.shadowRoot.querySelector('.back-btn').addEventListener('click', () => {
      window.location.hash = '#/home';
    });

    this.init(storyId);
  }

  async init(storyId) {
    if (!storyId) {
      this.showError('Story ID not found');
      return;
    }

    try {
      this.isLoading = true;
      this.render();

      await DetailPresenter.init({
        view: this,
        storyId: storyId
      });
    } catch (error) {
      this.showError(error.message);
    }
  }

  async displayStory(story) {
    this.story = story;
    this.isLoading = false;
    this.render();

    if (story.lat && story.lon) {
      await this.initMap(story.lat, story.lon, story.name);
    }
  }

  async toggleBookmark(story) {
    try {
      const isBookmarked = await DetailPresenter.toggleBookmark(story);
      const bookmarkBtn = this.shadowRoot.querySelector('#bookmarkBtn');
      
      if (bookmarkBtn) {
        bookmarkBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>${isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        `;
      }
      return isBookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  async _checkBookmarkStatus() {
    try {
      const isBookmarked = await StoryDatabase.isStorySaved(this.story.id);
      const bookmarkBtn = this.shadowRoot.querySelector('#bookmarkBtn');
      
      if (bookmarkBtn && isBookmarked) {
        bookmarkBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Bookmarked</span>
        `;
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  }

  async initMap(lat, lon, title) {
    this._cleanupMap();

    const mapContainer = this.shadowRoot.querySelector('.map-container');
    if (!mapContainer) return;

    try {
      const L = await import('leaflet');
      initLeaflet();

      this.map = L.map(mapContainer, {
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

      // Add tile layer with same settings as home page
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        minZoom: 13,
        crossOrigin: true
      }).addTo(this.map);

      // Add marker
      const marker = L.marker([lat, lon]).addTo(this.map);

      // Add popup with same style as home page
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

      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);

      this.resizeObserver = new ResizeObserver(() => {
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize({ pan: false });
          }
        }, 100);
      });
      this.resizeObserver.observe(mapContainer);

    } catch (error) {
      console.error('Error initializing map:', error);
      mapContainer.innerHTML = `
        <div style="
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #444;
          color: #eee;
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

  _cleanupMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  showError(message) {
    const container = this.shadowRoot.getElementById('storyContainer');
    container.innerHTML = `
      <div class="error-message">
        <h3>Error</h3>
        <p>${message}</p>
        <p>Please try again or go back to <a href="#/home" style="color: #93BFCF;">home page</a>.</p>
      </div>
    `;
  }

  render() {
    const container = this.shadowRoot.getElementById('storyContainer');

    if (this.isLoading) {
      container.innerHTML = `
          <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading story...</p>
          </div>
        `;
      return;
    }

    if (!this.story) {
      container.innerHTML = `
          <div class="error-message">
            Story not found
          </div>
        `;
      return;
    }

    container.innerHTML = `
      <div class="story-container">
        <img src="${this.story.photoUrl}" alt="${this.story.name}" class="story-image" loading="lazy">
        <div class="story-content">
          <h1 class="story-title">${this.story.name}</h1>
          <div class="story-description">${this.story.description}</div>
          <button id="bookmarkBtn" class="bookmark-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Bookmark</span>
          </button>
          <div class="story-meta">
            <span class="story-author">By: ${this.story.name}</span>
            <span class="story-date">Posted on: ${new Date(this.story.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</span>
          </div>
          ${this.story.lat && this.story.lon ?
        `<div class="story-map-container">
              <div class="map-container"></div>
            </div>` : ''}
        </div>
      </div>
    `;

    const bookmarkBtn = container.querySelector('#bookmarkBtn');
    bookmarkBtn.addEventListener('click', async () => {
      try {
        const isBookmarked = await this.toggleBookmark(this.story);
        bookmarkBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>${isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      `;
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
    });

    this._checkBookmarkStatus();

    if (this.story.lat && this.story.lon) {
      setTimeout(() => {
        this.initMap(this.story.lat, this.story.lon, this.story.name);
      }, 0);
    }
  }

  disconnectedCallback() {
    this._cleanupMap();
  }
}