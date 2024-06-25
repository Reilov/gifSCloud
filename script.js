const apiKey = '3hrZPDbT3eFDxIqly3GcFgr7I9cgVYEQ';
const gifsBlock = document.querySelector('.gifs');
const preloader = document.querySelector('.preloader');
const buttonSearch = document.querySelector('.search__button');
const cacheTime = 30 * 60 * 1000; // 30 минут
let limit = 27;
let offset = 0;
let isLoading = false;

const renderGif = (event) => {
    event.preventDefault();
    gifsBlock.innerHTML = '';
    offset = 0;

    loadMoreGifs(true);
};

const getCachedData = (query) => {
    const cachedData = localStorage.getItem(query);
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (Date.now() - parsedData.timestamp < cacheTime) {
            return parsedData.data;
        } else {
            localStorage.removeItem(query);
        }
    }
    return null;
};

const setCachedData = (query, data) => {
    const cacheEntry = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(query, JSON.stringify(cacheEntry));
};

const loadMoreGifs = (reset = false) => {
    if (isLoading) return;
    isLoading = true;
    
    let searchValue = document.querySelector('.search').value.trim();
    let cacheKey = `${searchValue}-${offset}`;
    let cachedData = getCachedData(cacheKey);

    if (cachedData) {
        displayGifs(cachedData, reset);
        isLoading = false;
    } else {
        let url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchValue}&limit=${limit}&offset=${offset}`;

        if (reset) {
            gifsBlock.style.display = 'none';
            preloader.classList.add('preloader__show');
        }

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                let gifsData = data.data;

                setCachedData(cacheKey, gifsData);

                if (gifsData.length === 0) {
                    preloader.classList.remove('preloader__show');
                    gifsBlock.style.display = 'flex';
                    gifsBlock.innerHTML = '<div class="error">Ничего не нашлось по Вашему запросу :(</div>';
                }

                displayGifs(gifsData, reset);
                isLoading = false;
            })
            .catch(err => {
                console.error(err);
                if (reset) {
                    preloader.classList.remove('preloader__show');
                    gifsBlock.style.display = 'flex';
                    gifsBlock.innerHTML = '<div class="error">Ничего не нашлось по Вашему запросу :(</div>';
                }
                isLoading = false;
            });
    }
};

const displayGifs = (gifsData, reset) => {
    if (reset) {
        gifsBlock.innerHTML = '';
    }
    gifsData.forEach(gif => {
        let iframeWrapper = document.createElement('div');
        iframeWrapper.classList.add('iframe__wrapper');
        let iframe = document.createElement('img');
        iframe.setAttribute('src', gif.images.downsized_medium.url);
        iframeWrapper.append(iframe);
        gifsBlock.append(iframeWrapper);
    });

    if (reset) {
        preloader.classList.remove('preloader__show');
        gifsBlock.style.display = 'flex';
    }

    offset += limit;
};





const clearOldCache = () => {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const cachedData = JSON.parse(localStorage.getItem(key));
        if (now - cachedData.timestamp > cacheTime) {
            localStorage.removeItem(key);
            i--;
        }
    }
};

clearOldCache();

buttonSearch.addEventListener('click', renderGif);

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) { // Срабатывает немного раньше достижения низа страницы
        loadMoreGifs();
    }
});
