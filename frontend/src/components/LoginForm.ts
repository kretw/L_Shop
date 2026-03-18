import { apiLogin } from '../api/api';
import { authStore } from '../store/authStore';
import { router } from '../router/Router';
import { ILoginBody } from '../types';

export class LoginForm {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'auth-form-wrapper';
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="auth-form">

        <div class="auth-form__header">
          <h2 class="auth-form__title">Войти в аккаунт</h2>
          <p class="auth-form__sub">
            Нет аккаунта?
            <a href="/register" data-link>Зарегистрироваться</a>
          </p>
        </div>

        <div class="alert alert-error" id="login-error" style="display:none"></div>
        <div class="alert alert-success" id="login-success" style="display:none"></div>

        <div class="auth-form__fields">

          <div class="form-group">
            <label class="form-label">Email / Логин / Телефон</label>
            <input
              class="input"
              id="field-login"
              type="text"
              placeholder="email@example.com"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Пароль</label>
            <div class="input-password">
              <input
                class="input"
                id="field-password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button
                class="input-password__toggle"
                id="toggle-password"
                type="button"
              >
                👀
              </button>
            </div>
          </div>

        </div>

        <button
          class="btn btn-primary auth-form__submit"
          id="login-submit"
          type="button"
        >
          Войти
        </button>

      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  private bindEvents(): void {
    // Показать/скрыть пароль
    const toggleBtn = this.container.querySelector('#toggle-password');
    const passwordInput = this.container.querySelector(
      '#field-password'
    ) as HTMLInputElement | null;

    toggleBtn?.addEventListener('click', () => {
      if (!passwordInput) return;
      passwordInput.type =
        passwordInput.type === 'password' ? 'text' : 'password';
    });

    // Отправка по кнопке
    const submitBtn = this.container.querySelector('#login-submit');
    submitBtn?.addEventListener('click', () => {
      void this.handleSubmit();
    });

    // Отправка по Enter
    this.container.querySelectorAll('.input').forEach((input) => {
      input.addEventListener('keydown', (e: Event) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          void this.handleSubmit();
        }
      });
    });
  }

  private showError(message: string): void {
    const errorEl = this.container.querySelector(
      '#login-error'
    ) as HTMLElement | null;
    const successEl = this.container.querySelector(
      '#login-success'
    ) as HTMLElement | null;
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    if (successEl) successEl.style.display = 'none';
  }

  private showSuccess(message: string): void {
    const errorEl = this.container.querySelector(
      '#login-error'
    ) as HTMLElement | null;
    const successEl = this.container.querySelector(
      '#login-success'
    ) as HTMLElement | null;
    if (successEl) {
      successEl.textContent = message;
      successEl.style.display = 'block';
    }
    if (errorEl) errorEl.style.display = 'none';
  }

  private setLoading(loading: boolean): void {
    const submitBtn = this.container.querySelector(
      '#login-submit'
    ) as HTMLButtonElement | null;
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Входим...' : 'Войти';
  }

  private async handleSubmit(): Promise<void> {
    const loginInput = this.container.querySelector(
      '#field-login'
    ) as HTMLInputElement | null;
    const passwordInput = this.container.querySelector(
      '#field-password'
    ) as HTMLInputElement | null;

    const login    = loginInput?.value.trim()  ?? '';
    const password = passwordInput?.value       ?? '';

    if (!login || !password) {
      this.showError('Заполните все поля');
      return;
    }

    this.setLoading(true);

    try {
      const body: ILoginBody = { login, password };
      const { user } = await apiLogin(body);

      authStore.setUser(user);
      this.showSuccess(`Добро пожаловать, ${user.username}!`);

      setTimeout(() => {
        router.navigate('/');
      }, 800);

    } catch (err) {
      const error = err as Error;
      this.showError(error.message ?? 'Ошибка входа');
    } finally {
      this.setLoading(false);
    }
  }
}