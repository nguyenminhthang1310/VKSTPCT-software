<template>
  <div class="timer">
    <!-- Vòng tròn countdown -->
    <div class="circle">
      <svg viewBox="0 0 120 120">
        <circle class="bg" cx="60" cy="60" r="54" />
        <circle
          class="progress"
          cx="60"
          cy="60"
          r="54"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="time-text">{{ formattedTime }}</div>
    </div>

    <!-- Nút bấm -->
    <div class="buttons">
      <button
        v-show="showStart"
        @click="startBtnClicked"
        :disabled="running"
        class="btn btn-green"
      >
        ▶ Bắt đầu làm bài
      </button>
    </div>

    <!-- Popup mất mạng -->
    <transition name="fade">
      <div v-if="isOffline" class="popup offline-popup">
        <p>⚠️ Mất kết nối! Đã tạm dừng thời gian.</p>
      </div>
    </transition>

    <!-- Popup hết giờ -->
    <transition name="fade">
      <div v-if="showPopup" class="popup">
        <p>⏰ Hết thời gian!</p>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "SimpleTimer",
  props: {
    duration: { type: Number, default: 1200 }, // 20 phút mặc định
  },
  data() {
    return {
      showStart: true,
      timeLeft: this.duration,
      timer: null,
      running: false,
      showPopup: false,
      timeAnswer: 0,
      circumference: 2 * Math.PI * 54,
      isOffline: !navigator.onLine, // Kiểm tra trạng thái mạng lúc khởi tạo
      wasRunningBeforeOffline: false, // Lưu trạng thái trước khi mất mạng
    };
  },
  computed: {
    formattedTime() {
      const h = String(Math.floor(this.timeLeft / 3600)).padStart(2, "0");
      const m = String(Math.floor((this.timeLeft % 3600) / 60)).padStart(
        2,
        "0",
      );
      const s = String(this.timeLeft % 60).padStart(2, "0");

      this.timeAnswer = this.duration - this.timeLeft;
      this.$emit("send-time", this.timeAnswer);

      return `${h}:${m}:${s}`;
    },
    dashOffset() {
      return (
        this.circumference -
        (this.timeLeft / this.duration) * this.circumference
      );
    },
  },
  mounted() {
    // Lắng nghe sự kiện thay đổi trạng thái mạng
    window.addEventListener("offline", this.handleOffline);
    window.addEventListener("online", this.handleOnline);
  },
  methods: {
    startBtnClicked() {
      if (this.isOffline) {
        alert("Vui lòng kiểm tra kết nối mạng trước khi bắt đầu!");
        return;
      }
      this.showStart = false;
      this.$emit("start");
      this.start();
    },
    start() {
      if (this.running) return;
      this.running = true;

      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.stop();
          this.showPopup = true;
          this.$emit("timeup");
        }
      }, 1000);
    },
    stop() {
      clearInterval(this.timer);
      this.timer = null;
      this.running = false;
    },
    reset() {
      this.stop();
      this.timeLeft = this.duration;
      this.showPopup = false;
      this.showStart = true;
      this.isOffline = !navigator.onLine;
      this.wasRunningBeforeOffline = false;
    },
    handleOffline() {
      this.isOffline = true;
      if (this.running) {
        this.wasRunningBeforeOffline = true;
        this.stop(); // Tạm dừng timer
      }
    },
    handleOnline() {
      this.isOffline = false;
      if (this.wasRunningBeforeOffline) {
        this.start(); // Tiếp tục timer
        this.wasRunningBeforeOffline = false;
      }
    },
  },
  beforeUnmount() {
    this.stop();
    // Xoá listener để tránh leak memory
    window.removeEventListener("offline", this.handleOffline);
    window.removeEventListener("online", this.handleOnline);
  },
};
</script>

<style scoped>
.timer {
  text-align: center;
}
.circle {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
}
svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
circle {
  fill: none;
  stroke-width: 10;
}
.bg {
  stroke: #ddd;
}
.progress {
  stroke: #2ecc71;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}
.time-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
  font-family: monospace;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}
button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  color: #fff;
}
button:hover {
  background: #e74c3c;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-green {
  background: #2ecc71;
}
.popup {
  margin-top: 10px;
  background: #ffeaa7;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
}
.offline-popup {
  background: #ff7675;
  color: white;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
