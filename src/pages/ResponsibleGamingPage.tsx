const ResponsibleGamingPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
          Ответственная игра
        </h1>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Наша приверженность</h2>
            <p className="mb-4">
              ChiBox стремится обеспечить безопасную и ответственную игровую среду для всех
              наших пользователей. Мы понимаем важность ответственной игры и предоставляем
              инструменты для контроля вашего игрового процесса.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Признаки чрезмерного увлечения</h2>
            <p className="mb-4">
              Обратите внимание на следующие признаки:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Вы тратите больше времени и денег, чем планировали</li>
              <li>Использование сервиса мешает вашей работе, учебе или личной жизни</li>
              <li>Вы используете платформу, чтобы убежать от проблем</li>
              <li>Вы скрываете свою активность от близких</li>
              <li>Вы чувствуете беспокойство, когда не используете сервис</li>
              <li>Вы пытаетесь компенсировать потери</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Инструменты самоконтроля</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400">Лимиты депозита</h3>
                <p>Установите дневные, недельные или месячные лимиты на пополнение баланса.</p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400">Тайм-аут</h3>
                <p>Временно приостановите свою учетную запись на период от 24 часов до 6 месяцев.</p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400">Самоисключение</h3>
                <p>Полностью закройте доступ к своей учетной записи на срок от 6 месяцев.</p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400">Напоминания о времени</h3>
                <p>Получайте уведомления о том, сколько времени вы провели в игре.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Советы по ответственному использованию</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Установите бюджет и придерживайтесь его</li>
              <li>Используйте только средства, которые можете позволить себе потратить</li>
              <li>Не пытайтесь компенсировать затраты</li>
              <li>Делайте регулярные перерывы</li>
              <li>Не используйте сервис под влиянием алкоголя или когда расстроены</li>
              <li>Балансируйте развлечения с другими видами деятельности</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Защита несовершеннолетних</h2>
            <p className="mb-4">
              Строго запрещено использование ChiBox лицами младше 18 лет. Родителям
              рекомендуется использовать программы родительского контроля для ограничения
              доступа детей к игровым сайтам.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Получите помощь</h2>
            <p className="mb-4">
              Если вы или кто-то из ваших знакомых испытывает проблемы с чрезмерным увлечением,
              обратитесь за помощью:
            </p>
            <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-lg">
              <p className="mb-2 text-white font-bold">Горячая линия психологической помощи</p>
              <p className="mb-4">8-800-XXX-XX-XX (звонок бесплатный, круглосуточно)</p>

              <p className="mb-2 text-white font-bold">Email</p>
              <p className="mb-4">
                <a href="mailto:help@chibox-game.ru" className="text-orange-400 hover:text-orange-300">
                  help@chibox-game.ru
                </a>
              </p>

              <p className="mb-2 text-white font-bold">Полезные ресурсы</p>
              <ul className="space-y-1">
                <li>• Психологическая помощь онлайн</li>
                <li>• Служба анонимной поддержки</li>
                <li>• Консультации специалистов</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Связаться с нами</h2>
            <p className="mb-4">
              Если у вас есть вопросы или вам нужна помощь в настройке инструментов
              самоконтроля, свяжитесь с нашей службой поддержки:{' '}
              <a href="mailto:support@chibox-game.ru" className="text-orange-400 hover:text-orange-300">
                support@chibox-game.ru
              </a>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-12">
            Помните: платформа предназначена для развлечения, а не для заработка.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResponsibleGamingPage;
