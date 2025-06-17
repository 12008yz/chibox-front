import { useState } from 'react';
import { Check, Crown, Star, Zap, Gift } from 'lucide-react';
import {
  useGetSubscriptionTiersQuery,
  useBuySubscriptionMutation,
  type SubscriptionTier
} from '../features/subscriptions/subscriptionsApi';
import { useAuth } from '../store/hooks';

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const { data: tiersData, isLoading } = useGetSubscriptionTiersQuery();
  const [buySubscription, { isLoading: isBuying }] = useBuySubscriptionMutation();

  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'bank_card'>('balance');

  const tiers = tiersData?.data || [];

  const handleBuySubscription = async (tierId: number) => {
    try {
      const result = await buySubscription({
        tierId,
        method: paymentMethod,
      }).unwrap();

      if (result.success) {
        if (result.data.paymentUrl && paymentMethod === 'bank_card') {
          // Перенаправляем на оплату
          window.location.href = result.data.paymentUrl;
        } else {
          // Показываем успешное сообщение
          alert('Подписка успешно активирована!');
        }
      }
    } catch (error: any) {
      alert(error?.data?.message || 'Ошибка при покупке подписки');
    }
  };

  const getTierIcon = (tierId: number) => {
    switch (tierId) {
      case 1:
        return <Star className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Zap className="w-8 h-8 text-orange-500" />;
      case 3:
        return <Crown className="w-8 h-8 text-purple-500" />;
      default:
        return <Gift className="w-8 h-8 text-blue-500" />;
    }
  };

  const getTierColors = (tierId: number) => {
    switch (tierId) {
      case 1:
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          button: 'bg-yellow-500 hover:bg-yellow-600',
          highlight: 'text-yellow-600'
        };
      case 2:
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          button: 'bg-orange-500 hover:bg-orange-600',
          highlight: 'text-orange-600'
        };
      case 3:
        return {
          border: 'border-purple-200',
          bg: 'bg-purple-50',
          button: 'bg-purple-500 hover:bg-purple-600',
          highlight: 'text-purple-600'
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          button: 'bg-gray-500 hover:bg-gray-600',
          highlight: 'text-gray-600'
        };
    }
  };

  const benefits = [
    'Ежедневные бесплатные кейсы',
    'Бонус к выпадению редких предметов',
    'Эксклюзивные достижения',
    'Приоритетная поддержка',
    'Скидки на премиум кейсы'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Выберите подписку
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Получите больше возможностей с подпиской ChiBox.
            Ежедневные кейсы, бонусы к дропу и эксклюзивные предметы.
          </p>
        </div>

        {/* Способ оплаты */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setPaymentMethod('balance')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                paymentMethod === 'balance'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              С баланса ({user?.balance?.toLocaleString() || '0'} ₽)
            </button>
            <button
              onClick={() => setPaymentMethod('bank_card')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                paymentMethod === 'bank_card'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Банковской картой
            </button>
          </div>
        </div>

        {/* Тарифы */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier: SubscriptionTier) => {
            const colors = getTierColors(tier.id);
            const isPopular = tier.id === 2; // Статус+ как популярный

            return (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-lg ${colors.border} border-2 transition-all duration-300 hover:shadow-xl ${
                  selectedTier === tier.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Популярный тариф */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-400 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Популярный
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Иконка и название */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      {getTierIcon(tier.id)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {tier.name}
                    </h3>
                    <div className="text-4xl font-bold text-gray-900">
                      {tier.price.toLocaleString()}
                      <span className="text-lg text-gray-500">₽</span>
                    </div>
                    <p className="text-gray-500 mt-1">{tier.days} дней</p>
                  </div>

                  {/* Основные преимущества */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        {tier.max_daily_cases} кейс в день
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        +{tier.bonus_percentage}% к дропу редких предметов
                      </span>
                    </div>
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Кнопка покупки */}
                  <button
                    onClick={() => handleBuySubscription(tier.id)}
                    disabled={isBuying || (paymentMethod === 'balance' && (user?.balance || 0) < tier.price)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors ${colors.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isBuying ? (
                      'Обработка...'
                    ) : paymentMethod === 'balance' && (user?.balance || 0) < tier.price ? (
                      'Недостаточно средств'
                    ) : (
                      `Выбрать ${tier.name}`
                    )}
                  </button>

                  {paymentMethod === 'balance' && (user?.balance || 0) < tier.price && (
                    <p className="text-center text-sm text-red-600 mt-2">
                      Нужно {(tier.price - (user?.balance || 0)).toLocaleString()} ₽
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Часто задаваемые вопросы
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Что входит в подписку?
              </h3>
              <p className="text-gray-600">
                Ежедневные бесплатные кейсы, увеличенный шанс выпадения редких предметов,
                эксклюзивные достижения и приоритетная поддержка.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Можно ли отменить подписку?
              </h3>
              <p className="text-gray-600">
                Подписка автоматически не продлевается. После окончания срока действия
                вы можете приобрести новую подписку.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Безопасны ли платежи?
              </h3>
              <p className="text-gray-600">
                Да, мы используем защищенную платежную систему YooMoney для обработки
                всех банковских карт.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Что такое бонус к дропу?
              </h3>
              <p className="text-gray-600">
                Это увеличенный шанс получить редкие и дорогие предметы при открытии кейсов.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
