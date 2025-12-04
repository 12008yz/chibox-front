import { Package, Sparkles, Gift, Trophy, Zap, Crown } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      category: 'Бесплатные кейсы',
      icon: <Gift className="w-8 h-8" />,
      items: [
        {
          name: 'Ежедневный бесплатный кейс',
          description: 'Доступен каждые 24 часа для всех пользователей',
          price: 0,
          currency: '₽'
        }
      ]
    },
    {
      category: 'Стандартные кейсы',
      icon: <Package className="w-8 h-8" />,
      items: [
        {
          name: 'Обычный кейс',
          description: 'Базовый кейс с различными предметами CS2',
          price: 99,
          currency: '₽'
        },
        {
          name: 'Улучшенный кейс',
          description: 'Кейс с повышенным шансом выпадения редких предметов',
          price: 199,
          currency: '₽'
        },
        {
          name: 'Расширенный кейс',
          description: 'Кейс с широким ассортиментом предметов',
          price: 299,
          currency: '₽'
        }
      ]
    },
    {
      category: 'Премиум кейсы',
      icon: <Crown className="w-8 h-8" />,
      items: [
        {
          name: 'Премиум кейс',
          description: 'Эксклюзивный кейс с высоким шансом выпадения дорогих предметов',
          price: 499,
          currency: '₽'
        },
        {
          name: 'VIP кейс',
          description: 'Элитный кейс с гарантированными редкими предметами',
          price: 999,
          currency: '₽'
        },
        {
          name: 'Ледяной кейс',
          description: 'Специальный тематический кейс с уникальными предметами',
          price: 2499,
          currency: '₽'
        }
      ]
    },
    {
      category: 'Игровые услуги',
      icon: <Zap className="w-8 h-8" />,
      items: [
        {
          name: 'Игра "Крестики-нолики"',
          description: 'Мини-игра с возможностью выиграть бонусный кейс',
          price: 0,
          currency: '₽',
          note: 'Бесплатно для авторизованных пользователей'
        },
        {
          name: 'Игра "Взлом сейфа"',
          description: 'Мини-игра с шансом получить ценные предметы',
          price: 0,
          currency: '₽',
          note: 'Бесплатно для авторизованных пользователей'
        },
        {
          name: 'Слот-машина',
          description: 'Классическая игра с возможностью выиграть предметы',
          price: 50,
          currency: '₽',
          note: 'За одну игру'
        }
      ]
    },
    {
      category: 'Дополнительные услуги',
      icon: <Sparkles className="w-8 h-8" />,
      items: [
        {
          name: 'Улучшение предмета',
          description: 'Апгрейд предметов с шансом получить более дорогой предмет',
          price: 0,
          currency: '₽',
          note: 'Стоимость зависит от предмета'
        },
        {
          name: 'Обмен предметов',
          description: 'Обмен предметов на внутриигровую валюту',
          price: 0,
          currency: '₽',
          note: 'Без комиссии'
        }
      ]
    },
    {
      category: 'Подписки',
      icon: <Trophy className="w-8 h-8" />,
      items: [
        {
          name: 'Подписка на 30 дней',
          description: 'Ежедневные бонусные кейсы и эксклюзивные привилегии',
          price: 499,
          currency: '₽'
        },
        {
          name: 'Подписка на 90 дней',
          description: 'Трёхмесячная подписка с дополнительными бонусами',
          price: 1299,
          currency: '₽',
          note: 'Выгода 13%'
        },
        {
          name: 'Подписка на 365 дней',
          description: 'Годовая подписка с максимальными привилегиями',
          price: 4999,
          currency: '₽',
          note: 'Выгода 17%'
        }
      ]
    },
    {
      category: 'Пополнение баланса',
      icon: <Package className="w-8 h-8" />,
      items: [
        {
          name: 'Пополнение 100 ₽',
          description: 'Пополнение внутриигрового баланса',
          price: 100,
          currency: '₽'
        },
        {
          name: 'Пополнение 500 ₽',
          description: 'Пополнение внутриигрового баланса',
          price: 500,
          currency: '₽'
        },
        {
          name: 'Пополнение 1000 ₽',
          description: 'Пополнение внутриигрового баланса',
          price: 1000,
          currency: '₽'
        },
        {
          name: 'Пополнение 2000 ₽',
          description: 'Пополнение внутриигрового баланса',
          price: 2000,
          currency: '₽'
        },
        {
          name: 'Пополнение 5000 ₽',
          description: 'Пополнение внутриигрового баланса',
          price: 5000,
          currency: '₽'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-orange-400">
            Каталог услуг
          </h1>
          <p className="text-lg text-gray-300">
            Полный перечень услуг и товаров платформы ChiBox с фиксированными ценами
          </p>
        </div>

        <div className="space-y-12">
          {services.map((category, categoryIndex) => (
            <section key={categoryIndex} className="bg-gray-800/30 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-orange-400">
                  {category.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {category.category}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-white">
                        {item.name}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-400">
                          {item.price === 0 ? 'Бесплатно' : `${item.price} ${item.currency}`}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {item.description}
                    </p>
                    {item.note && (
                      <p className="text-orange-300 text-xs italic">
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 bg-gray-800/50 rounded-xl p-6 md:p-8 border border-orange-500/30">
          <h2 className="text-2xl font-bold mb-4 text-orange-400">Важная информация</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">Деятельность:</strong> ChiBox является платформой для развлекательных игр,
              предоставляющей услуги по открытию виртуальных кейсов с предметами CS2 (Counter-Strike 2).
            </p>
            <p>
              <strong className="text-white">Производство:</strong> Все услуги предоставляются непосредственно
              платформой ChiBox. Мы не занимаемся перепродажей чужих товаров.
            </p>
            <p>
              <strong className="text-white">Оплата:</strong> Все указанные цены являются фиксированными и включают НДС.
            </p>
            <p>
              <strong className="text-white">Статус:</strong> ИП на УСН (упрощённая система налогообложения).
            </p>
            <p>
              <strong className="text-white">Возрастное ограничение:</strong> Для использования платформы необходимо быть старше 18 лет.
            </p>
            <p>
              <strong className="text-white">Контакты:</strong> По всем вопросам обращайтесь на{' '}
              <a href="mailto:support@chibox-game.ru" className="text-orange-400 hover:underline">
                support@chibox-game.ru
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
