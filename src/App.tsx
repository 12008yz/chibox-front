import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from './store/hooks';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import { loginSuccess, logout } from './features/auth/authSlice';
import { useEffect } from 'react';
import './index.css'

// Импорты компонентов
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import TestPage from './pages/testPage';

// Компонент для отображения страниц с Header
const PageWithHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 bg-pattern">
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};

function App() {
  const { isAuthenticated, token, user } = useAuth();
  const dispatch = useAppDispatch();

  // Проверяем токен при загрузке приложения
  const { data: currentUserData, error } = useGetCurrentUserQuery(undefined, {
    skip: !token || !isAuthenticated,
  });

  useEffect(() => {
    if (currentUserData?.success && currentUserData.data && token) {
      // Обновляем пользователя в store
      dispatch(loginSuccess({
        user: currentUserData.data,
        token: token,
      }));
    }
    // Ошибки 401 обрабатываются автоматически в baseApi.ts
  }, [currentUserData, token, dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          {/* Главная страница - показываем регистрацию для неавторизованных */}
          <Route
            path="/"
            element={
              <PageWithHeader>
                {isAuthenticated ? <HomePage /> : <RegisterPage />}
              </PageWithHeader>
            }
          />

          {/* Страницы авторизации без Header */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Gambling Games Pages */}
          <Route
            path="/cases"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-gambling mb-4">🎁 Кейсы</h1>
                  <p className="text-gray-400 text-lg">Откройте кейсы и получите редкие предметы</p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="card-gambling p-6 glow-gold">
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">Ежедневный кейс</h3>
                      <p className="text-gray-300">Бесплатный кейс каждый день</p>
                    </div>
                    <div className="card-gambling p-6">
                      <h3 className="text-xl font-bold text-purple-400 mb-2">Premium кейс</h3>
                      <p className="text-gray-300">Редкие предметы внутри</p>
                    </div>
                    <div className="card-gambling p-6">
                      <h3 className="text-xl font-bold text-red-400 mb-2">Mythical кейс</h3>
                      <p className="text-gray-300">Легендарные дропы</p>
                    </div>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/crash"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-neon mb-4">📈 Crash</h1>
                  <p className="text-gray-400 text-lg">Рискуйте и выигрывайте больше</p>
                  <div className="mt-8 card-gambling p-8 max-w-2xl mx-auto">
                    <div className="text-6xl font-bold text-green-400 mb-4 animate-pulse">1.00x</div>
                    <button className="btn-gambling">Играть</button>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/mines"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-gambling mb-4">💣 Mines</h1>
                  <p className="text-gray-400 text-lg">Избегайте мин и собирайте сокровища</p>
                  <div className="mt-8 card-gambling p-8 max-w-md mx-auto">
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <button key={i} className="aspect-square bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                        </button>
                      ))}
                    </div>
                    <button className="btn-gambling">Начать игру</button>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/tower"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-purple-400 mb-4">🏗️ Tower</h1>
                  <p className="text-gray-400 text-lg">Поднимайтесь по башне за наградами</p>
                  <div className="mt-8 card-gambling p-8 max-w-md mx-auto">
                    <div className="space-y-2 mb-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex gap-2">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <button key={j} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                              {i === 0 && j === 1 ? '👤' : ''}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                    <button className="btn-gambling">Играть</button>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/dice"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-blue-400 mb-4">🎲 Dice</h1>
                  <p className="text-gray-400 text-lg">Выберите число и рискуйте</p>
                  <div className="mt-8 card-gambling p-8 max-w-2xl mx-auto">
                    <div className="text-6xl mb-6 animate-spin-slow">🎲</div>
                    <div className="flex gap-4 justify-center mb-6">
                      <input className="input-gambling max-w-32" placeholder="Ставка" />
                      <input className="input-gambling max-w-32" placeholder="Множитель" />
                    </div>
                    <button className="btn-gambling">Бросить кости</button>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/double"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-red-400 mb-4">🔄 Double</h1>
                  <p className="text-gray-400 text-lg">Красное, чёрное или зелёное?</p>
                  <div className="mt-8 card-gambling p-8 max-w-2xl mx-auto">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-yellow-400 flex items-center justify-center text-2xl font-bold animate-spin-slow">
                      🎯
                    </div>
                    <div className="flex gap-4 justify-center mb-6">
                      <button className="btn-danger">Красное 2x</button>
                      <button className="btn-secondary">Чёрное 2x</button>
                      <button className="btn-gambling">Зелёное 14x</button>
                    </div>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          {/* Основные страницы */}
          <Route
            path="/inventory"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-gambling mb-4">🎒 Инвентарь</h1>
                  <p className="text-gray-400 text-lg">Ваши предметы и сокровища</p>
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="card-gambling aspect-square p-4 flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    ))}
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/profile"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-gambling mb-4">👤 Профиль</h1>
                  <p className="text-gray-400 text-lg">Ваши достижения и статистика</p>
                  <div className="mt-8 card-gambling p-8 max-w-2xl mx-auto">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-gold flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Player Name</h2>
                    <p className="text-gray-400 mb-6">Уровень 42 • 15,230 XP</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">1,337</div>
                        <div className="text-sm text-gray-400">Кейсов открыто</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">$12,450</div>
                        <div className="text-sm text-gray-400">Всего выиграно</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">89</div>
                        <div className="text-sm text-gray-400">Достижений</div>
                      </div>
                    </div>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/achievements"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-gambling mb-4">🏆 Достижения</h1>
                  <p className="text-gray-400 text-lg">Ваши успехи и награды</p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="card-gambling p-6 glow-gold">
                      <div className="text-3xl mb-2">🥇</div>
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">Первый кейс</h3>
                      <p className="text-gray-300">Откройте свой первый кейс</p>
                      <div className="mt-4 text-green-400 font-semibold">✅ Выполнено</div>
                    </div>
                    <div className="card-gambling p-6">
                      <div className="text-3xl mb-2">💰</div>
                      <h3 className="text-xl font-bold text-gray-400 mb-2">Миллионер</h3>
                      <p className="text-gray-300">Выиграйте $1,000,000</p>
                      <div className="mt-4 text-gray-500">🔒 Заблокировано</div>
                    </div>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          {/* Страница подписок */}
          <Route
            path="/subscription"
            element={
              <PageWithHeader>
                <SubscriptionsPage />
              </PageWithHeader>
            }
          />

          {/* Страница таблицы лидеров */}
          <Route
            path="/leaderboard"
            element={
              <PageWithHeader>
                <LeaderboardPage />
              </PageWithHeader>
            }
          />

          <Route
            path="/balance"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-gambling mb-4">💳 Баланс</h1>
                  <p className="text-gray-400 text-lg">Управление вашими средствами</p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="card-gambling p-8 glow-gold">
                      <h3 className="text-2xl font-bold text-yellow-400 mb-4">Текущий баланс</h3>
                      <div className="text-4xl font-bold mb-6">$1,337.42</div>
                      <button className="btn-gambling w-full">Пополнить</button>
                    </div>
                    <div className="card-gambling p-8">
                      <h3 className="text-2xl font-bold mb-4">Вывод средств</h3>
                      <input className="input-gambling mb-4" placeholder="Сумма" />
                      <button className="btn-secondary w-full">Вывести</button>
                    </div>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/settings"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-gambling mb-4">⚙️ Настройки</h1>
                  <p className="text-gray-400 text-lg">Настройка вашего аккаунта</p>
                  <div className="mt-8 card-gambling p-8 max-w-2xl mx-auto text-left">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input className="input-gambling" placeholder="your@email.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Уведомления</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span>Email уведомления</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span>Push уведомления</span>
                          </label>
                        </div>
                      </div>
                      <button className="btn-gambling w-full">Сохранить</button>
                    </div>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          <Route
            path="/notifications"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold text-gambling mb-4">🔔 Уведомления</h1>
                  <p className="text-gray-400 text-lg">Все ваши уведомления</p>
                  <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                    <div className="card-gambling p-4 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Новый кейс доступен!</h3>
                          <p className="text-gray-400 text-sm">5 минут назад</p>
                        </div>
                        <span className="text-green-400">●</span>
                      </div>
                    </div>
                    <div className="card-gambling p-4 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Поздравляем с выигрышем!</h3>
                          <p className="text-gray-400 text-sm">1 час назад</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </PageWithHeader>
            }
          />

          {/* После успешной регистрации перенаправляем на подписки */}
          <Route
            path="/welcome"
            element={
              isAuthenticated ? (
                <PageWithHeader>
                  <SubscriptionsPage />
                </PageWithHeader>
              ) : (
                <Navigate to="/register" replace />
              )
            }
          />

          {/* Тестовая страница */}
          <Route
            path="/test"
            element={
              <PageWithHeader>
                <TestPage />
              </PageWithHeader>
            }
          />

          {/* Защищенные маршруты (пример) */}
          <Route
            path="/admin"
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <PageWithHeader>
                  <div className="p-8 text-center">
                    <h1 className="text-4xl font-bold text-gambling mb-4">🛡️ Админ панель</h1>
                    <p className="text-gray-400 text-lg">Управление платформой</p>
                  </div>
                </PageWithHeader>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* 404 страница */}
          <Route
            path="*"
            element={
              <PageWithHeader>
                <div className="p-8 text-center">
                  <h1 className="text-6xl font-bold text-gambling mb-4">404</h1>
                  <p className="text-gray-400 text-lg">Страница не найдена</p>
                  <button className="btn-gambling mt-6" onClick={() => window.history.back()}>
                    Вернуться назад
                  </button>
                </div>
              </PageWithHeader>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
