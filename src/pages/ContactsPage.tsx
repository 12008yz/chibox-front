const ContactsPage = () => {
   return (
     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
       <div className="container mx-auto px-4 py-16 max-w-4xl">
         <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
           Контакты
         </h1>
 
         <div className="space-y-8">
           <section className="bg-gray-800/50 p-8 rounded-xl">
             <h2 className="text-2xl font-bold mb-6 text-white">Свяжитесь с нами</h2>
 
             <div className="space-y-6">
               <div className="flex items-start gap-4">
                 <div className="text-3xl">📧</div>
                 <div>
                   <h3 className="text-xl font-bold text-orange-400 mb-2">Email поддержки</h3>
                   <a
                     href="mailto:support@chibox.com"
                     className="text-gray-300 hover:text-orange-400 transition-colors"
                   >
                     support@chibox.com
                   </a>
                   <p className="text-sm text-gray-500 mt-1">
                     Ответим в течение 24 часов
                   </p>
                 </div>
               </div>
 
               <div className="flex items-start gap-4">
                 <div className="text-3xl">💼</div>
                 <div>
                   <h3 className="text-xl font-bold text-orange-400 mb-2">Бизнес и партнерство</h3>
                   <a
                     href="mailto:business@chibox.com"
                     className="text-gray-300 hover:text-orange-400 transition-colors"
                   >
                     business@chibox.com
                   </a>
                 </div>
               </div>
 
               <div className="flex items-start gap-4">
                 <div className="text-3xl">🔒</div>
                 <div>
                   <h3 className="text-xl font-bold text-orange-400 mb-2">Вопросы конфиденциальности</h3>
                   <a
                     href="mailto:privacy@chibox.com"
                     className="text-gray-300 hover:text-orange-400 transition-colors"
                   >
                     privacy@chibox.com
                   </a>
                 </div>
               </div>
 
               <div className="flex items-start gap-4">
                 <div className="text-3xl">🕐</div>
                 <div>
                   <h3 className="text-xl font-bold text-orange-400 mb-2">Часы работы</h3>
                   <p className="text-gray-300">24/7</p>
                   <p className="text-sm text-gray-500 mt-1">
                     Служба поддержки доступна круглосуточно
                   </p>
                 </div>
               </div>
             </div>
           </section>
 
           <section className="bg-gray-800/50 p-8 rounded-xl">
             <h2 className="text-2xl font-bold mb-6 text-white">Социальные сети</h2>
 
             <div className="grid md:grid-cols-2 gap-4">
               <a
                 href="#"
                 className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
               >
                 <span className="text-2xl">📱</span>
                 <div>
                   <div className="font-bold">Telegram</div>
                   <div className="text-sm text-gray-400">@chibox_official</div>
                 </div>
               </a>
 
               <a
                 href="#"
                 className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
               >
                 <span className="text-2xl">🐦</span>
                 <div>
                   <div className="font-bold">Twitter</div>
                   <div className="text-sm text-gray-400">@chibox</div>
                 </div>
               </a>
 
               <a
                 href="#"
                 className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
               >
                 <span className="text-2xl">📺</span>
                 <div>
                   <div className="font-bold">YouTube</div>
                   <div className="text-sm text-gray-400">ChiBox Official</div>
                 </div>
               </a>
 
               <a
                 href="#"
                 className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
               >
                 <span className="text-2xl">💬</span>
                 <div>
                   <div className="font-bold">Discord</div>
                   <div className="text-sm text-gray-400">discord.gg/chibox</div>
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
 