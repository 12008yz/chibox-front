import React from 'react';

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    // Логируем в консоль, чтобы упростить диагностику падений в проде.
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d0b14] text-white flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-xl border border-white/10 bg-black/40 p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Что-то пошло не так</h1>
            <p className="text-gray-300 text-sm mb-5">
              Произошла ошибка интерфейса. Попробуйте перезагрузить страницу.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors font-medium"
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
