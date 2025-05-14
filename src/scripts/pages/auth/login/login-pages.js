export default class MasukPengguna extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.classList.add('login-animasi-kustom');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: 100vh; /* Menggunakan viewport height */
          padding: 20px;
          box-sizing: border-box;
        }
        
        .kotak-formulir {
          background-color:rgb(44, 80, 45);
          padding: 30px;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 8px 20px rgba(20, 20, 20, 0.35);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin: auto; /* Center horizontally */
        }
        
        .kotak-formulir:hover {
          transform: scale(1.02); /* Efek lebih kecil */
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 20px; /* Lebih kecil */
        }
        
        .form-header h2 {
          color:rgb(147, 207, 147);
          margin: 0;
          font-size: 24px; /* Lebih kecil */
          font-weight: 600;
        }
        
        .form-group {
          margin-bottom: 18px; /* Lebih kecil */
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px; /* Lebih kecil */
          color: #eeeeee;
          font-weight: 500;
          font-size: 14px;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px 5px; /* Lebih kecil */
          border-radius: 8px;
          border: 2px solidrgb(74, 87, 74);
          background-color:rgb(34, 49, 34);
          color: #eeeeee;
          font-size: 15px; /* Lebih kecil */
          transition: all 0.3s ease;
        }
        
        .form-group input:focus {
          border-color:rgb(166, 207, 147);
          box-shadow: 0 0 0 3px rgba(48, 181, 0, 0.2);
          outline: none;
        }
        
        .form-group input::placeholder {
          color:rgb(108, 128, 107);
        }
        
        #loginButton {
          background: linear-gradient(135deg,rgb(147, 207, 155) 0%,rgb(96, 180, 99) 100%);
          color: white;
          border: none;
          padding: 14px; /* Lebih kecil */
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px; /* Lebih kecil */
          font-weight: 600;
          width: 100%;
          margin-top: 8px; /* Lebih kecil */
          transition: all 0.3s ease;
        }
        
        #loginButton:hover {
          background: linear-gradient(135deg,rgb(177, 214, 176) 0%,rgb(137, 199, 141) 100%);
          transform: translateY(-2px);
        }
        
        #loginButton:active {
          transform: translateY(0);
        }
        
        .form-footer {
          text-align: center;
          margin-top: 18px; /* Lebih kecil */
          color:rgb(157, 175, 156);
          font-size: 13px; /* Lebih kecil */
        }
        
        .form-footer a {
          color:rgb(147, 207, 147);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .form-footer a:hover {
          color:rgb(147, 207, 151);
          text-decoration: underline;
        }
        
        #errorMessage {
          color: #ff6b6b;
          margin: 12px 0; /* Lebih kecil */
          padding: 10px; /* Lebih kecil */
          background-color: rgba(255, 107, 107, 0.1);
          border-radius: 8px;
          text-align: center;
          display: none;
          font-size: 13px; /* Lebih kecil */
        }

        #successMessage {
          color:rgb(173, 207, 81); /* Warna hijau untuk pesan sukses */
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
        
        .form-group.invalid input {
          border-color: #ff6b6b;
        }
        
        .form-group.valid input {
          border-color: #51cf66;
        }
        
        @media (max-width: 600px) {
          :host {
            padding: 20px 10px;
          }
          
          .kotak-formulir {
            padding: 25px 15px;
            max-width: 100%;
          }
          
          .form-header h2 {
            font-size: 22px;
          }
        }
      </style>
      <div class="kotak-formulir">
        <div class="form-header">
          <h2>Welcome Back</h2>
        </div>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" required placeholder="Enter your email">
            <div class="error-text" id="emailError">Please enter a valid email address</div>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required minlength="8" placeholder="Enter your password">
            <div class="error-text" id="passwordError">Password must be at least 8 characters</div>
          </div>
          <button type="submit" id="loginButton">Sign In</button>
          <p id="successMessage"></p>
          <p id="errorMessage"></p>
          <div class="form-footer">
            <p>Don't have an account? <a href="#/register">Sign up</a></p>
          </div>
        </form>
      </div>
    `;
  }

  connectedCallback() {
    const link = this.shadowRoot.querySelector('.form-footer a');
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const targetHref = e.currentTarget.getAttribute('href');
    
      if (!document.startViewTransition) {
        window.location.hash = targetHref;
        return;
      }
    
      // Add appropriate class based on destination
      if (targetHref === '#/register' || targetHref === '#/') {
        document.documentElement.classList.add('auth-transition');
      } else if (targetHref === '#/home') {
        document.documentElement.classList.add('home-transition');
      } else if (targetHref === '#/create') {
        document.documentElement.classList.add('create-transition');
      }
    
      const transition = document.startViewTransition(() => {
        window.location.hash = targetHref;
      });
    
      await transition.finished;
      
      // Remove the class after transition
      document.documentElement.classList.remove('auth-transition', 'home-transition', 'create-transition');
    });

    const emailInput = this.shadowRoot.getElementById('email');
    const passwordInput = this.shadowRoot.getElementById('password');
    const emailError = this.shadowRoot.getElementById('emailError');
    const passwordError = this.shadowRoot.getElementById('passwordError');
    const form = this.shadowRoot.getElementById('loginForm');

    // Check for logout success message
    if (localStorage.getItem('showLogoutMessage') === 'true') {
      this.showSuccess('You have been logged out successfully');
      localStorage.removeItem('showLogoutMessage');
    }

    // Realtime email validation
    emailInput.addEventListener('input', () => {
      this._validateEmail(emailInput, emailError);
    });

    // Realtime password validation
    passwordInput.addEventListener('input', () => {
      this._validatePassword(passwordInput, passwordError);
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const password = passwordInput.value;

      // Validate before submit
      const isEmailValid = this._validateEmail(emailInput, emailError);
      const isPasswordValid = this._validatePassword(passwordInput, passwordError);

      if (isEmailValid && isPasswordValid && this.onSubmit) {
        this.onSubmit({ email, password });
      }
    });
  }

  _validateEmail(input, errorElement) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(input.value);

    this._updateValidationState(input, errorElement, isValid, 'Please enter a valid email address');
    return isValid;
  }

  _validatePassword(input, errorElement) {
    const isValid = input.value.length >= 8;

    this._updateValidationState(input, errorElement, isValid, 'Password must be at least 8 characters');
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
    this.onSubmit = (data) => {
      handler(data);
    };
  }

  showSuccess(message) {
    const successElement = this.shadowRoot.getElementById('successMessage');
    const errorElement = this.shadowRoot.getElementById('errorMessage');

    errorElement.style.display = 'none';
    successElement.textContent = message;
    successElement.style.display = 'block';
  }

  showError(message) {
    const successElement = this.shadowRoot.getElementById('successMessage');
    const errorElement = this.shadowRoot.getElementById('errorMessage');

    successElement.style.display = 'none';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  showLoading() {
    const button = this.shadowRoot.getElementById('loginButton');
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Loading...';
  }

  hideLoading() {
    const button = this.shadowRoot.getElementById('loginButton');
    button.disabled = false;
    button.textContent = 'Sign In';
  }
}
