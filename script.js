// реализовать подгрузку из кеша

const apiKey = '3hrZPDbT3eFDxIqly3GcFgr7I9cgVYEQ',
      gifsBlock = document.querySelector('.gifs'),
      preloader = document.querySelector('.preloader'),
      buttonSearch = document.querySelector('.search__button'),
      cacheTime = 30 * 60 * 1000; // 30 минут
let limit = 27,
    offset = 0;


const renderGif = (event) =>{
    event.preventDefault();
    gifsBlock.innerHTML = '';
    offset = 0;

    loadMoreGifs(true)
}

let loadMoreGifs = ( reset = false) => {
    let searchValue = document.querySelector('.search').value,
        url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchValue}&limit=${limit}&offset=${offset}`;
    
    if(reset){
        gifsBlock.style.display = 'none';
        preloader.classList.add('preloader__show')
    }

    fetch(url)
        .then((response)=>{
            return response.json();
        })
        .then((data)=>{
            let gifsData = data.data

            if(gifsData.length === 0){
                preloader.classList.remove('preloader__show');
                gifsBlock.style.display = 'flex';
                gifsBlock.innerHTML = '<div class="error">Ничего не нашлось по Вашему запросу :(</div>';
            }

            gifsData.forEach(gif => {
                let iframeWrapper = document.createElement('div');
                iframeWrapper.classList.add('iframe__wrapper')
                let iframe = document.createElement('img');
                iframe.setAttribute('src', gif.images.downsized_medium.url)
                iframeWrapper.append(iframe)
                gifsBlock.append(iframeWrapper)
            });

            if (reset) {
                preloader.classList.remove('preloader__show');
                gifsBlock.style.display = 'flex';
            }

            offset += limit;
        })
        .catch(err =>{
            console.error(err)
            preloader.classList.remove('preloader__show')
        })
}
buttonSearch.addEventListener('click', renderGif)

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        loadMoreGifs();
    }
});
