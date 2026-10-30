<template>
  <div class="login-box">
    <h2>Đăng nhập để vào thi</h2>
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

    <!-- Khối mã xác nhận chỉ gồm số -->
    <div class="captcha-wrapper">
      <canvas
        ref="captchaCanvas"
        width="110"
        height="42"
        class="captcha-canvas"
      ></canvas>
      <button
        type="button"
        class="btn-refresh"
        title="Đổi mã khác"
        @click="generateCaptcha"
      >
        ↻
      </button>
      <input
        v-model="inputCaptcha"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="Nhập 4 số"
        maxlength="4"
        class="input-captcha"
        @input="inputCaptcha = inputCaptcha.replace(/\D/g, '')"
      />
    </div>

    <p class="text-tb">
      * Lưu ý: Mỗi công chức, người lao động chỉ được phép tham gia thi một lần
      duy nhất. "Điểm số lấy dựa trên kết quả thi lần đầu".
    </p>
    <!-- <h2>Chưa đến thời gian thi</h2> -->
    <button class="btn-submit" @click="submit">Vào thi</button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>

  <LoadingOverlay :show="show" />
</template>

<script>
import { createUser } from "@/services/Userservice";
import LoadingOverlay from "./LoadingOverlay.vue";
import validUsers from "@/services/listcheckUser";

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
      captchaCode: "",
      inputCaptcha: "",
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
  mounted() {
    this.generateCaptcha();
  },
  methods: {
    generateCaptcha() {
      // Sinh 4 chữ số ngẫu nhiên từ 1000 đến 9999
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      this.captchaCode = code;
      this.inputCaptcha = "";

      this.$nextTick(() => {
        const canvas = this.$refs.captchaCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Nền canvas
        ctx.fillStyle = "#f5f6fa";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Nét gạch chống bot đọc ảnh đơn giản
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = `rgba(0, 0, 0, ${0.15 + Math.random() * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
          );
          ctx.lineTo(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
          );
          ctx.stroke();
        }

        // Vẽ 4 số lên canvas với màu sắc và góc nghiêng nhẹ
        ctx.font = "bold 24px monospace";
        for (let i = 0; i < code.length; i++) {
          ctx.save();
          const x = 16 + i * 22;
          const y = 29;
          ctx.translate(x, y);
          ctx.rotate((Math.random() - 0.5) * 0.3);
          ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 30%)`;
          ctx.fillText(code[i], 0, 0);
          ctx.restore();
        }
      });
    },

    async submit() {
      try {
        this.error = "";

        // 1️⃣ Kiểm tra nhập đủ thông tin cơ bản
        if (
          !this.formUser.hoten.trim() ||
          !this.formUser.donvi.trim() ||
          !this.formUser.phone.trim()
        ) {
          this.error = "⚠️ Vui lòng nhập đầy đủ thông tin!";
          return;
        }

        // 2️⃣ Kiểm tra mã số xác nhận
        if (!this.inputCaptcha.trim()) {
          this.error = "⚠️ Vui lòng nhập mã xác nhận!";
          return;
        }

        if (this.inputCaptcha.trim() !== this.captchaCode) {
          this.error = "⚠️ Mã xác nhận không chính xác!";
          this.generateCaptcha();
          return;
        }

        // 3️⃣ Kiểm tra họ tên có trong danh sách
        const inputNorm = normalizeName(this.formUser.hoten);
        const found = validUsers.find(
          (name) => normalizeName(name) === inputNorm,
        );

        if (!found) {
          this.error = "⚠️ Họ và tên chưa có trong danh sách !";
          return;
        }

        this.show = true;

        // 4️⃣ Gửi thông tin đăng ký lên server
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
        this.generateCaptcha();
        console.error("❌ Error submit:", err);

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

/* Khối Captcha */
.captcha-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}
.captcha-canvas {
  border: 1px solid #dcdde1;
  border-radius: 6px;
  user-select: none;
}
.btn-refresh {
  width: auto;
  padding: 8px 12px;
  margin: 0;
  background: #7f8c8d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
.btn-refresh:hover {
  background: #95a5a6;
}
.input-captcha {
  margin: 0;
  letter-spacing: 4px;
  font-weight: bold;
  text-align: center;
}

.btn-submit {
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
.btn-submit:hover {
  background: #27ae60;
}
.error {
  color: red;
  font-size: 14px;
  margin: 5px 0;
}
</style>
