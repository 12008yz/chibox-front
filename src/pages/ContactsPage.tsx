const ContactsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
          Контакты
        </h1>

        <div className="space-y-8">
          <section className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-white">Свяжитесь с нами</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Мы всегда рады помочь! По всем вопросам — поддержка, партнёрство, предложения —
              обращайтесь к нам в наших социальных сетях.
            </p>
            <div className="flex items-center gap-3 text-orange-400">
              <span className="text-3xl">⏰</span>
              <div>
                <div className="font-bold text-lg">Отвечаем 24/7</div>
                <div className="text-sm text-gray-400">Поддержка доступна круглосуточно</div>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Социальные сети</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="https://t.me/chibox_official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-orange-500/20 hover:border-orange-500/50 border border-transparent transition-all"
              >
                <div className="text-white">
                  <svg width="32" height="32" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-telegram">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold">Telegram</div>
                  <div className="text-sm text-gray-400">@chibox_official</div>
                </div>
              </a>

              <a
                href="https://vk.com/chibox_game"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-orange-500/20 hover:border-orange-500/50 border border-transparent transition-all"
              >
                <div className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32" viewBox="-2.5 0 32 32" version="1.1">
                    <path d="M16.563 15.75c-0.5-0.188-0.5-0.906-0.531-1.406-0.125-1.781 0.5-4.5-0.25-5.656-0.531-0.688-3.094-0.625-4.656-0.531-0.438 0.063-0.969 0.156-1.344 0.344s-0.75 0.5-0.75 0.781c0 0.406 0.938 0.344 1.281 0.875 0.375 0.563 0.375 1.781 0.375 2.781 0 1.156-0.188 2.688-0.656 2.75-0.719 0.031-1.125-0.688-1.5-1.219-0.75-1.031-1.5-2.313-2.063-3.563-0.281-0.656-0.438-1.375-0.844-1.656-0.625-0.438-1.75-0.469-2.844-0.438-1 0.031-2.438-0.094-2.719 0.5-0.219 0.656 0.25 1.281 0.5 1.813 1.281 2.781 2.656 5.219 4.344 7.531 1.563 2.156 3.031 3.875 5.906 4.781 0.813 0.25 4.375 0.969 5.094 0 0.25-0.375 0.188-1.219 0.313-1.844s0.281-1.25 0.875-1.281c0.5-0.031 0.781 0.406 1.094 0.719 0.344 0.344 0.625 0.625 0.875 0.938 0.594 0.594 1.219 1.406 1.969 1.719 1.031 0.438 2.625 0.313 4.125 0.25 1.219-0.031 2.094-0.281 2.188-1 0.063-0.563-0.563-1.375-0.938-1.844-0.938-1.156-1.375-1.5-2.438-2.563-0.469-0.469-1.063-0.969-1.063-1.531-0.031-0.344 0.25-0.656 0.5-1 1.094-1.625 2.188-2.781 3.188-4.469 0.281-0.5 0.938-1.656 0.688-2.219-0.281-0.625-1.844-0.438-2.813-0.438-1.25 0-2.875-0.094-3.188 0.156-0.594 0.406-0.844 1.063-1.125 1.688-0.625 1.438-1.469 2.906-2.344 4-0.313 0.375-0.906 1.156-1.25 1.031z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold">VK</div>
                  <div className="text-sm text-gray-400">https://vk.com/chibox_game</div>
                </div>
              </a>
            </div>
          </section>

          <section className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-white">Часто задаваемые вопросы</h2>
            <p className="text-gray-300 mb-4">
              Прежде чем связаться с нами, рекомендуем ознакомиться с разделом FAQ -
              возможно, там уже есть ответ на ваш вопрос.
            </p>
            <a
              href="/faq"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
            >
              Перейти к FAQ
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
