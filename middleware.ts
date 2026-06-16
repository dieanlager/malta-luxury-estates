import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/((?!_next|_vercel|api|admin|agency|favicon\\.png|sitemap\\.xml|robots\\.txt|locales|assets|.*\\..*).*)' ,
  ],
};
