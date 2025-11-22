const AboutPage = () => {
   return (
     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
       <div className="container mx-auto px-4 py-16 max-w-4xl">
         <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
           О нас
         </h1>
 
         <div className="space-y-8 text-gray-300">
           <section>
             <h2 className="text-2xl font-bold mb-4 text-white">ChiBox - Лучшая платформа для открытия кейсов</h2>
             <p className="mb-4 leading-relaxed">
               ChiBox - это современная платформа для открытия кейсов, созданная с любовью
               к играм и игровому сообществу. Мы стремимся предоставить лучший опыт открытия
               кейсов с прозрачными шансами и честной игрой.
             </p>
           </section>
 
           <section>
             <h2 className="text-2xl font-bold mb-4 text-white">Наша миссия</h2>
             <p className="mb-4 leading-relaxed">
               Создать самую безопасную, честную и увлекательную платформу для открытия кейсов,
               где каждый игрок может испытать удачу и получить уникальные предметы.
             </p>
           </section>
 
           <section>
             <h2 className="text-2xl font-bold mb-4 text-white">Почему выбирают ChiBox?</h2>
             <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-gray-800/50 p-6 rounded-lg">
                 <h3 className="text-xl font-bold mb-2 text-orange-400">🔒 Безопасность</h3>
                 <p>Все транзакции защищены современными методами шифрования</p>
               </div>
 
               <div className="bg-gray-800/50 p-6 rounded-lg">
                 <h3 className="text-xl font-bold mb-2 text-orange-400">⚡ Быстрота</h3>
                 <p>Мгновенное зачисление выигрышей и быстрый вывод предметов</p>
               </div>
 
               <div className="bg-gray-800/50 p-6 rounded-lg">
                 <h3 className="text-xl font-bold mb-2 text-orange-400">🎁 Бонусы</h3>
                 <p>Ежедневные бесплатные кейсы и щедрая система наград</p>
               </div>
 
               <div className="bg-gray-800/50 p-6 rounded-lg">
                 <h3 className="text-xl font-bold mb-2 text-orange-400">🎮 Разнообразие</h3>
                 <p>Широкий выбор кейсов и дополнительные мини-игры</p>
               </div>
             </div>
           </section>
 
           <section>
             <h2 className="text-2xl font-bold mb-4 text-white">Наши достижения</h2>
             <div className="grid md:grid-cols-3 gap-6">
               <div className="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg">
                 <div className="text-4xl font-bold text-orange-400 mb-2">1,234,567</div>
                 <div className="text-sm text-gray-400">Открыто кейсов</div>
               </div>
 
               <div className="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg">
                 <div className="text-4xl font-bold text-orange-400 mb-2">89,234</div>
                 <div className="text-sm text-gray-400">Пользователей</div>
               </div>
 
               <div className="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg">
                 <div className="text-4xl font-bold text-orange-400 mb-2">99.9%</div>
                 <div className="text-sm text-gray-400">Удовлетворенность</div>
               </div>
             </div>
           </section>
 
           <section>
             <h2 className="text-2xl font-bold mb-4 text-white">Наша команда</h2>
             <p className="mb-4 leading-relaxed">
               Мы - команда энтузиастов, которые любят игры так же, как и вы.
               Наша цель - создать лучший игровой опыт и постоянно совершенствовать наш сервис
               на основе отзывов сообщества.
             </p>
           </section>
         </div>
       </div>
     </div>
   );
 };
 
 export default AboutPage;
 