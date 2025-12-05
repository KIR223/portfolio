// js/products.js

// Массив с данными о катанах
const katanas = [
{
id: 1,
name: "Катана «Самурайская честь»",
price: 45900,
rating: 4.9,
image: "https://via.placeholder.com/400x300/2c3e50/c0392b?text=Самурайская+честь",
category: "боевые",
description: "Боевая катана из стали T10, закаленная глина, рукоять обтянута кожей ската.",
inStock: true,
featured: true
},
{
id: 2,
name: "Вакидзаси «Тень луны»",
price: 32900,
rating: 4.7,
image: "https://via.placeholder.com/400x300/2c3e50/27ae60?text=Тень+луны",
category: "боевые",
description: "Короткий меч для ближнего боя, идеален в паре с катаной.",
inStock: true,
featured: true
},
{
id: 3,
name: "Катана «Драконья сталь»",
price: 68900,
rating: 5.0,
image: "https://via.placeholder.com/400x300/2c3e50/f39c12?text=Драконья+сталь",
category: "коллекционные",
description: "Коллекционная катана с гравировкой дракона, дамасская сталь.",
inStock: true,
featured: true
},
{
id: 4,
name: "Танто «Шепот ветра»",
price: 18900,
rating: 4.5,
image: "https://via.placeholder.com/400x300/2c3e50/8e44ad?text=Шепот+ветра",
category: "декоративные",
description: "Традиционный японский кинжал для церемоний и коллекционирования.",
inStock: true,
featured: true
},
{
id: 5,
name: "Катана «Путь воина»",
price: 54900,
rating: 4.8,
image: "https://via.placeholder.com/400x300/2c3e50/c0392b?text=Путь+воина",
category: "боевые",
description: "Профессиональная катана для иайдо, идеальный баланс и острота.",
inStock: false,
featured: true
},
{
id: 6,
name: "Нодати «Гром небес»",
price: 78900,
rating: 4.9,
image: "https://via.placeholder.com/400x300/2c3e50/3498db?text=Гром+небес",
category: "боевые",
description: "Большой японский меч для пехоты, длина клинка 90 см.",
inStock: true,
featured: true
},
{
id: 7,
name: "Катана «Сакура»",
price: 41900,
rating: 4.6,
image: "https://via.placeholder.com/400x300/2c3e50/e74c3c?text=Сакура",
category: "декоративные",
description: "Декоративная катана с цветочным орнаментом сакуры на ножнах.",
inStock: true,
featured: false
},
{
id: 8,
name: "Вакидзаси «Рассвет»",
price: 28900,
rating: 4.4,
image: "https://via.placeholder.com/400x300/2c3e50/2ecc71?text=Рассвет",
category: "декоративные",
description: "Церемониальный короткий меч с позолоченной фурнитурой.",
inStock: true,
featured: false
}
];

// Функция для генерации рейтинга в виде звезд
function generateRatingStars(rating) {
let stars = '';
const fullStars = Math.floor(rating);
const hasHalfStar = rating % 1 >= 0.5;

for (let i = 0; i < fullStars; i++) {
stars += '<i class="fas fa-star"></i>';
}

if (hasHalfStar) {
stars += '<i class="fas fa-star-half-alt"></i>';
}

const emptyStars = 5 - Math.ceil(rating);
for (let i = 0; i < emptyStars; i++) {
stars += '<i class="far fa-star"></i>';
}

return stars;
}

// Функция для форматирования цены
function formatPrice(price) {
return price.toLocaleString('ru-RU') + ' ₽';
}

