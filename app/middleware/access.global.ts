export default defineNuxtRouteMiddleware(async (to) => {
  const { session, initialize } = useSession();

  const { locale, setLocale } = useLocale();

  if (!session.ready) {
    await Promise.all([
      setLocale(locale.value),
      initialize().catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage:
            "The hotel is temporarily unavailable. Please try again.",
        });
      }),
    ]);
  }

  const redirect = accessDestination(to.path, !!to.meta.auth, session);

  if (redirect) {
    return navigateTo(
      redirect === "/login"
        ? { path: redirect, query: { next: to.fullPath } }
        : redirect,
    );
  }
});
