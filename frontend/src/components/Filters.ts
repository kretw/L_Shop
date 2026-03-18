import { IProductFilters, ProductCategory } from '../types';

// Тип callback при изменении фильтров
type FiltersChangeCallback = (filters: IProductFilters) => void;

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'engine',       label: 'Двигатели'          },
  { value: 'fuel_system',  label: 'Топливная система'   },
  { value: 'navigation',   label: 'Навигация'           },
  { value: 'structure',    label: 'Конструкция'         },
  { value: 'electronics',  label: 'Электроника'         },
  { value: 'life_support', label: 'Жизнеобеспечение'  },
];

export class Filters {
  private filters: IProductFilters;
  private onChange: FiltersChangeCallback;

  constructor(onChange: FiltersChangeCallback) {
    this.onChange = onChange;
    this.filters = {
      search:      '',
      category:    '',
      available:   null,
      sortByPrice: '',
      minPrice:    null,
      maxPrice:    null,
    };
  }

  public render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'filters';

    container.innerHTML = `
      <div class="filters__row">

        <!-- Поиск -->
        <div class="filters__group filters__group--wide">
          <label class="filters__label">Поиск</label>
          <input
            class="input"
            id="filter-search"
            type="text"
            placeholder="Название или описание..."
            value="${this.filters.search}"
          />
        </div>

        <!-- Категория -->
        <div class="filters__group">
          <label class="filters__label">Категория</label>
          <select class="input" id="filter-category">
            <option value="">Все категории</option>
            ${CATEGORIES.map(
              (c) => `<option value="${c.value}"
                ${this.filters.category === c.value ? 'selected' : ''}>
                ${c.label}
              </option>`
            ).join('')}
          </select>
        </div>

        <!-- Наличие -->
        <div class="filters__group">
          <label class="filters__label"> Наличие</label>
          <select class="input" id="filter-available">
            <option value="">Все</option>
            <option value="true"  ${this.filters.available === true  ? 'selected' : ''}>
              ✓ В наличии
            </option>
            <option value="false" ${this.filters.available === false ? 'selected' : ''}>
              ✗ Нет в наличии
            </option>
          </select>
        </div>

        <!-- Сортировка по цене -->
        <div class="filters__group">
          <label class="filters__label">Цена</label>
          <select class="input" id="filter-sort">
            <option value="">Без сортировки</option>
            <option value="asc"  ${this.filters.sortByPrice === 'asc'  ? 'selected' : ''}>
              ↑ Сначала дешевле
            </option>
            <option value="desc" ${this.filters.sortByPrice === 'desc' ? 'selected' : ''}>
              ↓ Сначала дороже
            </option>
          </select>
        </div>

      </div>

      <div class="filters__row filters__row--secondary">

        <!-- Минимальная цена -->
        <div class="filters__group">
          <label class="filters__label">От ($)</label>
          <input
            class="input"
            id="filter-min-price"
            type="number"
            placeholder="0"
            min="0"
            value="${this.filters.minPrice ?? ''}"
          />
        </div>

        <!-- Максимальная цена -->
        <div class="filters__group">
          <label class="filters__label">До ($)</label>
          <input
            class="input"
            id="filter-max-price"
            type="number"
            placeholder="∞"
            min="0"
            value="${this.filters.maxPrice ?? ''}"
          />
        </div>

        <!-- Сброс фильтров -->
        <div class="filters__group filters__group--reset">
          <button class="btn btn-outline" id="filters-reset">
            Сбросить фильтры
          </button>
        </div>

      </div>
    `;

    this.bindEvents(container);
    return container;
  }

  private bindEvents(container: HTMLElement): void {
    // Поиск — с дебаунсом чтобы не спамить запросами
    const searchInput = container.querySelector(
      '#filter-search'
    ) as HTMLInputElement;
    let searchTimer: ReturnType<typeof setTimeout>;

    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        this.filters.search = searchInput.value.trim();
        this.onChange(this.filters);
      }, 400);
    });

    // Категория
    const categorySelect = container.querySelector(
      '#filter-category'
    ) as HTMLSelectElement;

    categorySelect?.addEventListener('change', () => {
      this.filters.category =
        (categorySelect.value as ProductCategory) || '';
      this.onChange(this.filters);
    });

    // Наличие
    const availableSelect = container.querySelector(
      '#filter-available'
    ) as HTMLSelectElement;

    availableSelect?.addEventListener('change', () => {
      if (availableSelect.value === '') {
        this.filters.available = null;
      } else {
        this.filters.available = availableSelect.value === 'true';
      }
      this.onChange(this.filters);
    });

    // Сортировка
    const sortSelect = container.querySelector(
      '#filter-sort'
    ) as HTMLSelectElement;

    sortSelect?.addEventListener('change', () => {
      this.filters.sortByPrice =
        (sortSelect.value as 'asc' | 'desc') || '';
      this.onChange(this.filters);
    });

    // Мин цена
    const minPriceInput = container.querySelector(
      '#filter-min-price'
    ) as HTMLInputElement;

    minPriceInput?.addEventListener('change', () => {
      this.filters.minPrice = minPriceInput.value
        ? parseFloat(minPriceInput.value)
        : null;
      this.onChange(this.filters);
    });

    // Макс цена
    const maxPriceInput = container.querySelector(
      '#filter-max-price'
    ) as HTMLInputElement;

    maxPriceInput?.addEventListener('change', () => {
      this.filters.maxPrice = maxPriceInput.value
        ? parseFloat(maxPriceInput.value)
        : null;
      this.onChange(this.filters);
    });

    // Сброс всех фильтров
    const resetBtn = container.querySelector('#filters-reset');
    resetBtn?.addEventListener('click', () => {
      this.filters = {
        search:      '',
        category:    '',
        available:   null,
        sortByPrice: '',
        minPrice:    null,
        maxPrice:    null,
      };

      // Сбрасываем значения инпутов
      if (searchInput)    searchInput.value    = '';
      if (categorySelect) categorySelect.value = '';
      if (availableSelect)availableSelect.value= '';
      if (sortSelect)     sortSelect.value     = '';
      if (minPriceInput)  minPriceInput.value  = '';
      if (maxPriceInput)  maxPriceInput.value  = '';

      this.onChange(this.filters);
    });
  }
}