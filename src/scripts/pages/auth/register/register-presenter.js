import { register } from '../../../data/api';
import { navigateToUrl } from '../../../routes/routes';

const RegisterPresenter = {
  async init({ view, navigateTo = '/' }) {
    this._view = view;
    this._navigateTo = navigateTo;

    this._view.setSubmitHandler(this._handleSubmit.bind(this));
  },

  async _handleSubmit({ name, email, password }) {
    try {
      this._view.showLoading();
      const { error } = await register({ name, email, password });

      if (error) {
        this._view.showError('Registration failed. Email may already be in use.');
        return;
      }

      this._view.showSuccess('Registration successful!');

      setTimeout(async () => {
        if (!document.startViewTransition) {
          navigateToUrl(this._navigateTo);
          return;
        }
        
        document.documentElement.style.viewTransitionName = 'none';
        document.documentElement.classList.remove('back-transition');
        
        await document.startViewTransition(() => {
          navigateToUrl(this._navigateTo);
        }).finished;
      }, 1500);
    } catch (error) {
      this._view.showError('An error occurred during registration');
    } finally {
      this._view.hideLoading();
    }
  },
};

export default RegisterPresenter;