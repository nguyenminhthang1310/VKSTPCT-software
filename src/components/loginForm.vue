<template>
  <!-- <h2>CHƯA BẮT ĐẦU THI!</h2> -->
  <div class="login-box">
    <h2>Đăng nhập để vào thi</h2>
    <p class="text-tb">
      Vui lòng nhập đầy đủ thông tin và đúng định dạnh họ tên. <br></br> Ví dụ: Nguyễn Minh Thắng
    </p>
    <input v-model="formUser.hoten" type="text" placeholder="Họ và tên" />
    <input v-model="formUser.phone" type="text" placeholder="Số điện thoại" />

    <select v-model="formUser.donvi">
      <option disabled value="">-- Chọn đơn vị --</option>
      <option v-for="dv in donviList" :key="dv" :value="dv">
        {{ dv }}
      </option>
    </select>
<p class="text-tb">
      * Lưu ý: Mỗi công chức, người lao động chỉ được phép tham gia thi một lần duy nhất.
      "Điểm số lấy dựa trên kết quả thi lần đầu".
    </p>
    <button @click="submit">Vào thi</button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>

  <LoadingOverlay :show="this.show"></LoadingOverlay>
</template>

<script>
import { createUser } from "@/services/Userservice";
import LoadingOverlay from "./LoadingOverlay.vue";
import validUsers from "@/services/listcheckUser"; // ✅ import danh sách hợp lệ

export default {
  name: "LoginForm",
  components: { LoadingOverlay },
  data() {
    return {
      formUser: {
        hoten: "",
        donvi: "",
        phone: "",
      },
      error: "",
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
      ],
    };
  },
  methods: {
    async submit() {
      try {
        this.error = "";
        this.show = true;

        // 1️⃣ Kiểm tra nhập đủ thông tin
        if (
          !this.formUser.hoten ||
          !this.formUser.donvi ||
          !this.formUser.phone
        ) {
          this.error = "⚠️ Vui lòng nhập đầy đủ thông tin!";
          this.show = false;
          return;
        }

        // 2️⃣ Kiểm tra họ tên có nằm trong danh sách không
        const found = validUsers.find(
          (name) =>
            name.trim().toLowerCase() ===
            this.formUser.hoten.trim().toLowerCase()
        );

        if (!found) {
          this.error = "❌ SPAM";
          this.show = false;
          return;
        }

        // 3️⃣ Nếu hợp lệ -> tiếp tục như cũ
        const newUser = await createUser(this.formUser);
        localStorage.setItem("currentUserId", JSON.stringify(newUser._id));

        this.$emit("login", {
          name: this.formUser.hoten,
          id: this.formUser.donvi,
        });

        this.error = "";
        this.show = false;
      } catch (err) {
        this.show = false;
        console.error("❌ Error submit:", err);

        if (err.error === "Vuot qua 2 lan") {
          this.error = "⚠️ Bạn đã vượt quá số lần đăng nhập cho phép!";
        } else {
          this.error = err.error || err.message || "⚠️ Có lỗi khi đăng nhập!";
        }
      }
    },
  },
};
</script>

<style scoped>
.text-tb {
  font-size: 11px;
  color: blue;
}
.login-box {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}
input,
select {
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  border: 2px solid #2ecc71;
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
