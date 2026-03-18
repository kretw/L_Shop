import { IProduct } from '../types';
import { authStore } from '../store/authStore';
import { apiAddToCart } from '../api/api';
import { router } from '../router/Router';

// Переводы категорий
const CATEGORY_LABELS: Record<string, string> = {
  engine:       '⚙️ Двигатель',
  fuel_system:  '⛽ Топливная система',
  navigation:   '🧭 Навигация',
  structure:    '🏗️ Конструкция',
  electronics:  '💻 Электроника',
  life_support: '🧑‍🚀 Жизнеобеспечение',
};

// Форматирование цены
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export class ProductCard {
  private product: IProduct;
  private onCartUpdate?: () => void;

  constructor(product: IProduct, onCartUpdate?: () => void) {
    this.product = product;
    this.onCartUpdate = onCartUpdate;
  }

  public render(): HTMLElement {
    const card = document.createElement('article');
    card.className = 'product-card';

    const isLoggedIn = authStore.getState().isLoggedIn;
    const categoryLabel =
      CATEGORY_LABELS[this.product.category] ?? this.product.category;

    card.innerHTML = `
      <div class="product-card__image">
        <span class="product-card__category-icon">
          ${categoryLabel.split(' ')[0]}
        </span>
      </div>

      <div class="product-card__body">
        <div class="product-card__meta">
          <span class="badge badge-primary">${categoryLabel}</span>
          <span class="badge ${this.product.available ? 'badge-success' : 'badge-danger'}">
            ${this.product.available ? '✓ В наличии' : '✗ Нет в наличии'}
          </span>
        </div>

        <!-- data-title на имя товара — ОБЯЗАТЕЛЬНО по ТЗ -->
        <h3 class="product-card__name" data-title>
          ${this.product.name}
        </h3>

        <p class="product-card__desc">
          ${this.product.description}
        </p>

        <div class="product-card__info">
          <span>${this.product.manufacturer}</span>
          <span>${this.product.weightKg} кг</span>
          <span>Склад: ${this.product.stock} шт.</span>
        </div>

        <div class="product-card__footer">
          <!-- data-price на цену товара — ОБЯЗАТЕЛЬНО по ТЗ -->
          <span class="product-card__price" data-price>
            ${formatPrice(this.product.price)}
          </span>

          ${this.product.available
            ? `<div class="product-card__actions">
                <div class="quantity-control">
                  <button class="qty-btn" id="qty-minus">−</button>
                  <input
                    class="qty-input"
                    id="qty-input"
                    type="number"
                    value="1"
                    min="1"
                    max="${this.product.stock}"
                  />
                  <button class="qty-btn" id="qty-plus">+</button>
                </div>
                <button
                  class="btn btn-primary add-to-cart-btn"
                  id="add-to-cart-${this.product.id}"
                  ${!isLoggedIn ? 'data-requires-auth' : ''}
                >
                  В корзину
                </button>
              </div>`
            : `<button class="btn btn-outline" disabled>
                Нет в наличии
               </button>`
          }
        </div>
      </div>
    `;

    // Вешаем обработчики
    this.bindEvents(card);

    return card;
  }

  private bindEvents(card: HTMLElement): void {
    const minusBtn = card.querySelector('#qty-minus');
    const plusBtn = card.querySelector('#qty-plus');
    const qtyInput = card.querySelector('#qty-input') as HTMLInputElement | null;
    const addBtn = card.querySelector(`#add-to-cart-${this.product.id}`);

    // Кнопка минус
    minusBtn?.addEventListener('click', () => {
      if (!qtyInput) return;
      const current = parseInt(qtyInput.value, 10);
      if (current > 1) qtyInput.value = String(current - 1);
    });

    // Кнопка плюс
    plusBtn?.addEventListener('click', () => {
      if (!qtyInput) return;
      const current = parseInt(qtyInput.value, 10);
      if (current < this.product.stock) {
        qtyInput.value = String(current + 1);
      }
    });

    // Кнопка добавить в корзину
    addBtn?.addEventListener('click', async () => {
      const isLoggedIn = authStore.getState().isLoggedIn;

      // Если не залогинен — редиректим на авторизацию
      if (!isLoggedIn) {
        router.navigate('/auth');
        return;
      }

      if (!qtyInput) return;
      const quantity = parseInt(qtyInput.value, 10);

      // Блокируем кнопку на время запроса
      addBtn.setAttribute('disabled', 'true');
      addBtn.textContent = 'Добавляем...';

      try {
        await apiAddToCart(this.product.id, quantity);

        addBtn.textContent = 'Добавлено!';
        addBtn.classList.add('btn-success');
        addBtn.classList.remove('btn-primary');

        // Уведомляем родителя об обновлении корзины
        this.onCartUpdate?.();

        // Через 2 секунды возвращаем кнопку в исходное состояние
        setTimeout(() => {
          addBtn.textContent = 'В корзину';
          addBtn.classList.remove('btn-success');
          addBtn.classList.add('btn-primary');
          addBtn.removeAttribute('disabled');
        }, 2000);

      } catch (err) {
        console.error('Add to cart error:', err);
        addBtn.textContent = 'Ошибка';
        addBtn.classList.add('btn-danger');

        setTimeout(() => {
          addBtn.textContent = 'В корзину';
          addBtn.classList.remove('btn-danger');
          addBtn.classList.add('btn-primary');
          addBtn.removeAttribute('disabled');
        }, 2000);
      }
    });
  }
}