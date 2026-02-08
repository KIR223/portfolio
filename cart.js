// js/cart.js

document.addEventListener('DOMContentLoaded', function() {
// Загружаем корзину
loadCart();

// Загружаем рекомендуемые товары
loadRecommendedProducts();

// Инициализация модального окна оформления заказа
initCheckoutModal();
});

// Загрузка содержимого корзины
function loadCart() {
const cartContainer = document.getElementById('cartContent');
if (!cartContainer) return;

const cart = JSON.parse(localStorage.getItem('katanaCart')) || [];

if (cart.length === 0) {
showEmptyCart();
return;
}

// Обновляем счетчик корзины
updateCartCount();

// Создаем HTML корзины
let cartHTML = `
<div class="cart-container">
<div class="cart-items">
`;

// Добавляем элементы корзины
cart.forEach(item => {
const product = katanas.find(p => p.id === item.id) || {};
const totalPrice = product.price * item.quantity;

cartHTML += `
<div class="cart-item" data-id="${item.id}">
<div class="cart-item-image">
<img src="${product.image || 'https://via.placeholder.com/120x120/2c3e50/c0392b?text=Катана'}" alt="${product.name}">
</div>
<div class="cart-item-info">
<a href="product.html?id=${item.id}" class="cart-item-name">${product.name}</a>
<div class="cart-item-sku">Артикул: KAT-${item.id.toString().padStart(3, '0')}</div>
<div class="cart-item-availability ${product.inStock ? 'in-stock' : 'out-of-stock'}">
<i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
${product.inStock ? 'В наличии' : 'Нет в наличии'}
</div>
<div class="cart-item-controls">
<div class="cart-item-quantity">
<button class="quantity-btn minus" onclick="updateQuantity(${item.id}, -1)">
<i class="fas fa-minus"></i>
</button>
<input type="number" value="${item.quantity}" min="1" max="10"
onchange="updateQuantityInput(${item.id}, this.value)">
<button class="quantity-btn plus" onclick="updateQuantity(${item.id}, 1)">
<i class="fas fa-plus"></i>
</button>
</div>
<button class="cart-item-remove" onclick="removeFromCart(${item.id})">
<i class="fas fa-trash"></i> Удалить
</button>
</div>
</div>
<div class="cart-item-price">
<div class="cart-item-price-current">${formatPrice(totalPrice)}</div>
<div class="cart-item-price-old">${formatPrice(product.price * 1.1)}</div>
<div class="cart-item-price-unit">${formatPrice(product.price)} / шт</div>
</div>
</div>
`;
});

cartHTML += `
</div>

<div class="cart-summary">
<h2>Итоги заказа</h2>

<div class="cart-warning">
<i class="fas fa-exclamation-triangle"></i>
<p>Товары с пометкой "Нет в наличии" будут отправлены после поступления на склад</p>
</div>

<div class="summary-row">
<span>Товары (${getTotalItems(cart)} шт.)</span>
<span>${formatPrice(calculateSubtotal(cart))}</span>
</div>

<div class="summary-row">
<span>Скидка</span>
<span style="color: var(--primary-green);">-${formatPrice(calculateDiscount(cart))}</span>
</div>

<div class="summary-row">
<span>Доставка</span>
<span>Бесплатно</span>
</div>

<div class="summary-row total">
<span>Итого к оплате</span>
<span>${formatPrice(calculateTotal(cart))}</span>
</div>

<div class="discount-form">
<h4>Промокод</h4>
<div class="discount-input">
<input type="text" placeholder="Введите промокод" id="promoCode">
<button type="button" onclick="applyPromoCode()">Применить</button>
</div>
</div>

<button class="btn btn-primary checkout-btn" id="checkoutButton">
<i class="fas fa-lock"></i> Перейти к оформлению
</button>

<div class="continue-shopping">
<a href="catalog.html">
<i class="fas fa-arrow-left"></i> Продолжить покупки
</a>
</div>
</div>
</div>
`;

cartContainer.innerHTML = cartHTML;

// Добавляем кнопки управления корзиной
cartContainer.innerHTML += `
<div class="cart-actions">
<button class="clear-cart-btn" onclick="clearCart()">
<i class="fas fa-trash"></i> Очистить корзину
</button>
<button class="update-cart-btn" onclick="loadCart()">
<i class="fas fa-sync-alt"></i> Обновить корзину
</button>
</div>
`;
}

