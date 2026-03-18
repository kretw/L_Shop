import { LoginForm } from '../components/LoginForm';
import { authStore } from '../store/authStore';
import { router } from '../router/Router';
import '../styles/auth.css';

export function renderAuthPage(): void {
  const app = document.getElementById('app');
  if (!app) return;

  // Если уже залогинен — на главную
  if (authStore.getState().isLoggedIn) {
    router.navigate('/');
    return;
  }

  app.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'auth-page';

  // Hero блок
  const hero = document.createElement('div');
  hero.className = 'auth-page__hero';
  hero.innerHTML = `
    <div class="auth-page__rocket">🚀</div>
    <h1 class="auth-page__title">RocketParts Shop</h1>
    <p class="auth-page__subtitle">
      Войдите чтобы добавлять товары в корзину и оформлять доставку
    </p>
  `;

  // Форма логина
  const formWrapper = document.createElement('div');
  formWrapper.className = 'auth-page__form';

  const loginForm = new LoginForm();
  formWrapper.appendChild(loginForm.render());

  page.appendChild(hero);
  page.appendChild(formWrapper);
  app.appendChild(page);
}