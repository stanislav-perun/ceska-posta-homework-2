import locales from '../locales/app.json'

// Dumb alternative for ReactI18n.
export const t = (key) => {
  return locales[key]
}