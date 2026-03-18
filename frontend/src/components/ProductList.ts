import { IProduct, IProductFilters } from '../types';
import { apiGetProducts } from '../api/api';
import { ProductCard } from './ProductCard';
import { Filters } from './Filters';
import '../styles/product.css';
import '../styles/filters.css';

export class ProductList {
  private container: HTMLElement;
  private gridEl: HTMLElement | null = null;
  private cartItemCount: number = 0;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'product-list';
  }

  public async render(): Promise<HTMLElement> {
    // Заголовок страницы
    const heading = document.createElement('div');
    heading.className = 'page-heading';
    heading.innerHTML = `
      <h1 class="page-title">🚀 Каталог запчастей</h1>
      <p class="page-subtitle">
        Всё необходимое для вашей ракеты — от двигателей до систем жизнеобеспечения
      </p>
    `;

    // Фильтры
    const filters = new Filters(
      (newFilters: IProductFilters) => {
        void this.loadProducts(newFilters);
      }
    );

    // Грид с товарами
    this.gridEl = document.createElement('div');
    this.gridEl.className = 'product-grid';

    this.container.appendChild(heading);
    this.container.appendChild(filters.render());
    this.container.appendChild(this.gridEl);

    // Загружаем товары без фильтров
    await this.loadProducts({
      search:      '',
      category:    '',
      available:   null,
      sortByPrice: '',
      minPrice:    null,
      maxPrice:    null,
    });

    return this.container;
  }

  private async loadProducts(
    filters: IProductFilters
  ): Promise<void> {
    if (!this.gridEl) return;

    // Показываем лоадер
    this.gridEl.innerHTML = `
      <div class="loading" style="grid-column: 1/-1">
        <div class="spinner"></div>
        Загружаем запчасти...
      </div>
    `;

    try {
      const { products } = await apiGetProducts(filters);
      this.renderProducts(products);
    } catch (err) {
      console.error('Load products error:', err);
      this.gridEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1">
          <div class="empty-icon">⚠️</div>
          <h2>Ошибка загрузки</h2>
          <p>Не удалось загрузить товары. Попробуйте позже.</p>
        </div>
      `;
    }
  }

  private renderProducts(products: IProduct[]): void {
    if (!this.gridEl) return;

    this.gridEl.innerHTML = '';

    if (products.length === 0) {
      this.gridEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1">
          <div class="empty-icon">🔭</div>
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить фильтры поиска</p>
        </div>
      `;
      return;
    }

    products.forEach((product) => {
      const card = new ProductCard(
        product,
        () => { this.cartItemCount++; }
      );
      this.gridEl?.appendChild(card.render());
    });
  }
}