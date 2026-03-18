import {
  apiGetCart,
  apiUpdateCartItem,
  apiRemoveFromCart,
} from '../api/api';
import { ICartItemEnriched } from '../types';
import { router } from '../router/Router';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export class Cart {
  private container: HTMLElement;
  private items: ICartItemEnriched[] = [];

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'cart';
  }

  public async render(): Promise<HTMLElement> {
    await this.loadCart();
    return this.container;
  }

  private async loadCart(): Promise<void> {
    this.container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        Загружаем корзину...
      </div>
    `;

    try {
      const { cart } = await apiGetCart();
      this.items = cart.items as ICartItemEnriched[];
      this.renderCart();
    } catch (err) {
      console.error('Load cart error:', err);
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h2>Ошибка загрузки корзины</h2>
        </div>
      `;
    }
  }

  private renderCart(): void {
    this.container.innerHTML = '';

    const heading = document.createElement('div');
    heading.className = 'page-heading';
    heading.innerHTML = `
      <h1 class="page-title">🛒 Корзина</h1>
      <p class="page-subtitle">${this.items.length} товаров</p>
    `;
    this.container.appendChild(heading);

    if (this.items.length === 0) {
      this.container.innerHTML += `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h2>Корзина пуста</h2>
          <p>Добавьте запчасти из каталога</p>
          <a href="/" class="btn btn-primary" data-link style="margin-top:16px">
            Перейти в каталог
          </a>
        </div>
      `;
      return;
    }

    // Список товаров
    const list = document.createElement('div');
    list.className = 'cart__list';

    this.items.forEach((item) => {
      const itemEl = this.createCartItem(item);
      list.appendChild(itemEl);
    });

    // Итог
    const total = this.items.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );

    const summary = document.createElement('div');
    summary.className = 'cart__summary';
    summary.innerHTML = `
      <div class="cart__total">
        <span>Итого:</span>
        <span class="cart__total-price">${formatPrice(total)}</span>
      </div>
      <button class="btn btn-success cart__checkout-btn" id="checkout-btn">
        Оформить доставку
      </button>
    `;

    this.container.appendChild(list);
    this.container.appendChild(summary);

    // Кнопка оформления доставки
    const checkoutBtn = summary.querySelector('#checkout-btn');
    checkoutBtn?.addEventListener('click', () => {
      router.navigate('/delivery');
    });
  }

  private createCartItem(item: ICartItemEnriched): HTMLElement {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.dataset['productId'] = item.productId;

    el.innerHTML = `
      <div class="cart-item__icon">🔩</div>

      <div class="cart-item__info">
        <h3 class="cart-item__name" data-title="basket">
          ${item.productName}
        </h3>
        <span class="cart-item__price" data-price="basket">
          ${formatPrice(item.priceAtAdd)}
        </span>
      </div>

      <div class="cart-item__controls">
        <div class="quantity-control">
          <button class="qty-btn" data-action="decrease">−</button>
          <input
            class="qty-input"
            type="number"
            value="${item.quantity}"
            min="1"
            max="99"
          />
          <button class="qty-btn" data-action="increase">+</button>
        </div>
      </div>

      <div class="cart-item__subtotal">
        ${formatPrice(item.priceAtAdd * item.quantity)}
      </div>

      <button class="cart-item__remove btn btn-danger" data-action="remove">
        🗑️
      </button>
    `;

    this.bindCartItemEvents(el, item);
    return el;
  }

  private bindCartItemEvents(
    el: HTMLElement,
    item: ICartItemEnriched
  ): void {
    const qtyInput = el.querySelector('.qty-input') as HTMLInputElement;
    const decreaseBtn = el.querySelector('[data-action="decrease"]');
    const increaseBtn = el.querySelector('[data-action="increase"]');
    const removeBtn   = el.querySelector('[data-action="remove"]');

    // Уменьшить количество
    decreaseBtn?.addEventListener('click', async () => {
      const current = parseInt(qtyInput.value, 10);
      if (current <= 1) return;
      const newQty = current - 1;
      qtyInput.value = String(newQty);
      await this.updateItem(item.productId, newQty);
    });

    // Увеличить количество
    increaseBtn?.addEventListener('click', async () => {
      const current = parseInt(qtyInput.value, 10);
      const newQty = current + 1;
      qtyInput.value = String(newQty);
      await this.updateItem(item.productId, newQty);
    });

    // Ввод вручную
    qtyInput?.addEventListener('change', async () => {
      const newQty = parseInt(qtyInput.value, 10);
      if (isNaN(newQty) || newQty < 1) {
        qtyInput.value = '1';
        return;
      }
      await this.updateItem(item.productId, newQty);
    });

    // Удалить товар
    removeBtn?.addEventListener('click', async () => {
      el.style.opacity = '0.5';
      await this.removeItem(item.productId);
    });
  }

  private async updateItem(
    productId: string,
    quantity: number
  ): Promise<void> {
    try {
      await apiUpdateCartItem(productId, quantity);
      // Обновляем локальный стейт
      const itemIndex = this.items.findIndex(
        (i) => i.productId === productId
      );
      if (itemIndex !== -1) {
        this.items[itemIndex].quantity = quantity;
      }
      // Перерисовываем итог
      this.updateSummary();
    } catch (err) {
      console.error('Update cart item error:', err);
    }
  }

  private async removeItem(productId: string): Promise<void> {
    try {
      await apiRemoveFromCart(productId);
      this.items = this.items.filter(
        (i) => i.productId !== productId
      );
      this.renderCart();
    } catch (err) {
      console.error('Remove cart item error:', err);
    }
  }

  private updateSummary(): void {
    const total = this.items.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );
    const totalPriceEl = this.container.querySelector(
      '.cart__total-price'
    );
    if (totalPriceEl) {
      totalPriceEl.textContent = formatPrice(total);
    }
  }
}