import { config } from '../config/config.js';
import { state } from './state.js';

export const utils = {
    getRandomId() {
        const { currentCategory, currentCategoryIds, usedIds } = state;
        if (currentCategory === "all") {
            return Math.floor(Math.random() * 1000);
        }

        if (currentCategoryIds.length === 0) {
            console.warn(`Nenhum ID disponível para categoria ${currentCategory}`);
            return Math.floor(Math.random() * 1000);
        }

        const allUsed = currentCategoryIds.every(id => usedIds[currentCategory]?.[id]);
        if (allUsed) usedIds[currentCategory] = {};

        let availableIds = currentCategoryIds.filter(id => !usedIds[currentCategory][id]);
        if (availableIds.length === 0) availableIds = currentCategoryIds;

        const selectedId = availableIds[Math.floor(Math.random() * availableIds.length)];
        usedIds[currentCategory][selectedId] = true;

        return selectedId;
    },

    getRelatedIds(sourceId) {
        const { currentCategory, currentCategoryIds } = state;
        if (currentCategory === "all") {
            return Array.from({ length: config.similarImagesCount }, () =>
                Math.floor(Math.random() * 1000)
            );
        }

        let availableIds = currentCategoryIds.filter(id => id !== sourceId);
        const relatedIds = [];

        for (let i = 0; i < config.similarImagesCount; i++) {
            if (availableIds.length > 0) {
                const idx = Math.floor(Math.random() * availableIds.length);
                relatedIds.push(availableIds.splice(idx, 1)[0]);
            } else {
                relatedIds.push(currentCategoryIds[Math.floor(Math.random() * currentCategoryIds.length)]);
            }
        }
        return relatedIds;
    }
};
