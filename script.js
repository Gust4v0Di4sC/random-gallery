$(function() {
    // Configurações
    const perPage = 5;        // Número de imagens por vez
    const preloadThreshold = 3; // Quantas imagens antes do fim devemos começar a carregar mais
    const similarImagesCount = 6; // Quantidade de imagens similares
    
    // Mapeamento de categorias para IDs específicos do Lorem Picsum
    // IDs selecionados que correspondem aproximadamente às categorias
    const categoryToIds = {
        "animals": [237, 433, 582, 593, 659, 783, 837, 1024, 1025, 1074, 1084],
        "nature": [10, 15, 27, 28, 29, 49, 65, 111, 133, 149, 192, 193, 197],
        "architecture": [36, 101, 142, 164, 172, 186, 238, 318, 429, 452, 469],
        "people": [26, 64, 91, 129, 169, 338, 453, 497, 505, 628, 660],
        "tech": [0, 2, 7, 60, 180, 331, 370, 383, 385, 494, 532],
        "dog": [237, 1025, 1062, 169, 1074, 200, 250, 659, 837, 1084],
        "city": [164, 320, 401, 429, 452, 1015, 599, 582, 535, 488],
        "food": [102, 292, 431, 488, 633, 755, 824, 835, 844, 867]
    };
    
    // Estado
    let totalLoadedImages = 0;
    let isLoading = false;
    let currentCategory = "all"; // Categoria atual (all = todas)
    let currentCategoryIds = []; // IDs da categoria atual
    let usedIds = {}; // Rastrear IDs já usados em cada categoria
    
    // Elementos DOM
    const carousel = $('#image-carousel');
    const carouselInner = $('.carousel-inner');
    const similarImagesContainer = $('#similar-images');
    const categoryButtons = $('.category-btn');
    
    // Inicialização
    initCategoryButtons();
    initCarousel();
    
    function initCarousel() {
        // Carregar o primeiro conjunto de imagens
        loadMoreImages();
        
        // Configurar evento de slide
        carousel.on('slide.bs.carousel', function(e) {
            const currentIndex = $(e.relatedTarget).index();
            const totalSlides = carouselInner.children('.carousel-item').length;
            
            console.log(`Slide em progresso: ${currentIndex+1}/${totalSlides}`);
            
            // Se estamos chegando perto do fim, carregar mais imagens
            if (totalSlides - currentIndex <= preloadThreshold) {
                loadMoreImages();
            }
            
            // Atualizar imagens similares para o slide atual
            const imageId = $(e.relatedTarget).data('id');
            updateSimilarImages(imageId);
        });
        
        // Adicionar controle manual extra para garantir
        $('.carousel-control-next').on('click', function() {
            const activeItem = carouselInner.children('.active');
            const totalSlides = carouselInner.children('.carousel-item').length;
            const currentIndex = activeItem.index();
            
            if (totalSlides - currentIndex <= preloadThreshold) {
                loadMoreImages();
            }
        });
    }
    
    function initCategoryButtons() {
        categoryButtons.on('click', function() {
            const category = $(this).data('category');
            
            // Destacar o botão ativo
            categoryButtons.removeClass('active');
            $(this).addClass('active');
            
            // Definir nova categoria e recarregar tudo
            currentCategory = category;
            console.log(`Categoria selecionada: ${category}`);
            
            // Resetar IDs usados para a nova categoria
            if (!usedIds[currentCategory]) {
                usedIds[currentCategory] = {};
            }
            
            // Obter IDs para a categoria selecionada
            if (category !== "all") {
                currentCategoryIds = categoryToIds[category] || [];
                console.log(`IDs disponíveis para ${category}: ${currentCategoryIds.length}`);
            } else {
                currentCategoryIds = [];
            }
            
            // Limpar carrossel e recarregar
            clearCarousel();
            loadMoreImages();
        });
    }
    
    function clearCarousel() {
        carouselInner.empty();
        totalLoadedImages = 0;
        isLoading = false;
    }
    
    function getRandomId() {
        if (currentCategory === "all") {
            // Se for "todas", gera um ID aleatório entre 0-1000
            return Math.floor(Math.random() * 1000);
        } else {
            // Se for uma categoria específica, usa o mapeamento
            if (currentCategoryIds.length === 0) {
                console.warn(`Nenhum ID disponível para categoria ${currentCategory}`);
                return Math.floor(Math.random() * 1000);
            }
            
            // Verificar se todos os IDs já foram usados
            const allUsed = currentCategoryIds.every(id => usedIds[currentCategory][id]);
            if (allUsed) {
                console.log("Todos os IDs foram usados, resetando...");
                usedIds[currentCategory] = {}; // Resetar para reutilizar
            }
            
            // Encontrar um ID não usado
            let availableIds = currentCategoryIds.filter(id => !usedIds[currentCategory][id]);
            
            // Se não houver IDs disponíveis, usar qualquer um
            if (availableIds.length === 0) {
                availableIds = currentCategoryIds;
            }
            
            // Escolher um ID aleatório da lista filtrada
            const randomIndex = Math.floor(Math.random() * availableIds.length);
            const selectedId = availableIds[randomIndex];
            
            // Marcar como usado
            usedIds[currentCategory][selectedId] = true;
            
            return selectedId;
        }
    }
    
    function loadMoreImages() {
        if (isLoading) return;
        isLoading = true;
        
        console.log(`Carregando imagens na categoria: ${currentCategory}`);
        
        let loadedCount = 0;
        
        for (let i = 0; i < perPage; i++) {
            // Obter ID específico da categoria ou aleatório
            const imageId = getRandomId();
            const timestamp = new Date().getTime() + i;
            
            // URL da imagem com o ID específico para evitar duplicações
            const imageUrl = `https://picsum.photos/id/${imageId}/800/500?_=${timestamp}`;
            
            // Criar elemento do carrossel
            const carouselItem = $('<div>')
                .addClass('carousel-item')
                .attr('data-index', totalLoadedImages + i)
                .attr('data-id', imageId);
            
            // Adicionar classe active ao primeiro item se for o primeiro conjunto
            if (totalLoadedImages === 0 && i === 0) {
                carouselItem.addClass('active');
            }
            
            // Container da imagem
            const imgContainer = $('<div>')
                .addClass('fixed-size-container d-flex justify-content-center align-items-center')
                .css({
                    'height': '500px',
                    'background-color': '#f8f9fa'
                });
            
            // Placeholder de carregamento
            const loadingSpinner = $('<div>')
                .addClass('spinner-border text-primary')
                .css('display', 'block');
                
            imgContainer.append(loadingSpinner);
            carouselItem.append(imgContainer);
            
            // Adicionar ao carrossel antes da imagem carregar
            carouselInner.append(carouselItem);
            
            // Criar a imagem
            const img = $('<img>')
                .addClass('d-block w-100 fixed-size-image')
                .css({
                    'object-fit': 'cover',
                    'height': '100%',
                    'display': 'none' // Esconder até carregar
                })
                .attr('src', imageUrl)
                .attr('alt', `Imagem ${currentCategory !== "all" ? currentCategory : "aleatória"} ${totalLoadedImages + i}`)
                .on('load', function() {
                    // Remover spinner e mostrar imagem
                    $(this).css('display', 'block');
                    $(this).parent().find('.spinner-border').remove();
                    
                    loadedCount++;
                    checkBatch();
                })
                .on('error', function() {
                    console.warn(`Erro ao carregar imagem com ID ${imageId}`);
                    
                    // Mostrar imagem de fallback em caso de erro
                    $(this).attr('src', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="%23666" text-anchor="middle">Imagem não disponível</text></svg>');
                    $(this).css('display', 'block');
                    $(this).parent().find('.spinner-border').remove();
                    
                    loadedCount++;
                    checkBatch();
                });
                
            // Adicionar imagem ao container
            imgContainer.append(img);
        }
        
        function checkBatch() {
            if (loadedCount === perPage) {
                totalLoadedImages += perPage;
                isLoading = false;
                console.log(`Lote concluído. Total de imagens: ${totalLoadedImages}`);
                
                // Inicializar carrossel apenas na primeira vez
                if (totalLoadedImages === perPage) {
                    carousel.carousel({
                        interval: 5000,
                        wrap: true // Permitir voltar ao início após o último slide
                    });
                    
                    // Carregar imagens similares para o primeiro slide
                    const firstId = carouselInner.children('.carousel-item').first().data('id');
                    updateSimilarImages(firstId);
                }
                
                // Verificar se precisamos carregar mais (garantia extra)
                const activeIndex = carouselInner.children('.active').index();
                const totalItems = carouselInner.children('.carousel-item').length;
                
                if (totalItems - activeIndex <= preloadThreshold) {
                    loadMoreImages();
                }
            }
        }
    }
    
    function getRelatedIds(sourceId) {
        // Se for categoria "todas", encontrar IDs aleatórios
        if (currentCategory === "all") {
            const relatedIds = [];
            for (let i = 0; i < similarImagesCount; i++) {
                relatedIds.push(Math.floor(Math.random() * 1000));
            }
            return relatedIds;
        }
        
        // Se for categoria específica, encontrar IDs na mesma categoria
        const availableIds = currentCategoryIds.filter(id => id !== sourceId);
        
        // Se não houver IDs suficientes, repetir alguns
        let relatedIds = [];
        for (let i = 0; i < similarImagesCount; i++) {
            if (availableIds.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableIds.length);
                const selectedId = availableIds[randomIndex];
                relatedIds.push(selectedId);
                
                // Remover para não repetir no lote atual
                const idIndex = availableIds.indexOf(selectedId);
                if (idIndex > -1) {
                    availableIds.splice(idIndex, 1);
                }
            } else {
                // Se acabaram os IDs disponíveis, use um aleatório da categoria
                const randomIndex = Math.floor(Math.random() * currentCategoryIds.length);
                relatedIds.push(currentCategoryIds[randomIndex]);
            }
        }
        
        return relatedIds;
    }
    
    function updateSimilarImages(sourceId) {
        if (!sourceId) return;
        
        console.log(`Atualizando imagens similares para ID: ${sourceId}`);
        
        // Limpar container de imagens similares
        similarImagesContainer.empty();
        
        
        
        // Criar grid para as imagens
        const row = $('<div>').addClass('row');
        similarImagesContainer.append(row);
        
        // Obter IDs relacionados
        const relatedIds = getRelatedIds(sourceId);
        
        // Carregar imagens similares
        for (let i = 0; i < relatedIds.length; i++) {
            const relatedId = relatedIds[i];
            const timestamp = new Date().getTime() + i;
            
            // URL da imagem similar
            const imageUrl = `https://picsum.photos/id/${relatedId}/300/200?_=${timestamp}`;
            
            // Criar coluna para cada imagem
            const col = $('<div>').addClass('col-md-2 col-sm-4 col-6 mb-3');
            
            // Container da imagem
            const imgContainer = $('<div>')
                .addClass('similar-image-container d-flex justify-content-center align-items-center')
                .css({
                    'height': '150px',
                    'background-color': '#f8f9fa',
                    'cursor': 'pointer',
                    'border-radius': '4px',
                    'overflow': 'hidden'
                })
                .attr('data-id', relatedId)
                .on('click', function() {
                    // Abrir imagem em tamanho maior
                    window.open(`https://picsum.photos/id/${relatedId}/800/500`, '_blank');
                });
            
            // Placeholder de carregamento
            const loadingSpinner = $('<div>')
                .addClass('spinner-border text-primary spinner-border-sm')
                .css('display', 'block');
                
            imgContainer.append(loadingSpinner);
            
            // Criar a imagem
            const img = $('<img>')
                .addClass('img-fluid')
                .css({
                    'object-fit': 'cover',
                    'height': '100%',
                    'width': '100%',
                    'display': 'none' // Esconder até carregar
                })
                .attr('src', imageUrl)
                .attr('alt', `Imagem similar ${i}`)
                .on('load', function() {
                    // Remover spinner e mostrar imagem
                    $(this).css('display', 'block');
                    $(this).parent().find('.spinner-border').remove();
                })
                .on('error', function() {
                    console.warn(`Erro ao carregar imagem similar com ID ${relatedId}`);
                    
                    // Mostrar imagem de fallback em caso de erro
                    $(this).attr('src', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23666" text-anchor="middle">Erro</text></svg>');
                    $(this).css('display', 'block');
                    $(this).parent().find('.spinner-border').remove();
                });
                
            // Adicionar imagem ao container
            imgContainer.append(img);
            col.append(imgContainer);
            row.append(col);
        }
    }
    
    // Verificação periódica como rede de segurança
    setInterval(function() {
        const activeIndex = carouselInner.children('.active').index();
        const totalItems = carouselInner.children('.carousel-item').length;
        
        if (totalItems - activeIndex <= preloadThreshold && !isLoading) {
            console.log("Carregando mais imagens (verificação periódica)");
            loadMoreImages();
        }
    }, 5000);
});