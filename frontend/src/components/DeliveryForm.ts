import { apiCreateDelivery, apiGetMyDeliveries } from '../api/api';
import { ICreateDeliveryBody, IDelivery, PaymentMethod, IDeliveryItem } from '../types';
import { router } from '../router/Router';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

const STATUS_LABELS: Record<string, string> = {
  pending:   '⏳ Обрабатывается',
  confirmed: '✅ Подтверждена',
  shipped:   '🚚 В пути',
  delivered: '📦 Доставлена',
  cancelled: '❌ Отменена',
};

export class DeliveryForm {
  private container: HTMLElement;
  private deliveries: IDelivery[] = [];

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'delivery-page';
  }

  public async render(): Promise<HTMLElement> {
    await this.loadDeliveries();
    this.buildPage();
    return this.container;
  }

  private async loadDeliveries(): Promise<void> {
    try {
      const { deliveries } = await apiGetMyDeliveries();
      this.deliveries = deliveries;
    } catch (err) {
      console.error('Load deliveries error:', err);
      this.deliveries = [];
    }
  }

  private buildPage(): void {
    this.container.innerHTML = '';

    const heading = document.createElement('div');
    heading.className = 'page-heading';
    heading.innerHTML = `
      <h1 class="page-title">📦 Доставка</h1>
      <p class="page-subtitle">Оформите новую доставку или отследите существующие</p>
    `;
    this.container.appendChild(heading);

    // Форма новой доставки
    const formSection = this.buildDeliveryForm();
    this.container.appendChild(formSection);

    // История доставок
    if (this.deliveries.length > 0) {
      const historySection = this.buildDeliveryHistory();
      this.container.appendChild(historySection);
    }
  }

  private buildDeliveryForm(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'delivery-form-section';

    section.innerHTML = `
      <h2 class="section-title">Новая доставка</h2>

      <!-- data-delivery на форму — ОБЯЗАТЕЛЬНО по ТЗ -->
      <form class="delivery-form" data-delivery>

        <div class="delivery-form__grid">

          <div class="form-group">
            <label class="form-label">Адрес доставки</label>
            <input
              class="input"
              id="delivery-address"
              type="text"
              placeholder="г. Минск, ул. Колесникова, д. 1"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input
              class="input"
              id="delivery-phone"
              type="tel"
              placeholder="+375 33 000 00 00"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              class="input"
              id="delivery-email"
              type="email"
              placeholder="cosmonaut@space.ru"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Способ оплаты</label>
            <select class="input" id="delivery-payment">
              <option value="">Выберите способ</option>
              <option value="card">Банковская карта</option>
              <option value="cash">Наличные при получении</option>
              <option value="crypto">Криптовалюта</option>
            </select>
          </div>

        </div>

        <!-- Капча -->
        <div class="captcha-block">
          <label class="form-label">Подтверждение — сколько будет 7 × 6?</label>
          <div class="captcha-row">
            <input
              class="input captcha-input"
              id="captcha-input"
              type="text"
              placeholder="Ваш ответ"
            />
          </div>
        </div>

        <div class="alert alert-error" id="delivery-error" style="display:none"></div>
        <div class="alert alert-success" id="delivery-success" style="display:none"></div>

        <button class="btn btn-success delivery-form__submit" id="delivery-submit" type="button">
          Оформить доставку
        </button>

      </form>
    `;

    const submitBtn = section.querySelector('#delivery-submit');
    submitBtn?.addEventListener('click', () => {
      void this.handleSubmit(section);
    });

    return section;
  }

private buildDeliveryHistory(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'delivery-history';

  section.innerHTML = `
    <h2 class="section-title">История доставок</h2>
    <div class="delivery-list">
      ${this.deliveries
        .slice()
        .reverse()
        .map(
          (d: IDelivery) => `
        <div class="delivery-card">
          <div class="delivery-card__header">
            <span class="delivery-card__id">
              #${d.id.slice(0, 8).toUpperCase()}
            </span>
            <span class="badge badge-primary">
              ${STATUS_LABELS[d.status] ?? d.status}
            </span>
          </div>

          <div class="delivery-card__body">
            <div class="delivery-card__row">
              <span>Адрес:</span>
              <strong>${d.address}</strong>
            </div>
            <div class="delivery-card__row">
              <span>Оплата:</span>
              <strong>${d.paymentMethod}</strong>
            </div>
            <div class="delivery-card__row">
              <span>Дата:</span>
              <strong>
                ${new Date(d.createdAt).toLocaleDateString('ru-RU')}
              </strong>
            </div>
          </div>

          <div class="delivery-card__items">
            ${d.cartSnapshot
              .map(
                (item: IDeliveryItem) => `
              <div class="delivery-card__item">
                <span>${item.productName} × ${item.quantity}</span>
                <span>${formatPrice(item.priceAtOrder * item.quantity)}</span>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="delivery-card__footer">
            <span>Итого:</span>
            <strong class="delivery-card__total">
              ${formatPrice(d.totalPrice)}
            </strong>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;

  return section;
}

  private async handleSubmit(section: HTMLElement): Promise<void> {
    const addressInput = section.querySelector(
      '#delivery-address'
    ) as HTMLInputElement | null;
    const phoneInput = section.querySelector(
      '#delivery-phone'
    ) as HTMLInputElement | null;
    const emailInput = section.querySelector(
      '#delivery-email'
    ) as HTMLInputElement | null;
    const paymentSelect = section.querySelector(
      '#delivery-payment'
    ) as HTMLSelectElement | null;
    const captchaInput = section.querySelector(
      '#captcha-input'
    ) as HTMLInputElement | null;
    const errorEl = section.querySelector(
      '#delivery-error'
    ) as HTMLElement | null;
    const successEl = section.querySelector(
      '#delivery-success'
    ) as HTMLElement | null;
    const submitBtn = section.querySelector(
      '#delivery-submit'
    ) as HTMLButtonElement | null;

    const address = addressInput?.value.trim() ?? '';
    const phone   = phoneInput?.value.trim()   ?? '';
    const email   = emailInput?.value.trim()   ?? '';
    const paymentMethod = paymentSelect?.value  ?? '';
    const captcha = captchaInput?.value.trim()  ?? '';

    const showError = (msg: string): void => {
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
      }
      if (successEl) successEl.style.display = 'none';
    };

    // Валидация
    if (!address || !phone || !email || !paymentMethod) {
      showError('Заполните все поля');
      return;
    }

    if (captcha !== '42') {
      showError('Неверный ответ на капчу. Подсказка: 7 × 6 = ?');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Оформляем...';
    }

    try {
      const body: ICreateDeliveryBody = {
        address,
        phone,
        email,
        paymentMethod: paymentMethod as PaymentMethod,
      };

      await apiCreateDelivery(body);

      if (successEl) {
        successEl.textContent =
          'Доставка оформлена! Корзина очищена. Перенаправляем...';
        successEl.style.display = 'block';
      }
      if (errorEl) errorEl.style.display = 'none';

      setTimeout(() => {
        router.navigate('/');
      }, 2000);

    } catch (err) {
      const error = err as Error;
      showError(error.message ?? 'Ошибка оформления доставки');

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Оформить доставку';
      }
    }
  }
}