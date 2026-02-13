import { authMiddleware } from '@clerk/nextjs/server';
 
export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/health',
    '/api/webhooks/(.*)',
  ],
  ignoredRoutes: [
    '/api/health',
  ],
});
 
export const config = {
  matcher: ['/((?!.+\.[\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};