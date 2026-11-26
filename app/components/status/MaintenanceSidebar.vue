<script setup lang="ts">
import { computed, ref } from "vue";
import type { Data } from "~/utils/api";

type MaintenanceTask = Data<"MaintenanceTask">;

defineProps<{ status: Data<"Status"> | null }>();

const { t } = useLocale();

const { safeUrl } = useApi();

const { avatar, session } = useSession();

const logoFailed = ref(false);

const logo = computed(() =>
  logoFailed.value
    ? "/assets/images/logo.png"
    : safeUrl(session.bootstrap.assets?.logo) || "/assets/images/logo.png",
);

function taskAvatar(task: MaintenanceTask) {
  return task.user
    ? avatar(task.user, { direction: 3, head_direction: 3, action: "wav" })
    : "";
}
</script>

<template>
  <aside
    class="relative hidden h-full w-96 flex-col items-center gap-10 bg-[var(--surface-recessed)] px-6 py-10 lg:flex"
  >
    <div>
      <img
        :src="logo"
        :alt="session.bootstrap.hotel_name"
        @error="logoFailed = true"
      />
    </div>

    <div class="relative z-10 flex w-full flex-col gap-2">
      <article
        v-for="task in status?.tasks.items || []"
        :key="task.id"
        class="relative h-20 w-full overflow-hidden bg-[var(--maintenance-bg)] py-2 pr-2 transition-transform duration-150 ease-in-out hover:scale-[1.01]"
      >
        <div class="flex size-full items-center gap-6">
          <div>
            <img
              class="-mb-8 max-w-none [image-rendering:auto]"
              v-if="task.user"
              :src="taskAvatar(task)"
              alt=""
            />
          </div>

          <div class="flex h-full w-2/3 items-center wrap-break-word">
            {{ task.task }}
          </div>
        </div>

        <div class="absolute right-2 bottom-2 flex w-full justify-between">
          <small
            class="pl-24 flex items-center gap-1 text-[12.8px] text-inherit"
          >
            {{ t("By: :user", { user: task.user?.username || "" }) }}
          </small>

          <small class="flex items-center gap-1 text-[12.8px] text-inherit">
            {{ t("Status:") }}
            <svg
              v-if="task.completed"
              class="size-5 text-green-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              :aria-label="t('Completed')"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              /></svg
            ><svg
              v-else
              class="size-5 text-yellow-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :aria-label="t('In progress')"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </small>
        </div>
      </article>

      <nav
        v-if="(status?.tasks.current_page || 1) > 1 || status?.tasks.has_more"
        class="flex justify-between text-sm"
        :aria-label="t('Pagination')"
      >
        <NuxtLink
          class="rounded border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-2"
          v-if="(status?.tasks.current_page || 1) > 1"
          :to="{
            path: '/maintenance',
            query: {
              page: (status?.tasks.current_page || 1) - 1,
            },
          }"
        >
          {{ t("Previous") }}
        </NuxtLink>

        <NuxtLink
          class="rounded border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-2"
          v-if="status?.tasks.has_more"
          :to="{
            path: '/maintenance',
            query: { page: status!.tasks.current_page + 1 },
          }"
        >
          {{ t("Next") }}
        </NuxtLink>
      </nav>
    </div>

    <img
      class="absolute right-0 bottom-0 z-0"
      src="/assets/images/maintenance/fireman.png"
      alt=""
    />
  </aside>
</template>
