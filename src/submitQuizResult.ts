/**
 * URL веб-приложения Google Apps Script (Web App → Google Таблица).
 * Вставьте сюда свой URL из Google Apps Script → Развернуть → Веб-приложение.
 *
 * Чтобы отключить отправку результатов, оставьте пустую строку:
 * export const GOOGLE_SCRIPT_URL = '';
 */
export const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby3xQS9Yo18Pvv0joylkvbU1ACDNf_8tOR1R8XcV1LZ1AnRUv28V9yGO7F3j-2Ws_Mz_g/exec'

const SENT_STORAGE_PREFIX = 'kviz_google_sheets_sent_v1_'

export type QuizResultPayload = {
  score: number
  totalQuestions: number
  status: string
  percent: number
  device: string
  userAgent: string
}

function detectDevice(): string {
  const ua = navigator.userAgent
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile'
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  return 'desktop'
}

/**
 * Отправка результата квиза в Google Таблицу через Apps Script.
 * Вызывается один раз при завершении квиза (см. finishQuiz в App.tsx).
 * Если GOOGLE_SCRIPT_URL пустой — функция сразу завершается без ошибок.
 */
export async function submitQuizResultToGoogleSheets(
  score: number,
  totalQuestions: number,
  status: string,
  completionId: string,
): Promise<void> {
  if (!GOOGLE_SCRIPT_URL.trim()) return

  const sentKey = `${SENT_STORAGE_PREFIX}${completionId}`
  if (sessionStorage.getItem(sentKey) === '1') return

  const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0

  const payload: QuizResultPayload = {
    score,
    totalQuestions,
    status,
    percent,
    device: detectDevice(),
    userAgent: navigator.userAgent,
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    })

    // Помечаем отправку, чтобы при обновлении страницы не дублировать запись.
    sessionStorage.setItem(sentKey, '1')
  } catch {
    // Ошибка сети не должна мешать прохождению квиза.
  }
}
