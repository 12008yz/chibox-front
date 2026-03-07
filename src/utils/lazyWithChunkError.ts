import { lazy, LazyExoticComponent, ComponentType } from 'react';

/**
 * Оборачивает React.lazy: при ошибке загрузки чанка (404 после деплоя, сеть)
 * выполняет перезагрузку страницы, чтобы подтянуть актуальные скрипты.
 * Решает: "Failed to fetch dynamically imported module" / 404 на *-DKFETn2d.js
 */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Loading chunk') ||
    message.includes('Loading CSS chunk') ||
    message.includes('Importing a module script failed')
  );
}

export function lazyWithChunkError<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (isChunkLoadError(error) && typeof window !== 'undefined') {
        window.location.reload();
      }
      throw error;
    }
  }) as LazyExoticComponent<T>;
}
