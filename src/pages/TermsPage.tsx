import { AlertCircle, Check } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
          Пользовательское соглашение
        </h1>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          {/* 1. Общие положения */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">1. Общие положения</h2>
            <p className="mb-4">
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует взаимоотношения между
              пользователем (далее — «Пользователь», «Вы») и платформой{' '}
              <strong className="text-orange-400">ChiBox</strong> (далее — «Сервис», «мы», «наш») при
              использовании веб-сайта{' '}
              <a href="https://chibox-game.ru" className="text-orange-400 hover:underline">chibox-game.ru</a>{' '}
              и связанных с ним услуг.
            </p>

            <div className="bg-gray-800/50 border-l-4 border-orange-400 p-4 rounded mb-4">
              <p className="mb-2"><strong className="text-orange-300">Оператор платформы:</strong></p>
              <p className="text-sm">ChiBox — платформа для приобретения виртуальных предметов Counter-Strike 2
              через механику открытия виртуальных кейсов.</p>
            </div>

            <div className="space-y-3 mt-4">
              <p>
                <strong className="text-white">Принимая настоящее Соглашение,</strong> вы подтверждаете, что:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Вы ознакомились с условиями Соглашения в полном объеме</li>
                <li>Вы полностью согласны со всеми его условиями</li>
                <li>Вы обязуетесь соблюдать правила использования Сервиса</li>
                <li>Вы достигли возраста 18 лет</li>
              </ul>
              <p className="mt-4 text-sm text-gray-400">
                Если вы не согласны с какими-либо положениями настоящего Соглашения, пожалуйста,
                не используйте наш Сервис.
              </p>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg mt-4">
              <h3 className="font-semibold text-orange-300 mb-2">Что такое ChiBox</h3>
              <p className="text-sm">
                ChiBox — это развлекательная платформа для приобретения виртуальных предметов игры Counter-Strike 2
                через механику случайного получения предметов из виртуальных кейсов. Сервис предоставляет возможность
                пополнения внутриигровой валюты (ChiCoins), её использования для открытия кейсов и получения
                виртуальных предметов, которые могут быть переданы в Steam инвентарь пользователя.
              </p>
            </div>
          </section>

          {/* 2. Возрастные ограничения */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">2. Возрастные ограничения (18+)</h2>
            <div className="bg-red-900/20 border border-red-500/30 p-5 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-300 text-xl mb-2">Сервис доступен только для совершеннолетних</p>
                  <p className="mb-3">
                    Сервис предназначен для пользователей не младше <strong className="text-white">18 лет</strong>.
                    Для пользователей из Российской Федерации возраст определяется в соответствии с законодательством РФ.
                  </p>
                  <p className="mb-3 text-sm">
                    Регистрируясь на платформе, вы подтверждаете, что достигли указанного возраста.
                  </p>
                  <div className="bg-red-900/30 p-3 rounded mt-3">
                    <p className="text-sm font-semibold">
                      ⚠️ В случае выявления использования Сервиса лицом младше 18 лет, его аккаунт будет немедленно
                      заблокирован без возможности восстановления и возврата средств.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Регистрация и аккаунт */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">3. Регистрация и учетная запись</h2>

            <div className="space-y-4">
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">3.1. Требования к регистрации</h3>
                <p className="mb-2">Для использования функционала Сервиса необходимо:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Иметь действующий аккаунт Steam</li>
                  <li>Пройти регистрацию на платформе ChiBox с указанием email и создания пароля</li>
                  <li>Подтвердить адрес электронной почты</li>
                  <li>Привязать аккаунт Steam к профилю ChiBox</li>
                </ul>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">3.2. Безопасность аккаунта</h3>
                <p className="mb-2">Вы несете полную ответственность за:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Сохранность логина и пароля вашей учетной записи</li>
                  <li>Все действия, совершенные с использованием вашего аккаунта</li>
                  <li>Своевременное уведомление нас о любом несанкционированном доступе</li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">
                  ChiBox не несет ответственности за любые убытки, возникшие в результате несанкционированного
                  использования вашей учетной записи по вашей вине.
                </p>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">3.3. Один аккаунт на пользователя</h3>
                <div className="bg-orange-900/20 border-l-4 border-orange-400 p-3 rounded">
                  <p className="text-sm">
                    <strong className="text-white">Запрещено создание множественных аккаунтов.</strong> Каждый
                    пользователь имеет право на один аккаунт. Создание дополнительных аккаунтов для получения
                    бонусов, обхода ограничений или других целей строго запрещено и приведет к блокировке
                    всех связанных аккаунтов без возврата средств.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Описание услуг */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">4. Описание услуг и виртуальные товары</h2>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-orange-900/20 to-gray-800/30 p-5 rounded-lg border border-orange-500/20">
                <h3 className="text-xl font-semibold text-orange-300 mb-3">4.1. Что мы предлагаем</h3>
                <p className="mb-3">ChiBox предоставляет следующие услуги:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <div>
                      <strong className="text-white">Приобретение виртуальной валюты (ChiCoins)</strong> —
                      пользователь может пополнить баланс внутриигровой валюты ChiCoins через доступные платежные системы.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <div>
                      <strong className="text-white">Обмен ChiCoins на виртуальные предметы</strong> —
                      пользователь использует ChiCoins для открытия виртуальных кейсов, содержащих случайные
                      виртуальные предметы Counter-Strike 2.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <div>
                      <strong className="text-white">Передача предметов в Steam</strong> —
                      полученные виртуальные предметы могут быть переданы в инвентарь Steam пользователя
                      через систему Trade Offer.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <div>
                      <strong className="text-white">Дополнительные функции</strong> —
                      подписки, мини-игры, система достижений, бонусы.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border-l-4 border-orange-400 p-4 rounded">
                <h3 className="font-semibold text-orange-300 mb-2">ВАЖНО: Характер услуги</h3>
                <p className="text-sm mb-2">
                  ChiBox — это <strong className="text-white">развлекательный сервис по обмену виртуальных товаров</strong>.
                  Пользователь приобретает виртуальную валюту ChiCoins, которую может
                  обменять на виртуальные предметы CS2 через механику открытия кейсов. Предметы передаются в
                  инвентарь Steam пользователя для личного использования или коллекционирования.
                </p>
                <p className="text-sm text-gray-400">
                  Мы не предлагаем возможность обмена виртуальных предметов или ChiCoins обратно на реальные деньги
                  через платформу ChiBox.
                </p>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">4.2. ChiCoins — внутриигровая валюта</h3>
                <div className="space-y-2">
                  <p>
                    <strong className="text-white">ChiCoins</strong> — это внутриигровая валюта платформы ChiBox,
                    которая используется исключительно для получения доступа к функциям сервиса.
                  </p>
                  <div className="bg-orange-900/20 p-3 rounded mt-2">
                    <p className="text-sm">
                      <strong className="text-orange-300">Важные условия использования ChiCoins:</strong>
                    </p>
                    <ul className="list-disc ml-6 space-y-1 text-sm mt-2">
                      <li>ChiCoins не имеют денежной стоимости</li>
                      <li>ChiCoins не подлежат обмену на реальные деньги</li>
                      <li>ChiCoins не могут быть переданы другим пользователям</li>
                      <li>ChiCoins не могут быть выведены за пределы платформы</li>
                      <li>Срок действия ChiCoins не ограничен при активном использовании аккаунта</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">4.3. Виртуальные предметы</h3>
                <p className="mb-2">
                  Виртуальные предметы Counter-Strike 2, получаемые через открытие кейсов:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Являются цифровыми товарами без реальной денежной стоимости (согласно условиям Valve)</li>
                  <li>Принадлежат Valve Corporation и используются в соответствии с условиями Steam</li>
                  <li>Могут быть переданы в Steam инвентарь пользователя</li>
                  <li>Могут быть обменены обратно на ChiCoins через нашу платформу</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Платежи и возвраты */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">5. Платежи и возвраты</h2>

            <div className="space-y-4">
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">5.1. Способы пополнения</h3>
                <p className="mb-2">Вы можете пополнить баланс ChiCoins следующими способами:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Банковские карты (Visa, MasterCard, МИР)</li>
                  <li>СПБ</li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">
                  Минимальная сумма пополнения: 10 ChiCoins. Комиссия платежной системы может взиматься
                  в зависимости от выбранного способа оплаты.
                </p>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">5.2. Обработка платежей</h3>
                <p className="text-sm">
                  Все платежи обрабатываются через защищенные сторонние платежные системы. ChiBox не хранит
                  полные данные банковских карт. Платежи зачисляются на баланс в течение нескольких минут
                  после подтверждения транзакции платежной системой.
                </p>
              </div>

              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-red-300 mb-2">5.3. Политика возвратов</h3>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Все платежи являются окончательными.</strong> Возврат средств
                    возможен только в следующих случаях:
                  </p>
                  <ul className="list-disc ml-6 space-y-2 text-sm">
                    <li>
                      <strong className="text-white">Техническая ошибка при пополнении</strong> — если средства
                      были списаны, но не зачислены на баланс по вине нашей системы (в течение 30 дней)
                    </li>
                    <li>
                      <strong className="text-white">Двойное списание</strong> — если одна транзакция была
                      обработана дважды
                    </li>
                  </ul>

                  <div className="bg-red-900/30 p-3 rounded mt-3">
                    <p className="text-sm font-semibold mb-2">⚠️ Возврат НЕ предоставляется в случаях:</p>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li>После использования приобретенных ChiCoins для открытия кейсов</li>
                      <li>После получения виртуальных предметов из кейсов</li>
                      <li>Если пользователь недоволен результатом открытия кейса</li>
                      <li>Если пользователь передумал использовать сервис</li>
                      <li>После блокировки аккаунта за нарушение правил</li>
                    </ul>
                  </div>

                  <p className="text-sm text-gray-400 mt-3">
                    Для запроса возврата средств свяжитесь с нашей службой поддержки в течение 30 дней с момента
                    транзакции. Решение о возврате принимается в индивидуальном порядке.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Вывод предметов */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">6. Вывод виртуальных предметов в Steam</h2>

            <div className="space-y-4">
              <div className="bg-gray-800/50 border-l-4 border-orange-400 p-4 rounded">
                <p className="mb-3">
                  Виртуальные предметы, полученные из кейсов, могут быть переданы в ваш Steam инвентарь
                  через систему Trade Offer (обмен предметами Steam).
                </p>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">6.1. Условия вывода</h3>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Ваш аккаунт Steam должен быть привязан к профилю ChiBox</li>
                  <li>Вы должны предоставить действующий Trade URL</li>
                  <li>Ваш инвентарь Steam не должен быть приватным</li>
                  <li>На вашем аккаунте Steam не должно быть ограничений на обмен</li>
                  <li>Минимальная стоимость предмета для вывода может быть установлена администрацией</li>
                </ul>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">6.2. Сроки и процесс вывода</h3>
                <p className="mb-2">
                  Вывод предметов осуществляется в течение <strong className="text-white">1-72 часов</strong> с
                  момента подачи заявки. В некоторых случаях срок может быть увеличен:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>При большом количестве запросов на вывод</li>
                  <li>При необходимости дополнительной проверки заявки</li>
                  <li>По техническим причинам со стороны Steam</li>
                  <li>В случае подозрения на мошенничество</li>
                </ul>
                <p className="text-sm text-gray-400 mt-3">
                  Комиссия за вывод предметов не взимается, если иное не указано в правилах конкретной акции.
                </p>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">6.3. Отсутствие предмета у бота</h3>
                <p className="mb-2 text-sm">
                  В некоторых случаях запрошенный к выводу предмет может временно отсутствовать в инвентаре бота
                  (например, из-за задержки пополнения или высокой нагрузки). В такой ситуации мы уведомим вас
                  и предложим на выбор:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li><strong className="text-white">Компенсация в ChiCoins</strong> — зачисление на баланс суммы, эквивалентной стоимости предмета</li>
                  <li><strong className="text-white">Ожидание</strong> — заявка остаётся в очереди, мы повторим попытку вывода позже автоматически</li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">
                  Выбор остаётся за вами. ChiBox не несёт ответственности за временную недоступность конкретного
                  предмета у бота, но гарантирует выполнение обязательства либо выдачей предмета, либо компенсацией в ChiCoins.
                </p>
              </div>

              <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-300 mb-2">6.4. Ограничение ответственности</h3>
                <p className="text-sm mb-2">
                  <strong className="text-white">ChiBox не контролирует дальнейшее использование предметов
                  пользователем после их передачи в Steam инвентарь.</strong>
                </p>
                <p className="text-sm">
                  Согласно условиям Valve Corporation, виртуальные предметы Steam не имеют денежной стоимости
                  и являются цифровыми активами, принадлежащими Valve. Любые действия пользователя с
                  предметами после их получения (продажа на сторонних площадках, обмен и т.д.) осуществляются
                  на его собственный риск и не являются ответственностью ChiBox.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Запрещенные действия */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">7. Запрещенные действия</h2>

            <div className="bg-red-900/20 border border-red-500/30 p-5 rounded-lg">
              <p className="mb-4 font-semibold text-red-300">
                При использовании ChiBox строго запрещается:
              </p>

              <div className="space-y-3">
                <div className="bg-red-900/20 p-3 rounded">
                  <h3 className="font-semibold text-white mb-1">🚫 Множественные аккаунты и мошенничество</h3>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Создание нескольких аккаунтов для получения бонусов</li>
                    <li>Использование чужих аккаунтов</li>
                    <li>Передача аккаунта третьим лицам</li>
                    <li>Мошеннические схемы и обман других пользователей</li>
                  </ul>
                </div>

                <div className="bg-red-900/20 p-3 rounded">
                  <h3 className="font-semibold text-white mb-1">🤖 Автоматизация и эксплуатация</h3>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Использование ботов, скриптов, автокликеров</li>
                    <li>Попытки взлома или обхода защиты системы</li>
                    <li>Эксплуатация багов и уязвимостей для получения преимущества</li>
                    <li>DDoS атаки или иные действия, нарушающие работу сервиса</li>
                  </ul>
                </div>

                <div className="bg-red-900/20 p-3 rounded">
                  <h3 className="font-semibold text-white mb-1">💳 Финансовые нарушения</h3>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Использование чужих платежных данных</li>
                    <li>Возвратные платежи (chargeback) без оснований</li>
                    <li>Отмывание денег через платформу</li>
                    <li>Использование украденных средств</li>
                  </ul>
                </div>

                <div className="bg-red-900/20 p-3 rounded">
                  <h3 className="font-semibold text-white mb-1">⚖️ Незаконная деятельность</h3>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Нарушение законодательства Российской Федерации</li>
                    <li>Использование сервиса для незаконных целей</li>
                    <li>Попытки продажи аккаунта или виртуальной валюты</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-900/40 p-3 rounded mt-4">
                <p className="text-sm font-bold">
                  ⚠️ Нарушение любого из указанных правил приведет к немедленной блокировке аккаунта
                  без возврата средств и возможности восстановления. Мы оставляем за собой право передать
                  информацию о нарушениях правоохранительным органам.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Законодательство и безопасность */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">8. Соблюдение законодательства и безопасность</h2>

            <div className="space-y-4">
              <div className="bg-gray-800/50 border-l-4 border-orange-400 p-4 rounded">
                <p>
                  ChiBox осуществляет деятельность в соответствии с законодательством Российской Федерации.
                  Мы не являемся оператором по переводу денежных средств в смысле 161-ФЗ и не проводим
                  процедуры полноценной верификации личности (KYC), как у лицензированных финансовых организаций.
                </p>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">8.1. Мониторинг и подозрительная активность</h3>
                <p className="mb-2 text-sm">
                  В целях безопасности и противодействия злоупотреблениям мы вправе анализировать активность
                  пользователей (в том числе паттерны пополнений и выводов). При выявлении подозрительной
                  активности или нарушений правил мы оставляем за собой право временно ограничить функции
                  аккаунта (пополнение, вывод), запросить пояснения по email или заблокировать аккаунт.
                </p>
                <p className="text-sm text-gray-400">
                  По официальным запросам уполномоченных государственных органов РФ мы предоставляем
                  информацию в объёме, предусмотренном законом.
                </p>
              </div>

              <div className="bg-gray-800/50 border-l-4 border-orange-400 p-4 rounded">
                <p className="text-sm">
                  Обработка персональных данных осуществляется в соответствии с нашей{' '}
                  <a href="/privacy" className="text-orange-400 hover:underline">
                    Политикой конфиденциальности
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* 9. Ответственность */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">9. Ответственность и ограничения</h2>

            <div className="space-y-4">
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">9.1. ChiBox НЕ несет ответственность за:</h3>
                <ul className="list-disc ml-6 space-y-2">
                  <li>
                    <strong className="text-white">Проблемы со Steam</strong> — работу серверов Steam,
                    доступность Trade Offer, ограничения Steam на обмен предметами
                  </li>
                  <li>
                    <strong className="text-white">Блокировку аккаунта Steam</strong> пользователя
                    по решению Valve Corporation
                  </li>
                  <li>
                    <strong className="text-white">Потерю доступа к Steam</strong> по вине пользователя
                    (утеря пароля, взлом аккаунта и т.д.)
                  </li>
                  <li>
                    <strong className="text-white">Изменение цен на виртуальные предметы</strong> на
                    сторонних торговых площадках
                  </li>
                  <li>
                    <strong className="text-white">Действия пользователя с предметами</strong> после
                    их получения в Steam инвентарь (продажа, обмен, передача)
                  </li>
                  <li>
                    <strong className="text-white">Косвенные убытки</strong> — упущенную выгоду,
                    моральный ущерб, репутационные потери
                  </li>
                  <li>
                    <strong className="text-white">Технические сбои</strong> — перерывы в работе сервиса
                    по причинам, не зависящим от нас (проблемы хостинга, DDoS атаки)
                  </li>
                </ul>
              </div>

              <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">9.2. Ограничение ответственности</h3>
                <p className="mb-2">
                  <strong className="text-white">Максимальная ответственность ChiBox ограничена суммой,
                  внесенной пользователем на баланс за последние 12 месяцев.</strong>
                </p>
                <p className="text-sm text-gray-400">
                  В случае доказанной вины ChiBox в технической ошибке или некачественном предоставлении услуг,
                  компенсация не может превышать фактически понесенные убытки и ограничивается суммой
                  последнего пополнения.
                </p>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">9.3. Ответственность пользователя</h3>
                <p className="mb-2">Пользователь несет полную ответственность за:</p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>Соблюдение условий настоящего Соглашения</li>
                  <li>Законность источника средств, используемых для пополнения баланса</li>
                  <li>Точность предоставленных персональных данных</li>
                  <li>Действия, совершенные через его аккаунт</li>
                  <li>Соблюдение законодательства РФ при использовании сервиса</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 10. Блокировка аккаунта */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">10. Блокировка и приостановка аккаунта</h2>

            <div className="space-y-4">
              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-red-300 mb-2">10.1. Основания для блокировки</h3>
                <p className="mb-3">Мы можем заблокировать или приостановить ваш аккаунт в случае:</p>
                <ul className="list-disc ml-6 space-y-2 text-sm">
                  <li>Нарушения любого пункта настоящего Соглашения</li>
                  <li>Мошеннических действий или попыток обмана системы</li>
                  <li>Использования ботов, скриптов, читов</li>
                  <li>Создания множественных аккаунтов</li>
                  <li>Подозрительной финансовой активности или нарушения правил использования сервиса</li>
                  <li>Использования чужих платёжных данных</li>
                  <li>Оскорбительного поведения по отношению к другим пользователям или персоналу</li>
                  <li>По требованию правоохранительных органов</li>
                </ul>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">10.2. Последствия блокировки</h3>
                <div className="space-y-2">
                  <p>При блокировке аккаунта:</p>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Доступ к аккаунту и всем его функциям прекращается</li>
                    <li>Неиспользованные ChiCoins аннулируются без возврата</li>
                    <li>Предметы в инвентаре, не выведенные в Steam, становятся недоступными</li>
                    <li>Возврат средств не производится</li>
                    <li>Все связанные аккаунты также подлежат блокировке</li>
                  </ul>
                  <p className="text-sm text-gray-400 mt-3">
                    В исключительных случаях (техническая ошибка) администрация может рассмотреть запрос
                    на разблокировку.
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">10.3. Удаление аккаунта по инициативе пользователя</h3>
                <p className="text-sm mb-2">
                  Вы можете запросить удаление вашего аккаунта, связавшись со службой поддержки.
                  При удалении аккаунта:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>Все неиспользованные ChiCoins будут аннулированы</li>
                  <li>Предметы, не выведенные в Steam, будут утрачены</li>
                  <li>Восстановление аккаунта возможно в течение 30 дней</li>
                  <li>После 30 дней данные удаляются безвозвратно</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 11. Интеллектуальная собственность */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">11. Интеллектуальная собственность</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <p className="mb-3">
                  Все права на контент, дизайн, программное обеспечение, логотипы, товарные знаки и
                  другие элементы платформы ChiBox принадлежат ChiBox или их правообладателям и защищены
                  законодательством об интеллектуальной собственности.
                </p>
                <p className="mb-2"><strong className="text-white">Запрещается без письменного разрешения:</strong></p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>Копирование, распространение или модификация контента сайта</li>
                  <li>Использование логотипов и товарных знаков ChiBox</li>
                  <li>Декомпиляция или реверс-инжиниринг программного обеспечения</li>
                  <li>Создание производных работ на основе нашего контента</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 12. Связь со Steam/Valve */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">12. Отношения со Steam и Valve Corporation</h2>
            <div className="bg-gray-800/50 border-l-4 border-orange-400 p-5 rounded">
              <div className="space-y-3">
                <p className="font-semibold text-lg text-orange-300">
                  ВАЖНОЕ УВЕДОМЛЕНИЕ
                </p>
                <p>
                  <strong className="text-white">ChiBox НЕ является партнером, аффилированным лицом
                  или официальным представителем Valve Corporation.</strong>
                </p>
                <p className="text-sm">
                  Все виртуальные предметы Counter-Strike 2 принадлежат Valve Corporation и регулируются
                  Соглашением подписчика Steam (Steam Subscriber Agreement) и Условиями использования Steam.
                </p>
                <p className="text-sm">
                  Пользователь обязан соблюдать условия использования Steam при работе с виртуальными предметами.
                  ChiBox не несет ответственности за:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>Изменения в политике Valve относительно виртуальных предметов</li>
                  <li>Блокировки или ограничения, наложенные Valve на аккаунт пользователя</li>
                  <li>Технические проблемы со стороны Steam (недоступность Trade, API и т.д.)</li>
                  <li>Решения Valve об удалении или изменении виртуальных предметов</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 13. Споры */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">13. Разрешение споров и применимое право</h2>

            <div className="space-y-4">
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">13.1. Претензионный порядок</h3>
                <p className="mb-2 text-sm">
                  До обращения в суд стороны обязуются соблюдать претензионный порядок разрешения споров:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>Пользователь направляет письменную претензию на{' '}
                    <a href="mailto:support@chibox-game.ru" className="text-orange-400 hover:underline">
                      support@chibox-game.ru
                    </a>
                  </li>
                  <li>ChiBox рассматривает претензию в течение 30 календарных дней</li>
                  <li>Ответ направляется на email пользователя, указанный при регистрации</li>
                  <li>При отсутствии ответа или несогласии с ответом пользователь вправе обратиться в суд</li>
                </ul>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">13.2. Применимое право и юрисдикция</h3>
                <p className="text-sm mb-2">
                  Настоящее Соглашение регулируется и толкуется в соответствии с законодательством Российской Федерации.
                </p>
                <p className="text-sm">
                  Все споры, возникающие из настоящего Соглашения или в связи с ним, подлежат разрешению
                  в судебном порядке по месту нахождения ChiBox, если иное не предусмотрено законодательством.
                </p>
              </div>
            </div>
          </section>

          {/* 14. Изменения соглашения */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">14. Изменения в Соглашении</h2>
            <div className="space-y-3">
              <p>
                ChiBox оставляет за собой право изменять условия настоящего Соглашения в любое время.
                Изменения вступают в силу с момента их публикации на сайте, если не указан иной срок.
              </p>
              <p>
                <strong className="text-white">О существенных изменениях</strong> мы уведомим пользователей
                одним из следующих способов:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Размещение уведомления на главной странице</li>
                <li>Отправка email-уведомления</li>
                <li>Push-уведомление в личном кабинете</li>
              </ul>
              <p className="text-sm text-gray-400 mt-3">
                Продолжение использования Сервиса после внесения изменений означает ваше согласие с
                новыми условиями. Если вы не согласны с изменениями, вы должны прекратить использование Сервиса.
              </p>
            </div>
          </section>

          {/* 15. Подписки */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">15. Подписки и премиум статус</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <p className="mb-3">
                  ChiBox предлагает платные подписки, предоставляющие дополнительные преимущества:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li><strong className="text-white">Статус</strong> — базовый уровень подписки</li>
                  <li><strong className="text-white">Статус+</strong> — продвинутый уровень</li>
                  <li><strong className="text-white">Статус++</strong> — премиум уровень</li>
                </ul>
                <p className="mt-3 text-sm text-gray-300">
                  В тарифе <strong className="text-white">Статус++</strong> повторы предметов отключены лишь в ежедневном бесплатном кейсе; в остальных кейсах дубликаты возможны.
                </p>
                <p className="mt-3 text-sm text-gray-300">
                  <strong className="text-orange-300">Бесплатное получение Статуса:</strong> пользователь может оформить Статус на период без оплаты, обменяв виртуальные предметы в разделе «Обмен» на время действия статуса, в соответствии с правилами, действующими на платформе.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">Условия подписки</h3>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>Подписка оформляется на период 30 дней</li>
                  <li>Автоматическое продление не осуществляется</li>
                  <li>Возврат средств за неиспользованный период подписки не производится</li>
                  <li>Преимущества подписки действуют до окончания оплаченного периода</li>
                  <li>При блокировке аккаунта подписка аннулируется без возврата средств</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 16. Контакты */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">16. Контактная информация</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-orange-900/20 to-gray-800/30 p-6 rounded-lg border border-orange-500/20">
                <h3 className="text-xl font-semibold text-orange-300 mb-3">📧 Поддержка пользователей</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong className="text-white">Email:</strong>{' '}
                    <a href="mailto:support@chibox-game.ru" className="text-orange-400 hover:underline">
                      support@chibox-game.ru
                    </a>
                  </p>
                  <p className="text-gray-400">
                    По общим вопросам, техническим проблемам, запросам на вывод предметов
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-900/20 to-gray-800/30 p-6 rounded-lg border border-orange-500/20">
                <h3 className="text-xl font-semibold text-orange-300 mb-3">⚖️ Юридические вопросы</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong className="text-white">Email:</strong>{' '}
                    <a href="mailto:legal@chibox-game.ru" className="text-orange-400 hover:underline">
                      legal@chibox-game.ru
                    </a>
                  </p>
                  <p className="text-gray-400">
                    По вопросам соблюдения законодательства, претензий и судебных запросов
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 17. Заключительные положения */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">17. Заключительные положения</h2>
            <div className="space-y-3 text-sm">
              <p>
                Если какое-либо положение настоящего Соглашения будет признано недействительным или
                не имеющим юридической силы, это не влияет на действительность остальных положений.
              </p>
              <p>
                Бездействие ChiBox в случае нарушения вами условий Соглашения не означает отказ от
                права требовать исполнения обязательств в будущем.
              </p>
              <p>
                Настоящее Соглашение представляет собой полное соглашение между вами и ChiBox и заменяет
                все предыдущие договоренности.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-700 pt-8 mt-12">
            <div className="bg-orange-900/20 border border-orange-500/30 p-5 rounded-lg mb-6">
              <p className="text-center text-sm mb-3">
                <strong className="text-orange-300">Используя сервис ChiBox, вы подтверждаете, что:</strong>
              </p>
              <ul className="text-sm space-y-2 max-w-3xl mx-auto">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Вам исполнилось 18 лет</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Вы ознакомились и согласны с условиями настоящего Соглашения</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Вы ознакомились с{' '}
                    <a href="/privacy" className="text-orange-400 hover:underline">
                      Политикой конфиденциальности
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Вы понимаете, что ChiBox — развлекательный сервис обмена виртуальных товаров</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Вы обязуетесь соблюдать правила использования платформы</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Вы понимаете, что <strong className="text-white">Статус</strong> можно получить бесплатно, обменяв предметы в разделе «Обмен» на период действия статуса</span>
                </li>
              </ul>
            </div>

            <p className="text-center text-gray-500 font-semibold">
              Дата последнего обновления: 26 ноября 2025 года
            </p>
            <p className="text-center text-gray-600 text-xs mt-2">
              Версия документа: 2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
ge;
