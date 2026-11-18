<script setup lang="ts">
import type { Data } from "~/utils/api";

const { mediaUrl } = useApi();

const { avatar, session } = useSession();

defineProps<{ article: Data<"Article">; forSlider?: boolean }>();
</script>

<template>
  <article
    class="group relative h-[210px] w-full min-w-0 overflow-hidden rounded bg-white shadow-sm transition duration-200 ease-in-out dark:bg-gray-900"
    :class="forSlider ? 'h-[215px]' : 'hover:scale-[101%]'"
  >
    <NuxtLink
      class="hover:text-inherit"
      :to="`/community/article/${article.slug}`"
    >
      <div
        class="mb-5 block h-[100px] w-full bg-position-[300px_220px] transition-[background-position] duration-300"
        :class="{ 'group-hover:bg-position-[350px_220px]': !forSlider }"
        :style="{ backgroundImage: `url('${mediaUrl(article.image)}')` }"
      ></div>

      <div class="mt-4 px-4">
        <h2
          class="truncate text-lg font-semibold dark:text-gray-200"
          :class="{
            'transition duration-200 group-hover:text-[#e9b124]': forSlider,
          }"
        >
          {{ article.title }}
        </h2>

        <div class="flex items-center gap-x-2">
          <div
            class="mt-3 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <img
              :src="avatar(article.author, { headonly: 1 })"
              alt=""
            />
          </div>

          <p class="mt-4 font-semibold dark:text-gray-400">
            {{ article.author?.username || session.bootstrap.hotel_name }}
          </p>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
