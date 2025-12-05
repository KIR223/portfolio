// js/main.js

// Инициализация мобильного меню
function initMobileMenu() {
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobileNav');
const closeNav = document.querySelector('.close-nav');
const overlay = document.createElement('div');

overlay.className = 'overlay';
document.body.appendChild(overlay);

if (menuToggle) {
menuToggle.addEventListener('click', function() {
mobileNav.classList.add('active');
overlay.classList.add('active');
document.body.style.overflow = 'hidden';
});
}

if (closeNav) {
closeNav.addEventListener('click', function() {
mobileNav.classList.remove('active');
overlay.classList.remove('active');
document.body.style.overflow = '';
});
}

overlay.addEventListener('click', function() {
mobileNav.classList.remove('active');
overlay.classList.remove('active');
document.body.style.overflow = '';
});

// Закрытие меню при клике на ссылку
const mobileLinks = mobileNav.querySelectorAll('a');
mobileLinks.forEach(link => {
link.addEventListener('click', function() {
mobileNav.classList.remove('active');
overlay.classList.remove('active');
document.body.style.overflow = '';
});
});
}

// Инициализация корзины
function initCart() {
let cart = JSON.parse(localStorage.getItem('katanaCart')) || [];

// Обновляем счетчик корзины
function updateCartCount() {
const countElements = document.querySelectorAll('.cart-count');
const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

countElements.forEach(element => {
element.textContent = totalItems;
});
}

// Добавление товара в корзину
document.addEventListener('click', function(e) {
if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
const productId = parseInt(button.getAttribute('data-id'));

// Находим товар в массиве
const product = katanas.find(p => p.id === productId);

if (!product) return;

// Проверяем наличие
if (!product.inStock) {
alert('Этот товар временно отсутствует на складе');
return;
}

// Проверяем, есть ли уже товар в корзине
const existingItem = cart.find(item => item.id === productId);

if (existingItem) {
existingItem.quantity += 1;
} else {
cart.push({
id: product.id,
name: product.name,
price: product.price,
image: product.image,
quantity: 1
});
}

// Сохраняем в localStorage
localStorage.setItem('katanaCart', JSON.stringify(cart));

// Обновляем счетчик
updateCartCount();

// Показываем уведомление
showNotification(`«${product.name}» добавлен в корзину`);
}
});

// Показываем уведомление
function showNotification(message) {
// Создаем элемент уведомления
const notification = document.createElement('div');
notification.className = 'notification';
notification.innerHTML = `
<div class="notification-content">
<i class="fas fa-check-circle"></i>
<span>${message}</span>
</div>
`;

// Стили для уведомления
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

// Показываем уведомление
setTimeout(() => {
notification.style.transform = 'translateX(0)';
}, 10);

// Скрываем через 3 секунды
setTimeout(() => {
notification.style.transform = 'translateX(150%)';
setTimeout(() => {
if (notification.parentNode) {
notification.parentNode.removeChild(notification);
}
}, 300);
}, 3000);
}

// Инициализируем счетчик при загрузке
updateCartCount();
}

// Плавная прокрутка для якорных ссылок
function initSmoothScroll() {
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function(e) {
e.preventDefault();

const targetId = this.getAttribute('href');
if (targetId === '#') return;

const targetElement = document.querySelector(targetId);
if (targetElement) {
window.scrollTo({
top: targetElement.offsetTop - 80,
behavior: 'smooth'
});
}
});
});
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
initMobileMenu();
initSmoothScroll();

// Анимация появления элементов при скролле
const observerOptions = {
threshold: 0.1,
rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('animate');
}
});
}, observerOptions);

// Наблюдаем за элементами с классом .animate-on-scroll
document.querySelectorAll('.product-card, .feature, .section-header').forEach(el => {
observer.observe(el);
});

// Добавляем текущий год в футер
const yearElement = document.querySelector('.current-year');
if (yearElement) {
yearElement.textContent = new Date().getFullYear();
}
});

// Создаем стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.notification-content {
display: flex;
align-items: center;
gap: 10px;
}

.notification-content i {
font-size: 1.2rem;
}

@keyframes slideIn {
from { transform: translateX(100%); }
to { transform: translateX(0); }
}

@keyframes slideOut {
from { transform: translateX(0); }
to { transform: translateX(100%); }
}
`;

document.head.appendChild(notificationStyles);
