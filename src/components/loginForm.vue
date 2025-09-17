<template>
  <div class="login-box">
    <h2>Đăng nhập để vào thi</h2>

    <input v-model="formUser.hoten" type="text" placeholder="Họ và tên" />
    <input v-model="formUser.donvi" type="text" placeholder="Đơn vị" />

    <!-- thông báo lỗi -->
    <p v-if="error" class="error">{{ error }}</p>

    <button @click="submit(), create()">Vào thi</button>
  </div>
</template>

<script>
import { createUser } from "@/services/Userservice";
export default {
  name: "LoginForm",
  data() {
    return {
      formUser: {
        hoten: "",
        donvi: "",
      },
      error: "", // biến lưu lỗi
    };
  },
  methods: {
    async create() {
      try {
        const newUser = await createUser(this.formUser);
        console.log(newUser);
        localStorage.setItem("currentUserId", JSON.stringify(newUser._id));
      } catch (err) {
        console.log(`Lỗi: ${err.message}`);
      }
    },
    submit() {
      if (!this.formUser.hoten || !this.formUser.donvi) {
        this.error = "⚠️ Vui lòng nhập đầy đủ thông tin trước khi vào thi!";
        return;
      }
      this.error = "";
      this.$emit("login", {
        name: this.formUser.hoten,
        id: this.formUser.donvi,
      });
    },
  },
};
</script>

<style scoped>
.login-box {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}
input {
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  border-radius: 6px;
  background: #2ecc71;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
button:hover {
  background: #e74c3c;
}

.error {
  color: red;
  font-size: 14px;
  margin: 5px 0;
}
</style>
