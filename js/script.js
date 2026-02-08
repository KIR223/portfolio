/**
* DigitalStudio - Основной JavaScript файл
*
* Структура:
* 1. Конфигурация и константы
* 2. Утилитарные функции
* 3. Мобильная навигация
* 4. Формы и валидация
* 5. Портфолио и фильтрация
* 6. Модальные окна
* 7. Аккордеоны (FAQ)
* 8. Анимации и эффекты
* 9. Аналитика и отслеживание
* 10. Инициализация
*/

// ============================================================================
// 1. КОНФИГУРАЦИЯ И КОНСТАНТЫ
// ============================================================================

const CONFIG = {
// Настройки форм
formSelector: '.form',
inputSelector: '.form__input, .form__textarea, .form__select',
submitSelector: '[type="submit"]',
errorClass: 'form__error',
errorVisibleClass: 'form__error--visible',
invalidClass: 'form__input--invalid',

// Настройки API (заглушка)
apiEndpoint: 'https://jsonplaceholder.typicode.com/posts',

// Настройки анимаций
animationDuration: 300,
prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

// Локальное хранилище
storageKeys: {
theme: 'digitalstudio-theme',
formData: 'digitalstudio-form-data'
}
};

// ============================================================================
// 2. УТИЛИТАРНЫЕ ФУНКЦИИ
// ============================================================================

/**
* Дебаунс функция для оптимизации событий
*/
function debounce(func, wait) {
let timeout;
return function executedFunction(...args) {
const later = () => {
clearTimeout(timeout);
func(...args);
};
clearTimeout(timeout);
timeout = setTimeout(later, wait);
};
}

/**
* Функция для установки фокуса внутри элемента
*/
function trapFocus(element) {
const focusableElements = element.querySelectorAll(
'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);

if (focusableElements.length === 0) return;

const firstFocusableElement = focusableElements[0];
const lastFocusableElement = focusableElements[focusableElements.length - 1];

function handleTabKey(e) {
if (e.key !== 'Tab') return;

if (e.shiftKey) {
if (document.activeElement === firstFocusableElement) {
lastFocusableElement.focus();
e.preventDefault();
}
} else {
if (document.activeElement === lastFocusableElement) {
firstFocusableElement.focus();
e.preventDefault();
}
}
}

element.addEventListener('keydown', handleTabKey);
firstFocusableElement.focus();

// Очистка обработчика
return () => {
element.removeEventListener('keydown', handleTabKey);
};
}

/**
* Проверка поддержки современных возможностей браузера
*/
function checkBrowserSupport() {
const supports = {
fetch: 'fetch' in window,
intersectionObserver: 'IntersectionObserver' in window,
matchMedia: 'matchMedia' in window,
localStorage: 'localStorage' in window,
cssVariables: window.CSS && CSS.supports('color', 'var(--test)')
};

if (!supports.fetch) {
console.warn('Браузер не поддерживает Fetch API. Некоторые функции могут быть ограничены.');
}

return supports;
}

/**
* Генерация уникального ID
*/
function generateId() {
return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================================================
// 3. МОБИЛЬНАЯ НАВИГАЦИЯ
// ============================================================================

class MobileNavigation {
constructor() {
this.navToggle = document.querySelector('.nav__toggle');
this.navMenu = document.querySelector('.nav__list');
this.navLinks = document.querySelectorAll('.nav__link');
this.body = document.body;
this.overlay = null;
this.isOpen = false;

this.init();
}

init() {
if (!this.navToggle || !this.navMenu) return;

// Создаем оверлей для мобильного меню
this.createOverlay();

// Обработчик кнопки меню
this.navToggle.addEventListener('click', () => this.toggle());

// Закрытие меню при клике на ссылку
this.navLinks.forEach(link => {
link.addEventListener('click', () => this.close());
});

// Закрытие по клавише Escape
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && this.isOpen) {
this.close();
}
});

// Обновление ARIA атрибутов
this.updateAriaAttributes();
}

createOverlay() {
this.overlay = document.createElement('div');
this.overlay.className = 'nav__overlay';
this.overlay.setAttribute('aria-hidden', 'true');
this.overlay.addEventListener('click', () => this.close());

const header = document.querySelector('.header');
if (header) {
header.appendChild(this.overlay);
}
}

toggle() {
if (this.isOpen) {
this.close();
} else {
this.open();
}
}

open() {
this.isOpen = true;
this.navMenu.setAttribute('aria-hidden', 'false');
this.navToggle.setAttribute('aria-expanded', 'true');
this.body.style.overflow = 'hidden';

if (this.overlay) {
this.overlay.classList.add('active');
this.overlay.setAttribute('aria-hidden', 'false');
}

// Фокус внутри меню
this.focusTrapCleanup = trapFocus(this.navMenu);
}

close() {
this.isOpen = false;
this.navMenu.setAttribute('aria-hidden', 'true');
this.navToggle.setAttribute('aria-expanded', 'false');
this.body.style.overflow = '';

if (this.overlay) {
this.overlay.classList.remove('active');
this.overlay.setAttribute('aria-hidden', 'true');
}

// Возврат фокуса на кнопку меню
this.navToggle.focus();

// Очистка обработчика фокуса
if (this.focusTrapCleanup) {
this.focusTrapCleanup();
}
}

updateAriaAttributes() {
this.navMenu.setAttribute('aria-hidden', 'true');
this.navMenu.setAttribute('role', 'menu');
this.navToggle.setAttribute('aria-expanded', 'false');
this.navToggle.setAttribute('aria-controls', 'nav-menu');
}
}

// ============================================================================
// 4. ФОРМЫ И ВАЛИДАЦИЯ
// ============================================================================

