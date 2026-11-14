<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AsyncState from '@/components/AsyncState.vue'
import { useClassesStore } from '@/stores/classes'
import { formatDateTime } from '@/utils/format'

const classes = useClassesStore()

onMounted(() => classes.fetchAll())

function clear() {
  classes.clearFilters()
  classes.fetchAll()
}
</script>

<template>
  <h1>Class timetable</h1>

  <form class="filters" role="search" @submit.prevent="classes.fetchAll()">
    <div class="field">
      <label for="search">Search by title</label>
      <input id="search" v-model="classes.search" type="search" placeholder="e.g. yoga" />
    </div>
    <div class="field">
      <label for="category">Category</label>
      <select id="category" v-model="classes.category" @change="classes.fetchAll()">
        <option value="">All categories</option>
        <option v-for="name in classes.categories" :key="name" :value="name">{{ name }}</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary">Search</button>
    <button type="button" class="btn" @click="clear">Clear</button>
  </form>

  <AsyncState
    :loading="classes.loading"
    :error="classes.error"
    :empty="classes.items.length === 0"
    empty-text="No classes match your search. Try another word or clear the filters."
    @retry="classes.fetchAll()"
  >
    <div class="grid">
      <article v-for="item in classes.items" :key="item.id" class="card">
        <p class="chips">
          <span class="badge">{{ item.category }}</span>
          <span v-if="item.seatsLeft <= 0" class="badge badge-warn">Full</span>
        </p>
        <h2>
          <RouterLink :to="{ name: 'class-detail', params: { id: item.id } }">{{ item.title }}</RouterLink>
        </h2>
        <p>{{ formatDateTime(item.startsAt) }} · {{ item.durationMinutes }} min</p>
        <p class="muted">{{ item.coachName }}</p>
        <p>
          <strong>{{ Math.max(item.seatsLeft, 0) }}</strong> of {{ item.capacity }} seats left
        </p>
      </article>
    </div>
  </AsyncState>
</template>
