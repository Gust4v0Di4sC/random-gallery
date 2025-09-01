import { config } from '../config/config.js';
import { state } from '../core/state.js';
import { dom } from '../core/dom.js';
import { utils } from '../core/utils.js';
import { similarManager } from './similarManager.js';

export const carouselManager = {
    init() {
        this.loadMoreImages();

        dom.carousel.on('slide.bs.carousel', e => {
            const currentIndex = $(e.relatedTarget).index();
            const totalSlides = dom.carouselInner.children('.carousel-item').length;

            if (totalSlides - currentIndex <= config.preloadThreshold) {
                this.loadMoreImages();
            }

            similarManager.update($(e.relatedTarget).data('id'));
        });

        $('.carousel-control-next').on('click', () => {
            const activeItem = dom.carouselInner.children('.active');
            const totalSlides = dom.carouselInner.children('.carousel-item').length;
            const currentIndex = activeItem.index();

            if (totalSlides - currentIndex <= config.preloadThreshold) {
                this.loadMoreImages();
            }
        });
    },

    clear() {
        dom.carouselInner.empty();
        state.totalLoadedImages = 0;
        state.isLoading = false;
    },

    loadMoreImages() {
        if (state.isLoading) return;
        state.isLoading = true;

        let loadedCount = 0;
        for (let i = 0; i < config.perPage; i++) {
            const imageId = utils.getRandomId();
            const timestamp = new Date().getTime() + i;
            const imageUrl = `https://picsum.photos/id/${imageId}/800/500?_=${timestamp}`;

            const carouselItem = $('<div>')
                .addClass('carousel-item')
                .attr('data-index', state.totalLoadedImages + i)
                .attr('data-id', imageId);

            if (state.totalLoadedImages === 0 && i === 0) carouselItem.addClass('active');

            const imgContainer = $('<div>')
                .addClass('fixed-size-container d-flex justify-content-center align-items-center')
                .css({ height: '500px', backgroundColor: '#f8f9fa' });

            const spinner = $('<div>').addClass('spinner-border text-primary').css('display', 'block');
            imgContainer.append(spinner);
            carouselItem.append(imgContainer);
            dom.carouselInner.append(carouselItem);

            const img = $('<img>')
                .addClass('d-block w-100 fixed-size-image')
                .css({ objectFit: 'cover', height: '100%', display: 'none' })
                .attr('src', imageUrl)
                .on('load error', function (e) {
                    $(this).css('display', 'block');
                    $(this).parent().find('.spinner-border').remove();

                    if (e.type === "error") {
                        $(this).attr('src',
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="%23666" text-anchor="middle">Imagem não disponível</text></svg>'
                        );
                    }

                    loadedCount++;
                    if (loadedCount === config.perPage) {
                        state.totalLoadedImages += config.perPage;
                        state.isLoading = false;

                        if (state.totalLoadedImages === config.perPage) {
                            dom.carousel.carousel({ interval: 5000, wrap: true });
                            similarManager.update(dom.carouselInner.children('.carousel-item').first().data('id'));
                        }
                    }
                });

            imgContainer.append(img);
        }
    }
};
