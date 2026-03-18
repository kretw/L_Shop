type PageRenderer = () => void | Promise<void>;

interface IRoute {
  path: string;
  render: PageRenderer;
}

export class Router {
  private routes: IRoute[] = [];
  private notFoundRenderer: PageRenderer | null = null;

  public addRoute(path: string, render: PageRenderer): void {
    this.routes.push({ path, render });
  }

  public setNotFound(render: PageRenderer): void {
    this.notFoundRenderer = render;
  }

  public init(): void {
    window.addEventListener('popstate', () => {
      void this.handleRoute();
    });

    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('[data-link]') as HTMLElement | null;

      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href') ?? '/';
        void this.navigate(href);
      }
    });

    void this.handleRoute();
  }

  public navigate(path: string): void {
    window.history.pushState({}, '', path);
    void this.handleRoute();
  }

  private async handleRoute(): Promise<void> {
    const currentPath = window.location.pathname;
    const route = this.routes.find((r) => r.path === currentPath);

    if (route) {
      await route.render();
    } else if (this.notFoundRenderer) {
      await this.notFoundRenderer();
    }
  }
}

export const router = new Router();