import { Package, Sparkles, Gift, Trophy, Zap, Crown, Coins, Gamepad2, TrendingUp, Shield } from 'lucide-react';

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Заголовок */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-orange-400">
            Услуги платформы ChiBox
          </h1>
          <p className="text-lg text-gray-300">
            Полное описание услуг развлекательной платформы по открытию виртуальных кейсов с игровыми предметами CS2
          </p>
        </div>

        {/* Подписки - главный раздел */}
        <section className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 rounded-xl p-8 mb-12 border-2 border-orange-500/50">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-10 h-10 text-orange-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-orange-400">
              Подписки (Статусы)
            </h2>
          </div>

          <p className="text-gray-300 mb-8">
            Подписки предоставляют расширенный функционал на 30 дней. Ежедневные бонусы выдаются автоматически в 16:00 МСК.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Статус */}
            <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-blue-500/50 hover:border-blue-400 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-blue-400">Статус</h3>
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-4">1 811 ₽</div>
              <div className="text-sm text-gray-400 mb-6">на 30 дней</div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">1 бесплатный кейс ежедневно (в 16:00 МСК)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">+2% шанс на редкие предметы</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">3 попытки в мини-играх ежедневно</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">Доступ к системе достижений</span>
                </div>
              </div>
            </div>

            {/* Статус+ */}
            <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-purple-500/50 hover:border-purple-400 transition-all transform scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-purple-400">Статус+</h3>
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-4">3 666 ₽</div>
              <div className="text-sm text-gray-400 mb-6">на 30 дней</div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">1 бесплатный кейс ежедневно (в 16:00 МСК)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">+3% шанс на редкие предметы</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">4 попытки в мини-играх ежедневно</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">Доступ к системе достижений</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">Улучшенные награды</span>
                </div>
              </div>
            </div>

            {/* Статус++ */}
            <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-orange-500/70 hover:border-orange-400 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-orange-400">Статус++</h3>
                <Crown className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-4">7 580 ₽</div>
              <div className="text-sm text-gray-400 mb-6">на 30 дней</div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">1 бесплатный кейс ежедневно (в 16:00 МСК)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">+5% шанс на редкие предметы</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">5 попыток в мини-играх ежедневно</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">★</span>
                  <span className="text-orange-200 font-semibold">Защита от дубликатов предметов</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">Эксклюзивные достижения</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-gray-300">Премиум награды</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-200">
              <strong>Важно:</strong> Подписки действуют 30 календарных дней с момента активации.
              Ежедневные кейсы и попытки в играх обновляются автоматически в 16:00 МСК (13:00 UTC).
              Автопродление не предусмотрено.
            </p>
          </div>
        </section>

        {/* Виртуальные кейсы */}
        <section className="bg-gray-800/30 rounded-xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-8 h-8 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Виртуальные кейсы</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">Стандартный кейс</h3>
                <div className="text-2xl font-bold text-orange-400">99 ₽</div>
              </div>
              <p className="text-gray-300 text-sm">
                Базовый кейс с разнообразными игровыми предметами из Counter-Strike 2
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-purple-300">Премиум кейс</h3>
                <div className="text-2xl font-bold text-purple-400">499 ₽</div>
              </div>
              <p className="text-gray-300 text-sm">
                Улучшенный кейс с повышенным шансом получения редких и ценных предметов
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">17 ₽</div>
              <p className="text-xs text-gray-400">Ночной дозор</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">49 ₽</div>
              <p className="text-xs text-gray-400">Пушистый кейс</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">101 ₽</div>
              <p className="text-xs text-gray-400">Санитарный набор</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">250 ₽</div>
              <p className="text-xs text-gray-400">Платиновый кейс</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">601 ₽</div>
              <p className="text-xs text-gray-400">Космический кейс</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">998 ₽</div>
              <p className="text-xs text-gray-400">Морской кейс</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">2 499 ₽</div>
              <p className="text-xs text-gray-400">Ледяной кейс</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">5 000 ₽</div>
              <p className="text-xs text-gray-400">Бурый кейс</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">10 000 ₽</div>
              <p className="text-xs text-gray-400">Демонический кейс</p>
            </div>
          </div>
        </section>

        {/* Бонусная система */}
        <section className="bg-gray-800/30 rounded-xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Система бонусов</h2>
          </div>

          <p className="text-gray-300 mb-6">
            На платформе действует уникальная система накопительных бонусов, увеличивающая шансы на получение редких предметов.
            Максимальный суммарный бонус — 25%.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-blue-500/30">
              <h3 className="text-lg font-bold text-blue-400 mb-3">Бонус от уровня</h3>
              <div className="text-2xl font-bold text-white mb-2">до +2%</div>
              <p className="text-sm text-gray-300">
                +0.02% за каждый уровень. Максимум достигается на 100 уровне.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-400 mb-3">Бонус от достижений</h3>
              <div className="text-2xl font-bold text-white mb-2">до +17%</div>
              <p className="text-sm text-gray-300">
                Выполняйте достижения и получайте постоянные бонусы к шансам на редкие предметы.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-orange-500/30">
              <h3 className="text-lg font-bold text-orange-400 mb-3">Бонус от подписки</h3>
              <div className="text-2xl font-bold text-white mb-2">от +2% до +5%</div>
              <p className="text-sm text-gray-300">
                В зависимости от уровня подписки (Статус, Статус+, Статус++).
              </p>
            </div>
          </div>
        </section>

        {/* Мини-игры */}
        <section className="bg-gray-800/30 rounded-xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Gamepad2 className="w-8 h-8 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Мини-игры</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Safe Cracker (Взлом сейфа)</h3>
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Увлекательная мини-игра с возможностью получить ценные предметы
              </p>
              <div className="text-sm text-gray-400">
                • Новички: 2 бесплатные попытки<br/>
                • С подпиской: 3-5 попыток ежедневно
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Крестики-нолики</h3>
                <Gamepad2 className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Классическая игра против ИИ с возможностью получить бонусные предметы
              </p>
              <div className="text-sm text-gray-400">
                • Новички: 1 попытка ежедневно<br/>
                • С подпиской: расширенный доступ
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Мини-игра</h3>
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Развлекательная игра с возможностью получить предметы и chiCoins
              </p>
              <div className="text-sm text-gray-400">
                Стоимость зависит от выбранного уровня
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Улучшение предметов</h3>
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Улучшайте предметы с шансом получить более ценные скины
              </p>
              <div className="text-sm text-gray-400">
                Доступно всем пользователям
              </div>
            </div>
          </div>
        </section>

        {/* Дополнительные услуги */}
        <section className="bg-gray-800/30 rounded-xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Дополнительные услуги</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-2">Улучшение предметов</h3>
              <p className="text-sm text-gray-300 mb-2">
                Система апгрейда позволяет улучшить предметы с шансом получить более дорогой предмет
              </p>
              <div className="text-xs text-gray-400">Стоимость зависит от предмета</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-2">Продажа предметов</h3>
              <p className="text-sm text-gray-300 mb-2">
                Обменяйте ненужные предметы на внутриигровую валюту chiCoins
              </p>
              <div className="text-green-400 text-xs font-semibold">с 15% комиссией</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-2">Обмен на дни подписки</h3>
              <p className="text-sm text-gray-300 mb-2">
                Некоторые предметы можно обменять на дополнительные дни подписки
              </p>
              <div className="text-xs text-gray-400">При наличии такой возможности</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-2">Вывод в Steam</h3>
              <p className="text-sm text-gray-300 mb-2">
                Выводите реальные предметы CS2 в свой Steam-инвентарь
              </p>
              <div className="text-xs text-gray-400">При наличии предметов в наличии</div>
            </div>
          </div>
        </section>

        {/* Пополнение баланса */}
        <section className="bg-gray-800/30 rounded-xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Coins className="w-8 h-8 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Пополнение баланса chiCoins</h2>
          </div>

          <p className="text-gray-300 mb-6">
            Пополните баланс внутриигровой валюты для покупки кейсов и участия в играх
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[100, 500, 1000, 2000, 5000].map(amount => (
              <div key={amount} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 text-center hover:border-orange-500/50 transition-all">
                <div className="text-2xl font-bold text-orange-400 mb-1">{amount} ₽</div>
                <div className="text-xs text-gray-400">≈ {amount * 10} chiCoins</div>
              </div>
            ))}
          </div>
        </section>

        {/* Бесплатные бонусы */}
        <section className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-8 mb-12 border border-green-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-8 h-8 text-green-400" />
            <h2 className="text-3xl font-bold text-green-400">Бесплатные бонусы для новичков</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-bold text-white mb-2">Приветственные кейсы</h3>
              <p className="text-gray-300 text-sm">
                Новым пользователям бесплатно выдаются 2 кейса в первые 2 дня после регистрации
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-bold text-white mb-2">Попытки в Safe Cracker</h3>
              <p className="text-gray-300 text-sm">
                2 бесплатные попытки во взломе сейфа для всех новых пользователей
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-bold text-white mb-2">Крестики-нолики</h3>
              <p className="text-gray-300 text-sm">
                1 бесплатная попытка в день для игры против ИИ с возможностью получить бонусы
              </p>
            </div>
          </div>
        </section>

        {/* Важная информация */}
        <div className="bg-gray-800/50 rounded-xl p-8 border border-orange-500/30">
          <h2 className="text-2xl font-bold mb-6 text-orange-400">Важная информация</h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <p>
                <strong className="text-white">О платформе:</strong> ChiBox — развлекательная платформа,
                предоставляющая услуги по открытию виртуальных кейсов с игровыми предметами Counter-Strike 2.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <p>
                <strong className="text-white">Виртуальные предметы:</strong> Полученные предметы являются
                цифровыми объектами. Некоторые могут быть выведены в Steam при наличии в инвентаре.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <p>
                <strong className="text-white">Система оплаты:</strong> Все платежи обрабатываются через
                безопасные платежные системы (Robokassa, FreeKassa, YooMoney). Цены указаны в рублях РФ.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <p>
                <strong className="text-white">Подписки:</strong> Срок действия — 30 дней с момента активации.
                Автопродление отсутствует. Возврат за неиспользованный период не предусмотрен, кроме случаев по закону РФ.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <p>
                <strong className="text-white">Возраст:</strong> Для использования платформы необходимо
                достичь 18 лет или иметь согласие законных представителей.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <p>
                <strong className="text-white">Запреты:</strong> Запрещено использование читов, ботов,
                скриптов и других методов получения несправедливого преимущества. Нарушение ведёт к блокировке аккаунта.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <p>
                <strong className="text-white">Техническое обслуживание:</strong> Платформа может быть
                временно недоступна в связи с проведением технических работ.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <p>
                <strong className="text-white">Поддержка:</strong> По всем вопросам обращайтесь на{' '}
                <a href="mailto:deniscikasov@gmail.com" className="text-orange-400 hover:underline">
                  support@chibox-game.ru
                </a>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-200">
                <strong>Правовая информация:</strong> Самозанятый Чикасов Денис Владимирович, ИНН 711204279301.
                Применяется специальный налоговый режим «Налог на профессиональный доход».
                Адрес: Российская Федерация, Тульская область, г. Богородицк.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
