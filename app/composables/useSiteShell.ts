export function useSiteShell() {
  const { t, locale, setLocale } = useLocale();

  const { initialize, session, avatar } = useSession();

  const { safeUrl } = useApi();

  const { busy, error, run } = usePage();

  const { logout: endSession } = useLogout();

  const route = useRoute();

  const mobileOpen = ref(false);

  const openMenu = ref("");

  const logoFailed = ref(false);

  const hotel = computed(() => session.bootstrap.hotel_name || "Atom Hotel");

  const logo = computed(() =>
    logoFailed.value
      ? "/assets/images/logo.png"
      : safeUrl(session.bootstrap.assets?.logo) || "/assets/images/logo.png",
  );

  const languages = computed(
    () => session.bootstrap.locales || [{ name: "English", locale: "en" }],
  );

  const navigation = computed(() =>
    [
      {
        label: "Community",
        active: route.path.startsWith("/help-center"),
        icon: "community_icon",
        visible: true,
        children: [
          { label: "Staff", path: "/community/staff" },
          { label: "Teams", path: "/community/teams" },
          { label: "Team applications", path: "/community/team-applications" },
          {
            label: "Staff applications",
            path: "/community/staff-applications",
          },
          {
            label: "Rare values",
            path: "/values",
            visible: session.bootstrap.features?.includes("rare-values"),
          },
          { label: "Help center", path: "/help-center" },
          {
            label: "Photos",
            path: "/community/photos",
            visible: session.bootstrap.features?.includes("camera-photos"),
          },
        ].filter((item) => !("visible" in item) || item.visible),
      },
      {
        label: "Leaderboard",
        icon: "leaderboard_icon",
        path: "/leaderboard",
        visible: true,
      },
      { label: "News", icon: "news_icon", path: "/community/articles" },
      {
        label: "Store",
        icon: "store_icon",
        path: "/shop",
        visible: true,
      },
      {
        label: "Home",
        active: route.path.startsWith("/user"),
        icon: "home_icon",
        children: session.user
          ? [
              { label: "My Home", path: `/home/${session.user.username}` },
              { label: "Badge Drawer", path: "/draw-badge" },
              { label: "Account settings", path: "/user/settings/account" },
              { label: "Logout", path: "" },
            ]
          : [
              { label: "Login", path: "/login" },
              { label: "Register", path: "/register" },
            ],
      },
    ].filter((item) => item.visible !== false),
  );

  watch(
    () => session.bootstrap.assets?.logo,
    () => {
      logoFailed.value = false;
    },
  );

  watch(
    () => route.fullPath,
    () => {
      mobileOpen.value = false;

      openMenu.value = "";
    },
  );

  useHead(() => ({
    titleTemplate: (title) =>
      title ? `${title} · ${hotel.value}` : hotel.value,
  }));

  function hoverMenu(event: PointerEvent, name: string) {
    if (
      event.pointerType === "mouse" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      openMenu.value = name;
    }
  }

  function toggleMenu(event: MouseEvent, name: string) {
    if (
      event.detail > 0 &&
      !(event instanceof PointerEvent && event.pointerType === "touch") &&
      window.matchMedia("(min-width: 1024px) and (hover: hover)").matches
    ) {
      return;
    }

    openMenu.value = openMenu.value === name ? "" : name;
  }

  function closeMenu(event: FocusEvent) {
    if (
      !(event.currentTarget as HTMLElement).contains(
        event.relatedTarget as Node | null,
      )
    ) {
      openMenu.value = "";
    }
  }

  function closeOutsideMenu(event: PointerEvent) {
    if (!(event.target as Element).closest(".nav-menu, .language-menu")) {
      openMenu.value = "";
    }
  }

  onMounted(() => document.addEventListener("pointerdown", closeOutsideMenu));

  onBeforeUnmount(() =>
    document.removeEventListener("pointerdown", closeOutsideMenu),
  );

  async function logout() {
    openMenu.value = "";

    await run(endSession);
  }

  async function changeLocale(value: string) {
    openMenu.value = "";

    await run(async () => {
      await setLocale(value);

      await initialize();
    });
  }

  return {
    t,
    locale,
    session,
    safeUrl,
    busy,
    error,
    mobileOpen,
    openMenu,
    logoFailed,
    hotel,
    logo,
    languages,
    navigation,
    hoverMenu,
    toggleMenu,
    closeMenu,
    logout,
    changeLocale,
    avatar,
  };
}
