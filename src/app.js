import { config } from './config/config.js';
import { state } from './core/state.js';
import { dom } from './core/dom.js';
import { carouselManager } from './modules/carouselManager.js';
import { categoryManager } from './modules/categoryManager.js';
import './style.css';

const App = {
    init() {
        categoryManager.init();
        carouselManager.init();

        setInterval(() => {
            const activeIndex = dom.carouselInner.children('.active').index();
            const totalItems = dom.carouselInner.children('.carousel-item').length;

            if (totalItems - activeIndex <= config.preloadThreshold && !state.isLoading) {
                carouselManager.loadMoreImages();
            }
        }, 5000);
    }
};

$(function() {
    App.init();
});
