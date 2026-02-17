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
            <h2 className="text-2xl font-bold mb-4 text-white">Что мы можем предложить</h2>
            <p className="mb-4 text-gray-300">
              ChiBox — небольшая платформа; у нас нет встроенных лимитов депозита или автоматических напоминаний,
              как у крупных операторов. Мы рекомендуем самостоятельно контролировать бюджет и время.
            </p>
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400">Ограничение доступа по вашему запросу</h3>
                <p>
                  Если вам нужно временно или надолго прекратить пользоваться сервисом, напишите в поддержку
                  (support@chibox-game.ru или help@chibox-game.ru). По вашему запросу мы можем заблокировать
                  доступ к аккаунту на указанный срок (тайм-аут или самоисключение).
                </p>
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
              <p className="mb-2 text-white font-bold">Связь с нами</p>
              <p className="mb-4">
                По вопросам ограничения доступа к аккаунту или игрового поведения напишите на{' '}
                <a href="mailto:help@chibox-game.ru" className="text-orange-400 hover:text-orange-300">
                  help@chibox-game.ru
                </a>
                . Мы поможем настроить тайм-аут или самоисключение.
              </p>

              <p className="mb-2 text-white font-bold">Психологическая помощь (Россия)</p>
              <p className="mb-4 text-sm text-gray-300">
                Телефоны доверия и центры помощи различаются по регионам. Узнайте актуальные номера на сайтах
                органов здравоохранения или учреждений соцзащиты вашего региона или обратитесь к психологу.
              </p>

              <p className="mb-2 text-white font-bold">Полезные ресурсы</p>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Обращение к психологу или специалисту по зависимостям в вашем городе</li>
                <li>• Информация о центрах помощи — на сайтах региональных органов здравоохранения</li>
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
