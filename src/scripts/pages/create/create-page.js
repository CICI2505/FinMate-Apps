import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default class CreatePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._coordinates = null;
    this._map = null;
    this._marker = null;
    this._resizeObserver = null;
    this._stream = null;
    this._photoData = null;
    this._initTemplate();

    this.classList.add('create-page');
  }

  _initTemplate() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          min-height: 100vh;
          padding: 20px;
          box-sizing: border-box;
          overflow-y: auto;
          background-color:rgb(48, 91, 4);
          padding: 30px 20px;
        }
        
        .form-container {
          background-color:rgb(73, 88, 67);
          padding: 40px;
          border-radius: 16px;
          width: calc(100% - 40px);
          max-width: 800px;
          min-height: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin: 20px auto;
          position: relative;
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 30px;
          margin-top: 10px;
        }
        
        .form-header h2 {
          color:rgb(167, 207, 147);
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .form-group {
          margin-bottom: 18px;
          flex-shrink: 0;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: #eeeeee;
          font-weight: 500;
          font-size: 14px;
        }
        
        .form-group textarea,
        .form-group input {
          width: 100%;
          padding: 14px 8px;
          border-radius: 8px;
          border: 2px solidrgb(74, 87, 74);
          background-color:rgb(37, 49, 34);
          color: #eeeeee;
          font-size: 16px;
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
        }
        
        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .form-group textarea:focus,
        .form-group input:focus {
          border-color:rgb(163, 207, 147);
          box-shadow: 0 0 0 3px rgba(164, 207, 147, 0.2);
          outline: none;
        }
        
        .image-preview {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          margin-top: 10px;
          display: none;
          background-color:rgb(36, 49, 34);
        }

        .photo-options {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .photo-option-btn {
          flex: 1;
          background:rgb(58, 70, 57);
          color: white;
          border: 1px solidrgb(77, 87, 74);
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .photo-option-btn:hover {
          background:rgb(74, 87, 74);
        }

        .photo-option-btn svg {
          flex-shrink: 0;
        }
        
        .camera-btn {
          background: linear-gradient(135deg,rgb(152, 207, 147) 0%,rgb(118, 180, 96) 100%);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          width: 100%;
          margin-top: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .camera-btn:hover {
          background: linear-gradient(135deg, #BDCDD6 0%,rgb(154, 207, 147) 100%);
          transform: translateY(-2px);
        }

        .camera-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .camera-container {
          width: 100%;
          max-width: 500px;
          position: relative;
        }

        .camera-preview {
          width: 100%;
          max-height: 70vh;
          object-fit: contain;
          background: #000;
        }

        .camera-controls {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }

        .capture-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #fff;
          border: none;
          cursor: pointer;
        }

        .close-camera-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
        }

        .close-camera-btn svg {
          width: 24px;
          height: 24px;
          stroke: #fff;
        }
        
        .map-container {
          height: 400px;
          min-height: 400px;
          width: calc(100% - 4px);
          border-radius: 8px;
          margin: 20px 0;
          overflow: hidden;
          background-color: #222831;
          position: relative;
          flex-grow: 1;
          border: 2px solid #4a4e57;
        }

        .leaflet-container {
          background: #222831 !important;
          height: 100% !important;
          width: 100% !important;
        }
        
        .leaflet-tile-container img {
          position: absolute;
          left: 0;
          top: 0;
          image-rendering: crisp-edges;
        }

        .location-btn {
          background: linear-gradient(135deg,rgb(121, 180, 96) 0%, #93BFCF 100%);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          width: 100%;
          margin-top: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .location-btn:hover {
          background: linear-gradient(135deg,rgb(148, 207, 147) 0%,rgb(190, 214, 189) 100%);
          transform: translateY(-2px);
        }
        
        #submitButton {
          background: linear-gradient(135deg,rgb(96, 180, 114) 0%,rgb(164, 207, 147) 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          width: 100%;
          margin-top: 8px;
          transition: all 0.3s ease;
        }
        
        #submitButton:hover {
          background: linear-gradient(135deg,rgb(156, 207, 147) 0%, #BDCDD6 100%);
          transform: translateY(-2px);
        }

        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
        
        .close-btn svg {
          width: 18px;
          height: 18px;
          stroke: #eeeeee;
          stroke-width: 2.5px;
        }
        
        #errorMessage {
          color: #ff6b6b;
          margin: 12px 0;
          padding: 10px;
          background-color: rgba(255, 107, 107, 0.1);
          border-radius: 8px;
          text-align: center;
          display: none;
          font-size: 13px;
        }

        #successMessage {
          color: #51cf66; 
          margin: 12px 0;
          padding: 10px;
          background-color: rgba(81, 207, 102, 0.1);
          border-radius: 8px;
          text-align: center;
          display: none;
          font-size: 13px;
        }

        .error-text {
          color: #ff6b6b;
          font-size: 12px;
          margin-top: 4px;
          display: none;
        }
        
        .form-group.invalid textarea,
        .form-group.invalid input {
          border-color: #ff6b6b;
        }
        
        .form-group.valid textarea,
        .form-group.valid input {
          border-color: #51cf66;
        }
        
        .coordinates-info {
          color: #9ca3af;
          font-size: 12px;
          margin-top: 5px;
          text-align: center;
        }
        
        @media (max-width: 1024px) {
          :host {
            padding: 20px 15px;
          }
          
          .form-container {
            padding: 30px;
            max-width: calc(100vw - 30px);
          }
          
          .map-container {
            height: 350px;
            min-height: 350px;
          }
        }

        @media (max-width: 768px) {
          :host {
            padding: 15px 10px;
          }
          
          .form-container {
            padding: 25px;
            max-width: calc(100vw - 20px);
          }
          
          .map-container {
            height: 300px;
            min-height: 300px;
          }
          
          .form-header h2 {
            font-size: 22px;
          }
          
          .form-group textarea,
          .form-group input {
            padding: 12px 8px;
            font-size: 15px;
          }
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .loading-gradient {
          background: linear-gradient(135deg,rgb(123, 180, 96) 0%,rgb(153, 207, 147) 50%, #6096B4 100%);
          background-size: 200% 200%;
          animation: gradientFlow 2s ease infinite;
        }

        /* Add to HomePage styles */
        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .story-card {
          view-timeline-name: --card;
          view-timeline-axis: block;
          animation: cardEntrance linear;
          animation-timeline: --card;
          animation-range: entry 25% cover 50%;
        }

        @media (max-width: 685px) {
          :host {
            padding: 10px;
          }
          
          .form-container {
            padding: 20px 15px;
            max-width: calc(100vw - 20px);
          }
          
          .map-container {
            height: 250px;
            min-height: 250px;
          }
          
          .form-header h2 {
            font-size: 20px;
          }
          
          .camera-btn,
          .location-btn,
          #submitButton {
            padding: 10px;
            font-size: 14px;
          }
          
          .form-group label {
            font-size: 13px;
          }
          
          .coordinates-info {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .form-container {
            padding: 15px 10px;
          }
          
          .map-container {
            height: 200px;
            min-height: 200px;
          }
          
          .close-btn {
            top: 10px;
            right: 10px;
            width: 28px;
            height: 28px;
          }
        }
      </style>
      <div class="form-container">
        <button class="close-btn" id="closeButton">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="form-header">
          <h2>Create New Story</h2>
        </div>
        <form id="storyForm">
          <div class="form-group">
            <label for="description">Story Description</label>
            <textarea id="description" required placeholder="Tell your story..."></textarea>
            <div class="error-text" id="descriptionError">Please enter your story description</div>
          </div>
          
          <div class="form-group">
            <label for="photo">Story Photo</label>
            <div class="photo-options">
              <button type="button" class="photo-option-btn" id="cameraButton">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                Take Photo
              </button>
              <button type="button" class="photo-option-btn" id="uploadButton">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload Photo
              </button>
            </div>
            <input type="file" id="fileInput" accept="image/*" style="display: none;">
            <img id="imagePreview" class="image-preview" alt="Preview">
            <div class="error-text" id="photoError">Please provide a photo</div>
          </div>
          
          <div class="form-group">
            <label>Location (Optional)</label>
            <button type="button" class="location-btn" id="locationButton">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Select Location
            </button>
            <div class="map-container" id="map"></div>
            <p class="coordinates-info" id="coordinatesInfo">No location selected</p>
          </div>
          
          <button type="submit" id="submitButton">Publish Story</button>
          <p id="successMessage"></p>
          <p id="errorMessage"></p>
        </form>
      </div>
    `;
  }

  connectedCallback() {
    if (document.startViewTransition) {
      document.documentElement.style.viewTransitionName = 'create-page';
      this.style.contain = 'layout paint';
    }

    this._initMap();
    this._initForm();

    this.shadowRoot.getElementById('closeButton').addEventListener('click', async () => {
      if (!document.startViewTransition) {
        const closeBtn = this.shadowRoot.getElementById('closeButton');
        closeBtn.animate([
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(0.9)', opacity: 0.8 }
        ], {
          duration: 200,
          easing: 'ease-out'
        });
        
        await this.animate([
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(20px)' }
        ], {
          duration: 300,
          easing: 'ease-in-out'
        }).finished;
        
        window.location.hash = '#/home';
        return;
      }

      document.documentElement.classList.add('create-to-home-transition');

      const transition = document.startViewTransition(() => {
        window.location.hash = '#/home';
      });

      await transition.finished;

      document.documentElement.classList.remove('create-to-home-transition');
    });

    this.shadowRoot.getElementById('cameraButton').addEventListener('click', () => {
      this._openCameraModal();
    });

    this.shadowRoot.getElementById('uploadButton').addEventListener('click', () => {
      this.shadowRoot.getElementById('fileInput').click();
    });
  
    this.shadowRoot.getElementById('fileInput').addEventListener('change', (e) => {
      this._handleFileUpload(e);
    });
  }

  _handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    if (!file.type.match('image.*')) {
      this.showError('Please select an image file');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e) => {
      this._photoData = e.target.result;
      const imagePreview = this.shadowRoot.getElementById('imagePreview');
      imagePreview.src = this._photoData;
      imagePreview.style.display = 'block';
  
      const photoGroup = this.shadowRoot.querySelector('.form-group:nth-child(2)');
      const photoError = this.shadowRoot.getElementById('photoError');
  
      photoGroup.classList.remove('invalid');
      photoGroup.classList.add('valid');
      photoError.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  async _openCameraModal() {
    const modal = document.createElement('div');
    modal.className = 'camera-modal';

    modal.animate([
      { opacity: 0, transform: 'scale(0.9)' },
      { opacity: 1, transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });

    const cameraContainer = document.createElement('div');
    cameraContainer.className = 'camera-container';

    const video = document.createElement('video');
    video.className = 'camera-preview';
    video.autoplay = true;
    video.playsInline = true;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-camera-btn';
    closeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    const controls = document.createElement('div');
    controls.className = 'camera-controls';

    const captureBtn = document.createElement('button');
    captureBtn.className = 'capture-btn';
    captureBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
    `;

    controls.appendChild(captureBtn);
    cameraContainer.appendChild(closeBtn);
    cameraContainer.appendChild(video);
    cameraContainer.appendChild(controls);
    modal.appendChild(cameraContainer);

    this.shadowRoot.appendChild(modal);

    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      video.srcObject = this._stream;

      closeBtn.addEventListener('click', () => this._closeCameraModal(modal));
      captureBtn.addEventListener('click', () => this._capturePhoto(video, modal));

    } catch (error) {
      console.error('Error accessing camera:', error);
      this.showError('Could not access camera. Please check permissions.');
      this.shadowRoot.removeChild(modal);
    }
  }

  _closeCameraModal(modal) {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }

    if (modal && modal.parentNode) {
      this.shadowRoot.removeChild(modal);
    }
  }

  _capturePhoto(videoElement, modal) {
    const captureBtn = modal.querySelector('.capture-btn');
    captureBtn.animate([
      { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255,255,255,0.4)' },
      { transform: 'scale(0.95)', boxShadow: '0 0 0 10px rgba(255,255,255,0)' }
    ], {
      duration: 500,
      easing: 'ease-out'
    });

    const canvas = document.createElement('canvas');
    const video = videoElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    this._photoData = canvas.toDataURL('image/jpeg', 0.8);

    const imagePreview = this.shadowRoot.getElementById('imagePreview');
    imagePreview.src = this._photoData;
    imagePreview.style.display = 'block';

    const photoGroup = this.shadowRoot.querySelector('.form-group:nth-child(2)');
    const photoError = this.shadowRoot.getElementById('photoError');

    if (this._photoData) {
      photoGroup.classList.remove('invalid');
      photoGroup.classList.add('valid');
      photoError.style.display = 'none';
    } else {
      photoGroup.classList.remove('valid');
      photoGroup.classList.add('invalid');
      photoError.style.display = 'block';
    }

    this._closeCameraModal(modal);
  }

  _initMap() {
    const mapContainer = this.shadowRoot.getElementById('map');
    const locationButton = this.shadowRoot.getElementById('locationButton');
    const coordinatesInfo = this.shadowRoot.getElementById('coordinatesInfo');

    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    this._map = L.map(mapContainer, {
      center: [-2.5489, 118.0149],
      zoom: 5,
      zoomControl: true,
      attributionControl: false
    });

    setTimeout(() => {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true
      }).addTo(this._map);

      setTimeout(() => {
        this._map.invalidateSize();
      }, 100);
    }, 100);

    this._map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this._updateLocation(lat, lng, coordinatesInfo);
    });

    locationButton.addEventListener('click', () => {
      this._getCurrentLocation(coordinatesInfo);
    });

    this._resizeObserver = new ResizeObserver(() => {
      if (this._map) {
        setTimeout(() => {
          this._map.invalidateSize();
        }, 100);
      }
    });
    this._resizeObserver.observe(mapContainer);
  }

  _updateLocation(lat, lon, coordinatesInfo) {
    this._coordinates = { lat, lon };

    if (this._marker) {
      this._marker.setLatLng([lat, lon]);
    } else {
      this._marker = L.marker([lat, lon]).addTo(this._map);
    }

    coordinatesInfo.textContent = `Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`;
    coordinatesInfo.style.color = '#93BFCF';

    this._map.setView([lat, lon], 15);
  }

  _getCurrentLocation(coordinatesInfo) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this._updateLocation(latitude, longitude, coordinatesInfo);
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.showError('Tidak bisa mendapatkan lokasi. Silakan pilih manual di peta.');
        }
      );
    } else {
      this.showError('Browser tidak mendukung geolokasi. Silakan pilih manual di peta.');
    }
  }

  _initForm() {
    const form = this.shadowRoot.getElementById('storyForm');
    const descriptionInput = this.shadowRoot.getElementById('description');
    const descriptionError = this.shadowRoot.getElementById('descriptionError');

    descriptionInput.addEventListener('input', () => {
      this._validateDescription(descriptionInput, descriptionError);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const description = descriptionInput.value;

      const photoGroup = this.shadowRoot.querySelector('.form-group:nth-child(2)');
      const photoError = this.shadowRoot.getElementById('photoError');

      const isDescriptionValid = this._validateDescription(descriptionInput, descriptionError);
      const isPhotoValid = this._photoData !== null;

      if (!isPhotoValid) {
        photoGroup.classList.remove('valid');
        photoGroup.classList.add('invalid');
        photoError.style.display = 'block';
      }

      if (isDescriptionValid && isPhotoValid && this.onSubmit) {
        const blob = await fetch(this._photoData).then(res => res.blob());
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

        this.onSubmit({
          description,
          photo: file,
          ...this._coordinates
        });
      }
    });
  }

  _validateDescription(input, errorElement) {
    const isValid = input.value.trim() !== '';
    this._updateValidationState(input, errorElement, isValid, 'Please enter your story description');
    return isValid;
  }

  _validatePhoto(input, errorElement) {
    const isValid = input.files && input.files.length > 0;
    const formGroup = input.parentElement;

    if (isValid) {
      formGroup.classList.remove('invalid');
      formGroup.classList.add('valid');
      errorElement.style.display = 'none';
    } else {
      formGroup.classList.remove('valid');
      formGroup.classList.add('invalid');
      errorElement.style.display = 'block';
    }

    return isValid;
  }

  _updateValidationState(input, errorElement, isValid, errorMessage) {
    const formGroup = input.parentElement;

    if (input.value === '') {
      formGroup.classList.remove('invalid', 'valid');
      errorElement.style.display = 'none';
    } else if (isValid) {
      formGroup.classList.remove('invalid');
      formGroup.classList.add('valid');
      errorElement.style.display = 'none';
    } else {
      formGroup.classList.remove('valid');
      formGroup.classList.add('invalid');
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
  }

  setSubmitHandler(handler) {
    this.onSubmit = handler;
  }

  showLoading() {
    const button = this.shadowRoot.getElementById('submitButton');
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Publishing...';
  }

  hideLoading() {
    const button = this.shadowRoot.getElementById('submitButton');
    button.disabled = false;
    button.textContent = 'Publish Story';
  }

  showSuccess(message) {
    const successElement = this.shadowRoot.getElementById('successMessage');
    const errorElement = this.shadowRoot.getElementById('errorMessage');

    errorElement.style.display = 'none';
    successElement.textContent = message;
    successElement.style.display = 'block';

    setTimeout(() => {
      this._resetForm();
    }, 2000);
  }

  showError(message) {
    const successElement = this.shadowRoot.getElementById('successMessage');
    const errorElement = this.shadowRoot.getElementById('errorMessage');

    successElement.style.display = 'none';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  _resetForm() {
    const form = this.shadowRoot.getElementById('storyForm');
    form.reset();

    const imagePreview = this.shadowRoot.getElementById('imagePreview');
    imagePreview.style.display = 'none';
    imagePreview.src = '';

    this._coordinates = null;
    if (this._marker) {
      this._map.removeLayer(this._marker);
      this._marker = null;
    }
    this.shadowRoot.getElementById('coordinatesInfo').textContent = 'No location selected';
    this.shadowRoot.getElementById('coordinatesInfo').style.color = '#9ca3af';

    const formGroups = this.shadowRoot.querySelectorAll('.form-group');
    formGroups.forEach(group => {
      group.classList.remove('valid', 'invalid');
    });

    const errorTexts = this.shadowRoot.querySelectorAll('.error-text');
    errorTexts.forEach(error => {
      error.style.display = 'none';
    });

    this.shadowRoot.getElementById('successMessage').style.display = 'none';
    this.shadowRoot.getElementById('errorMessage').style.display = 'none';
    this._photoData = null;
  }

  disconnectedCallback() {
    if (document.startViewTransition) {
      document.documentElement.style.viewTransitionName = 'create-page';
      this.style.contain = 'layout paint';
    }

    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    if (this._marker) {
      this._marker.remove();
      this._marker = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
}