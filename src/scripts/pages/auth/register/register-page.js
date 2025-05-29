export default class RegisterPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.classList.add('auth-transition');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: 100vh;
          padding: 20px;
          box-sizing: border-box;
        }
        
        .form-container {
          background-color:rgb(58, 70, 57);
          padding: 30px;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin: auto;
        }
        
        .form-container:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .form-header h2 {
          color:rgb(149, 207, 147);
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .form-group {
          margin-bottom: 18px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: #eeeeee;
          font-weight: 500;
          font-size: 14px;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px 5px;
          border-radius: 8px;
          border: 2px solidrgb(74, 87, 75);
          background-color:rgb(34, 49, 35);
          color: #eeeeee;
          font-size: 15px;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus {
          border-color:rgb(150, 207, 147);
          box-shadow: 0 0 0 3px rgba(0, 181, 3, 0.2);
          outline: none;
        }
        
        #registerButton {
          background: linear-gradient(135deg,rgb(152, 207, 147) 0%, #6096B4 100%);
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
        
        #registerButton:hover {
          background: linear-gradient(135deg,rgb(176, 205, 214) 0%,rgb(137, 177, 199) 100%);
          transform: translateY(-2px);
        }
        
        .form-footer {
          text-align: center;
          margin-top: 18px;
          color: #9ca3af;
          font-size: 13px;
        }
        
        .form-footer a {
          color: #93BFCF;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .form-footer a:hover {
          color:rgb(147, 207, 159);
          text-decoration: underline;
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
          
          .form-container {
            padding: 25px 15px;
            max-width: 100%;
          }
          
          .form-header h2 {
            font-size: 22px;
          }
        }
      </style>
      <div class="form-container">
        <div class="form-header">
          <h2>Create Account</h2>
        </div>
        <form id="registerForm">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" required placeholder="Enter your full name">
            <div class="error-text" id="nameError">Please enter your name</div>
          </div>
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
          <button type="submit" id="registerButton">Sign Up</button>
          <p id="successMessage"></p>
          <p id="errorMessage"></p>
          <div class="form-footer">
            <p>Already have an account? <a href="#/">Sign in</a></p>
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

    const nameInput = this.shadowRoot.getElementById('name');
    const emailInput = this.shadowRoot.getElementById('email');
    const passwordInput = this.shadowRoot.getElementById('password');
    const nameError = this.shadowRoot.getElementById('nameError');
    const emailError = this.shadowRoot.getElementById('emailError');
    const passwordError = this.shadowRoot.getElementById('passwordError');
    const form = this.shadowRoot.getElementById('registerForm');

    // Realtime validation
    nameInput.addEventListener('input', () => {
      this._validateName(nameInput, nameError);
    });

    emailInput.addEventListener('input', () => {
      this._validateEmail(emailInput, emailError);
    });

    passwordInput.addEventListener('input', () => {
      this._validatePassword(passwordInput, passwordError);
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;

      // Validate before submit
      const isNameValid = this._validateName(nameInput, nameError);
      const isEmailValid = this._validateEmail(emailInput, emailError);
      const isPasswordValid = this._validatePassword(passwordInput, passwordError);

      if (isNameValid && isEmailValid && isPasswordValid && this.onSubmit) {
        this.onSubmit({ name, email, password });
      }
    });
  }

  _validateName(input, errorElement) {
    const isValid = input.value.trim() !== '';
    this._updateValidationState(input, errorElement, isValid, 'Please enter your name');
    return isValid;
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
    this.onSubmit = handler;
  }

  showLoading() {
    const button = this.shadowRoot.getElementById('registerButton');
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Loading...';
  }

  hideLoading() {
    const button = this.shadowRoot.getElementById('registerButton');
    button.disabled = false;
    button.textContent = 'Sign Up';
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
}

