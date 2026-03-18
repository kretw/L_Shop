import { RegisterForm } from '../components/RegisterForm';
import { authStore } from '../store/authStore';
import { router } from '../router/Router';
import '../styles/auth.css';

export function renderRegisterPage(): void {
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
    <div class="auth-page__rocket">🛸</div>
    <h1 class="auth-page__title">Создать аккаунт</h1>
    <p class="auth-page__subtitle">
      Зарегистрируйтесь чтобы покупать запчасти для ракет
    </p>
  `;

  // Форма регистрации
  const formWrapper = document.createElement('div');
  formWrapper.className = 'auth-page__form';

  const registerForm = new RegisterForm();
  formWrapper.appendChild(registerForm.render());

  page.appendChild(hero);
  page.appendChild(formWrapper);
  app.appendChild(page);
}