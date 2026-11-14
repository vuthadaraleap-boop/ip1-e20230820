<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="card narrow">
    <h1>Page not found</h1>
    <p>This address does not exist.</p>
    <RouterLink :to="{ name: 'classes' }" class="btn btn-primary">Go to the timetable</RouterLink>
  </section>
</template>
