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
        @click="start"
        :disabled="running"
        class="btn btn-green"
      >
        ▶ Bắt đầu làm bài
      </button>
    </div>

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
    duration: { type: Number, default: 1800 }, // mặc định 30 phút
  },
  data() {
    return {
      showStart: true,
      timeLeft: this.duration,
      timer: null,
      running: false,
      showPopup: false,
      timeAnswer: 0,
      circumference: 2 * Math.PI * 54, // chu vi vòng tròn
    };
  },
  computed: {
    formattedTime() {
      const h = String(Math.floor(this.timeLeft / 3600)).padStart(2, "0");
      const m = String(Math.floor((this.timeLeft % 3600) / 60)).padStart(
        2,
        "0"
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
  methods: {
    start() {
      this.showStart = false;
      if (this.running) return;
      this.running = true;
      this.$emit("start");
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
    pause() {
      this.stop();
    },
    reset() {
      this.stop();
      this.timeLeft = this.duration;
      this.showPopup = false;
    },
    stop() {
      clearInterval(this.timer);
      this.timer = null;
      this.running = false;
    },
  },
  beforeUnmount() {
    this.stop();
  },
};
</script>

<style scoped>
.timer {
  text-align: center;
}

/* Đồng hồ tròn */
.circle {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
}
svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* cho bắt đầu từ trên */
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

/* Nút */
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
.btn-green {
  background: #2ecc71;
}
.btn-gray {
  background: #95a5a6;
}
.btn-red {
  background: #e74c3c;
}

/* Popup */
.popup {
  margin-top: 10px;
  background: #ffeaa7;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
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
