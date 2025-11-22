import { useState } from 'react';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    {
      category: 'Общие вопросы',
      questions: [
        {
          q: 'Что такое ChiBox?',
          a: 'ChiBox - это платформа для открытия кейсов с виртуальными предметами. Вы можете открывать кейсы, получать предметы и обменивать их.'
        },
        {
          q: 'Как начать пользоваться ChiBox?',
          a: 'Зарегистрируйтесь на сайте, подтвердите email и получите бесплатный приветственный бонус. После этого вы можете открыть свой первый бесплатный кейс!'
        },
        {
          q: 'Есть ли возрастные ограничения?',
          a: 'Да, использование ChiBox доступно только пользователям старше 18 лет.'
        }
      ]
    },
    {
      category: 'Баланс и платежи',
      questions: [
        {
          q: 'Как пополнить баланс?',
          a: 'Нажмите кнопку "Пополнить баланс" в шапке сайта, выберите сумму и способ оплаты. Средства зачисляются мгновенно после успешной оплаты.'
        },
        {
          q: 'Какие способы оплаты доступны?',
          a: 'Мы принимаем банковские карты Visa/Mastercard/Мир, электронные кошельки и криптовалюту.'
        },
        {
          q: 'Можно ли вернуть деньги?',
          a: 'Возврат средств возможен только в случае технической ошибки. После открытия кейса возврат не предусмотрен.'
        }
      ]
    },
    {
      category: 'Кейсы и предметы',
      questions: [
        {
          q: 'Как открыть кейс?',
          a: 'Нажмите на интересующий вас кейс, ознакомьтесь с содержимым и нажмите "Открыть". Для платных кейсов необходимо иметь достаточный баланс.'
        },
        {
          q: 'Что такое бесплатные кейсы?',
          a: 'Это кейсы, которые можно открывать ежедневно без затрат. Количество и доступность зависят от вашего статуса.'
        },
        {
          q: 'Можно ли вывести предметы?',
          a: 'Да, пользователи со статусом могут выводить предметы в Steam. Для этого необходимо указать Trade URL в настройках профиля.'
        }
      ]
    },
    {
      category: 'Статус и бонусы',
      questions: [
        {
          q: 'Что дает статус?',
          a: 'Статус увеличивает шанс получения редких предметов, дает ежедневные бесплатные кейсы, доступ к эксклюзивным играм и возможность вывода предметов.'
        },
        {
          q: 'Какие уровни статуса существуют?',
          a: 'Есть три уровня: Статус (+5% к дропу), Статус+ (+10% к дропу) и Статус++ (+15% к дропу). Каждый последующий уровень дает больше преимуществ.'
        },
        {
          q: 'Как получить бонусы?',
          a: 'Ежедневно заходите на сайт, открывайте кейсы, участвуйте в играх и выполняйте достижения для получения бонусов.'
        }
      ]
    },
    {
      category: 'Игры',
      questions: [
        {
          q: 'Какие игры доступны?',
          a: 'На ChiBox доступны: Слоты, Крестики-нолики, Взлом сейфа и Апгрейд предметов. Каждая игра имеет свои правила и награды.'
        },
        {
          q: 'Есть ли ограничения на игры?',
          a: 'Да, количество попыток в некоторых играх ограничено и зависит от вашего статуса. Например, в крестики-нолики можно играть ограниченное количество раз в день.'
        }
      ]
    },
    {
      category: 'Технические вопросы',
      questions: [
        {
          q: 'Сайт не загружается, что делать?',
          a: 'Попробуйте очистить кеш браузера, использовать другой браузер или проверить интернет-соединение. Если проблема сохраняется, обратитесь в поддержку.'
        },
        {
          q: 'Как привязать Steam аккаунт?',
          a: 'Перейдите в настройки профиля и нажмите "Подключить Steam". Вы будете перенаправлены на страницу авторизации Steam.'
        },
        {
          q: 'Забыл пароль, как восстановить?',
          a: 'На странице входа нажмите "Забыли пароль?" и следуйте инструкциям. Ссылка для восстановления будет отправлена на ваш email.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-orange-400">
          Часто задаваемые вопросы
        </h1>
        <p className="text-gray-400 mb-12">
          Найдите ответы на самые популярные вопросы о ChiBox
        </p>

        <div className="space-y-8">
          {faqData.map((category, catIndex) => (
            <section key={catIndex}>
              <h2 className="text-2xl font-bold mb-6 text-orange-400">
                {category.category}
              </h2>

              <div className="space-y-4">
                {category.questions.map((item, qIndex) => {
                  const globalIndex = catIndex * 100 + qIndex;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={qIndex}
                      className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-orange-500/50 transition-colors"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full p-6 text-left flex justify-between items-center gap-4"
                      >
                        <span className="font-bold text-white">{item.q}</span>
                        <span className={`text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Не нашли ответ на свой вопрос?
          </h2>
          <p className="text-gray-300 mb-6">
            Свяжитесь с нашей службой поддержки, и мы поможем вам!
          </p>
          <a
            href="/contacts"
            className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
          >
            Связаться с поддержкой
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