// Показать пустую корзину
function showEmptyCart() {
const cartContainer = document.getElementById('cartContent');

cartContainer.innerHTML = `
<div class="empty-cart">
<i class="fas fa-shopping-cart"></i>
<h2>Ваша корзина пуста</h2>
<p>Добавьте товары из каталога, чтобы сделать заказ. У нас есть более 120 моделей японских катан на любой вкус и бюджет.</p>
<a href="catalog.html" class="btn btn-primary">
<i class="fas fa-swords"></i> Перейти в каталог
</a>
</div>
`;

// Обновляем счетчик корзины
updateCartCount();
}

// Обновить количество товара
function updateQuantity(productId, change) {
let cart = JSON.parse(localStorage.getItem('katanaCart')) || [];
const itemIndex = cart.findIndex(item => item.id === productId);

if (itemIndex !== -1) {
const newQuantity = cart[itemIndex].quantity + change;

if (newQuantity < 1) {
removeFromCart(productId);
return;
}

if (newQuantity > 10) {
showNotification('Максимальное количество одного товара - 10 шт.');
return;
}

cart[itemIndex].quantity = newQuantity;
localStorage.setItem('katanaCart', JSON.stringify(cart));
loadCart();
showNotification('Количество товара обновлено');
}
}

// Обновить количество через input
function updateQuantityInput(productId, value) {
const quantity = parseInt(value) || 1;

if (quantity < 1) {
removeFromCart(productId);
return;
}

if (quantity > 10) {
showNotification('Максимальное количество одного товара - 10 шт.');
loadCart(); // Перезагружаем, чтобы вернуть старое значение
return;
}

let cart = JSON.parse(localStorage.getItem('katanaCart')) || [];
const itemIndex = cart.findIndex(item => item.id === productId);

if (itemIndex !== -1) {
cart[itemIndex].quantity = quantity;
localStorage.setItem('katanaCart', JSON.stringify(cart));
loadCart();
showNotification('Количество товара обновлено');
}
}

// Удалить товар из корзины
function removeFromCart(productId) {
if (!confirm('Удалить товар из корзины?')) return;

let cart = JSON.parse(localStorage.getItem('katanaCart')) || [];
cart = cart.filter(item => item.id !== productId);
localStorage.setItem('katanaCart', JSON.stringify(cart));
loadCart();
showNotification('Товар удален из корзины');
}

// Очистить корзину
function clearCart() {
if (!confirm('Очистить всю корзину?')) return;

localStorage.removeItem('katanaCart');
loadCart();
showNotification('Корзина очищена');
}

// Применить промокод
function applyPromoCode() {
const promoCode = document.getElementById('promoCode').value;
const validPromoCodes = {
'SAMURAI10': 10, // 10% скидка
'KATANA2023': 15, // 15% скидка
'FIRSTORDER': 20 // 20% скидка на первый заказ
};

if (!promoCode) {
showNotification('Введите промокод');
return;
}

if (validPromoCodes[promoCode.toUpperCase()]) {
const discount = validPromoCodes[promoCode.toUpperCase()];
localStorage.setItem('katanaPromoCode', promoCode.toUpperCase());
localStorage.setItem('katanaPromoDiscount', discount.toString());
showNotification(`Промокод применен! Скидка ${discount}%`);
loadCart(); // Перезагружаем корзину для отображения скидки
} else {
showNotification('Недействительный промокод');
}
}