class FormHandler {
constructor(form) {
this.form = form;
this.inputs = Array.from(form.querySelectorAll(CONFIG.inputSelector));
this.submitButton = form.querySelector(CONFIG.submitSelector);
this.honeypot = form.querySelector('[name="website"]');
this.isSubmitting = false;

this.init();
}

init() {
// Валидация в реальном времени
this.inputs.forEach(input => {
input.addEventListener('input', () => this.validateField(input));
input.addEventListener('blur', () => this.validateField(input));
});

// Обработка отправки формы
this.form.addEventListener('submit', (e) => this.handleSubmit(e));

// Автосохранение данных (опционально)
this.setupAutoSave();
}

validateField(input) {
const errorElement = this.getErrorElement(input);

// Очистка предыдущих ошибок
this.clearError(input);

// Проверка заполнения honeypot поля (защита от спама)
if (this.honeypot && this.honeypot.value.trim() !== '') {
this.showError(input, 'Обнаружена подозрительная активность');
return false;
}

// Проверка обязательных полей
if (input.hasAttribute('required') && !input.value.trim()) {
this.showError(input, 'Это поле обязательно для заполнения');
return false;
}

// Проверка email
if (input.type === 'email' && input.value.trim()) {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(input.value)) {
this.showError(input, 'Введите корректный email адрес');
return false;
}
}

// Проверка минимальной длины
if (input.hasAttribute('minlength')) {
const minLength = parseInt(input.getAttribute('minlength'));
if (input.value.length < minLength) {
this.showError(input, `Минимальная длина: ${minLength} символов`);
return false;
}
}

// Проверка максимальной длины
if (input.hasAttribute('maxlength')) {
const maxLength = parseInt(input.getAttribute('maxlength'));
if (input.value.length > maxLength) {
this.showError(input, `Максимальная длина: ${maxLength} символов`);
return false;
}
}

// Валидация прошла успешно
this.markAsValid(input);
return true;
}

validateForm() {
let isValid = true;

this.inputs.forEach(input => {
if (!this.validateField(input)) {
isValid = false;
}
});

return isValid;
}

showError(input, message) {
const errorElement = this.getErrorElement(input);
errorElement.textContent = message;
errorElement.classList.add(CONFIG.errorVisibleClass);
input.classList.add(CONFIG.invalidClass);
input.setAttribute('aria-invalid', 'true');

// Скролл к первой ошибке
if (!this.firstError) {
this.firstError = input;
input.focus();
}
}

clearError(input) {
const errorElement = this.getErrorElement(input);
errorElement.textContent = '';
errorElement.classList.remove(CONFIG.errorVisibleClass);
input.classList.remove(CONFIG.invalidClass);
input.setAttribute('aria-invalid', 'false');
}

markAsValid(input) {
input.classList.remove(CONFIG.invalidClass);
input.setAttribute('aria-invalid', 'false');
}

getErrorElement(input) {
const id = input.id;
if (!id) {
const generatedId = `input-${generateId()}`;
input.id = generatedId;
}

let errorElement = input.parentNode.querySelector(`.${CONFIG.errorClass}`);
if (!errorElement) {
errorElement = document.createElement('div');
errorElement.className = CONFIG.errorClass;
errorElement.id = `${input.id}-error`;
errorElement.setAttribute('aria-live', 'polite');
input.parentNode.appendChild(errorElement);
}

return errorElement;
}

async handleSubmit(e) {
e.preventDefault();

if (this.isSubmitting) return;

// Валидация формы
if (!this.validateForm()) {
this.shakeForm();
return;
}

// Защита от спама через honeypot
if (this.honeypot && this.honeypot.value.trim() !== '') {
console.log('Обнаружена попытка спама через honeypot поле');
this.showSuccess(); // Показываем успех даже при спаме, чтобы не раскрывать защиту
return;
}

this.isSubmitting = true;
this.setSubmittingState(true);

try {
// Сбор данных формы
const formData = new FormData(this.form);
const data = Object.fromEntries(formData);

// Отправка данных (заглушка)
const response = await fetch(CONFIG.apiEndpoint, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(data)
});

if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}

// Очистка сохраненных данных
this.clearSavedData();

// Показ сообщения об успехе
this.showSuccess();

// Сброс формы
this.form.reset();

} catch (error) {
console.error('Ошибка отправки формы:', error);
this.showError(this.form, 'Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
} finally {
this.isSubmitting = false;
this.setSubmittingState(false);
}
}

setSubmittingState(isSubmitting) {
if (this.submitButton) {
this.submitButton.disabled = isSubmitting;
this.submitButton.textContent = isSubmitting ? 'Отправка...' : 'Отправить';
}
}

showSuccess() {
// Создаем элемент сообщения об успехе
const successMessage = document.createElement('div');
successMessage.className = 'form-success';
successMessage.setAttribute('role', 'alert');
successMessage.innerHTML = `
<svg width="24" height="24" aria-hidden="true">
<use href="#icon-success"></use>
</svg>
<span>Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</span>
`;

// Добавляем стили
successMessage.style.cssText = `
display: flex;
align-items: center;
gap: 0.5rem;
padding: 1rem;
background: #10b981;
color: white;
border-radius: 0.5rem;
margin-top: 1rem;
animation: slideIn 0.3s ease;
`;

// Добавляем после формы
this.form.parentNode.insertBefore(successMessage, this.form.nextSibling);

// Удаляем через 5 секунд
setTimeout(() => {
successMessage.style.opacity = '0';
successMessage.style.transform = 'translateY(-10px)';
setTimeout(() => successMessage.remove(), 300);
}, 5000);
}

shakeForm() {
if (CONFIG.prefersReducedMotion) return;

this.form.style.animation = 'none';
requestAnimationFrame(() => {
this.form.style.animation = `shake 0.5s ease`;
setTimeout(() => {
this.form.style.animation = '';
}, 500);
});
}

setupAutoSave() {
// Сохранение данных формы при изменении
this.inputs.forEach(input => {
input.addEventListener('input', debounce(() => {
this.saveFormData();
}, 1000));
});

// Восстановление данных при загрузке
window.addEventListener('load', () => {
this.restoreFormData();
});
}

saveFormData() {
const data = {};
this.inputs.forEach(input => {
if (input.name && !input.name.includes('website')) { // Исключаем honeypot
data[input.name] = input.value;
}
});

try {
localStorage.setItem(CONFIG.storageKeys.formData, JSON.stringify(data));
} catch (e) {
console.warn('Не удалось сохранить данные формы:', e);
}
}

restoreFormData() {
try {
const saved = localStorage.getItem(CONFIG.storageKeys.formData);
if (!saved) return;

const data = JSON.parse(saved);
this.inputs.forEach(input => {
if (data[input.name] !== undefined) {
input.value = data[input.name];
}
});
} catch (e) {
console.warn('Не удалось восстановить данные формы:', e);
}
}

clearSavedData() {
try {
localStorage.removeItem(CONFIG.storageKeys.formData);
} catch (e) {
console.warn('Не удалось очистить сохраненные данные:', e);
}
}
}

