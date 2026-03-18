interface IModalOptions {
  title: string;
  content: HTMLElement;
  onClose?: () => void;
}

export class Modal {
  private overlay: HTMLElement;

  constructor(options: IModalOptions) {
    this.overlay = this.create(options);
  }

  private create(options: IModalOptions): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    // Шапка модала
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal__header';
    modalHeader.innerHTML = `
      <h2 class="modal__title">${options.title}</h2>
      <button class="modal__close" id="modal-close-btn">✕</button>
    `;

    // Тело модала
    const modalBody = document.createElement('div');
    modalBody.className = 'modal__body';
    modalBody.appendChild(options.content);

    modal.appendChild(modalHeader);
    modal.appendChild(modalBody);
    overlay.appendChild(modal);

    // Закрытие по крестику
    const closeBtn = modalHeader.querySelector('#modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
        options.onClose?.();
      });
    }

    // Закрытие по клику на оверлей
    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) {
        this.close();
        options.onClose?.();
      }
    });

    // Закрытие по Escape
    const handleKeydown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        this.close();
        options.onClose?.();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    return overlay;
  }

  public open(): void {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.appendChild(this.overlay);
      // Блокируем скролл страницы
      document.body.style.overflow = 'hidden';
    }
  }

  public close(): void {
    this.overlay.remove();
    document.body.style.overflow = '';
  }
}