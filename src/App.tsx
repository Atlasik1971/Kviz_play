import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas'
import { quizData } from './quizData'
import type { QuizQuestion } from './quizData'
import { publicUrl } from './publicUrl'
import { submitQuizResultToGoogleSheets } from './submitQuizResult'
import './styles.css'

type View = 'splash' | 'start' | 'quiz' | 'result'

type CategoryKey = 'guest' | 'good' | 'local' | 'expert'

type Category = {
  key: CategoryKey
  label: string
}

type Stats = {
  total: number
  categories: Record<CategoryKey, number>
}

const STORAGE_KEY = 'kviz_moskovsky_stats_v1'
const TOTAL_QUESTIONS = quizData.length
const QUIZ_SHARE_URL = 'https://atlasik1971.github.io/Kviz_play/'

type SoundState = 'idle' | 'playing' | 'blocked' | 'error' | 'done'

type UserAnswer = {
  questionIndex: number
  selectedIndex: number
  isCorrect: boolean
}

const categoriesInUi: Category[] = [
  { key: 'guest', label: 'Гость Московского района' },
  { key: 'good', label: 'Хороший знаток района' },
  { key: 'local', label: 'Краевед Московского района' },
  { key: 'expert', label: 'Эксперт Московского района' },
]

const nominationShortLabels: Record<CategoryKey, string> = {
  guest: 'Гость',
  good: 'Знаток',
  local: 'Краевед',
  expert: 'Эксперт',
}

function categoryFromScore(score: number): Category {
  if (score === 16) return categoriesInUi[3]
  if (score >= 12) return categoriesInUi[2]
  if (score >= 7) return categoriesInUi[1]
  return categoriesInUi[0]
}

const defaultStats: Stats = {
  total: 0,
  categories: {
    guest: 0,
    good: 0,
    local: 0,
    expert: 0,
  },
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStats
    const parsed = JSON.parse(raw) as Partial<Stats>
    const next: Stats = {
      total: typeof parsed.total === 'number' ? parsed.total : 0,
      categories: {
        guest: parsed.categories?.guest ?? 0,
        good: parsed.categories?.good ?? 0,
        local: parsed.categories?.local ?? 0,
        expert: parsed.categories?.expert ?? 0,
      },
    }
    return next
  } catch {
    return defaultStats
  }
}

function getResultAudioSrc(category: Category): string {
  return publicUrl(category.key === 'expert' ? '/audio/expert.mp3' : '/audio/common.mp3')
}

function getOptionReviewLabel(option: string | { text: string; image?: string; reviewText?: string }): string {
  if (typeof option === 'string') return option
  return option.reviewText || option.text
}

function buildShareTextBody(score: number, totalQuestions: number, status: string): string {
  return [
    'Я прошёл «Квиз о Московском районе»!',
    '',
    `Мой результат: ${score} из ${totalQuestions}`,
    `Статус: ${status}`,
    '',
    'Проверьте, насколько хорошо вы знаете Московский район:',
  ].join('\n')
}

function buildShareTextFull(score: number, totalQuestions: number, status: string): string {
  return `${buildShareTextBody(score, totalQuestions, status)}\n${QUIZ_SHARE_URL}`
}