// ============================================================================
// 5. ПОРТФОЛИО И ФИЛЬТРАЦИЯ
// ============================================================================

class PortfolioFilter {
constructor(container) {
this.container = container;
this.filters = container.querySelectorAll('[data-filter]');
this.items = container.querySelectorAll('[data-category]');
this.activeFilter = 'all';

this.init();
}

init() {
if (!this.container || this.filters.length === 0) return;

// Обработчики для фильтров
this.filters.forEach(filter => {
filter.addEventListener('click', (e) => {
e.preventDefault();
const filterValue = filter.getAttribute('data-filter');
this.setActiveFilter(filter);
this.filterItems(filterValue);
});
});

// Инициализация активного фильтра
const activeFilter = this.container.querySelector('[data-filter].active');
if (activeFilter) {
this.activeFilter = activeFilter.getAttribute('data-filter');
}
}

setActiveFilter(selectedFilter) {
this.filters.forEach(filter => {
filter.classList.remove('active');
filter.setAttribute('aria-pressed', 'false');
});

selectedFilter.classList.add('active');
selectedFilter.setAttribute('aria-pressed', 'true');
this.activeFilter = selectedFilter.getAttribute('data-filter');
}

filterItems(filterValue) {
this.items.forEach(item => {
const categories = item.getAttribute('data-category').split(' ');

if (filterValue === 'all' || categories.includes(filterValue)) {
this.showItem(item);
} else {
this.hideItem(item);
}
});

// Обновление URL (без перезагрузки)
this.updateUrl(filterValue);

// Анимация пересчета сетки
this.reflowGrid();
}

showItem(item) {
item.style.display = '';
item.setAttribute('aria-hidden', 'false');

// Анимация появления
if (!CONFIG.prefersReducedMotion) {
item.style.animation = 'fadeIn 0.5s ease';
setTimeout(() => {
item.style.animation = '';
}, 500);
}
}

hideItem(item) {
item.style.display = 'none';
item.setAttribute('aria-hidden', 'true');
}

updateUrl(filterValue) {
const url = new URL(window.location);
if (filterValue === 'all') {
url.searchParams.delete('filter');
} else {
url.searchParams.set('filter', filterValue);
}

window.history.replaceState({}, '', url);
}

reflowGrid() {
// Принудительный reflow для корректной работы CSS Grid
this.container.style.display = 'grid';
void this.container.offsetWidth;
}
}

// ============================================================================
// 6. МОДАЛЬНЫЕ ОКНА
// ============================================================================

class Modal {
constructor(trigger, modalId) {
this.trigger = trigger;
this.modal = document.getElementById(modalId);
this.closeButton = this.modal?.querySelector('[data-modal-close]');
this.body = document.body;
this.focusableElements = null;
this.previousFocus = null;
this.focusTrapCleanup = null;

this.init();
}

init() {
if (!this.modal) return;

// Открытие модального окна
this.trigger.addEventListener('click', (e) => {
e.preventDefault();
this.open();
});

// Закрытие по кнопке
if (this.closeButton) {
this.closeButton.addEventListener('click', () => this.close());
}

// Закрытие по клику вне окна
this.modal.addEventListener('click', (e) => {
if (e.target === this.modal) {
this.close();
}
});

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && this.modal.getAttribute('aria-hidden') === 'false') {
this.close();
}
});

// Инициализация ARIA атрибутов
this.modal.setAttribute('aria-hidden', 'true');
this.modal.setAttribute('role', 'dialog');
this.modal.setAttribute('aria-modal', 'true');

if (!this.modal.hasAttribute('aria-labelledby') && !this.modal.hasAttribute('aria-label')) {
const title = this.modal.querySelector('h2, h3, [role="heading"]');
if (title) {
if (!title.id) {
title.id = `modal-title-${generateId()}`;
}
this.modal.setAttribute('aria-labelledby', title.id);
} else {
this.modal.setAttribute('aria-label', 'Модальное окно');
}
}
}

open() {
this.previousFocus = document.activeElement;
this.modal.setAttribute('aria-hidden', 'false');
this.body.style.overflow = 'hidden';

// Показ модального окна
this.modal.style.display = 'flex';

// Анимация появления
if (!CONFIG.prefersReducedMotion) {
this.modal.style.animation = 'modalFadeIn 0.3s ease';
}

// Фокус внутри модального окна
this.focusTrapCleanup = trapFocus(this.modal);
}

close() {
this.modal.setAttribute('aria-hidden', 'true');
this.body.style.overflow = '';

// Анимация скрытия
if (!CONFIG.prefersReducedMotion) {
this.modal.style.animation = 'modalFadeOut 0.3s ease';
setTimeout(() => {
this.modal.style.display = 'none';
this.modal.style.animation = '';
}, 300);
} else {
this.modal.style.display = 'none';
}

// Возврат фокуса
if (this.previousFocus) {
this.previousFocus.focus();
}

// Очистка обработчика фокуса
if (this.focusTrapCleanup) {
this.focusTrapCleanup();
}
}
}

// ============================================================================
// 7. АККОРДЕОНЫ (FAQ)
// ============================================================================

class Accordion {
constructor(container) {
this.container = container;
this.items = container.querySelectorAll('[data-accordion-item]');
this.openClass = 'accordion__item--open';

this.init();
}

init() {
if (!this.container || this.items.length === 0) return;

this.items.forEach(item => {
const button = item.querySelector('[data-accordion-toggle]');
const content = item.querySelector('[data-accordion-content]');

if (!button || !content) return;

// ARIA атрибуты
const itemId = content.id || `accordion-content-${generateId()}`;
const buttonId = button.id || `accordion-button-${generateId()}`;

content.id = itemId;
button.id = buttonId;
button.setAttribute('aria-controls', itemId);
button.setAttribute('aria-expanded', 'false');

// Обработчик клика
button.addEventListener('click', () => this.toggleItem(item));

// Закрытие при нажатии Enter или Space
button.addEventListener('keydown', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
this.toggleItem(item);
}
});

// Инициализация состояния
if (item.classList.contains(this.openClass)) {
button.setAttribute('aria-expanded', 'true');
content.setAttribute('aria-hidden', 'false');
} else {
content.setAttribute('aria-hidden', 'true');
}
});
}

