import { DeliveryForm } from '../components/DeliveryForm';
import { authStore } from '../store/authStore';
import { router } from '../router/Router';
import '../styles/delivery.css';

export async function renderDeliveryPage(): Promise<void> {
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
      Загрузка...
    </div>
  `;

  try {
    const deliveryForm = new DeliveryForm();
    const el = await deliveryForm.render();
    app.innerHTML = '';
    app.appendChild(el);
  } catch (err) {
    console.error('DeliveryPage error:', err);
    app.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h2>Ошибка загрузки страницы</h2>
      </div>
    `;
  }
}