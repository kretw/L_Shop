import { apiRegister } from '../api/api';
import { authStore } from '../store/authStore';
import { router } from '../router/Router';
import { IRegisterBody } from '../types';

export class RegisterForm {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'auth-form-wrapper';
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="auth-form">

        <div class="auth-form__header">
          <h2 class="auth-form__title">Регистрация</h2>
          <p class="auth-form__sub">
            Уже есть аккаунт?
            <a href="/auth" data-link>Войти</a>
          </p>
        </div>

        <div class="alert alert-error"   id="reg-error"   style="display:none"></div>
        <div class="alert alert-success" id="reg-success" style="display:none"></div>

        <div class="auth-form__fields" data-registration>

          <div class="form-group">
            <label class="form-label">Имя пользователя</label>
            <input
              class="input"
              id="field-username"
              type="text"
              placeholder="cosmonaut42"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              class="input"
              id="field-email"
              type="email"
              placeholder="email@example.com"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input
              class="input"
              id="field-phone"
              type="tel"
              placeholder="+375 33 000 00 00"
              autocomplete="tel"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Пароль</label>
            <div class="input-password">
              <input
                class="input"
                id="field-password"
                type="password"
                placeholder="Минимум 6 символов"
                autocomplete="new-password"
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

          <div class="form-group">
            <label class="form-label">Подтвердите пароль</label>
            <input
              class="input"
              id="field-password-confirm"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </div>

        </div>

        <button
          class="btn btn-primary auth-form__submit"
          id="reg-submit"
          type="button"
        >
          Зарегистрироваться
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
    const submitBtn = this.container.querySelector('#reg-submit');
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
      '#reg-error'
    ) as HTMLElement | null;
    const successEl = this.container.querySelector(
      '#reg-success'
    ) as HTMLElement | null;
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    if (successEl) successEl.style.display = 'none';
  }

  private showSuccess(message: string): void {
    const errorEl = this.container.querySelector(
      '#reg-error'
    ) as HTMLElement | null;
    const successEl = this.container.querySelector(
      '#reg-success'
    ) as HTMLElement | null;
    if (successEl) {
      successEl.textContent = message;
      successEl.style.display = 'block';
    }
    if (errorEl) errorEl.style.display = 'none';
  }

  private setLoading(loading: boolean): void {
    const submitBtn = this.container.querySelector(
      '#reg-submit'
    ) as HTMLButtonElement | null;
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading
      ? 'Регистрируем...'
      : 'Зарегистрироваться';
  }

  private async handleSubmit(): Promise<void> {
    const usernameInput = this.container.querySelector(
      '#field-username'
    ) as HTMLInputElement | null;
    const emailInput = this.container.querySelector(
      '#field-email'
    ) as HTMLInputElement | null;
    const phoneInput = this.container.querySelector(
      '#field-phone'
    ) as HTMLInputElement | null;
    const passwordInput = this.container.querySelector(
      '#field-password'
    ) as HTMLInputElement | null;
    const passwordConfirmInput = this.container.querySelector(
      '#field-password-confirm'
    ) as HTMLInputElement | null;

    const username        = usernameInput?.value.trim()        ?? '';
    const email           = emailInput?.value.trim()           ?? '';
    const phone           = phoneInput?.value.trim()           ?? '';
    const password        = passwordInput?.value               ?? '';
    const passwordConfirm = passwordConfirmInput?.value        ?? '';

    // Валидация
    if (!username || !email || !phone || !password || !passwordConfirm) {
      this.showError('Заполните все поля');
      return;
    }

    if (password.length < 6) {
      this.showError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (password !== passwordConfirm) {
      this.showError('Пароли не совпадают');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showError('Введите корректный email');
      return;
    }

    this.setLoading(true);

    try {
      const body: IRegisterBody = { username, email, phone, password };
      const { user } = await apiRegister(body);

      authStore.setUser(user);
      this.showSuccess('Регистрация успешна! Перенаправляем...');

      setTimeout(() => {
        router.navigate('/');
      }, 800);

    } catch (err) {
      const error = err as Error;
      this.showError(error.message ?? 'Ошибка регистрации');
    } finally {
      this.setLoading(false);
    }
  }
}