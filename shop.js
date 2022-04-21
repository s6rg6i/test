/**
        Объект каталог товаров в магазине
*/
const catalog = {
    goods: [
        {
            id: 8123, name: 'Смартфон Xiaomi Redmi Note 11 NFC 4GB+128GB', price: 21999,
            image: 'images/1.webp',
            bigImage: ['images/1_1.webp', 'images/1_2.webp']
        },
        {
            id: 9123, name: 'Смартфон Samsung Galaxy A03 Core 32GB', price: 7999,
            image: 'images/2.webp',
            bigImage: ['images/2_1.webp', 'images/2_2.webp', 'images/2_3.webp']
        },
        {
            id: 1123, name: 'Смартфон Apple iPhone 13 Pro 128GB', price: 122999,
            image: 'images/3.webp',
            bigImage: ['images/3_1.webp', 'images/3_2.webp', 'images/3_3.webp', 'images/3_4.webp']
        },
        {
            id: 6123, name: 'Смартфон Nokia X10 6+128GB', price: 22015,
            image: 'images/4.webp',
            bigImage: ['images/4_1.webp', 'images/4_2.webp']
        },
        {
            id: 4123, name: 'Смартфон HUAWEI P Smart 2021 4+128GB Crush', price: 16999,
            image: 'images/5.webp',
            bigImage: ['images/5_1.webp', 'images/5_2.webp', 'images/5_3.webp']
        },
    ],

    currBigImage: {
        index: 0,
        link: null
    },

    getItemIndexById(id) {
        return this.goods.findIndex( x => x.id === +id)
    },

    initBigImagesById(id) {
        for (let item of this.goods) {  // ищем по id товара
            if (item.id === +id) {
                this.currBigImage.link = item.bigImage;
                this.currBigImage.index = 0;
                return this.currBigImage.link[0];
            }
        }
        return null;
    },

    nextBigImagesById(num) {
        if (this.currBigImage.link === null) return null;  // Изобр. нет
        num += this.currBigImage.index;  // след или пред элемент; +1 или -1
        const len =  this.currBigImage.link.length;
        num = (num >= len) ? 0 : (num < 0) ? len - 1 : num;
        this.currBigImage.index = num;
        return this.currBigImage.link[num];  // Возвращаем изобр.
    },

    clearBigImage() {
        this.currBigImage.link = null;
    }
}
/**
 Объект корзина с выбранными товарами
 */
const basket = {
    cart : [],

    addItem(id, add = 1) {
        for (let i = 0; i < this.cart.length; i++) {
            if (this.cart[i].merch.id === +id) {
                this.cart[i].count += add;
                if (this.cart[i].count < 1)
                    this.cart.splice(i,1)  // if count < 1 - удаляем
                return;
            }
        }
        if (add > 0) {
            let idx = catalog.getItemIndexById(id);
            if (idx >= 0)
                this.cart.push({merch: catalog.goods[idx], count: add});
        }
    },

    getBasketSum() {
        let sum = 0, quan = 0;
        for (let i = 0; i < this.cart.length; i++) {
            quan += this.cart[i].count;
            sum += this.cart[i].count * this.cart[i].merch.price;
        }
        return [quan,sum];
    },

    printBasket() {
        let str = '\nСодержимое корзины:';
        for (let i = 0; i < this.cart.length; i++) {
            str += `\n${this.cart[i].merch.name} -> ${this.cart[i].merch.price} * ${this.cart[i].count}`;
        }
        console.log(str);
    }
}

/**
 Объект, реализующий HTML-представление объектов catalog и basket
 */
const view_shop = {
    goodsBlock: null,
    cartBlock: null,
    modalBlock: null,

    init() {
        this.goodsBlock = document.querySelector(".goods");
        this.cartBlock = document.querySelector(".cart");
        this.modalBlock = document.querySelector(".gal-wrap");
        this.render_catalog();
        this.render_basket();
        this.goodsBlock.addEventListener('click', this.clickHandler.bind(this));
        this.cartBlock.addEventListener('click', this.clickHandler.bind(this));
        this.modalBlock.addEventListener('click', this.clickModalHandler.bind(this));
    },

    render_catalog() {
        if (this.goodsBlock.length) return;
        this.goodsBlock.insertAdjacentHTML('beforeend', '<div class="title">Каталог</div>')
        catalog.goods.forEach(el => {
            this.goodsBlock.insertAdjacentHTML(
                'beforeend',
                `
                <div class="item" id="${el.id}"><div class="image"><img src=${el.image} alt=""></div>
                    <div class="description">${el.name}</div>
                    <div class="quantity"><button class="plus-btn" type="button" name="button">+</button></div>
                    <div class="price">${el.price}</div>
                </div>`)
        })
    },

    render_basket() {
        if (this.cartBlock.length) return;
        this.cartBlock.innerHTML = "";
        this.cartBlock.insertAdjacentHTML('beforeend', '<div class="title">Корзина</div>')
        basket.cart.forEach(el => {
            this.cartBlock.insertAdjacentHTML(
                'beforeend',
                `
                <div class="item" id="${el.merch.id}"><div class="image"><img src=${el.merch.image} alt=""></div>
                    <div class="description">${el.merch.name}</div>
                    <div class="quantity">
                        <button class="plus-btn" type="button" name="button">+</button>
                        <input type="text" name="name" value="${el.count}">
                        <button class="minus-btn" type="button" name="button">-</button>
                    </div>
                    <div class="price">${el.merch.price * el.count}</div>
                </div>`)
        })
        const res = basket.getBasketSum()
        this.cartBlock.insertAdjacentHTML(
            'beforeend',
            `
                 <div class="item">
                    <div class="image"></div>
                    <div class="description">Итого:</div>
                    <div class="quantity">${res[0]}</div>
                    <div class="price">₽ ${res[1]}</div>
                </div>`)
    },

    clickModalHandler(e) {
        const id_img = e.target.getAttribute("id");
        if (id_img === "exit") {
            this.modalBlock.style.visibility = "hidden";
            catalog.clearBigImage();
            return;
        }
        let add = (id_img === 'right') ? -1 : (id_img === 'left') ? +1 : 0;
        if (add)
            document.querySelector(".gal-wrap__image").src = catalog.nextBigImagesById(add);
    },

    clickHandler(e) {
        const el = e.target;
        let clicked = el.tagName === "BUTTON" ? 1 : el.tagName === "IMG" ? 2 : 0;
        if (!clicked) return;
        let id = el.closest(".item").getAttribute("id");
        if (clicked === 1) {  // BUTTON +
            let sign = (el.getAttribute("class") === "plus-btn") ? 1 : -1;
            basket.addItem(id, sign);
            this.render_basket();
            return;
        }
        const modalImageBlock = document.querySelector(".gal-wrap__image");
        modalImageBlock.src = catalog.initBigImagesById(id);
        this.modalBlock.style.visibility = "visible";
    },
}
