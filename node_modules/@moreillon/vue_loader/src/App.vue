<template>
  <div class="container">
    <Loader>Loading...</Loader>
  </div>

</template>

<script>
import Loader from '@/Loader.vue'

export default {
  name: 'my_component',
  components: { Loader }
}
</script>
<style .scoped>
.container{
  font-size: 200%;
}
</style>
