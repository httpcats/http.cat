export const strings = {
  en: {
    APP_TITLE: 'HTTP Cats',
    USAGE_TITLE: 'Usage',
    USAGE_PARAM: 'status_code',
    USAGE_NOTE_LABEL: 'Note',
    USAGE_NOTE_TEXT: 'If you need an extension at the end of the URL just add',
    LANGUAGE_LINK_TEXT: 'Versió Català',
    DEVELOPED_BY: 'Developed by',
    IMAGES_BY: 'Images by',
    COPIED: 'Copied!',
    COPY_ICON_ALT_TEXT: 'Icon that represent the clipboard action'
  },

  cat: {
    APP_TITLE: 'HTTP Gats',
    USAGE_TITLE: 'Instruccions',
    USAGE_PARAM: 'codi_d_estat',
    USAGE_NOTE_LABEL: 'Nota',
    USAGE_NOTE_TEXT:
      'Si necessiteu una extensió al final de l’URL només heu d’afegir',
    LANGUAGE_LINK_TEXT: 'Versió Català',
    DEVELOPED_BY: 'Desenvolupat per',
    IMAGES_BY: 'Imatges de',
    COPIED: '¡Copiat!',
    COPY_ICON_ALT_TEXT: "Icona que representa l'acció del porta-retalls"
  }
}

const getString = label => {
  const lang = window.location.search.indexOf('lang=cat') !== -1 ? 'cat' : 'en'

  return strings[lang][label]
}

export default getString