// Загрузить рекомендуемые товары
function loadRecommendedProducts() {
const container = document.querySelector('#recommendedProducts .products-grid');
if (!container) return;

// Берем случайные товары, которых нет в корзине
const cart = JSON.parse(localStorage.getItem('katanaCart')) || [];
const cartIds = cart.map(item => item.id);

const recommended = katanas
.filter(product => !cartIds.includes(product.id) && product.inStock)
.sort(() => Math.random() - 0.5)
.slice(0, 4);

if (recommended.length === 0) return;

container.innerHTML = '';
recommended.forEach(product => {
container.innerHTML += createProductCard(product);
});
}

// Инициализация модального окна оформления заказа
function initCheckoutModal() {
const checkoutBtn = document.getElementById('checkoutButton');
const modal = document.getElementById('checkoutModal');
const closeBtn = modal.querySelector('.modal-close');
const checkoutForm = document.getElementById('checkoutForm');

if (checkoutBtn) {
checkoutBtn.addEventListener('click', function() {
// Проверяем, есть ли товары в корзине
const cart = JSON.parse(localStorage.getItem('katanaCart')) || [];
if (cart.length === 0) {
showNotification('Корзина пуста');
return;
}

// Загружаем сводку заказа
loadCheckoutSummary();

// Открываем модальное окно
modal.classList.add('active');
document.body.style.overflow = 'hidden';
});
}

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

// Обработка формы оформления заказа
if (checkoutForm) {
checkoutForm.addEventListener('submit', function(e) {
e.preventDefault();

// Получаем данные формы
const formData = new FormData(this);
const name = formData.get('name');
const phone = formData.get('phone');
const email = formData.get('email');

// В реальном приложении здесь был бы AJAX запрос к серверу
showNotification(`Заказ оформлен! Номер вашего заказа: #${Math.floor(Math.random() * 10000)}. Подробности отправлены на ${email}`);

// Очищаем корзину
localStorage.removeItem('katanaCart');
localStorage.removeItem('katanaPromoCode');
localStorage.removeItem('katanaPromoDiscount');

// Закрываем модальное окно
modal.classList.remove('active');
document.body.style.overflow = '';

// Обновляем страницу
setTimeout(() => {
loadCart();
}, 1000);
});
}
}

// Загрузить сводку заказа для модального окна
function loadCheckoutSummary() {
const container = document.getElementById('checkoutSummary');
if (!container) return;

const cart = JSON.parse(localStorage.getItem('katanaCart')) || [];
const subtotal = calculateSubtotal(cart);
const discount = calculateDiscount(cart);
const total = calculateTotal(cart);

let summaryHTML = `
<div class="summary-row">
<span>Стоимость товаров</span>
<span>${formatPrice(subtotal)}</span>
</div>
`;

if (discount > 0) {
summaryHTML += `
<div class="summary-row">
<span>Скидка</span>
<span style="color: var(--primary-green);">-${formatPrice(discount)}</span>
</div>
`;
}

summaryHTML += `
<div class="summary-row total">
<span>Итого к оплате</span>
<span>${formatPrice(total)}</span>
</div>
`;

container.innerHTML = summaryHTML;
}

// Вспомогательные функции для корзины
function getTotalItems(cart) {
return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function calculateSubtotal(cart) {
return cart.reduce((sum, item) => {
const product = katanas.find(p => p.id === item.id);
return sum + (product?.price || 0) * item.quantity;
}, 0);
}

function calculateDiscount(cart) {
const promoDiscount = parseInt(localStorage.getItem('katanaPromoDiscount')) || 0;
const subtotal = calculateSubtotal(cart);
return Math.round(subtotal * promoDiscount / 100);
}

function calculateTotal(cart) {
const subtotal = calculateSubtotal(cart);
const discount = calculateDiscount(cart);
return subtotal - discount;
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
