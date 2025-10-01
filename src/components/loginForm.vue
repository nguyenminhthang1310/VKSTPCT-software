<template>
  <div class="login-box">
    <h2>Đăng nhập để vào thi</h2>

    <input v-model="formUser.hoten" type="text" placeholder="Họ và tên" />
    <input v-model="formUser.phone" type="text" placeholder="Số điện thoại" />
    <!-- đổi input thành select -->
    <select v-model="formUser.donvi">
      <option disabled value="">-- Chọn đơn vị --</option>
      <option v-for="dv in donviList" :key="dv" :value="dv">
        {{ dv }}
      </option>
    </select>

    <!-- thông báo lỗi -->
    <p v-if="error" class="error">{{ error }}</p>

    <button @click="submit()">Vào thi</button>
  </div>
  <LoadingOverlay :show="this.show"></LoadingOverlay>
</template>

<script>
import { createUser } from "@/services/Userservice";
import { getAllUsers } from "@/services/Userservice";
import LoadingOverlay from "./LoadingOverlay.vue";
export default {
  name: "LoginForm",
  data() {
    return {
      formUser: {
        hoten: "",
        donvi: "",
        phone: "",
      },
      error: "", // biến lưu lỗi
      login: false,
      show: false,
      donviList: [
        "Văn phòng",
        "Phòng 1",
        "Phòng 2",
        "Phòng 7",
        "Phòng 8",
        "Phòng 9",
        "Phòng 10",
        "Phòng 11",
        "Phòng 15",
        "Phòng Thanh tra - Khiếu tố",
        "Khu vực 1",
        "Khu vực 2",
        "Khu vực 3",
        "Khu vực 4",
        "Khu vực 5",
        "Khu vực 6",
        "Khu vực 7",
        "Khu vực 8",
        "Khu vực 9",
        "Khu vực 10",
        "Khu vực 11",
        "Khu vực 12",
        "Khu vực 13",
        "Khu vực 14",
      ], // danh sách đơn vị có sẵn
    };
  },
  components: {
    LoadingOverlay,
  },
  methods: {
    async submit() {
      try {
        // 1. Kiểm tra input
        if (
          !this.formUser.hoten ||
          !this.formUser.donvi ||
          !this.formUser.phone
        ) {
          this.error = "⚠️ Vui lòng nhập đầy đủ thông tin trước khi vào thi!";
          return;
        }

        // 2. Lấy toàn bộ user
        const allUsers = await getAllUsers();

        // 3. Lọc user theo hoten + phone
        const sameUsers = allUsers.filter(
          (u) =>
            u.hoten === this.formUser.hoten && u.phone === this.formUser.phone
        );

        // 4. Kiểm tra số lần đăng nhập
        if (sameUsers.length >= 3) {
          this.error = "⚠️ Người dùng đã vượt quá số lần đăng nhập!";
          return;
        }
        this.show = true;
        // 5. Nếu ok thì tạo mới
        const newUser = await createUser(this.formUser);
        localStorage.setItem("currentUserId", JSON.stringify(newUser._id));

        this.error = "";
        this.$emit("login", {
          name: this.formUser.hoten,
          id: this.formUser.donvi,
        });
        this.show = false;
      } catch (err) {
        console.log(`❌ Lỗi: ${err.message}`);
        this.error = "⚠️ Có lỗi khi đăng nhập, vui lòng thử lại!";
      }
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
.login-box select,
.login-box input {
  border: #2ecc71 solid 2px;
  border-radius: 5%;
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
}
</style>
