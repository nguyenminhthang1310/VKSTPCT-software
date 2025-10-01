<template>
  <div class="wrapper">
    <footer class="footer">
      <div class="footer-content">
        <!-- <p>
          <i class="fas fa-balance-scale"></i> © 2025 Viện Kiểm sát – Phần mềm
          thi trắc nghiệm
        </p> -->
        <p>
          <i class="fas fa-code"></i> 🚀 Developed by
          <span class="brand"
            >Bộ phận Công nghệ thông tin VKSND TP Cần Thơ</span
          >
        </p>
        <p>
          <i class="fas fa-user-shield"></i> 🤝 Liên hệ hổ trợ qua Đ/c Nguyễn
          Minh Thắng - SĐT:
          <span class="brand">0939 753 581</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
}

.wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1; /* chiếm hết không gian trống */
}

.footer {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  text-align: center;
  width: 100%;
  padding: 10px 0;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
}

.footer-content p {
  margin: 4px 0;
  font-size: 16px;
}

.brand {
  font-weight: bold;
  color: #ffeb3b;
}
</style>
