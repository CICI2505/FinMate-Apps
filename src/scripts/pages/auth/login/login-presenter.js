import { login, putAccessToken } from '../../../data/api';
import { navigateToUrl } from '../../../routes/routes';

const LoginPresenter = {
  async init({ view, navigateTo = '/home' }) {
    this._view = view;
    this._navigateTo = navigateTo;

    requestAnimationFrame(() => {
      this._view.setSubmitHandler(this._handleSubmit.bind(this));
    });
  },

  async _handleSubmit({ email, password }) {
    try {
      this._view.showLoading();
      const { error, data } = await login({ email, password });
  
      if (error) {
        this._view.showError('Email atau password salah');
        return;
      }
  
      putAccessToken(data.token);
      this._view.showSuccess('Login successful! Redirecting...');
      
      setTimeout(async () => {
        if (!document.startViewTransition) {
          navigateToUrl(this._navigateTo);
          return;
        }
        
        document.documentElement.classList.add('home-transition');
        
        await document.startViewTransition(() => {
          navigateToUrl(this._navigateTo);
        }).finished;
        
        document.documentElement.classList.remove('home-transition');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      this._view.showError('Terjadi kesalahan saat login');
    } finally {
      this._view.hideLoading();
    }
  }
};

export default LoginPresenter;