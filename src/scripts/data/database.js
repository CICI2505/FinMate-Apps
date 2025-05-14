import { openDB } from 'idb';

const DATABASE_NAME = 'storyapps';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade: (database) => {
        database.createObjectStore(OBJECT_STORE_NAME, {
            keyPath: 'id',
        });
    },
});

const StoryDatabase = {
    async saveStory(story) {
        try {
            const db = await dbPromise;
            await db.put(OBJECT_STORE_NAME, story);
            return true;
        } catch (error) {
            console.error('Failed to save story:', error);
            return false;
        }
    },

    async getAllSavedStories() {
        try {
            const db = await dbPromise;
            return await db.getAll(OBJECT_STORE_NAME);
        } catch (error) {
            console.error('Failed to get saved stories:', error);
            return [];
        }
    },

    async getStoryById(id) {
        try {
            const db = await dbPromise;
            return await db.get(OBJECT_STORE_NAME, id);
        } catch (error) {
            console.error('Failed to get story by id:', error);
            return null;
        }
    },

    async deleteStory(id) {
        try {
            const db = await dbPromise;
            await db.delete(OBJECT_STORE_NAME, id);
            return true;
        } catch (error) {
            console.error('Failed to delete story:', error);
            return false;
        }
    },

    async isStorySaved(id) {
        try {
            const db = await dbPromise;
            const story = await db.get(OBJECT_STORE_NAME, id);
            return !!story;
        } catch (error) {
            console.error('Failed to check if story is saved:', error);
            return false;
        }
    }
};

export default StoryDatabase;