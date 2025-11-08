import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import { store, persistor } from "./store/index";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
// Импортируем утилиту очистки данных (будет доступна в консоли как window.clearAllAuthData)
import "./utils/clearAllAuth";

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
const isDevelopment = process.env.NODE_ENV === 'development';

const AppWithToaster = () => (
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistor}>
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
      />
    </PersistGate>
  </Provider>
);

createRoot(rootElement).render(
  isDevelopment ? <AppWithToaster /> : <StrictMode><AppWithToaster /></StrictMode>
);
