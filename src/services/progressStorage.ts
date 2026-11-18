import type { AttemptLog, Lang, MisconceptionEvent, Progress } from '../types'

const KEY = 'se24b3941.progress.v1'
const LANG_KEY = 'se24b3941.lang'

export const emptyProgress = (): Progress => ({
  objectsExplored: [],
  investigations: 0,
  lessonDone: false,
  solved: {},
  attempts: {},
  firstTryCorrect: {},
  log: [],
  misconceptions: [],
  practiceIndex: 0,
  practiceDone: false,
})

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable (private mode) – app still works in memory */
  }
}

export function loadProgress(): Progress {
  const raw = safeGet(KEY)
  if (!raw) return emptyProgress()
  try {
    return { ...emptyProgress(), ...(JSON.parse(raw) as Partial<Progress>) }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: Progress) {
  safeSet(KEY, JSON.stringify(p))
}

export function loadLang(): Lang {
  return safeGet(LANG_KEY) === 'en' ? 'en' : 'hi'
}
export function saveLang(l: Lang) {
  safeSet(LANG_KEY, l)
}

/** Pure reducer helpers so the components stay small. */
export function recordAttempt(p: Progress, a: AttemptLog, mis?: Omit<MisconceptionEvent, 'at'>): Progress {
  const attempts = { ...p.attempts, [a.questionId]: (p.attempts[a.questionId] ?? 0) + 1 }
  const solved = { ...p.solved }
  const firstTryCorrect = { ...p.firstTryCorrect }
  if (attempts[a.questionId] === 1) firstTryCorrect[a.questionId] = a.correct
  let misconceptions = p.misconceptions
  if (a.correct) {
    solved[a.questionId] = true
    // A later correct answer on the same question marks earlier misconception evidence as corrected.
    misconceptions = misconceptions.map((m) =>
      m.questionId === a.questionId && !m.corrected ? { ...m, corrected: true, retryResponse: a.answer } : m,
    )
  }
  if (mis) misconceptions = [...misconceptions, { ...mis, at: a.at }]
  return { ...p, attempts, solved, firstTryCorrect, misconceptions, log: [...p.log, a] }
}

/**
 * Evidence is only promoted to a "detected" misconception when it is repeated
 * (≥ 2 pieces of evidence) or when it appears in the question designed to probe it.
 * One ambiguous action alone is reported as "possible".
 */
export function misconceptionStatus(p: Progress) {
  const by = (id: 'M1' | 'M2') => p.misconceptions.filter((m) => m.id === id)
  const status = (id: 'M1' | 'M2') => {
    const ev = by(id)
    if (ev.length === 0) return 'none' as const
    const allCorrected = ev.every((e) => e.corrected)
    if (ev.length >= 2) return allCorrected ? ('corrected' as const) : ('detected' as const)
    return allCorrected ? ('corrected' as const) : ('possible' as const)
  }
  return { M1: status('M1'), M2: status('M2'), m1Count: by('M1').length, m2Count: by('M2').length }
}
