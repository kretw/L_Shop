import '../styles/header.css';
import { authStore } from '../store/authStore';
import { apiLogout } from '../api/api';
import { router } from '../router/Router';

export class Header {
  public render(): HTMLElement {
    const state = authStore.getState();

    const header = document.createElement('header');
    header.className = 'header';

    header.innerHTML = `
      <div class="header__inner">

        <a href="/" class="header__logo" data-link>
          🚀 RocketParts
        </a>

        <nav class="header__nav">
          <a href="/" data-link>Каталог</a>
          ${state.isLoggedIn
            ? `<a href="/cart"     data-link>Корзина</a>
               <a href="/delivery" data-link>Доставки</a>`
            : ''
          }
        </nav>

        <div class="header__user">
          ${state.isLoggedIn
            ? `<span>${state.user?.username}</span>
               <button class="btn btn-outline" id="logout-btn">
                 Выйти
               </button>`
            : `<a href="/auth"     class="btn btn-outline"  data-link>
                 Войти
               </a>
               <a href="/register" class="btn btn-primary"  data-link>
                 Регистрация
               </a>`
          }
        </div>

      </div>
    `;

    const logoutBtn = header.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await apiLogout();
          authStore.clearUser();
          router.navigate('/');
        } catch (err) {
          console.error('Logout error:', err);
        }
      });
    }

    return header;
  }
}