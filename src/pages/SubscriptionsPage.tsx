import { useState } from 'react';
import { Check, Crown, Star, Zap, Gift, Coins, Shield, Sparkles } from 'lucide-react';
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
        return <Star className="w-10 h-10 text-yellow-400" />;
      case 2:
        return <Zap className="w-10 h-10 text-orange-400" />;
      case 3:
        return <Crown className="w-10 h-10 text-purple-400" />;
      default:
        return <Gift className="w-10 h-10 text-blue-400" />;
    }
  };

  const getTierConfig = (tierId: number) => {
    switch (tierId) {
      case 1:
        return {
          gradient: 'from-yellow-400/20 to-yellow-600/20',
          border: 'border-yellow-400/30',
          button: 'gradient-gold',
          highlight: 'text-yellow-400',
          glow: 'shadow-yellow-400/20'
        };
      case 2:
        return {
          gradient: 'from-orange-400/20 to-red-500/20',
          border: 'border-orange-400/30',
          button: 'bg-gradient-to-r from-orange-400 to-red-500',
          highlight: 'text-orange-400',
          glow: 'shadow-orange-400/20'
        };
      case 3:
        return {
          gradient: 'from-purple-400/20 to-pink-500/20',
          border: 'border-purple-400/30',
          button: 'bg-gradient-to-r from-purple-400 to-pink-500',
          highlight: 'text-purple-400',
          glow: 'shadow-purple-400/20'
        };
      default:
        return {
          gradient: 'from-blue-400/20 to-blue-600/20',
          border: 'border-blue-400/30',
          button: 'bg-gradient-to-r from-blue-400 to-blue-600',
          highlight: 'text-blue-400',
          glow: 'shadow-blue-400/20'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Загрузка подписок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-6 py-2 mb-6">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-semibold">Премиум доступ</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Выберите <span className="text-yellow-400">подписку</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Получите больше возможностей с подпиской ChiBox.
          <br className="hidden md:block" />
          Ежедневные кейсы, бонусы к дропу и эксклюзивные предметы.
        </p>
      </div>

      {/* Способ оплаты */}
      <div className="flex justify-center mb-12">
        <div className="bg-[#232832] border border-[#374151] rounded-xl p-2 inline-flex">
          <button
            onClick={() => setPaymentMethod('balance')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              paymentMethod === 'balance'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-300 hover:text-yellow-400 hover:bg-[#2a303a]'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>С баланса ({user?.balance?.toLocaleString() || '0'} ₽)</span>
          </button>
          <button
            onClick={() => setPaymentMethod('bank_card')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              paymentMethod === 'bank_card'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-300 hover:text-yellow-400 hover:bg-[#2a303a]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Банковской картой</span>
          </button>
        </div>
      </div>

      {/* Тарифы */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {tiers.map((tier: SubscriptionTier) => {
          const config = getTierConfig(tier.id);
          const isPopular = tier.id === 2; // Статус+ как популярный

          return (
            <div
              key={tier.id}
              className={`relative case-card overflow-hidden hover-scale transition-all duration-300 ${
                selectedTier === tier.id ? 'ring-2 ring-yellow-400' : ''
              } ${config.glow} hover:shadow-2xl`}
            >
              {/* Популярный тариф */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    🔥 Популярный
                  </div>
                </div>
              )}

              {/* Градиентный фон */}
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`}></div>

              <div className="relative p-8">
                {/* Иконка и название */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-[#1a1d23] border border-[#374151]">
                      {getTierIcon(tier.id)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {tier.name}
                  </h3>
                  <div className="text-5xl font-bold text-white mb-2">
                    {tier.price.toLocaleString()}
                    <span className="text-xl text-gray-400">₽</span>
                  </div>
                  <div className="inline-flex items-center space-x-1 bg-[#1a1d23] rounded-full px-3 py-1 border border-[#374151]">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300 text-sm">{tier.days} дней</span>
                  </div>
                </div>

                {/* Основные преимущества */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center p-3 bg-[#1a1d23]/50 rounded-lg border border-[#374151]">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">
                      {tier.max_daily_cases} кейс в день
                    </span>
                  </div>
                  <div className="flex items-center p-3 bg-[#1a1d23]/50 rounded-lg border border-[#374151]">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">
                      +{tier.bonus_percentage}% к дропу редких предметов
                    </span>
                  </div>
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center p-3 bg-[#1a1d23]/50 rounded-lg border border-[#374151]">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Кнопка покупки */}
                <button
                  onClick={() => handleBuySubscription(tier.id)}
                  disabled={isBuying || (paymentMethod === 'balance' && (user?.balance || 0) < tier.price)}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-black transition-all hover-scale ${
                    tier.id === 1 ? 'gradient-gold' : config.button
                  } disabled:opacity-50 disabled:cursor-not-allowed text-lg`}
                >
                  {isBuying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Обработка...</span>
                    </div>
                  ) : paymentMethod === 'balance' && (user?.balance || 0) < tier.price ? (
                    'Недостаточно средств'
                  ) : (
                    `Выбрать ${tier.name}`
                  )}
                </button>

                {paymentMethod === 'balance' && (user?.balance || 0) < tier.price && (
                  <p className="text-center text-sm text-red-400 mt-3">
                    Нужно {(tier.price - (user?.balance || 0)).toLocaleString()} ₽
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="case-card p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center space-x-2">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <span>Часто задаваемые вопросы</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-[#1a1d23] rounded-xl border border-[#374151]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              <span>Что входит в подписку?</span>
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Ежедневные бесплатные кейсы, увеличенный шанс выпадения редких предметов,
              эксклюзивные достижения и приоритетная поддержка.
            </p>
          </div>

          <div className="p-6 bg-[#1a1d23] rounded-xl border border-[#374151]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span>Можно ли отменить подписку?</span>
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Подписка автоматически не продлевается. После окончания срока действия
              вы можете приобрести новую подписку.
            </p>
          </div>

          <div className="p-6 bg-[#1a1d23] rounded-xl border border-[#374151]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span>Безопасны ли платежи?</span>
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Да, мы используем защищенную платежную систему YooMoney для обработки
              всех банковских карт.
            </p>
          </div>

          <div className="p-6 bg-[#1a1d23] rounded-xl border border-[#374151]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Что такое бонус к дропу?</span>
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Это увеличенный шанс получить редкие и дорогие предметы при открытии кейсов.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
