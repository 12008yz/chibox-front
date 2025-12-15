const RequisitesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
          Реквизиты
        </h1>

        <div className="space-y-8">
          <section className="bg-gray-800/50 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Информация о владельце</h2>
            <div className="space-y-4 text-gray-300">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">Наименование:</span>
                <span>Индивидуальный предприниматель Чикасов Денис Владимирович</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">ИНН:</span>
                <span>711204279301</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">ОГРНИП:</span>
                <span>325710000080682</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">Дата присвоения ОГРНИП:</span>
                <span>15.12.2025</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">Местонахождение:</span>
                <span>г. Богородицк, Тульская область, Российская Федерация</span>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Контактная информация</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">Email поддержки:</span>
                <a href="mailto:support@chibox-game.ru" className="text-orange-400 hover:underline">
                  support@chibox-game.ru
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">Email для общих вопросов:</span>
                <a href="mailto:help@chibox-game.ru" className="text-orange-400 hover:underline">
                  help@chibox-game.ru
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">Юридические вопросы:</span>
                <a href="mailto:legal@chibox-game.ru" className="text-orange-400 hover:underline">
                  legal@chibox-game.ru
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-orange-300 min-w-[200px]">Конфиденциальность:</span>
                <a href="mailto:privacy@chibox-game.ru" className="text-orange-400 hover:underline">
                  privacy@chibox-game.ru
                </a>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Описание деятельности</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                ChiBox — платформа для приобретения виртуальных предметов Counter-Strike 2
                через механику открытия виртуальных кейсов.
              </p>
              <p>
                Сервис предоставляет пользователям возможность:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Приобретать внутриигровую валюту ChiCoins</li>
                <li>Открывать виртуальные кейсы с предметами CS2</li>
                <li>Выводить полученные предметы в свой Steam инвентарь</li>
                <li>Участвовать в дополнительных игровых активностях</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                Все транзакции обрабатываются через защищенные платежные системы.
                Подробную информацию об условиях оказания услуг можно найти в{' '}
                <a href="/terms" className="text-orange-400 hover:underline">
                  Пользовательском соглашении
                </a>.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-white mb-2">Важная информация</p>
                <p>
                  Данная страница создана для соблюдения требований платежных систем и обеспечения
                  прозрачности нашей деятельности. Если у вас есть вопросы, свяжитесь с нами по
                  указанным выше контактам.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RequisitesPage;
