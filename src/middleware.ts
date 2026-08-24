import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // As páginas atuais não usam o segmento app/[locale]. Portanto,
  // não devemos reescrever as rotas públicas para /pt-BR, /en ou /es.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