// Функция для создания карточки товара
function createProductCard(product) {
return `
<div class="product-card" data-id="${product.id}" data-category="${product.category}">
<div class="product-image">
<img src="${product.image}" alt="${product.name}">
${!product.inStock ? '<div class="out-of-stock">Нет в наличии</div>' : ''}
</div>
<div class="product-info">
<h3 class="product-title">${product.name}</h3>
<div class="product-rating">
${generateRatingStars(product.rating)}
<span class="rating-value">${product.rating}</span>
</div>
<p class="product-price">${formatPrice(product.price)}</p>
<div class="product-actions">
<a href="product.html?id=${product.id}" class="btn btn-small btn-details">Подробнее</a>
<button class="btn btn-small btn-cart add-to-cart" ${!product.inStock ? 'disabled' : ''} data-id="${product.id}">
<i class="fas fa-shopping-cart"></i> ${product.inStock ? 'В корзину' : 'Нет в наличии'}
</button>
</div>
</div>
</div>
`;
}

// Функция для загрузки товаров на главную страницу
function loadFeaturedProducts() {
const container = document.getElementById('featured-products');

if (!container) return;

// Очищаем контейнер
container.innerHTML = '';

// Фильтруем избранные товары
const featured = katanas.filter(product => product.featured);

// Добавляем карточки в контейнер
featured.forEach(product => {
container.innerHTML += createProductCard(product);
});
}

// Функция для загрузки всех товаров на страницу каталога
function loadAllProducts() {
const container = document.getElementById('all-products');

if (!container) return;

// Очищаем контейнер
container.innerHTML = '';

// Добавляем все карточки в контейнер
katanas.forEach(product => {
container.innerHTML += createProductCard(product);
});
}

// Загружаем товары при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
// Проверяем, на какой странице мы находимся
if (document.getElementById('featured-products')) {
loadFeaturedProducts();
}

if (document.getElementById('all-products')) {
loadAllProducts();
}

// Инициализируем корзину
initCart();
});
document.addEventListener('DOMContentLoaded', function() {
// Получаем ID товара из URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id')) || 1;

// Загружаем данные товара
loadProductData(productId);

// Инициализация галереи
initGallery();

// Инициализация вкладок
initTabs();

// Инициализация FAQ
initFAQ();

// Инициализация модального окна
initModal();

// Инициализация похожих товаров
loadRelatedProducts(productId);

// Обработчики кнопок
initProductButtons(productId);
});

// Загрузка данных товара
function loadProductData(productId) {
const product = katanas.find(p => p.id === productId) || katanas[0];

// Обновляем данные на странице
document.getElementById('productTitle').textContent = product.name;
document.getElementById('productSKU').textContent = `KAT-${product.id.toString().padStart(3, '0')}`;
document.getElementById('productPrice').textContent = formatPrice(product.price);
document.getElementById('productDescription').textContent = product.description;

// Обновляем рейтинг
const ratingElement = document.querySelector('.product-rating .stars');
if (ratingElement) {
ratingElement.innerHTML = generateRatingStars(product.rating);
document.querySelector('.rating-value').textContent = product.rating;
}

// Обновляем изображение
const mainImage = document.getElementById('mainProductImage');
if (mainImage) {
mainImage.src = product.image;
mainImage.alt = product.name;
}

// Обновляем наличие
const availabilityElement = document.getElementById('productAvailability');
if (availabilityElement) {
if (product.inStock) {
availabilityElement.className = 'availability in-stock';
availabilityElement.innerHTML = '<i class="fas fa-check-circle"></i> В наличии';
} else {
availabilityElement.className = 'availability out-of-stock';
availabilityElement.innerHTML = '<i class="fas fa-times-circle"></i> Нет в наличии';
}
}

// Обновляем кнопки
const addToCartBtn = document.querySelector('.add-to-cart-product');
if (addToCartBtn) {
addToCartBtn.disabled = !product.inStock;
if (!product.inStock) {
addToCartBtn.textContent = 'Нет в наличии';
addToCartBtn.style.opacity = '0.6';
addToCartBtn.style.cursor = 'not-allowed';
}
}
}

