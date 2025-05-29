import { fetchWithToken } from "../../data/api";

const HomePresenter = {
    async init({ view, navigateTo }) {
        this._view = view;
        this._navigateTo = navigateTo;
        await this._showStories();

        this._view.setNavigateHandler(this._navigateTo);
    },

    async _showStories() {
        try {
            const response = await fetchWithToken('https://story-api.dicoding.dev/v1/stories?location=1');

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            this._view.displayStories(data.listStory);

            this._view.initMainMap(data.listStory);

        } catch (error) {
            console.error('Error:', error);
            this._view.showError(error.message);

            if (error.message.includes('401')) {
                this._view.handleLogout();
            }
        }
    }
};

export default HomePresenter;