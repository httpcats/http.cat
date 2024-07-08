export async function getTranslations(lang: string) {
  const translationsModule = await import(`../locales/${lang}/common.json`);

  return translationsModule.default;
}
