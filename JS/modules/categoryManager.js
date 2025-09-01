import { config } from '../config/config.js';
import { state } from '../core/state.js';
import { dom } from '../core/dom.js';
import { carouselManager } from './carouselManager.js';

export const categoryManager = {
    init() {
        dom.categoryButtons.on('click', function () {
            dom.categoryButtons.removeClass('active');
            $(this).addClass('active');

            state.currentCategory = $(this).data('category');
            if (!state.usedIds[state.currentCategory]) {
                state.usedIds[state.currentCategory] = {};
            }

            state.currentCategoryIds = state.currentCategory !== "all"
                ? config.categoryToIds[state.currentCategory] || []
                : [];

            carouselManager.clear();
            carouselManager.loadMoreImages();
        });
    }
};
