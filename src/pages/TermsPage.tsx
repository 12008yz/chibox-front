const TermsPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
          Условия использования
        </h1>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Общие положения</h2>
            <p className="mb-4">
              Настоящие Условия использования регулируют ваше использование сервиса ChiBox.
              Используя наш сервис, вы соглашаетесь с этими условиями.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Возрастные ограничения</h2>
            <p className="mb-4">
              Вам должно быть не менее 18 лет для использования ChiBox. Мы оставляем за собой
              право запросить подтверждение возраста в любое время.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. Учетная запись пользователя</h2>
            <p className="mb-4">
              Вы несете ответственность за сохранность своей учетной записи и пароля.
              ChiBox не несет ответственности за любые убытки, возникшие в результате
              несанкционированного использования вашей учетной записи.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Виртуальные предметы</h2>
            <p className="mb-4">
              Все виртуальные предметы и валюта в ChiBox являются виртуальными товарами.
              Они не имеют реальной денежной стоимости и не могут быть обменены на реальные деньги.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Платежи и возвраты</h2>
            <p className="mb-4">
              Все платежи являются окончательными. Мы не предоставляем возврат средств,
              за исключением случаев, предусмотренных законодательством.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Запрещенное поведение</h2>
            <div className="mb-4">
              Запрещается:
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Использование ботов или автоматизированных скриптов</li>
                <li>Попытки обмана или эксплуатации системы</li>
                <li>Создание нескольких аккаунтов для получения бонусов</li>
                <li>Использование сервиса для незаконной деятельности</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">7. Ответственная игра</h2>
            <p className="mb-4">
              ChiBox поддерживает ответственную игру. Если вы считаете, что у вас проблемы
              с игровой зависимостью, пожалуйста, обратитесь за помощью.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">8. Изменение условий</h2>
            <p className="mb-4">
              Мы оставляем за собой право изменять эти условия в любое время.
              Продолжение использования сервиса после изменений означает ваше согласие с новыми условиями.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">9. Контактная информация</h2>
            <p className="mb-4">
              Если у вас есть вопросы по этим условиям, свяжитесь с нами по адресу:{' '}
              <a href="mailto:support@chibox.com" className="text-orange-400 hover:text-orange-300">
                support@chibox.com
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

export default TermsPage;
