const now = new Date('2026-10-20T10:00:00').toISOString();

export const seedRequirements = [
  { id: 'REQ-001', title: 'Реєстрація користувача за e-mail', type: 'functional', priority: 'high', status: 'implemented',
    description: 'Система повинна дозволяти новому користувачу створити обліковий запис, вказавши імʼя, e-mail та пароль, з перевіркою унікальності e-mail.' },
  { id: 'REQ-002', title: 'Авторизація та завершення сесії', type: 'functional', priority: 'high', status: 'implemented',
    description: 'Користувач входить за e-mail і паролем; сесія автоматично завершується після 30 хвилин неактивності.' },
  { id: 'REQ-003', title: 'Пошук номерів за датами та кількістю гостей', type: 'functional', priority: 'high', status: 'approved',
    description: 'Користувач задає дати заїзду та виїзду і кількість гостей, система показує лише доступні номери.' },
  { id: 'REQ-004', title: 'Онлайн-оплата бронювання', type: 'functional', priority: 'high', status: 'approved',
    description: 'Після вибору номера користувач може оплатити бронювання банківською карткою через платіжний шлюз.' },
  { id: 'REQ-005', title: 'Скасування бронювання', type: 'functional', priority: 'medium', status: 'review',
    description: 'Користувач може скасувати бронювання не пізніше ніж за 24 години до заїзду з поверненням коштів.' },
  { id: 'REQ-006', title: 'Час відповіді сторінки пошуку', type: 'nonfunctional', priority: 'medium', status: 'approved',
    description: 'Сторінка результатів пошуку має завантажуватися не довше ніж за 2 секунди при 500 одночасних користувачах.' },
  { id: 'REQ-007', title: 'Адаптивність для мобільних пристроїв', type: 'nonfunctional', priority: 'medium', status: 'implemented',
    description: 'Інтерфейс коректно відображається на екранах шириною від 320 px без горизонтальної прокрутки.' },
  { id: 'REQ-008', title: 'Сповіщення про бронювання на e-mail', type: 'functional', priority: 'low', status: 'draft',
    description: 'Після успішної оплати користувач отримує лист з підтвердженням і деталями бронювання.' }
].map(r => ({ ...r, createdAt: now, updatedAt: now, author: 'Демо-аналітик' }));

const step = (action, expected) => ({ action, expected });

export const seedTestCases = [
  { id: 'TC-001', title: 'Успішна реєстрація з валідними даними', priority: 'high', status: 'passed', requirementIds: ['REQ-001'],
    precondition: 'Користувач не зареєстрований',
    steps: [step('Відкрити сторінку реєстрації', 'Відображається форма реєстрації'), step('Заповнити поля валідними даними', 'Помилки валідації відсутні'), step('Натиснути «Зареєструватися»', 'Створено обліковий запис, виконано вхід')] },
  { id: 'TC-002', title: 'Реєстрація з уже існуючим e-mail', priority: 'medium', status: 'passed', requirementIds: ['REQ-001'],
    precondition: 'E-mail вже використовується',
    steps: [step('Ввести зайнятий e-mail', 'Поле приймає значення'), step('Надіслати форму', 'Показано повідомлення про зайнятий e-mail')] },
  { id: 'TC-003', title: 'Вхід з неправильним паролем', priority: 'high', status: 'passed', requirementIds: ['REQ-002'],
    precondition: 'Обліковий запис існує',
    steps: [step('Ввести e-mail і хибний пароль', 'Вхід не виконано'), step('Повторити 5 разів', 'Форма блокується на 60 секунд')] },
  { id: 'TC-004', title: 'Пошук доступних номерів', priority: 'high', status: 'failed', requirementIds: ['REQ-003', 'REQ-006'],
    precondition: 'У базі є вільні номери',
    steps: [step('Вказати дати та 2 гостей', 'Поля заповнено'), step('Натиснути «Знайти»', 'Список номерів за 2 с, лише доступні')] },
  { id: 'TC-005', title: 'Оплата тестовою карткою', priority: 'high', status: 'blocked', requirementIds: ['REQ-004'],
    precondition: 'Платіжний шлюз у тестовому режимі',
    steps: [step('Обрати номер і натиснути «Оплатити»', 'Відкривається форма оплати'), step('Ввести дані тестової картки', 'Оплата підтверджена')] },
  { id: 'TC-006', title: 'Відображення на ширині 320 px', priority: 'medium', status: 'passed', requirementIds: ['REQ-007'],
    precondition: 'DevTools, режим мобільного пристрою',
    steps: [step('Встановити ширину 320 px', 'Відсутня горизонтальна прокрутка'), step('Відкрити меню', 'Меню відкривається поверх контенту')] },
  { id: 'TC-007', title: 'Скасування бронювання за 48 годин', priority: 'medium', status: 'not_run', requirementIds: ['REQ-005'],
    precondition: 'Є бронювання з заїздом через 48 годин',
    steps: [step('Відкрити «Мої бронювання»', 'Бронювання у списку'), step('Натиснути «Скасувати»', 'Статус «Скасовано», ініційовано повернення')] }
].map(tc => ({
  ...tc,
  createdAt: now,
  updatedAt: now,
  lastRunAt: tc.status === 'not_run' ? null : now,
  history: tc.status === 'not_run' ? [] : [{ date: now, status: tc.status, comment: '', by: 'Демо-тестувальник' }]
}));
