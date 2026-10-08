import { pageNames, type RoutePage } from '../routes'

const lastPageKey = 'projectpulse:last-page'

export function readLastPage(): RoutePage {
  const savedPage = window.localStorage.getItem(lastPageKey)
  return pageNames.find(page => page === savedPage) ?? 'Dashboard'
}

export function saveLastPage(page: RoutePage): void {
  window.localStorage.setItem(lastPageKey, page)
}