toggleItem(item) {
const isOpen = item.classList.contains(this.openClass);
const button = item.querySelector('[data-accordion-toggle]');
const content = item.querySelector('[data-accordion-content]');

if (isOpen) {
this.closeItem(item);
} else {
this.openItem(item);

// Закрытие других открытых элементов (опционально)
if (this.container.hasAttribute('data-accordion-single')) {
this.items.forEach(otherItem => {
if (otherItem !== item && otherItem.classList.contains(this.openClass)) {
this.closeItem(otherItem);
}
});
}
}

// Обновление ARIA атрибутов
button.setAttribute('aria-expanded', (!isOpen).toString());
content.setAttribute('aria-hidden', isOpen.toString());
}

openItem(item) {
item.classList.add(this.openClass);
const content = item.querySelector('[data-accordion-content]');

if (!CONFIG.prefersReducedMotion) {
content.style.maxHeight = content.scrollHeight + 'px';
} else {
content.style.maxHeight = 'none';
}
}

closeItem(item) {
item.classList.remove(this.openClass);
const content = item.querySelector('[data-accordion-content]');

if (!CONFIG.prefersReducedMotion) {
content.style.maxHeight = '0';
} else {
content.style.maxHeight = 'none';
}
}
}

// ============================================================================
// 8. АНИМАЦИИ И ЭФФЕКТЫ
// ============================================================================

