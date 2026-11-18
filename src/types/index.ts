export type Lang = 'hi' | 'en'

/** A string available in both languages. Used for all learner-facing text. */
export interface Bi {
  hi: string
  en: string
}

export type ImageSource = 'camera' | 'gallery' | 'sample'

export interface SelectedImage {
  imageUrl: string
  source: ImageSource
  sampleId?: string
  /** Object name confirmed or corrected by the learner (or from sample metadata). */
  objectName?: Bi
}

export type AxisKind = 'vertical' | 'horizontal' | 'diagonal' | 'unknown'
export type SymmetryType = 'perfect' | 'approximate' | 'none'

export interface SampleImage {
  id: string
  category: 'nature' | 'everyday' | 'geometric'
  src: string
  name: Bi
  description: Bi
  /** Verified against the actual asset (we draw the assets ourselves). */
  symmetry: SymmetryType
  axes: Bi
  suggestedAxis: AxisKind
  /** Suggested starting angle of the axis in degrees (0 = vertical). */
  axisAngle: number
}

export interface AiResult {
  object_name: string
  description: string
  possible_axis: AxisKind
  symmetry_observation: 'approximate' | 'asymmetric' | 'uncertain'
  confidence: number
  observation_task: string
}

export type MisconceptionId = 'M1' | 'M2'

export interface MisconceptionEvent {
  id: MisconceptionId
  questionId: string
  response: string
  feedbackKey: string
  at: number
  /** Filled when the learner later answers the same question correctly. */
  corrected?: boolean
  retryResponse?: string
}

export interface AttemptLog {
  questionId: string
  answer: string
  correct: boolean
  attempt: number
  timeMs: number
  hintUsed: boolean
  feedbackKey: string
  misconception?: MisconceptionId
  lang: Lang
  at: number
}

export interface Progress {
  objectsExplored: string[]
  investigations: number
  lessonDone: boolean
  /** questionId -> solved (correct at some attempt) */
  solved: Record<string, boolean>
  /** questionId -> number of attempts */
  attempts: Record<string, number>
  firstTryCorrect: Record<string, boolean>
  log: AttemptLog[]
  misconceptions: MisconceptionEvent[]
  /** Index of the current practice question, for resume. */
  practiceIndex: number
  practiceDone: boolean
  lastRoute?: string
  q6?: { source: ImageSource; classification: SymmetryType; reason: string; similarity: number | null }
}
