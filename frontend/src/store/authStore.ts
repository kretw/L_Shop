import { IUserPublic, IAuthState } from '../types';
import { apiGetMe } from '../api/api';

// Тип для подписчиков на изменения стейта
type AuthListener = (state: IAuthState) => void;

class AuthStore {
  private state: IAuthState = {
    isLoggedIn: false,
    user: null,
  };

  private listeners: AuthListener[] = [];

  // Получаем текущий стейт
  public getState(): IAuthState {
    return this.state;
  }

  // Подписываемся на изменения
  public subscribe(listener: AuthListener): void {
    this.listeners.push(listener);
  }

  // Отписываемся
  public unsubscribe(listener: AuthListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  // Обновляем стейт и уведомляем подписчиков
  private setState(newState: IAuthState): void {
    this.state = newState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Устанавливаем пользователя после логина/регистрации
  public setUser(user: IUserPublic): void {
    this.setState({ isLoggedIn: true, user });
  }

  // Сбрасываем пользователя после логаута
  public clearUser(): void {
    this.setState({ isLoggedIn: false, user: null });
  }

  // Проверяем сессию при загрузке страницы
  public async checkAuth(): Promise<void> {
    try {
      const { user } = await apiGetMe();
      this.setState({ isLoggedIn: true, user });
    } catch {
      this.setState({ isLoggedIn: false, user: null });
    }
  }
}

// Синглтон
export const authStore = new AuthStore();