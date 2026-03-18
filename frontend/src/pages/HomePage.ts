import { ProductList } from '../components/ProductList';

export async function renderHomePage(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  // Очищаем контент
  app.innerHTML = '';

  // Показываем лоадер пока грузим компонент
  app.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      Загрузка каталога...
    </div>
  `;

  try {
    const productList = new ProductList();
    const el = await productList.render();

    app.innerHTML = '';
    app.appendChild(el);
  } catch (err) {
    console.error('HomePage error:', err);
    app.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🚨</div>
        <h2>Ошибка загрузки страницы</h2>
        <p>Проверьте подключение и попробуйте снова</p>
      </div>
    `;
  }
}