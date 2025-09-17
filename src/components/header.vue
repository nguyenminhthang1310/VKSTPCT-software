<template>
  <header class="header">
    <div class="logo">
      <img src="/img/logoVKS.png" alt="LOGO" width="50" height="50" />
      <span class="text-header">VIỆN KIỂM SÁT NHÂN DÂN THÀNH PHỐ CẦN THƠ</span>
    </div>
    <!-- <nav class="nav">
      <a href="#">Trang chủ</a>
      <a href="#">Giới thiệu</a>
      <a href="#">Liên hệ</a>
    </nav> -->
  </header>
</template>

<script setup>
// Chưa cần JS logic, sau này có thể thêm
</script>

<style scoped>
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  padding: 15px 30px;
  color: white;
  height: 70px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
}

.logo {
  display: flex;
  font-size: 16px;
  font-weight: 400;
}
.text-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;
  font-weight: 600;
  font-size: 18px;
}
.nav a {
  color: white;
  margin-left: 20px;
  text-decoration: none;
  font-weight: 500;
}

.nav a:hover {
  color: #42b983; /* xanh Vue */
}
</style>
