'use strict';
const gallery = {

    init(userSettings = {}) {
        document.querySelector(".gal-prev").addEventListener('click', this.clickHandler.bind(this));
        // document.addEventListener('click', (event) => this.clickHandler(event));
    },

    clickHandler(event) {
        if (event.target.tagName !== 'IMG') return;
        // this.openImage(event.target.dataset.full_image_url);
        const screen = this.getScreenContainer();
        screen.querySelector(".gal-wrap__image").src = event.target.dataset.full_image_url;
    },

    getScreenContainer() {
        const galleryWrapElement = document.querySelector(".gal-wrap");
        if (galleryWrapElement) return galleryWrapElement;  // контейнер уже существует

        // Создаем новый контейнер
        const galleryWrapperElement = document.createElement('div');
        galleryWrapperElement.classList.add("gal-wrap");

        const galleryScreenElement = document.createElement('div');
        galleryScreenElement.classList.add("gal-wrap__screen");
        galleryWrapperElement.appendChild(galleryScreenElement);

        const closeImageElement = new Image();
        closeImageElement.classList.add("gal-wrap__close");
        closeImageElement.src = "images1/gallery/close.png";
        closeImageElement.addEventListener('click', this.close.bind(this))
        galleryWrapperElement.appendChild(closeImageElement);

        const image = new Image();
        image.classList.add("gal-wrap__image");
        galleryWrapperElement.appendChild(image);

        document.body.appendChild(galleryWrapperElement);

        return galleryWrapperElement;
    },

    close() {
        document.querySelector(".gal-wrap").remove();
    }
};

gallery.init();