export default function App() {
  const [view, setView] = useState<View>('splash')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])

  const [stats, setStats] = useState<Stats>(() => defaultStats)
  const [screenshotState, setScreenshotState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [shareNotice, setShareNotice] = useState<string | null>(null)
  const [soundState, setSoundState] = useState<SoundState>('idle')

  const resultCardRef = useRef<HTMLDivElement | null>(null)
  const celebrateOnceRef = useRef(false)
  const sheetsCompletionIdRef = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentQuestion: QuizQuestion | undefined = view === 'quiz' ? quizData[currentIndex] : undefined
  const progressPercent = useMemo(() => {
    if (view !== 'quiz') return 0
    return Math.round((currentIndex / TOTAL_QUESTIONS) * 100)
  }, [currentIndex, view])

  const resultCategory = useMemo(() => categoryFromScore(score), [score])

  useEffect(() => {
    setStats(loadStats())
  }, [])

  function stopResultAudio() {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audioRef.current = null
  }

  async function playResultAudio(category: Category): Promise<boolean> {
    try {
      stopResultAudio()

      const audio = new Audio(getResultAudioSrc(category))
      audio.volume = 0.9
      audio.loop = false
      audioRef.current = audio

      audio.addEventListener(
        'ended',
        () => {
          setSoundState('done')
        },
        { once: true },
      )

      audio.addEventListener(
        'error',
        () => {
          setSoundState('error')
        },
        { once: true },
      )

      await audio.play()
      setSoundState('playing')
      return true
    } catch {
      setSoundState('blocked')
      return false
    }
  }

  useEffect(() => {
    if (view !== 'result') return

    let disposed = false
    const category = categoryFromScore(score)

    void (async () => {
      const played = await playResultAudio(category)
      if (disposed && played) stopResultAudio()
    })()

    return () => {
      disposed = true
      stopResultAudio()
    }
  }, [view, score])

  useEffect(() => {
    if (view !== 'result') return
    if (score !== 16) return
    if (celebrateOnceRef.current) return

    celebrateOnceRef.current = true

    confetti({
      particleCount: 220,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#ef4444', '#f59e0b', '#22c55e', '#a855f7'],
    })

    window.setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563eb', '#ef4444', '#f59e0b'],
      })
    }, 350)
  }, [score, view])

  function persistStats(next: Stats) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Игнорируем ошибки (например, private mode)
    }
  }

  function startQuiz() {
    stopResultAudio()
    setSoundState('idle')
    setView('quiz')
    setCurrentIndex(0)
    setScore(0)
    setUserAnswers([])
    celebrateOnceRef.current = false
    sheetsCompletionIdRef.current = null
    setScreenshotState('idle')
    setShareNotice(null)
  }

  async function handlePlayResultSound() {
    await playResultAudio(resultCategory)
  }

  function finishQuiz(finalScore: number, finalAnswers: UserAnswer[]) {
    setUserAnswers(finalAnswers)
    setScore(finalScore)

    const cat = categoryFromScore(finalScore)
    setStats(prev => {
      const next: Stats = {
        total: prev.total + 1,
        categories: {
          ...prev.categories,
          [cat.key]: prev.categories[cat.key] + 1,
        },
      }
      persistStats(next)
      return next
    })

    setView('result')

    // Отправка результата в Google Таблицу — один раз за прохождение квиза.
    if (!sheetsCompletionIdRef.current) {
      const completionId = crypto.randomUUID()
      sheetsCompletionIdRef.current = completionId
      void submitQuizResultToGoogleSheets(finalScore, TOTAL_QUESTIONS, cat.label, completionId)
    }
  }

  function handleAnswer(optionIndex: number) {
    if (view !== 'quiz') return
    if (!currentQuestion) return

    const isCorrect = optionIndex === currentQuestion.correct
    const answer: UserAnswer = {
      questionIndex: currentIndex,
      selectedIndex: optionIndex,
      isCorrect,
    }
    const nextAnswers = [...userAnswers, answer]
    const nextScore = score + (isCorrect ? 1 : 0)

    if (currentIndex >= TOTAL_QUESTIONS - 1) {
      finishQuiz(nextScore, nextAnswers)
      return
    }

    setUserAnswers(nextAnswers)
    setScore(nextScore)
    setCurrentIndex(i => i + 1)
  }

  async function handleScreenshot() {
    if (!resultCardRef.current) return
    setScreenshotState('loading')
    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Не удалось сформировать изображение')

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `result_${score}_из_16.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setScreenshotState('done')
    } catch {
      setScreenshotState('error')
    }
  }

  async function handleShareResult() {
    const shareText = buildShareTextFull(score, TOTAL_QUESTIONS, resultCategory.label)

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Квиз о Московском районе',
          text: buildShareTextBody(score, TOTAL_QUESTIONS, resultCategory.label),
          url: QUIZ_SHARE_URL,
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(shareText)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }

    setShareNotice('Результат и ссылка на квиз скопированы. Можно отправить их в мессенджере.')
    window.setTimeout(() => setShareNotice(null), 4500)
  }

  return (
    <div className={`page${view === 'splash' ? ' page--welcome' : ''}`}>
      <div className="container">
        <div className={`card${view === 'splash' ? ' card--splash' : ''}`}>
          {view === 'splash' && (
            <div className="welcomeScreen">
              <figure className="welcomeBanner">
                <img
                  className="welcomeBannerImg"
                  src={publicUrl('/images/quiz-cover-new.png')}
                  alt=""
                  aria-hidden="true"
                />
              </figure>

              <div className="welcomeCard">
                <h1 className="welcomeTitle">Знаете ли вы Московский район?</h1>
                <p className="welcomeLead">
                  Интерактивный квиз о знаковых местах, истории и интересных фактах Московского района Санкт-Петербурга
                </p>
                <p className="welcomeNote">
                  Пройдите 16 вопросов, узнайте свой результат и посмотрите правильные ответы в финале.
                </p>

                <div className="welcomeBadges" aria-label="Особенности квиза">
                  <span className="welcomeBadge welcomeBadge--blue">16 вопросов</span>
                  <span className="welcomeBadge welcomeBadge--red">Результат в финале</span>
                  <span className="welcomeBadge welcomeBadge--blue">Правильные ответы</span>
                </div>

                <button className="welcomeBtn" type="button" onClick={() => setView('start')}>
                  Начать квиз
                </button>
              </div>
            </div>
          )}

          {view !== 'splash' && (
            <div className="header">
              <div>
                <h1 className="title">Знаете ли вы Московский район?</h1>
                <p className="subtitle">Быстрый квиз из 16 вопросов. Без регистрации, только локальная статистика.</p>
              </div>
            </div>
          )}

          {view === 'start' && (
            <>
              <div className="startActions">
                <button className="startBtn" onClick={startQuiz}>
                  Начать квиз
                </button>
              </div>

              <section className="statsSection" aria-label="Локальная статистика прохождений квиза">
                <div className="statsSectionHead">
                  <span className="badgeDot" aria-hidden="true" />
                  <span>Локальный счётчик</span>
                </div>

                <div className="statBoxTotal">
                  <div className="statLabel">Всего прошли квиз</div>
                  <div className="statValue statValue--hero">{stats.total}</div>
                </div>

                <div className="statsNominationGrid">
                  {categoriesInUi.map(cat => (
                    <div key={cat.key} className="statBox statBox--nomination" title={cat.label}>
                      <div className="statValue">{stats.categories[cat.key]}</div>
                      <div className="statLabel">{nominationShortLabels[cat.key]}</div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="fineprint">
                Подсказка: результат сохраняется в `localStorage` на этом устройстве. Персональные данные не собираются.
              </div>
            </>
          )}

          {view === 'quiz' && currentQuestion && (
            <>
              <div className="kvizRow">
                <div>
                  <div className="muted">
                    Вопрос {currentIndex + 1} из {TOTAL_QUESTIONS}
                  </div>
                </div>
                <div style={{ flex: '1 1 260px' }}>
                  <div className="progressOuter" aria-label="Прогресс квиза">
                    <div className="progressInner" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <p className="question">{currentQuestion.question}</p>
                {currentQuestion.image && (
                  <img
                    className="questionBanner"
                    src={publicUrl(currentQuestion.image)}
                    alt={currentQuestion.question}
                  />
                )}
                <div className="optionGrid">
                  {currentQuestion.options.map((opt, i) => {
                    const optionText = typeof opt === 'string' ? opt : opt.text
                    const optionImage = typeof opt === 'string' ? undefined : opt.image
                    const hasImage = Boolean(optionImage)

                    return (
                      <button
                        key={`q${currentIndex}-opt-${i}-${optionText}`}
                        className={`optionBtn${hasImage ? ' optionBtn--image' : ''}`}
                        onClick={() => handleAnswer(i)}
                      >
                        {hasImage ? (
                          <>
                            <div className="optionImageWrap" aria-hidden="true">
                              <img className="optionImage" src={publicUrl(optionImage)} alt={optionText} />
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="optionIndex">{String.fromCharCode(65 + i)}</span>
                            <span className="optionText">{optionText}</span>
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {view === 'result' && (
            <>
              <div ref={resultCardRef} className="resultCard" aria-label="Карточка результата квиза">
                <div className="resultHero">
                  <div>
                    <div className="muted">Ваш результат</div>
                    <div style={{ marginTop: 6 }} className="scoreBig">
                      {score}
                      <span style={{ fontSize: '0.55em', fontWeight: 1000, marginLeft: 6, color: 'rgba(15,23,42,0.75)' }}>из 16</span>
                    </div>
                    <div style={{ fontWeight: 900, marginTop: 8 }}>
                      Вы набрали {score} из 16
                    </div>
                  </div>

                  <div className="categoryPill">
                    <span className="categoryPillDot" />
                    {resultCategory.label}
                  </div>
                </div>

                {score === 16 ? (
                  <div className="fineprint" style={{ marginTop: 14 }}>
                    Отлично! 16/16 — конфетти и фанфары уже в деле.
                  </div>
                ) : (
                  <div className="fineprint" style={{ marginTop: 14 }}>
                    Неплохо! Хотите ещё разок — нажмите “Начать заново”.
                  </div>
                )}
              </div>

              <section className="reviewSection" aria-label="Разбор ответов">
                <h2 className="reviewTitle">Ваши ответы</h2>
                <div className="reviewList">
                  {quizData.map((question, questionIndex) => {
                    const userAnswer = userAnswers.find(a => a.questionIndex === questionIndex)
                    const selectedIndex = userAnswer?.selectedIndex
                    const isQuestionCorrect = userAnswer?.isCorrect ?? false

                    return (
                      <article key={questionIndex} className="reviewCard">
                        <div className="reviewQuestionNum">Вопрос {questionIndex + 1}</div>
                        <p className="reviewQuestion">{question.question}</p>

                        <ul className="reviewOptions">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = selectedIndex === optionIndex
                            const isCorrectOption = question.correct === optionIndex
                            const optionClasses = ['reviewOption']

                            if (isQuestionCorrect && isSelected) {
                              optionClasses.push('reviewOption--correct')
                            } else if (!isQuestionCorrect) {
                              if (isSelected) optionClasses.push('reviewOption--wrong')
                              if (isCorrectOption) optionClasses.push('reviewOption--correct')
                            }

                            return (
                              <li key={optionIndex} className={optionClasses.join(' ')}>
                                <span className="reviewOptionLetter">{String.fromCharCode(65 + optionIndex)}</span>
                                <span className="reviewOptionText">{getOptionReviewLabel(option)}</span>
                                <span className="reviewOptionTags">
                                  {isQuestionCorrect && isSelected && (
                                    <span className="reviewTag reviewTag--ok">Ваш ответ — верно</span>
                                  )}
                                  {!isQuestionCorrect && isSelected && (
                                    <span className="reviewTag reviewTag--user">Ваш ответ — неверно</span>
                                  )}
                                  {!isQuestionCorrect && isCorrectOption && (
                                    <span className="reviewTag reviewTag--correct">Правильный ответ</span>
                                  )}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </article>
                    )
                  })}
                </div>
              </section>

              <div className="kvizRow" style={{ marginTop: 14 }}>
                <button className="secondaryBtn" onClick={handleScreenshot} disabled={screenshotState === 'loading'}>
                  {screenshotState === 'loading' ? 'Сохраняю...' : 'Сделать скриншот результата'}
                </button>
                <button className="shareBtn" type="button" onClick={() => void handleShareResult()}>
                  Поделиться результатом
                </button>
                <button className="ghostBtn" onClick={startQuiz}>
                  Начать заново
                </button>
              </div>

              {shareNotice && (
                <div className="shareNotice" role="status">
                  {shareNotice}
                </div>
              )}

              {soundState === 'blocked' && (
                <div className="kvizRow" style={{ marginTop: 12 }}>
                  <button className="ghostBtn" onClick={() => void handlePlayResultSound()}>
                    Включить звук поздравления
                  </button>
                </div>
              )}

              {screenshotState === 'error' && (
                <div className="fineprint" style={{ marginTop: 10, color: 'rgba(185,28,28,0.95)' }}>
                  Не удалось сделать скриншот. Попробуйте ещё раз.
                </div>
              )}

              <div className="fineprint">
                Скриншот сохраняется на ваше устройство как PNG (картинка именно карточки результата).
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

