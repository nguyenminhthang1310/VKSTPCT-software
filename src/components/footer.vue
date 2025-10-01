<template>
  <footer class="footer">
    <div class="footer-content">
      <p>© 2025 Viện Kiểm sát – Phần mềm thi trắc nghiệm</p>
      <p>
        🚀 Developed by
        <span class="brand">Bộ phận Công nghệ thông tin VKSND TP Cần Thơ</span>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "FooterVKS",
};
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  padding: 0px;
  text-align: center;
  position: relative;
  bottom: 0;
  width: 100%;
  margin-top: 10%;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  position: fixed; /* cố định */
  bottom: 0; /* dính sát dưới */
  left: 0;
}
.footer-content p {
  padding: 0;
  margin: 2px 0;
  font-size: 11px;
}
.footer a {
  color: #ffeb3b;
  text-decoration: none;
  font-weight: bold;
}
.footer a:hover {
  text-decoration: underline;
}
.brand {
  font-weight: bold;
  color: #ffeb3b;
}
</style>
