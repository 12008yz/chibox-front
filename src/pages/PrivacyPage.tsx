import { useTranslation } from 'react-i18next';

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
          Политика конфиденциальности
        </h1>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Собираемая информация</h2>
            <p className="mb-4">
              Мы собираем следующую информацию:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Email адрес и имя пользователя при регистрации</li>
              <li>Информация о Steam аккаунте при привязке</li>
              <li>История транзакций и игровая статистика</li>
              <li>IP адрес и данные об устройстве</li>
              <li>Файлы cookie для улучшения работы сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Использование информации</h2>
            <p className="mb-4">
              Мы используем вашу информацию для:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Предоставления и улучшения наших услуг</li>
              <li>Обработки платежей и транзакций</li>
              <li>Отправки важных уведомлений</li>
              <li>Предотвращения мошенничества</li>
              <li>Анализа использования сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. Защита данных</h2>
            <p className="mb-4">
              Мы применяем современные методы шифрования и безопасности для защиты ваших данных.
              Все платежные данные обрабатываются через защищенные платежные системы.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Передача данных третьим лицам</h2>
            <p className="mb-4">
              Мы не продаем ваши персональные данные третьим лицам. Мы можем передавать данные:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Платежным системам для обработки транзакций</li>
              <li>По требованию законодательства</li>
              <li>Нашим партнерам для улучшения сервиса (с вашего согласия)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Файлы cookie</h2>
            <p className="mb-4">
              Мы используем cookie для:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Аутентификации пользователей</li>
              <li>Сохранения настроек</li>
              <li>Анализа трафика</li>
              <li>Персонализации контента</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Ваши права</h2>
            <p className="mb-4">
              Вы имеете право:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Запросить копию ваших данных</li>
              <li>Исправить неточные данные</li>
              <li>Удалить свою учетную запись</li>
              <li>Отозвать согласие на обработку данных</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">7. Хранение данных</h2>
            <p className="mb-4">
              Мы храним ваши данные до тех пор, пока это необходимо для предоставления услуг
              или требуется законодательством.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">8. Изменения в политике</h2>
            <p className="mb-4">
              Мы можем обновлять эту политику. О существенных изменениях мы уведомим вас
              по email или через уведомления в сервисе.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">9. Контакты</h2>
            <p className="mb-4">
              По вопросам конфиденциальности:{' '}
              <a href="mailto:privacy@chibox.com" className="text-orange-400 hover:text-orange-300">
                privacy@chibox.com
              </a>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-12">
            Последнее обновление: Ноябрь 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
