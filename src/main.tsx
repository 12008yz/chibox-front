import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { store, persistor } from "./store/index";
import { isDemoMode } from "./utils/demoMode";
import { loginSuccess } from "./features/auth/authSlice";
import { buildDemoProfileUser } from "./utils/demoData";
import { getDemoBalance, getDemoInventory, getDemoTotalCasesOpened } from "./utils/demoState";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
// Импортируем утилиту очистки данных (будет доступна в консоли как window.clearAllAuthData)
import "./utils/clearAllAuth";
import { initAnalytics } from "./utils/analytics";

// Аналитику не блокируем первый кадр: тяжёлые внешние скрипты — после load или в idle
function scheduleNonCriticalInit(fn: () => void) {
  const run = () => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  };
  if (typeof window === "undefined") {
    run();
    return;
  }
  if (document.readyState === "complete") {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(run, { timeout: 4000 });
    } else {
      setTimeout(run, 0);
    }
    return;
  }
  window.addEventListener(
    "load",
    () => {
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(run, { timeout: 4000 });
      } else {
        setTimeout(run, 0);
      }
    },
    { once: true }
  );
}

scheduleNonCriticalInit(() => initAnalytics());

// При 404 чанка после деплоя (старый кэш) — перезагрузка, чтобы подтянуть новые скрипты
const CHUNK_RELOAD_GUARD_KEY = 'chunk-reload-attempted';

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    (event.filename && /[-][A-Za-z0-9]+\.js$/.test(event.filename) && event.message?.includes('fetch'))
  ) {
    event.preventDefault();

    // One-shot guard: защищает от бесконечного цикла перезагрузки при проблемном ассете/CDN.
    if (sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY) === '1') {
      return true;
    }
    sessionStorage.setItem(CHUNK_RELOAD_GUARD_KEY, '1');
    window.location.reload();
    return true;
  }
});

// Если приложение успешно загрузилось, guard можно сбросить.
if (sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY) === '1') {
  sessionStorage.removeItem(CHUNK_RELOAD_GUARD_KEY);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

// Компонент загрузки для PersistGate
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
  </div>
);

// В development режиме отключаем StrictMode для WebSocket
const isDevelopment = import.meta.env.DEV;

const AppWithToaster = () => (
  <Provider store={store}>
    <PersistGate
      loading={<Loading />}
      persistor={persistor}
      onBeforeLift={() => {
        if (isDemoMode()) {
          const inv = getDemoInventory();
          store.dispatch(
            loginSuccess({
              user: buildDemoProfileUser(getDemoBalance(), inv, getDemoTotalCasesOpened()),
            })
          );
        }
      }}
    >
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          right: 20,
          zIndex: 99999999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            color: '#f8fafc',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          success: {
            duration: 4000,
            style: {
              background: 'rgba(22, 163, 74, 0.95)',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#16a34a',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: 'rgba(220, 38, 38, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#dc2626',
            },
          },
        }}
      >
        {(t) => (
          <div
            role="button"
            tabIndex={0}
            onClick={() => toast.dismiss(t.id)}
            onKeyDown={(e) => e.key === 'Enter' && toast.dismiss(t.id)}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            <ToastBar toast={t} position={t.position || 'top-right'} />
          </div>
        )}
      </Toaster>
    </PersistGate>
  </Provider>
);

createRoot(rootElement).render(
  isDevelopment ? <AppWithToaster /> : <StrictMode><AppWithToaster /></StrictMode>
);
