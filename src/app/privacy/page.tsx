import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Политика конфиденциальности
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Общие положения</h2>
              <div className="space-y-4 text-gray-700">
                <p>1.1. Настоящая политика обработки персональных данных (далее — Политика) составлена в соответствии с требованиями Федерального закона от 27.07.2006 №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению их безопасности оператором (далее — Оператор).</p>
                <p>1.2. Оператор считает соблюдение прав и свобод человека и гражданина при обработке персональных данных, включая право на неприкосновенность частной жизни, личную и семейную тайну, одной из приоритетных задач.</p>
                <p>1.3. Политика применяется ко всей информации, которую Оператор может получить о посетителях сайта <a href="https://home-rtk.ru" className="text-orange-500 hover:underline">https://home-rtk.ru</a> (далее — Сайт), а также о клиентах в процессе взаимодействия с Оператором, включая устные и письменные коммуникации.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Термины</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Персональные данные</strong> — информация, относящаяся к прямо или косвенно определяемому физическому лицу.</p>
                <p><strong>Обработка персональных данных</strong> — любые действия с персональными данными: сбор, хранение, использование, передача, удаление и др.</p>
                <p><strong>Клиент / Пользователь</strong> — лицо, использующее Сайт и/или взаимодействующее с Оператором с целью получения информации об услугах.</p>
                <p><strong>Cookies</strong> — небольшие фрагменты данных, сохраняемые браузером Пользователя.</p>
                <p><strong>IP-адрес</strong> — уникальный сетевой адрес устройства Пользователя.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Принципы обработки персональных данных</h2>
              <p className="text-gray-700 mb-3">Оператор обрабатывает персональные данные на основании следующих принципов:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>законности и справедливости;</li>
                <li>обработки только тех данных, которые необходимы для достижения целей;</li>
                <li>соответствия целей обработки целям, заявленным при сборе данных;</li>
                <li>точности и актуальности данных;</li>
                <li>хранения данных не дольше, чем это необходимо;</li>
                <li>принятия необходимых мер по защите данных.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Цели обработки персональных данных</h2>
              <div className="space-y-4 text-gray-700">
                <p>4.1. Оператор обрабатывает персональные данные в следующих целях:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>предоставление информации об услугах связи (интернет, телевидение, телефония и др.);</li>
                  <li>обратная связь, включая обработку обращений, заявок, уведомлений;</li>
                  <li>проверка технической возможности подключения услуг;</li>
                  <li>передача данных операторам связи при наличии согласия;</li>
                  <li>аналитика использования сайта и улучшение качества обслуживания.</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Объем обрабатываемых данных</h2>
              <p className="text-gray-700 mb-3">Персональные данные, которые могут быть обработаны:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>контактный телефон;</li>
                <li>адрес подключения;</li>
                <li>адрес электронной почты;</li>
                <li>технические данные (IP-адрес, cookies, тип устройства и браузера, поведенческие данные).</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Условия обработки и передачи данных</h2>
              <div className="space-y-4 text-gray-700">
                <p>6.1. Данные Пользователя могут быть переданы операторам связи для исполнения запроса по подключению услуг.</p>
                <p>6.2. При отсутствии технической возможности у одного оператора, Оператор может проверить доступность услуг у других операторов и передать данные при наличии согласия Пользователя.</p>
                <p>6.3. Данные обрабатываются как с использованием автоматизированных средств, так и без них.</p>
                <p>6.4. Оператор обеспечивает защиту персональных данных от утраты, несанкционированного доступа и иных неправомерных действий посредством технических и организационных мер безопасности.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Права субъекта персональных данных</h2>
              <p className="text-gray-700 mb-3">Пользователь имеет право:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>получать информацию об обработке своих данных;</li>
                <li>требовать уточнения, блокирования или уничтожения данных;</li>
                <li>отозвать согласие на обработку персональных данных;</li>
                <li>обжаловать действия Оператора в Роскомнадзоре или суде.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Обязанности Оператора</h2>
              <p className="text-gray-700 mb-3">Оператор обязан:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>использовать персональные данные только в заявленных целях;</li>
                <li>не передавать данные без законных оснований;</li>
                <li>обеспечить конфиденциальность и безопасность информации;</li>
                <li>при поступлении запроса — заблокировать или удалить данные в установленный срок.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Уничтожение персональных данных</h2>
              <p className="text-gray-700 mb-3">Уничтожение персональных данных осуществляется:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>при достижении целей обработки;</li>
                <li>по требованию субъекта данных;</li>
                <li>по решению уполномоченного органа.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Хранение персональных данных</h2>
              <p className="text-gray-700">
                Данные хранятся на территории Российской Федерации не дольше, чем необходимо для целей их обработки.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Контакты и порядок обращений</h2>
              <div className="space-y-4 text-gray-700">
                <p>11.1. Запросы по вопросам обработки персональных данных можно направить:</p>
                <p className="ml-4">
                  на электронную почту: <a href="mailto:partner@home-rtk.ru" className="text-orange-500 hover:underline font-medium">partner@home-rtk.ru</a>
                </p>
                <p>11.2. Запрос должен содержать:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>сведения, удостоверяющие личность субъекта;</li>
                  <li>описание сути обращения;</li>
                  <li>контактную информацию.</li>
                </ul>
                <p>11.3. Оператор рассматривает обращения в течение 5 рабочих дней.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Прочие положения</h2>
              <div className="space-y-4 text-gray-700">
                <p>12.1. Использование Сайта означает согласие Пользователя с данной Политикой.</p>
                <p>12.2. В случае несогласия с условиями Политики, Пользователь обязан прекратить использование Сайта.</p>
                <p>12.3. Оператор вправе вносить изменения в настоящую Политику. Актуальная версия публикуется на Сайте и вступает в силу с момента размещения.</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <Link 
              href="/order" 
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Вернуться к оформлению заявки
            </Link>
          </div>
        </div>
      </main>

      <Footer cityName="в России" />
    </div>
  );
} 