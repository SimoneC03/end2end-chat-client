<template>
  <div class="notfound text-center">
    <h1 class="text-4xl mt-20">404</h1>
    <h2 class="text-xl">Page not found</h2>
    <router-link :to="{name:'Home'}" class="underline my-3 block">Back to Home</router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound"
}
</script>