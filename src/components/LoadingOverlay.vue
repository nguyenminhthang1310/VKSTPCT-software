<template>
  <div
    v-if="show"
    class="loading-overlay d-flex justify-content-center align-items-center"
  >
    <div
      class="spinner-border text-light"
      role="status"
      style="width: 4rem; height: 4rem"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
export default {
  props: {
    show: { type: Boolean, default: false },
  },
};
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6); /* nền mờ */
  z-index: 9999;
}
</style>