// Галерея товара
function initGallery() {
const thumbnails = document.querySelectorAll('.thumbnail');
const mainImage = document.getElementById('mainProductImage');

thumbnails.forEach(thumbnail => {
thumbnail.addEventListener('click', function() {
// Удаляем активный класс у всех миниатюр
thumbnails.forEach(t => t.classList.remove('active'));

// Добавляем активный класс текущей миниатюре
this.classList.add('active');

// Обновляем основное изображение
const newImage = this.querySelector('img').getAttribute('data-image');
if (mainImage && newImage) {
mainImage.src = newImage;
}
});
});
}

// Вкладки
function initTabs() {
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
button.addEventListener('click', function() {
const tabId = this.getAttribute('data-tab');

// Удаляем активный класс у всех кнопок и панелей
tabButtons.forEach(btn => btn.classList.remove('active'));
tabPanes.forEach(pane => pane.classList.remove('active'));

// Добавляем активный класс текущей кнопке и соответствующей панели
this.classList.add('active');
document.getElementById(tabId).classList.add('active');
});
});
}

// FAQ
function initFAQ() {
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
question.addEventListener('click', function() {
const answer = this.nextElementSibling;
const isActive = this.classList.contains('active');

// Закрываем все ответы
faqQuestions.forEach(q => {
q.classList.remove('active');
q.nextElementSibling.classList.remove('active');
});

// Открываем текущий ответ, если он был закрыт
if (!isActive) {
this.classList.add('active');
answer.classList.add('active');
}
});
});
}

// Модальное окно
function initModal() {
const modal = document.getElementById('quickOrderModal');
const closeBtn = modal.querySelector('.modal-close');
const buyNowBtn = document.getElementById('buyNow');

// Закрытие модального окна
closeBtn.addEventListener('click', function() {
modal.classList.remove('active');
document.body.style.overflow = '';
});

// Закрытие при клике вне модального окна
modal.addEventListener('click', function(e) {
if (e.target === modal) {
modal.classList.remove('active');
document.body.style.overflow = '';
}
});

// Открытие модального окна при нажатии "Купить сейчас"
if (buyNowBtn) {
buyNowBtn.addEventListener('click', function() {
modal.classList.add('active');
document.body.style.overflow = 'hidden';
});
}

// Обработка формы быстрого заказа
const quickOrderForm = document.getElementById('quickOrderForm');
if (quickOrderForm) {
quickOrderForm.addEventListener('submit', function(e) {
e.preventDefault();

// Получаем данные формы
const formData = new FormData(this);
const name = formData.get('name') || 'Не указано';
const phone = formData.get('phone') || 'Не указан';

// В реальном приложении здесь был бы AJAX запрос к серверу
showNotification(`Заказ оформлен! Менеджер свяжется с вами по телефону ${phone} в ближайшее время.`);

// Закрываем модальное окно
modal.classList.remove('active');
document.body.style.overflow = '';

// Очищаем форму
this.reset();
});
}
}

// Похожие товары
function loadRelatedProducts(productId) {
const container = document.getElementById('related-products');
if (!container) return;

// Фильтруем товары той же категории, исключая текущий
const currentProduct = katanas.find(p => p.id === productId) || katanas[0];
const related = katanas.filter(p =>
p.id !== productId &&
p.category === currentProduct.category &&
p.inStock
).slice(0, 4); // Берем максимум 4 товара

if (related.length === 0) {
// Если нет товаров той же категории, берем любые другие
const alternative = katanas
.filter(p => p.id !== productId && p.inStock)
.slice(0, 4);
related.push(...alternative);
}

// Очищаем контейнер
container.innerHTML = '';

// Добавляем похожие товары
related.forEach(product => {
container.innerHTML += createProductCard(product);
});
}

