import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { T, type TKey } from '../data/translations'
import { loadLang, loadProgress, saveLang, saveProgress, emptyProgress } from '../services/progressStorage'
import type { Bi, Lang, Progress, SelectedImage } from '../types'

const IMG_KEY = 'se24b3941.image'

interface Ctx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (k: TKey) => string
  tx: (b: Bi) => string
  progress: Progress
  update: (fn: (p: Progress) => Progress) => void
  resetProgress: () => void
  image: SelectedImage | null
  setImage: (img: SelectedImage | null) => void
}

const AppCtx = createContext<Ctx | null>(null)

function loadImage(): SelectedImage | null {
  // Only sample selections are restored after a refresh — learner photos are never persisted.
  try {
    const raw = sessionStorage.getItem(IMG_KEY)
    return raw ? (JSON.parse(raw) as SelectedImage) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [image, setImageState] = useState<SelectedImage | null>(loadImage)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    saveLang(l)
  }, [])

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev)
      saveProgress(next)
      return next
    })
  }, [])

  const resetProgress = useCallback(() => {
    const p = emptyProgress()
    saveProgress(p)
    setProgress(p)
  }, [])

  const setImage = useCallback((img: SelectedImage | null) => {
    setImageState((prev) => {
      if (prev?.imageUrl.startsWith('blob:') && prev.imageUrl !== img?.imageUrl) URL.revokeObjectURL(prev.imageUrl)
      return img
    })
    try {
      if (img?.source === 'sample') sessionStorage.setItem(IMG_KEY, JSON.stringify(img))
      else sessionStorage.removeItem(IMG_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k) => T[k][lang],
      tx: (b) => b[lang],
      progress,
      update,
      resetProgress,
      image,
      setImage,
    }),
    [lang, setLang, progress, update, resetProgress, image, setImage],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp outside provider')
  return c
}
