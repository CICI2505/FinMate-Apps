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

const Database = {
    async putReport(report) {
        if (!Object.hasOwn(report, 'id')) {
            throw new Error('`id` is required to save.');
        }
        return (await dbPromise).put(OBJECT_STORE_NAME, report);
    },

    async saveStory(story) {
        if (!Object.hasOwn(story, 'id')) {
            throw new Error('`id` is required to save.');
        }
        try {
            const db = await dbPromise;
            await db.put(OBJECT_STORE_NAME, story);
            console.log('Story saved successfully:', story);
            return true;
        } catch (error) {
            console.error('Failed to save story:', error);
            return false;
        }
    },

    async putReport(report) {
        if (!Object.hasOwn(report, 'id')) {
            throw new Error('`id` is required to save.');
        }
        try {
            const db = await dbPromise;
            await db.put(OBJECT_STORE_NAME, report);
            console.log('Report saved successfully:', report);
            return report;
        } catch (error) {
            console.error('Failed to save report:', error);
            throw error;
        }
    },

   async getAllReports() {
    try {
        const db = await dbPromise;
        const reports = await db.getAll(OBJECT_STORE_NAME);
        console.log('Retrieved reports from database:', reports);
        return reports;  // langsung return hasil yang sudah didapat
    } catch (error) {
        console.error('Failed to get saved reports:', error);
        return [];
    }
},


    async getAllSavedStories() {
        try {
            const db = await dbPromise;
            const stories = await db.getAll(OBJECT_STORE_NAME);
            console.log('Retrieved stories from database:', stories);
            return stories;
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
    },

    async getReportById(id) {
        if (!id) {
            throw new Error('`id` is required.');
        }
        return (await dbPromise).get(OBJECT_STORE_NAME, id);
    },
};

export default Database;