// Обработчики кнопок товара
function initProductButtons(productId) {
const product = katanas.find(p => p.id === productId) || katanas[0];

// Добавление в корзину
const addToCartBtn = document.querySelector('.add-to-cart-product');
if (addToCartBtn) {
addToCartBtn.addEventListener('click', function() {
if (!product.inStock) {
showNotification('Этот товар временно отсутствует на складе');
return;
}

const quantity = parseInt(document.getElementById('productQuantity').value) || 1;

// Добавляем товар в корзину
let cart = JSON.parse(localStorage.getItem('katanaCart')) || [];

const existingItem = cart.find(item => item.id === productId);

if (existingItem) {
existingItem.quantity += quantity;
} else {
cart.push({
id: product.id,
name: product.name,
price: product.price,
image: product.image,
quantity: quantity
});
}

localStorage.setItem('katanaCart', JSON.stringify(cart));

// Обновляем счетчик корзины
updateCartCount();

// Показываем уведомление
showNotification(`«${product.name}» (${quantity} шт.) добавлен в корзину`);
});
}

// Избранное
const wishlistBtn = document.getElementById('addToWishlist');
if (wishlistBtn) {
// Проверяем, есть ли товар в избранном
let wishlist = JSON.parse(localStorage.getItem('katanaWishlist')) || [];
const isInWishlist = wishlist.includes(productId);

if (isInWishlist) {
wishlistBtn.classList.add('active');
wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> В избранном';
}

wishlistBtn.addEventListener('click', function() {
let wishlist = JSON.parse(localStorage.getItem('katanaWishlist')) || [];
const isInWishlist = wishlist.includes(productId);

if (isInWishlist) {
// Удаляем из избранного
wishlist = wishlist.filter(id => id !== productId);
this.classList.remove('active');
this.innerHTML = '<i class="far fa-heart"></i> В избранное';
showNotification('Товар удален из избранного');
} else {
// Добавляем в избранное
wishlist.push(productId);
this.classList.add('active');
this.innerHTML = '<i class="fas fa-heart"></i> В избранном';
showNotification('Товар добавлен в избранное');
}

localStorage.setItem('katanaWishlist', JSON.stringify(wishlist));
});
}

// Изменение количества
const minusBtn = document.querySelector('.quantity-btn.minus');
const plusBtn = document.querySelector('.quantity-btn.plus');
const quantityInput = document.getElementById('productQuantity');

if (minusBtn) {
minusBtn.addEventListener('click', function() {
let value = parseInt(quantityInput.value) || 1;
if (value > 1) {
value--;
quantityInput.value = value;
}
});
}

if (plusBtn) {
plusBtn.addEventListener('click', function() {
let value = parseInt(quantityInput.value) || 1;
if (value < 10) {
value++;
quantityInput.value = value;
}
});
}

if (quantityInput) {
quantityInput.addEventListener('change', function() {
let value = parseInt(this.value) || 1;
if (value < 1) value = 1;
if (value > 10) value = 10;
this.value = value;
});
}
}

// Обновление счетчика корзины
function updateCartCount() {
const cart = JSON.parse(localStorage.getItem('katanaCart')) || [];
const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

document.querySelectorAll('.cart-count').forEach(element => {
element.textContent = totalItems;
});
}

// Уведомления
function showNotification(message) {
const notification = document.createElement('div');
notification.className = 'notification';
notification.innerHTML = `
<div class="notification-content">
<i class="fas fa-check-circle"></i>
<span>${message}</span>
</div>
`;

notification.style.cssText = `
position: fixed;
top: 100px;
right: 20px;
background-color: var(--primary-green);
color: white;
padding: 15px 20px;
border-radius: 5px;
box-shadow: 0 5px 15px rgba(0,0,0,0.2);
z-index: 10000;
transform: translateX(150%);
transition: transform 0.3s ease;
max-width: 300px;
`;

document.body.appendChild(notification);

setTimeout(() => {
notification.style.transform = 'translateX(0)';
}, 10);

setTimeout(() => {
notification.style.transform = 'translateX(150%)';
setTimeout(() => {
if (notification.parentNode) {
notification.parentNode.removeChild(notification);
}
}, 300);
}, 3000);
}