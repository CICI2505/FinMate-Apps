import { addNewStory } from '../../data/api';
import { navigateToUrl } from '../../routes/routes';

const CreatePresenter = {
    init({ view }) {
        this._view = view;
        this._view.setSubmitHandler(this._submitHandler.bind(this));
    },

    async _submitHandler({ description, photo, lat, lon }) {
        try {
            this._view.showLoading();

            const formData = new FormData();
            formData.append('description', description);
            formData.append('photo', photo);

            if (lat && lon) {
                formData.append('lat', lat);
                formData.append('lon', lon);
            }

            const response = await addNewStory({ formData });

            if (response.error) {
                throw new Error(response.message);
            }

            this._view.showSuccess('Story published successfully!');
            setTimeout(() => navigateToUrl('/home'), 1500);

        } catch (error) {
            console.error('Error:', error);
            this._view.showError(error.message);
        } finally {
            this._view.hideLoading();
        }
    }
};

export default CreatePresenter;