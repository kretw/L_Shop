import { Cart } from '../components/Cart';
import { authStore } from '../store/authStore';
import { router } from '../router/Router';
import '../styles/cart.css';

export async function renderCartPage(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  // Защита — только для залогиненных
  if (!authStore.getState().isLoggedIn) {
    router.navigate('/auth');
    return;
  }

  app.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      Загрузка корзины...
    </div>
  `;

  try {
    const cart = new Cart();
    const el = await cart.render();
    app.innerHTML = '';
    app.appendChild(el);
  } catch (err) {
    console.error('CartPage error:', err);
    app.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h2>Ошибка загрузки</h2>
      </div>
    `;
  }
}