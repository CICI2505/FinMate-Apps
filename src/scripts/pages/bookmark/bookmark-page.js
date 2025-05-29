import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  generateLoaderAbsoluteTemplate,
  generateReportItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from '../../templates';
import BookmarkPresenter from './bookmark-presenter';
import Database from '../../data/database';
import { logout } from '../../data/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default class BookmarkPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.maps = {};
    this.resizeObservers = {};
    this.resizeTimeouts = {};
    this._mainMap = null;
    this._mainMapResizeObserver = null;
    this._navigateTo = null;
    this._initTemplate();
  }

  async render() {
    return `
      <div class="page-container">
        <nav class="navbar">
          <a href="#/home" class="logo">FinMate Apps</a>
          <div class="nav-links">
            <a href="#/home" class="nav-link">Home</a>
            <a href="#/create" class="nav-link">Create</a>
            <a href="#/" class="nav-link">Daftar Cerita</a>
            <a href="#/bookmark" class="nav-link">Cerita Tersimpan</a>
            
            <button id="subscribeBtn" class="subscribeBtn">
              Subscribe <i class="fas fa-bell"></i>
            </button>
            <button id="unsubscribeBtn" class="unsubscribeBtn" style="display: none;">
              Unsubscribe <i class="fas fa-bell-slash"></i>
            </button>
            
            <button class="logout-btn" id="logoutBtn">Logout</button>
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
            <h1 class="welcome-message">Daftar Laporan Kerusakan Tersimpan</h1>
            
            <div class="reports-list__container">
              <div id="reports-list"></div>
              <div id="reports-list-loading-container"></div>
            </div>
            
            <div id="storiesContainer"></div>
          </div>
        </div>
      </div>
    `;
  }

  _initTemplate() {
    const style = document.createElement('style');
    style.textContent = `
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

        .subscribeBtn, .unsubscribeBtn {
          background: linear-gradient(135deg, rgb(73, 16, 196) 0%, rgb(173, 175, 219) 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .subscribeBtn:hover, .unsubscribeBtn:hover {
          background: linear-gradient(135deg, rgb(150, 147, 207) 0%, rgb(96, 103, 180) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px #BDCDD6;
        }      

        .subscribeBtn:active, .unsubscribeBtn:active {
          transform: scale(0.95) translateY(-2px);
          transition: transform 0.1s ease;
        }

        .subscribeBtn.clicked, .unsubscribeBtn.clicked {
          animation: pulse 0.5s ease;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(0,0,0,0);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 10px rgba(147, 191, 207, 0.5);
          } 
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(0,0,0,0);
          }
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
        
        .story-card, .report-card {
          background-color:rgb(48, 91, 4);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(190, 178, 178, 0.2);
          transition: transform 0.3s ease;
          cursor: pointer;
          position: relative;
        }
        
        .story-card:hover, .report-card:hover {
          transform: translateY(-5px);
        }
        
        .story-image, .report-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .story-content, .report-content {
          padding: 1rem;
        }
        
        .story-title, .report-title {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color:rgb(177, 207, 147);
        }
        
        .story-description, .report-description {
          color: rgb(238, 238, 238);
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .story-date, .report-location, .report-reporter {
          color: rgb(156, 163, 175);
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }
        
        .story-map, .report-map {
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

        .delete-bookmark-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .delete-bookmark-btn:hover {
          background: rgb(220, 53, 69);
          transform: scale(1.1);
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

        .empty-message {
          text-align: center;
          padding: 2rem;
          color:rgb(176, 207, 147);
        }

        .retry-btn {
          background: linear-gradient(135deg, rgb(73, 16, 196) 0%, rgb(173, 175, 219) 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
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

        .reports-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
      
        @media (max-width: 1024px) {
          .content {
            padding: 0 1.5rem;
            max-width: calc(100vw - 3rem);
          }
          
          .stories-container, .reports-list {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }
          
          .story-image, .report-image {
            height: 180px;
          }
          
          .story-map, .report-map {
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

          .stories-container, .reports-list {
            grid-template-columns: 1fr;
          }
          
          .content {
            padding: 0 1rem;
          }
          
          .welcome-message {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .story-card, .report-card {
            max-width: 100%;
          }
          
          .story-image, .report-image {
            height: 220px;
          }
          
          .story-map, .report-map {
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
          
          .story-content, .report-content {
            padding: 0.8rem;
          }
          
          .story-title, .report-title {
            font-size: 1.1rem;
          }
          
          .story-description, .report-description {
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
    `;
    this.shadowRoot.appendChild(style);
  }

  async connectedCallback() {
    if (document.startViewTransition) {
      document.documentElement.style.viewTransitionName = 'bookmark-page';
      this.style.contain = 'layout paint';
    }

    const html = await this.render();
    this.shadowRoot.innerHTML = html;
    this._initTemplate();

    await this.afterRender();
  }

  async afterRender() {
    this.presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });

    this._initEventListeners();
    await this._loadBookmarkedReports();
    this._initMainMap();
    this._initSkipLinks();
  }

  async initialGalleryAndMap() {
    await this.presenter.initialGalleryAndMap();
  }

  _initEventListeners() {
    // Logout button
    const logoutBtn = this.shadowRoot.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this._handleLogout.bind(this));
    }

    // Navigation links
    const navLinks = this.shadowRoot.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            window.location.hash = href;
          });
        } else {
          window.location.hash = href;
        }
      });
    });

    // Subscription buttons
    this._initSubscriptionButtons();
  }

  _initSkipLinks() {
    const skipLink = this.shadowRoot.getElementById('skipLink');
    const skipCloseBtn = this.shadowRoot.getElementById('skipCloseBtn');
    const storiesContainer = this.shadowRoot.getElementById('storiesContainer');

    if (!skipLink || !skipCloseBtn || !storiesContainer) return;

    const showSkipLink = () => {
      skipLink.style.display = 'block';
      skipCloseBtn.style.display = 'block';
      skipLink.focus();
    };

    const hideSkipLink = () => {
      skipLink.style.display = 'none';
      skipCloseBtn.style.display = 'none';
    };

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
      this.shadowRoot.querySelector('.navbar')?.focus();
    };

    // Event listeners
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && skipLink.style.display !== 'block') {
        showSkipLink();
        e.preventDefault();
      }
    });

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

    this.shadowRoot.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && skipLink.style.display !== 'none') {
        closeSkipLink();
      }
    });
  }

  async _initSubscriptionButtons() {
    try {
      const { isCurrentPushSubscriptionAvailable } = await import('../../utils/notification-helper');
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      const subscribeBtn = this.shadowRoot.getElementById('subscribeBtn');
      const unsubscribeBtn = this.shadowRoot.getElementById('unsubscribeBtn');

      if (subscribeBtn && unsubscribeBtn) {
        subscribeBtn.style.display = isSubscribed ? 'none' : 'block';
        unsubscribeBtn.style.display = isSubscribed ? 'block' : 'none';

        subscribeBtn.addEventListener('click', async () => {
          try {
            const { subscribe } = await import('../../utils/notification-helper');
            await subscribe();
            subscribeBtn.style.display = 'none';
            unsubscribeBtn.style.display = 'block';
            alert('Berhasil subscribe notifikasi');
          } catch (error) {
            console.error('Subscription error:', error);
            alert(`Gagal subscribe: ${error.message}`);
          }
        });

        unsubscribeBtn.addEventListener('click', async () => {
          try {
            const { unsubscribe } = await import('../../utils/notification-helper');
            await unsubscribe();
            subscribeBtn.style.display = 'block';
            unsubscribeBtn.style.display = 'none';
            alert('Berhasil unsubscribe notifikasi');
          } catch (error) {
            console.error('Unsubscription error:', error);
            alert(`Gagal unsubscribe: ${error.message}`);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing subscription buttons:', error);
    }
  }

  // PERBAIKAN UTAMA: Ganti localStorage dengan Database
  async _loadBookmarkedReports() {
    this.showReportsListLoading();

    try {
      // Menggunakan Database.getAllReports() alih-alih localStorage
      const bookmarkedReports = await Database.getAllReports();
      console.log('Loaded bookmarked reports:', bookmarkedReports);

      if (bookmarkedReports && bookmarkedReports.length > 0) {
        this.populateBookmarkedReports('Success', bookmarkedReports);
      } else {
        this.populateBookmarkedReportsListEmpty();
      }
    } catch (error) {
      console.error('Error loading bookmarked reports:', error);
      this.populateBookmarkedReportsError('Gagal memuat laporan tersimpan');
    } finally {
      this.hideReportsListLoading();
    }
  }

  // Hapus method localStorage dan ganti dengan Database
  async _getBookmarkedReportsFromStorage() {
    try {
      return await Database.getAllReports();
    } catch (error) {
      console.error('Failed to get bookmarked reports from database:', error);
      return [];
    }
  }

  populateBookmarkedReports(message, reports) {
    if (reports.length <= 0) {
      this.populateBookmarkedReportsListEmpty();
      return;
    }

    const html = reports.reduce((accumulator, report) => {
      return accumulator.concat(this._generateReportCard(report));
    }, '');

    const reportsListContainer = this.shadowRoot.getElementById('reports-list');
    if (reportsListContainer) {
      reportsListContainer.innerHTML = `<div class="reports-list">${html}</div>`;
    }

    // Initialize maps for reports with coordinates
    reports.forEach(report => {
      if (report.lat && report.lon) {
        setTimeout(() => {
          this._initReportMap(report.id, report.lat, report.lon, report.title || report.name);
        }, 100);
      }
    });

    // Add delete event listeners
    this._initDeleteButtons();
  }

  _generateReportCard(report) {
    const mapHtml = report.lat && report.lon ? `
      <div class="report-map">
        <div class="map-container" id="report-map-${report.id}"></div>
      </div>
    ` : '';

    return `
      <div class="report-card" data-report-id="${report.id}">
        <button class="delete-bookmark-btn" data-report-id="${report.id}" title="Hapus dari bookmark">
          ×
        </button>
        ${report.photoUrl ? `<img src="${report.photoUrl}" alt="${report.name || report.title}" class="report-image" loading="lazy">` : ''}
        <div class="report-content">
          <h3 class="report-title">${report.name || report.title}</h3>
          <p class="report-description">${report.description}</p>
          <p class="report-location">${report.location?.placeName || 'Lokasi tidak diketahui'}</p>
          <p class="report-reporter">Dilaporkan oleh: ${report.reporter?.name || 'Anonim'}</p>
          ${mapHtml}
        </div>
      </div>
    `;
  }

  // Tambahkan method untuk handle delete
  _initDeleteButtons() {
    const deleteButtons = this.shadowRoot.querySelectorAll('.delete-bookmark-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const reportId = button.getAttribute('data-report-id');
        await this._handleDeleteBookmark(reportId);
      });
    });
  }

  async _handleDeleteBookmark(reportId) {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini dari bookmark?')) {
      return;
    }

    try {
      const success = await Database.deleteStory(reportId);
      if (success) {
        // Reload the bookmarked reports
        await this._loadBookmarkedReports();
        this._initMainMap(); // Refresh main map
        alert('Laporan berhasil dihapus dari bookmark');
      } else {
        alert('Gagal menghapus laporan dari bookmark');
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('Terjadi kesalahan saat menghapus bookmark');
    }
  }

  populateBookmarkedReportsListEmpty() {
    const reportsListContainer = this.shadowRoot.getElementById('reports-list');
    if (reportsListContainer) {
      reportsListContainer.innerHTML = `
        <div class="empty-message">
          <h3>Belum ada laporan tersimpan</h3>
          <p>Laporan yang Anda simpan akan muncul di sini</p>
        </div>
      `;
    }
  }

  populateBookmarkedReportsError(message) {
    const reportsListContainer = this.shadowRoot.getElementById('reports-list');
    if (reportsListContainer) {
      reportsListContainer.innerHTML = `
        <div class="error-message">
          <h3>Terjadi Kesalahan</h3>
          <p>${message}</p>
          <button onclick="location.reload()" class="retry-btn">Coba Lagi</button>
        </div>
      `;
    }
  }

  showReportsListLoading() {
    const loadingContainer = this.shadowRoot.getElementById('reports-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = `<div class="loading">Memuat laporan tersimpan...</div>`;
    }
  }

  hideReportsListLoading() {
    const loadingContainer = this.shadowRoot.getElementById('reports-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = '';
    }
  }

  async _initMainMap() {
    try {
      const mainMapContainer = this.shadowRoot.getElementById('mainMap');
      if (!mainMapContainer) return;

      if (this._mainMap) {
        this._mainMap.remove();
      }

      this._mainMap = L.map(mainMapContainer).setView([-2.5489, 118.0149], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this._mainMap);

      const bookmarkedReports = this._getBookmarkedReportsFromStorage();
      bookmarkedReports
        .filter(report => report.lat && report.lon)
        .forEach(report => {
          L.marker([report.lat, report.lon])
            .addTo(this._mainMap)
            .bindPopup(`<b>${report.name || report.title}</b><br>${report.description.substring(0, 50)}...`);
        });

      if (this._mainMapResizeObserver) {
        this._mainMapResizeObserver.disconnect();
      }

      this._mainMapResizeObserver = new ResizeObserver(() => {
        setTimeout(() => {
          if (this._mainMap) {
            this._mainMap.invalidateSize();
          }
        }, 100);
      });
      this._mainMapResizeObserver.observe(mainMapContainer);

    } catch (error) {
      console.error('Error initializing main map:', error);
    }
  }

  _initReportMap(id, lat, lon, title) {
    const mapContainer = this.shadowRoot.getElementById(`report-map-${id}`);
    if (!mapContainer) return;



    const map = L.map(mapContainer).setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([lat, lon]).addTo(map);

    const popupContent = `
      <div style="font-family: 'Poppins', sans-serif; padding: 8px; max-width: 200px;">
        <h3 style="margin: 0 0 5px 0;">${title}</h3>
        <p style="margin: 0;">Latitude: ${lat}</p>
        <p style="margin: 0;">Longitude: ${lon}</p>
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();
  }

  _handleLogout() {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        logout();
        window.location.hash = '#/login';
      });
    } else {
      logout();
      window.location.hash = '#/login';
    }
  }
}