import { dom } from '../core/dom.js';
import { utils } from '../core/utils.js';

export const similarManager = {
    update(sourceId) {
        if (!sourceId) return;

        dom.similarImagesContainer.empty();
        const row = $('<div>').addClass('row');
        dom.similarImagesContainer.append(row);

        const relatedIds = utils.getRelatedIds(sourceId);

        relatedIds.forEach((relatedId, i) => {
            const timestamp = new Date().getTime() + i;
            const imageUrl = `https://picsum.photos/id/${relatedId}/300/200?_=${timestamp}`;

            const col = $('<div>').addClass('col-md-2 col-sm-4 col-6 mb-3');
            const imgContainer = $('<div>')
                .addClass('similar-image-container d-flex justify-content-center align-items-center')
                .css({ height: '150px', backgroundColor: '#f8f9fa', cursor: 'pointer', borderRadius: '4px', overflow: 'hidden' })
                .on('click', () => window.open(`https://picsum.photos/id/${relatedId}/800/500`, '_blank'));

            const spinner = $('<div>').addClass('spinner-border text-primary spinner-border-sm').css('display', 'block');
            imgContainer.append(spinner);

            const img = $('<img>')
                .addClass('img-fluid')
                .css({ objectFit: 'cover', height: '100%', width: '100%', display: 'none' })
                .attr('src', imageUrl)
                .on('load error', function (e) {
                    $(this).css('display', 'block');
                    $(this).parent().find('.spinner-border').remove();

                    if (e.type === "error") {
                        $(this).attr('src',
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23666" text-anchor="middle">Erro</text></svg>'
                        );
                    }
                });

            imgContainer.append(img);
            col.append(imgContainer);
            row.append(col);
        });
    }
};