class Animations {
constructor() {
this.observerOptions = {
root: null,
rootMargin: '50px',
threshold: 0.1
};

this.init();
}

init() {
if (CONFIG.prefersReducedMotion) return;

// Добавление CSS анимаций
this.addKeyframes();

// Наблюдатель за появлением элементов
this.setupIntersectionObserver();

// Плавная прокрутка
this.setupSmoothScroll();
}

addKeyframes() {
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
from { opacity: 0; transform: translateY(20px); }
to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
from { opacity: 0; transform: translateX(-20px); }
to { opacity: 1; transform: translateX(0); }
}

@keyframes shake {
0%, 100% { transform: translateX(0); }
10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes modalFadeIn {
from { opacity: 0; transform: scale(0.9); }
to { opacity: 1; transform: scale(1); }
}

@keyframes modalFadeOut {
from { opacity: 1; transform: scale(1); }
to { opacity: 0; transform: scale(0.9); }
}

@keyframes pulse {
0% { transform: scale(1); }
50% { transform: scale(1.05); }
100% { transform: scale(1); }
}

.animate-on-scroll {
opacity: 0;
transform: translateY(20px);
transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.animated {
opacity: 1;
transform: translateY(0);
}
`;

document.head.appendChild(style);
}

setupIntersectionObserver() {
if (!('IntersectionObserver' in window)) return;

const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('animated');
observer.unobserve(entry.target);
}
});
}, this.observerOptions);

// Наблюдение за элементами с классом animate-on-scroll
document.querySelectorAll('.animate-on-scroll').forEach(el => {
observer.observe(el);
});
}

setupSmoothScroll() {
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
const href = this.getAttribute('href');

if (href === '#') return;

const target = document.querySelector(href);
if (target) {
e.preventDefault();

target.scrollIntoView({
behavior: 'smooth',
block: 'start'
});

// Обновление URL без перезагрузки
if (href !== '#main-content') {
history.pushState(null, null, href);
}
}
});
});
}
}

// ============================================================================
// 9. АНАЛИТИКА И ОТСЛЕЖИВАНИЕ
// ============================================================================

class Analytics {
constructor() {
this.consentGiven = false;
this.init();
}

init() {
// Проверка согласия пользователя
this.checkConsent();

// Отслеживание событий (если согласие получено)
if (this.consentGiven) {
this.setupEventTracking();
}
}

checkConsent() {
// Проверка localStorage на наличие согласия
try {
const consent = localStorage.getItem('analytics-consent');
this.consentGiven = consent === 'granted';
} catch (e) {
console.warn('Не удалось проверить согласие на аналитику:', e);
}
}

setupEventTracking() {
// Отслеживание кликов по внешним ссылкам
document.addEventListener('click', (e) => {
const link = e.target.closest('a');
if (link && link.hostname !== window.location.hostname) {
this.trackEvent('external_link_click', {
url: link.href,
text: link.textContent.trim()
});
}
});

// Отслеживание отправки форм
document.addEventListener('submit', (e) => {
if (e.target.matches('.form')) {
this.trackEvent('form_submit', {
form_id: e.target.id || 'unknown'
});
}
});

// Отслеживание просмотра страницы
window.addEventListener('load', () => {
this.trackEvent('page_view', {
url: window.location.pathname,
title: document.title
});
});
}

trackEvent(eventName, data = {}) {
// Заглушка для аналитики
console.log('Event tracked:', eventName, data);

// Здесь можно подключить Google Analytics, Yandex.Metrica и т.д.
// if (typeof gtag !== 'undefined') {
// gtag('event', eventName, data);
// }
}

requestConsent() {
// Создание баннера запроса согласия
const banner = document.createElement('div');
banner.className = 'consent-banner';
banner.innerHTML = `
<div class="consent-banner__content">
<p>Мы используем файлы cookie для улучшения работы сайта. Вы можете разрешить их использование или отказаться.</p>
<div class="consent-banner__actions">
<button class="btn btn--small" data-consent="accept">Разрешить</button>
<button class="btn btn--secondary btn--small" data-consent="reject">Отказаться</button>
</div>
</div>
`;

// Стили баннера
banner.style.cssText = `
position: fixed;
bottom: 0;
left: 0;
right: 0;
background: var(--color-surface);
padding: 1rem;
box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
z-index: var(--z-modal);
animation: slideIn 0.3s ease;
`;

document.body.appendChild(banner);

// Обработчики кнопок
banner.querySelectorAll('[data-consent]').forEach(button => {
button.addEventListener('click', () => {
const consent = button.getAttribute('data-consent');
this.handleConsent(consent);
banner.remove();
});
});
}

handleConsent(consent) {
this.consentGiven = consent === 'accept';

try {
localStorage.setItem('analytics-consent', consent);
} catch (e) {
console.warn('Не удалось сохранить согласие:', e);
}

if (this.consentGiven) {
this.setupEventTracking();
}
}
}

// ============================================================================
// 10. ИНИЦИАЛИЗАЦИЯ
// ============================================================================

class DigitalStudioApp {
constructor() {
this.components = {};
this.init();
}

init() {
// Проверка поддержки браузера
const supports = checkBrowserSupport();

// Инициализация компонентов
this.initComponents();

// Настройка темы (если требуется)
this.initTheme();

// Запрос согласия на аналитику (если не было получено ранее)
this.initAnalytics();

// Глобальные обработчики ошибок
this.setupErrorHandling();

// Отслеживание производительности
this.trackPerformance();
}

initComponents() {
// Мобильная навигация
this.components.navigation = new MobileNavigation();

// Формы
document.querySelectorAll(CONFIG.formSelector).forEach(form => {
new FormHandler(form);
});

// Фильтрация портфолио
const portfolioContainer = document.querySelector('[data-portfolio]');
if (portfolioContainer) {
this.components.portfolio = new PortfolioFilter(portfolioContainer);
}

// Модальные окна
document.querySelectorAll('[data-modal-open]').forEach(trigger => {
const modalId = trigger.getAttribute('data-modal-open');
new Modal(trigger, modalId);
});

// Аккордеоны
document.querySelectorAll('[data-accordion]').forEach(container => {
new Accordion(container);
});

// Анимации
if (!CONFIG.prefersReducedMotion) {
this.components.animations = new Animations();
}
}

initTheme() {
// Проверка сохраненной темы
try {
const savedTheme = localStorage.getItem(CONFIG.storageKeys.theme);
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
this.enableDarkTheme();
}
} catch (e) {
console.warn('Не удалось загрузить тему:', e);
}

// Переключатель темы (если есть на странице)
const themeToggle = document.querySelector('[data-theme-toggle]');
if (themeToggle) {
themeToggle.addEventListener('click', () => this.toggleTheme());
}
}

enableDarkTheme() {
document.documentElement.setAttribute('data-theme', 'dark');

// Обновление CSS переменных для темной темы
const root = document.documentElement;
root.style.setProperty('--color-background', 'var(--color-dark-background)');
root.style.setProperty('--color-surface', 'var(--color-dark-surface)');
root.style.setProperty('--color-border', 'var(--color-dark-border)');
root.style.setProperty('--color-text', 'var(--color-dark-text)');
root.style.setProperty('--color-text-light', 'var(--color-dark-text-light)');
root.style.setProperty('--color-text-lighter', 'var(--color-dark-text-lighter)');
}

disableDarkTheme() {
document.documentElement.removeAttribute('data-theme');

// Восстановление CSS переменных для светлой темы
const root = document.documentElement;
root.style.removeProperty('--color-background');
root.style.removeProperty('--color-surface');
root.style.removeProperty('--color-border');
root.style.removeProperty('--color-text');
root.style.removeProperty('--color-text-light');
root.style.removeProperty('--color-text-lighter');
}

toggleTheme() {
const isDark = document.documentElement.hasAttribute('data-theme');

if (isDark) {
this.disableDarkTheme();
localStorage.setItem(CONFIG.storageKeys.theme, 'light');
} else {
this.enableDarkTheme();
localStorage.setItem(CONFIG.storageKeys.theme, 'dark');
}
}

initAnalytics() {
// Проверяем, нужно ли запрашивать согласие
try {
const consent = localStorage.getItem('analytics-consent');
if (!consent) {
this.components.analytics = new Analytics();
// Раскомментировать для показа баннера согласия
// setTimeout(() => this.components.analytics.requestConsent(), 2000);
} else if (consent === 'granted') {
this.components.analytics = new Analytics();
}
} catch (e) {
console.warn('Не удалось инициализировать аналитику:', e);
}
}

setupErrorHandling() {
// Обработчик ошибок JavaScript
window.addEventListener('error', (e) => {
console.error('JavaScript ошибка:', e.error);

// Отправка ошибки на сервер (если настроено)
// this.reportError(e.error);
});

// Обработчик неперехваченных Promise rejection
window.addEventListener('unhandledrejection', (e) => {
console.error('Необработанная ошибка Promise:', e.reason);
});
}

trackPerformance() {
// Отслеживание метрик производительности
if ('performance' in window && 'getEntriesByType' in performance) {
window.addEventListener('load', () => {
setTimeout(() => {
const paintMetrics = performance.getEntriesByType('paint');
const navigationMetrics = performance.getEntriesByType('navigation')[0];

console.log('Метрики производительности:', {
firstPaint: paintMetrics.find(m => m.name === 'first-paint')?.startTime,
firstContentfulPaint: paintMetrics.find(m => m.name === 'first-contentful-paint')?.startTime,
pageLoadTime: navigationMetrics?.loadEventEnd - navigationMetrics?.startTime,
domContentLoaded: navigationMetrics?.domContentLoadedEventEnd - navigationMetrics?.startTime
});
}, 0);
});
}
}

reportError(error) {
// Отправка ошибок на сервер для анализа
const errorData = {
message: error.message,
stack: error.stack,
url: window.location.href,
userAgent: navigator.userAgent,
timestamp: new Date().toISOString()
};

// Отправка через navigator.sendBeacon или fetch
if (navigator.sendBeacon) {
navigator.sendBeacon('/api/error-log', JSON.stringify(errorData));
}
}
}

// ============================================================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================================================

// Ожидание полной загрузки DOM
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
window.DigitalStudio = new DigitalStudioApp();
});
} else {
window.DigitalStudio = new DigitalStudioApp();
}

// Экспорт для использования в консоли (если нужно)
window.DigitalStudioApp = DigitalStudioApp;
// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ КОМПОНЕНТЫ
// ============================================================================

/**
* Табы для страниц услуг
*/
class Tabs {
constructor(container) {
this.container = container;
this.tabs = container.querySelectorAll('[role="tab"]');
this.panels = container.querySelectorAll('[role="tabpanel"]');
this.activeTab = null;

this.init();
}

init() {
if (!this.container || this.tabs.length === 0) return;

// Находим активную вкладку
this.activeTab = this.container.querySelector('[role="tab"][aria-selected="true"]');
if (!this.activeTab) {
this.activeTab = this.tabs[0];
this.setActiveTab(this.activeTab);
}

// Обработчики для вкладок
this.tabs.forEach(tab => {
tab.addEventListener('click', (e) => {
e.preventDefault();
this.setActiveTab(tab);
});

tab.addEventListener('keydown', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
this.setActiveTab(tab);
}

// Навигация стрелками
if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
this.handleArrowKeys(e, tab);
}
});
});
}

setActiveTab(tab) {
// Деактивируем все вкладки
this.tabs.forEach(t => {
t.setAttribute('aria-selected', 'false');
t.classList.remove('active');
});

// Скрываем все панели
this.panels.forEach(panel => {
panel.hidden = true;
panel.classList.remove('active');
});

// Активируем выбранную вкладку
tab.setAttribute('aria-selected', 'true');
tab.classList.add('active');

// Показываем соответствующую панель
const panelId = tab.getAttribute('aria-controls');
const panel = document.getElementById(panelId);
if (panel) {
panel.hidden = false;
panel.classList.add('active');
}

// Фокус на активной вкладке
tab.focus();
}

handleArrowKeys(e, currentTab) {
e.preventDefault();

const direction = e.key === 'ArrowRight' ? 1 : -1;
const tabsArray = Array.from(this.tabs);
const currentIndex = tabsArray.indexOf(currentTab);
let nextIndex = currentIndex + direction;

// Циклическая навигация
if (nextIndex < 0) nextIndex = tabsArray.length - 1;
if (nextIndex >= tabsArray.length) nextIndex = 0;

this.setActiveTab(tabsArray[nextIndex]);
}
}

/**
* Поиск по блогу
*/
class BlogSearch {
constructor() {
this.searchForms = document.querySelectorAll('.search-form');
this.articles = document.querySelectorAll('[data-category]');
this.searchInputs = document.querySelectorAll('input[type="search"]');

this.init();
}

init() {
if (this.searchForms.length === 0) return;

this.searchForms.forEach(form => {
form.addEventListener('submit', (e) => this.handleSearch(e));
});

this.searchInputs.forEach(input => {
input.addEventListener('input', debounce(() => {
this.performSearch(input.value);
}, 300));
});
}

handleSearch(e) {
e.preventDefault();
const form = e.target;
const input = form.querySelector('input[type="search"]');
if (input && input.value.trim()) {
this.performSearch(input.value.trim());
}
}

performSearch(query) {
if (!this.articles.length) return;

const normalizedQuery = query.toLowerCase().trim();

this.articles.forEach(article => {
const title = article.querySelector('h2, h3, .blog-article__title')?.textContent || '';
const excerpt = article.querySelector('.blog-article__excerpt')?.textContent || '';
const content = title + ' ' + excerpt;

if (normalizedQuery === '' || content.toLowerCase().includes(normalizedQuery)) {
this.showElement(article);
} else {
this.hideElement(article);
}
});

// Показать сообщение, если ничего не найдено
this.showNoResultsMessage(query);
}

showElement(element) {
element.style.display = '';
element.setAttribute('aria-hidden', 'false');
}

hideElement(element) {
element.style.display = 'none';
element.setAttribute('aria-hidden', 'true');
}

showNoResultsMessage(query) {
const container = document.querySelector('.blog-articles');
if (!container) return;

// Удаляем предыдущее сообщение
const existingMessage = container.querySelector('.no-results-message');
if (existingMessage) {
existingMessage.remove();
}

// Проверяем, есть ли видимые статьи
const visibleArticles = Array.from(this.articles).filter(article =>
article.style.display !== 'none'
);

if (visibleArticles.length === 0 && query.trim() !== '') {
const message = document.createElement('div');
message.className = 'no-results-message';
message.innerHTML = `
<p>По запросу "<strong>${query}</strong>" ничего не найдено.</p>
<p>Попробуйте изменить поисковый запрос или посмотрите другие статьи.</p>
`;
message.style.cssText = `
grid-column: 1 / -1;
text-align: center;
padding: 3rem;
background: var(--color-surface);
border-radius: var(--border-radius);
margin: 2rem 0;
`;

container.appendChild(message);
}
}
}

/**
* Ленивая загрузка изображений
*/
class LazyLoader {
constructor() {
this.images = document.querySelectorAll('img[loading="lazy"]');
this.observer = null;

this.init();
}

init() {
if (!('IntersectionObserver' in window)) {
// Fallback для старых браузеров
this.loadImagesImmediately();
return;
}

this.observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const img = entry.target;
this.loadImage(img);
this.observer.unobserve(img);
}
});
}, {
rootMargin: '50px',
threshold: 0.1
});

this.images.forEach(img => {
this.observer.observe(img);
});
}

loadImage(img) {
const src = img.getAttribute('data-src') || img.src;
const srcset = img.getAttribute('data-srcset');

if (srcset) {
img.srcset = srcset;
}

img.src = src;
img.classList.add('loaded');

// Загрузка фонового изображения, если есть
const bgSrc = img.getAttribute('data-bg');
if (bgSrc) {
img.style.backgroundImage = `url(${bgSrc})`;
}
}

loadImagesImmediately() {
this.images.forEach(img => {
this.loadImage(img);
});
}
}

/**
* Плавный скролл к якорям
*/
class SmoothScroller {
constructor() {
this.links = document.querySelectorAll('a[href^="#"]');
this.init();
}

init() {
this.links.forEach(link => {
link.addEventListener('click', (e) => this.handleClick(e));
});
}

handleClick(e) {
const link = e.currentTarget;
const href = link.getAttribute('href');

if (href === '#' || href === '#!') return;

const target = document.querySelector(href);
if (target) {
e.preventDefault();
this.scrollToElement(target);

// Обновление URL
if (href !== '#main-content') {
history.pushState(null, null, href);
}

// Фокус на целевом элементе для доступности
if (!target.hasAttribute('tabindex')) {
target.setAttribute('tabindex', '-1');
}
target.focus();
}
}

scrollToElement(element) {
const elementPosition = element.getBoundingClientRect().top;
const offsetPosition = elementPosition + window.pageYOffset - 80; // Учитываем фиксированную шапку

window.scrollTo({
top: offsetPosition,
behavior: 'smooth'
});
}
}

/**
* Валидация форм в реальном времени
*/
class LiveValidator {
constructor() {
this.forms = document.querySelectorAll('form');
this.init();
}

init() {
this.forms.forEach(form => {
const inputs = form.querySelectorAll('input, textarea, select');

inputs.forEach(input => {
input.addEventListener('blur', () => this.validateInput(input));
input.addEventListener('input', () => this.clearError(input));
});
});
}

validateInput(input) {
const value = input.value.trim();
let isValid = true;
let message = '';

// Проверка обязательных полей
if (input.hasAttribute('required') && !value) {
isValid = false;
message = 'Это поле обязательно для заполнения';
}

// Проверка email
if (input.type === 'email' && value) {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(value)) {
isValid = false;
message = 'Введите корректный email адрес';
}
}

// Проверка телефона
if (input.type === 'tel' && value) {
const phoneRegex = /^[\d\s\-\+\(\)]+$/;
if (!phoneRegex.test(value)) {
isValid = false;
message = 'Введите корректный номер телефона';
}
}

// Проверка минимальной длины
if (input.hasAttribute('minlength') && value.length < parseInt(input.getAttribute('minlength'))) {
isValid = false;
message = `Минимальная длина: ${input.getAttribute('minlength')} символов`;
}

// Проверка максимальной длины
if (input.hasAttribute('maxlength') && value.length > parseInt(input.getAttribute('maxlength'))) {
isValid = false;
message = `Максимальная длина: ${input.getAttribute('maxlength')} символов`;
}

// Показ/очистка ошибки
if (!isValid) {
this.showError(input, message);
} else {
this.clearError(input);
}

return isValid;
}

showError(input, message) {
this.clearError(input);

const error = document.createElement('div');
error.className = 'live-error';
error.textContent = message;
error.style.cssText = `
color: var(--color-error);
font-size: var(--font-size-sm);
margin-top: var(--spacing-1);
`;

input.parentNode.appendChild(error);
input.classList.add('invalid');
input.setAttribute('aria-invalid', 'true');
}

clearError(input) {
const existingError = input.parentNode.querySelector('.live-error');
if (existingError) {
existingError.remove();
}

input.classList.remove('invalid');
input.setAttribute('aria-invalid', 'false');
}
}

/**
* Кастомный селект
*/
class CustomSelect {
constructor(select) {
this.select = select;
this.wrapper = null;
this.button = null;
this.list = null;
this.options = [];

this.init();
}

init() {
if (!this.select) return;

// Скрываем нативный селект
this.select.style.display = 'none';

// Создаем кастомный селект
this.createCustomSelect();

// Обработчики событий
this.button.addEventListener('click', () => this.toggle());
document.addEventListener('click', (e) => this.handleClickOutside(e));
document.addEventListener('keydown', (e) => this.handleKeydown(e));
}

createCustomSelect() {
this.wrapper = document.createElement('div');
this.wrapper.className = 'custom-select';
this.wrapper.style.cssText = `
position: relative;
width: 100%;
`;

this.button = document.createElement('button');
this.button.className = 'custom-select__button';
this.button.setAttribute('type', 'button');
this.button.setAttribute('aria-haspopup', 'listbox');
this.button.setAttribute('aria-expanded', 'false');
this.button.style.cssText = `
width: 100%;
padding: var(--spacing-3) var(--spacing-4);
border: 1px solid var(--color-border);
border-radius: var(--border-radius);
background: var(--color-background);
text-align: left;
font-family: inherit;
font-size: var(--font-size-base);
cursor: pointer;
display: flex;
justify-content: space-between;
align-items: center;
`;

this.list = document.createElement('ul');
this.list.className = 'custom-select__list';
this.list.setAttribute('role', 'listbox');
this.list.setAttribute('aria-hidden', 'true');
this.list.style.cssText = `
position: absolute;
top: 100%;
left: 0;
right: 0;
margin: 0;
padding: 0;
list-style: none;
background: var(--color-background);
border: 1px solid var(--color-border);
border-radius: var(--border-radius);
max-height: 200px;
overflow-y: auto;
z-index: var(--z-dropdown);
display: none;
`;

// Заполняем опции
const selectOptions = this.select.querySelectorAll('option');
selectOptions.forEach((option, index) => {
if (option.value === '') return; // Пропускаем пустую опцию

const li = document.createElement('li');
li.setAttribute('role', 'option');
li.setAttribute('data-value', option.value);
li.textContent = option.textContent;
li.style.cssText = `
padding: var(--spacing-3) var(--spacing-4);
cursor: pointer;
transition: background-color var(--transition-fast);
`;

li.addEventListener('click', () => this.selectOption(option.value));
li.addEventListener('mouseenter', () => {
li.style.backgroundColor = 'var(--color-surface)';
});
li.addEventListener('mouseleave', () => {
li.style.backgroundColor = '';
});

this.list.appendChild(li);
this.options.push(li);

// Устанавливаем выбранную по умолчанию опцию
if (option.selected) {
this.button.textContent = option.textContent;
li.setAttribute('aria-selected', 'true');
li.style.backgroundColor = 'var(--color-surface)';
}
});

// Добавляем стрелку
const arrow = document.createElement('span');
arrow.textContent = '▼';
arrow.style.cssText = `
font-size: var(--font-size-sm);
transition: transform var(--transition-normal);
`;
this.button.appendChild(arrow);

// Собираем компонент
this.wrapper.appendChild(this.button);
this.wrapper.appendChild(this.list);
this.select.parentNode.insertBefore(this.wrapper, this.select.nextSibling);
}

toggle() {
const isExpanded = this.button.getAttribute('aria-expanded') === 'true';
this.button.setAttribute('aria-expanded', !isExpanded);
this.list.setAttribute('aria-hidden', isExpanded);

if (!isExpanded) {
this.list.style.display = 'block';
this.button.querySelector('span').style.transform = 'rotate(180deg)';
} else {
this.list.style.display = 'none';
this.button.querySelector('span').style.transform = 'rotate(0deg)';
}
}

selectOption(value) {
// Обновляем нативный селект
this.select.value = value;
this.select.dispatchEvent(new Event('change', { bubbles: true }));

// Обновляем кастомный селект
const selectedOption = this.select.querySelector(`option[value="${value}"]`);
if (selectedOption) {
this.button.textContent = selectedOption.textContent;

// Обновляем стили опций
this.options.forEach(option => {
option.setAttribute('aria-selected', 'false');
option.style.backgroundColor = '';
});

const selectedLi = this.list.querySelector(`[data-value="${value}"]`);
if (selectedLi) {
selectedLi.setAttribute('aria-selected', 'true');
selectedLi.style.backgroundColor = 'var(--color-surface)';
}
}

this.toggle();
}

handleClickOutside(e) {
if (!this.wrapper.contains(e.target)) {
this.button.setAttribute('aria-expanded', 'false');
this.list.setAttribute('aria-hidden', 'true');
this.list.style.display = 'none';
this.button.querySelector('span').style.transform = 'rotate(0deg)';
}
}

handleKeydown(e) {
if (this.list.style.display !== 'block') return;

const currentIndex = this.options.findIndex(option =>
option.getAttribute('aria-selected') === 'true'
);

switch (e.key) {
case 'ArrowDown':
e.preventDefault();
this.navigateOptions(currentIndex + 1);
break;
case 'ArrowUp':
e.preventDefault();
this.navigateOptions(currentIndex - 1);
break;
case 'Enter':
e.preventDefault();
if (currentIndex !== -1) {
this.selectOption(this.options[currentIndex].getAttribute('data-value'));
}
break;
case 'Escape':
e.preventDefault();
this.toggle();
break;
}
}

navigateOptions(index) {
if (index < 0) index = this.options.length - 1;
if (index >= this.options.length) index = 0;

this.options.forEach(option => {
option.setAttribute('aria-selected', 'false');
option.style.backgroundColor = '';
});

const option = this.options[index];
option.setAttribute('aria-selected', 'true');
option.style.backgroundColor = 'var(--color-surface)';
option.scrollIntoView({ block: 'nearest' });
}
}
initComponents() {
// Существующие компоненты...
this.components.navigation = new MobileNavigation();

// Формы
document.querySelectorAll(CONFIG.formSelector).forEach(form => {
new FormHandler(form);
});

// Фильтрация портфолио
const portfolioContainer = document.querySelector('[data-portfolio]');
if (portfolioContainer) {
this.components.portfolio = new PortfolioFilter(portfolioContainer);
}

// Модальные окна
document.querySelectorAll('[data-modal-open]').forEach(trigger => {
const modalId = trigger.getAttribute('data-modal-open');
new Modal(trigger, modalId);
});

// Аккордеоны
document.querySelectorAll('[data-accordion]').forEach(container => {
new Accordion(container);
});

// Анимации
if (!CONFIG.prefersReducedMotion) {
this.components.animations = new Animations();
}

// НОВЫЕ КОМПОНЕНТЫ

// Табы
const tabContainers = document.querySelectorAll('[role="tablist"]');
tabContainers.forEach(container => {
new Tabs(container);
});

// Поиск по блогу
const blogContainer = document.querySelector('[data-blog]');
if (blogContainer) {
this.components.blogSearch = new BlogSearch();
}

// Ленивая загрузка
this.components.lazyLoader = new LazyLoader();

// Плавный скролл
this.components.scroller = new SmoothScroller();

// Валидация в реальном времени
this.components.validator = new LiveValidator();

// Кастомные селекты
const customSelects = document.querySelectorAll('select:not([multiple])');
customSelects.forEach(select => {
if (!select.classList.contains('no-custom')) {
new CustomSelect(select);
}
});

// Инициализация фильтров блога
this.initBlogFilters();

// Инициализация галереи
this.initGallery();

// Инициализация подсветки кода
this.initCodeHighlighting();
}
initBlogFilters() {
const categoryButtons = document.querySelectorAll('.category-filter');
const categorySections = document.querySelectorAll('.faq-category-section');

categoryButtons.forEach(button => {
button.addEventListener('click', (e) => {
e.preventDefault();
const category = button.getAttribute('data-category');

// Обновляем активную кнопку
categoryButtons.forEach(btn => {
btn.classList.remove('active');
btn.setAttribute('aria-pressed', 'false');
});
button.classList.add('active');
button.setAttribute('aria-pressed', 'true');

// Показываем/скрываем секции
categorySections.forEach(section => {
if (category === 'all' || section.id === category) {
section.hidden = false;
} else {
section.hidden = true;
}
});

// Прокрутка к секции
if (category !== 'all') {
const targetSection = document.getElementById(category);
if (targetSection) {
targetSection.scrollIntoView({ behavior: 'smooth' });
}
}
});
});
}

initGallery() {
const galleryLinks = document.querySelectorAll('.project-gallery__item a');

galleryLinks.forEach(link => {
link.addEventListener('click', (e) => {
e.preventDefault();

const imgSrc = link.getAttribute('href');
const modalId = link.getAttribute('data-modal-open');

if (modalId) {
// Используем существующее модальное окно
const modal = document.getElementById(modalId);
if (modal) {
const modalImg = modal.querySelector('img');
if (modalImg) {
modalImg.src = imgSrc;
modalImg.alt = link.querySelector('img')?.alt || '';
}

// Открываем модальное окно
const modalInstance = new Modal(link, modalId);
modalInstance.open();
}
} else {
// Создаем временное модальное окно
this.createImageModal(imgSrc, link.querySelector('img')?.alt || '');
}
});
});
}

createImageModal(src, alt) {
const modalId = 'temp-image-modal-' + Date.now();

const modal = document.createElement('div');
modal.id = modalId;
modal.className = 'modal';
modal.setAttribute('aria-hidden', 'true');
modal.innerHTML = `
<div class="modal__content">
<button class="modal__close" data-modal-close aria-label="Закрыть модальное окно">×</button>
<img src="${src}" alt="${alt}">
</div>
`;

document.body.appendChild(modal);

const trigger = document.createElement('button');
trigger.style.display = 'none';

const modalInstance = new Modal(trigger, modalId);
modalInstance.open();

// Удаляем модальное окно после закрытия
modal.addEventListener('modal:close', () => {
setTimeout(() => modal.remove(), 300);
});
}

initCodeHighlighting() {
const codeBlocks = document.querySelectorAll('pre code');

if (codeBlocks.length === 0) return;

// Простая подсветка синтаксиса (можно заменить на библиотеку типа Prism.js)
codeBlocks.forEach(block => {
const code = block.textContent;
const highlighted = this.highlightSyntax(code);
block.innerHTML = highlighted;
});
}

highlightSyntax(code) {
// Простая подсветка для демонстрации
return code
.replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
.replace(/(function|class|const|let|var|return|if|else|for|while|async|await)(?=\s)/g, '<span class="keyword">$1</span>')
.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="string">$1</span>')
.replace(/(\d+)/g, '<span class="number">$1</span>')
.replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
}

