// localStorage-based history — no account needed
export type HistoryItem = {
  id:         string
  title:      string
  content:    string
  createdAt:  number
}

const KEY = 'fury_history'
const MAX = 30

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch { return [] }
}

export function saveToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
  const entry: HistoryItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() }
  const existing = getHistory()
  const updated  = [entry, ...existing].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return entry
}

export function deleteFromHistory(id: string) {
  const updated = getHistory().filter(h => h.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}
