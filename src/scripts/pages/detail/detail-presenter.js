import { fetchWithToken } from "../../data/api";
import StoryDatabase from '../../data/database';

const DetailPresenter = {
    async init({ view, storyId }) {
        this._view = view;
        this._storyId = storyId;

        await this._fetchStoryDetail();
    },

    async _fetchStoryDetail() {
        try {
            const urlParts = window.location.hash.split('/');
            const caseSensitiveId = urlParts[urlParts.length - 1];

            const response = await fetchWithToken(`https://story-api.dicoding.dev/v1/stories/${caseSensitiveId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch story details');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.message || 'Failed to load story');
            }

            this._view.displayStory(data.story);

        } catch (error) {
            console.error('Error fetching story details:', error);
            this._view.showError(error.message || 'Failed to load story');

            if (error.message.includes('401')) {
                localStorage.removeItem('accessToken');
                window.location.hash = '#/';
            }
        }
    },

    async toggleBookmark(story) {
        try {
            const isSaved = await StoryDatabase.isStorySaved(story.id);

            if (isSaved) {
                await StoryDatabase.deleteStory(story.id);
                return false;
            } else {
                await StoryDatabase.saveStory(story);
                return true;
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            throw error;
        }
    }
};

export default DetailPresenter;