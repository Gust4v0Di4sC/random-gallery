$(document).ready(function() {
    const accessKey = 'urWRR4ftlzin2jdcf9pCDXDN857y8Qc7hmqneEH3bdU'; // Substitua pela sua chave de acesso do Unsplash
    let page = 1; // Contador de páginas para carregar mais imagens
    const perPage = 5; // Número de imagens por requisição

    function fetchImages() {
        const apiUrl = `https://api.unsplash.com/photos/random?client_id=${accessKey}&count=${perPage}&page=${page}`;

        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(data) {
                const carouselInner = $('#carousel-inner');

                data.forEach((image, index) => {
                    const carouselItem = $('<div>').addClass('carousel-item');
                    if (carouselInner.children().length === 0 && index === 0) {
                        carouselItem.addClass('active');
                    }

                    const img = $('<img>').attr('src', image.urls.regular).addClass('d-block w-100');
                    carouselItem.append(img);
                    carouselInner.append(carouselItem);
                });

                page++; // Incrementa a página para a próxima requisição
            },
            error: function(error) {
                console.error('Erro ao buscar imagens:', error);
            }
        });
    }

    // Carrega as primeiras imagens ao iniciar
    fetchImages();

    // Carrega mais imagens quando o carrossel chega ao final
    $('#carouselExample').on('slid.bs.carousel', function() {
        const carouselInner = $('#carousel-inner');
        const lastItem = carouselInner.children().last();

        if ($(lastItem).hasClass('active')) {
            fetchImages(); // Carrega mais imagens
        }
    });
});