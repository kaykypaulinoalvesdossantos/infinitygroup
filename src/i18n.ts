import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['pt-BR', 'en', 'es'];

export default getRequestConfig(async ({ locale }) => {
  const requestLocale = locale ?? 'pt-BR';
  if (!locales.includes(requestLocale as any)) notFound();

  return {
    locale: requestLocale,
    messages: (await import(`./messages/${requestLocale}.json`)).default
  };
});
