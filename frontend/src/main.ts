import './styles/main.css';
import './styles/header.css';
import './styles/modal.css';
import './styles/product.css';
import './styles/filters.css';
import './styles/cart.css';
import './styles/auth.css';
import './styles/delivery.css';

import { router } from './router/Router';
import { authStore } from './store/authStore';
import { Header } from './components/Header';
import { renderHomePage } from './pages/HomePage';
import { renderCartPage } from './pages/CartPage';
import { renderDeliveryPage } from './pages/DeliveryPage';
import { renderAuthPage } from './pages/AuthPage';
import { renderRegisterPage } from './pages/RegisterPage';

async function bootstrap(): Promise<void> {
  // 1. Проверяем сессию при старте
  await authStore.checkAuth();

  // 2. Рендерим шапку
  const headerRoot = document.getElementById('header-root');
  if (headerRoot) {
    const header = new Header();
    headerRoot.appendChild(header.render());

    authStore.subscribe(() => {
      headerRoot.innerHTML = '';
      const newHeader = new Header();
      headerRoot.appendChild(newHeader.render());
    });
  }

  // 3. Регистрируем маршруты
  router.addRoute('/', renderHomePage);
  router.addRoute('/auth', renderAuthPage);
  router.addRoute('/register', renderRegisterPage); // ← НОВЫЙ
  router.addRoute('/cart', renderCartPage);
  router.addRoute('/delivery', renderDeliveryPage);

  router.setNotFound(() => {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="not-found">
          <div style="font-size:72px;margin-bottom:16px">🌌</div>
          <h1>404 — Страница потеряна в космосе</h1>
          <p style="color:var(--color-text-secondary);margin:12px 0 24px">
            Такой страницы не существует
          </p>
          <a href="/" data-link class="btn btn-primary">
            ← На главную
          </a>
        </div>
      `;
    }
  });

  // 4. Запускаем роутер
  router.init();
}

bootstrap().catch(console.error);