export type QuizQuestion = {
  question: string
  options: Array<string | { text: string; image?: string; reviewText?: string }>
  image?: string
  correct: number // индекс правильного варианта (0..3)
}

export const quizData: QuizQuestion[] = [
  {
    question: 'Какой район Санкт-Петербурга называют «южными воротами» города?',
    options: [
      { text: 'Петроградский', image: '/images/q1-a.jpg' },
      { text: 'Калининский', image: '/images/q1-b.jpg' },
      { text: 'Московский', image: '/images/q1-c.jpg' },
      { text: 'Приморский', image: '/images/q1-d.jpg' },
    ],
    correct: 2,
  },
  {
    question: 'Когда был образован Московский район Санкт-Петербурга?',
    options: [
      { text: 'А', image: '/images/q2-a.png', reviewText: '27 июня 1703 года' },
      { text: 'Б', image: '/images/q2-b.png', reviewText: '21 июня 1919 года' },
      { text: 'В', image: '/images/q2-c.png', reviewText: '1 сентября 1965 года' },
      { text: 'Г', image: '/images/q2-d.png', reviewText: '16 января 1812 года' },
    ],
    correct: 1,
  },
  {
    question:
      'Какой из проспектов Санкт-Петербурга является одной из главных магистралей Московского района?',
    options: [
      { text: 'А', image: '/images/q3-a.png', reviewText: 'Невский проспект' },
      { text: 'Б', image: '/images/q3-b.png', reviewText: 'Большой проспект П.С.' },
      { text: 'В', image: '/images/q3-c.png', reviewText: 'Московский проспект' },
      { text: 'Г', image: '/images/q3-d.png', reviewText: 'Суворовский проспект' },
    ],
    correct: 2,
  },
  {
    question: 'Почему Парк Авиаторов получил такое название?',
    image: '/images/q4-park.jpg',
    options: [
      'Там находится памятник летчикам-героям ВОВ',
      'Он расположен на территории бывшего аэродрома',
      'До 1956 года на месте парка находилась летная школа ДОСААФ',
      'Ежегодно в парке проводится церемония вручения дипломов выпускникам летного отделения СПбГУГА',
    ],
    correct: 1,
  },
  {
    question: 'Сколько станций метрополитена находится на территории Московского района?',
    image: '/images/q5-banner.png',
    options: ['4', '5', '6', '7'],
    correct: 2,
  },
  {
    question: 'Какой мемориальный комплекс находится на площади Победы?',
    options: [
      { text: 'А', image: '/images/q6-a.png', reviewText: 'Московские триумфальные ворота' },
      { text: 'Б', image: '/images/q6-b.png', reviewText: 'Памятник В.И. Ленину' },
      { text: 'В', image: '/images/q6-c.png', reviewText: 'Монумент героическим защитникам Ленинграда' },
      { text: 'Г', image: '/images/q6-d.png', reviewText: 'Памятник истребителю МИГ-19' },
    ],
    correct: 2,
  },
  {
    question: 'Когда был торжественно открыт Монумент героическим защитникам Ленинграда?',
    image: '/images/q7-banner.png',
    options: ['27 января 1944 года', '9 мая 1965 года', '9 мая 1975 года', '22 июня 1981 года'],
    correct: 2,
  },
  {
    question: 'Какой известный музыкант родился на территории Московского района?',
    image: '/images/q8-banner.png',
    options: ['Эдмунд Шклярский', 'Гарик Сукачев', 'Виктор Цой', 'Константин Кинчев'],
    correct: 2,
  },
  {
    question: 'Кому установлен памятник в центре Аллеи Героев в Парке Победы?',
    image: '/images/q9-banner.png',
    options: ['Маршалу Г.К. Жукову', 'Маршалу К.К. Рокоссовскому', 'Маршалу И.С. Коневу', 'Маршалу С.М. Буденному'],
    correct: 0,
  },
  {
    question: 'Какой известный храм Московского района имеет необычный «готический» облик?',
    options: [
      { text: 'А', image: '/images/q10-a.png', reviewText: 'Храм Рождества Христова' },
      { text: 'Б', image: '/images/q10-b.png', reviewText: 'Церковь святителя Николая Чудотворца' },
      { text: 'В', image: '/images/q10-c.png', reviewText: 'Храм Святого Иоанна Предтечи, Чесменская церковь' },
      { text: 'Г', image: '/images/q10-d.png', reviewText: 'Храм Казанской иконы Божьей Матери' },
    ],
    correct: 2,
  },
  {
    question: 'С каким историческим событием связана Чесменская церковь?',
    image: '/images/q11-banner.png',
    options: [
      'С победой в Полтавской битве в 1709 году',
      'С победой в Бородинском сражении в 1812 году',
      'С победой русского флота над турецким в бухте Эгейского моря в 1770 году',
      'С первой победой русского флота в Гангутском сражении',
    ],
    correct: 2,
  },
  {
    question: 'Какой объект установлен на площади Московские Ворота?',
    options: [
      { text: 'А', image: '/images/q12-a.png', reviewText: 'Александровская колонна' },
      { text: 'Б', image: '/images/q12-b.png', reviewText: 'Нарвские ворота' },
      { text: 'В', image: '/images/q12-c.png', reviewText: 'Московские триумфальные ворота' },
      { text: 'Г', image: '/images/q12-d.png', reviewText: 'Ростральные колонны' },
    ],
    correct: 2,
  },
  {
    question: 'Кто является архитектором Московских триумфальных ворот?',
    image: '/images/q13-banner.png',
    options: ['Карл Росси', 'Огюст Монферран', 'Василий Стасов', 'Жан-Батист Леблон'],
    correct: 2,
  },
  {
    question: 'Под сводами какого комплекса в 1984 году ленинградская команда «Зенит» стала чемпионом страны по футболу?',
    image: '/images/q14-banner.png',
    options: ['Дворец спорта «Волна»', 'Стадион «Московская застава»', 'Стадион «Московский»', 'Спортивно-концертный комплекс, СКК'],
    correct: 3,
  },
  {
    question: 'Что располагалось на территории Парка Авиаторов в 70–80-е годы XX века?',
    image: '/images/q15-banner.png',
    options: ['Техно-парк', 'Луна-парк', 'Аква-парк', 'Авто-парк'],
    correct: 1,
  },
  {
    question: 'На какой улице Московского района жил герой стихотворения С.Я. Маршака «Человек рассеянный»?',
    image: '/images/q16-banner.png',
    options: ['Кузнецовская', 'Цветочная', 'Бассейная', 'Костюшко'],
    correct: 2,
  },
]

