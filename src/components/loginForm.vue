<template>
  <div class="login-box">
    <h2>Chưa đến thời gian thi</h2>
    <!-- <h2>Đăng nhập để vào thi</h2>
    <p class="text-tb">
      Vui lòng nhập đầy đủ thông tin và đúng định dạng họ tên. <br />
      Ví dụ: Nguyễn Minh Thắng
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
      * Lưu ý: Mỗi công chức, người lao động chỉ được phép tham gia thi một lần
      duy nhất. "Điểm số lấy dựa trên kết quả thi lần đầu".
    </p>

    <button @click="submit">Vào thi</button>

    <p v-if="error" class="error">{{ error }}</p> -->
  </div>

  <LoadingOverlay :show="show" />
</template>

<script>
import { createUser } from "@/services/Userservice";
import LoadingOverlay from "./LoadingOverlay.vue";
import validUsers from "@/services/listcheckUser";

// Hàm chuẩn hóa loại bỏ hoàn toàn dấu tiếng Việt để so sánh
function normalizeName(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/[đ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

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
        "Lãnh đạo Viện",
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

        // 1️⃣ Kiểm tra nhập đủ thông tin
        if (
          !this.formUser.hoten.trim() ||
          !this.formUser.donvi.trim() ||
          !this.formUser.phone.trim()
        ) {
          this.error = "⚠️ Vui lòng nhập đầy đủ thông tin!";
          return;
        }

        // 2️⃣ Kiểm tra họ tên có nằm trong danh sách không (khử triệt để lệch dấu úy/uý)
        const inputNorm = normalizeName(this.formUser.hoten);
        const found = validUsers.find(
          (name) => normalizeName(name) === inputNorm,
        );

        if (!found) {
          this.error = "⚠️ Họ và tên chưa có trong danh sách !";
          return;
        }

        this.show = true;

        // 3️⃣ Gửi thông tin đăng ký lên server
        const newUser = await createUser({
          hoten: this.formUser.hoten.trim(),
          donvi: this.formUser.donvi.trim(),
          phone: this.formUser.phone.trim(),
        });

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

        // Bắt lỗi theo response từ backend (hỗ trợ cả axios hoặc fetch)
        const serverMsg = err.response?.data?.error || err.error || err.message;
        if (serverMsg && serverMsg.includes("đã xuất hiện 2 lần")) {
          this.error = "⚠️ Bạn đã vượt quá số lần đăng nhập cho phép!";
        } else {
          this.error = "⚠️ Có lỗi khi đăng nhập!";
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
  box-sizing: border-box;
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
  background: #27ae60;
}
.error {
  color: red;
  font-size: 14px;
  margin: 5px 0;
}
</style>
