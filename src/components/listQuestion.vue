<template>
  <!-- 🛑 MÀN HÌNH CHẶN KHI RỚT MẠNG 🛑 -->
  <div v-if="!isOnline" class="overlay-blocker offline-bg">
    <div class="alert-box">
      <h2>⚠️ LỖI KẾT NỐI MẠNG</h2>
      <p>Bạn đã bị mất kết nối Internet.</p>
      <p>Vui lòng giữ nguyên màn hình và liên hệ <b>bộ phận CNTT</b>.</p>
      <p class="warning-text">KHÔNG ĐƯỢC TẮT TRÌNH DUYỆT ĐỂ TRÁNH MẤT BÀI.</p>
    </div>
  </div>

  <!-- 🛑 MÀN HÌNH CẢNH BÁO GIAN LẬN 🛑 -->
  <div v-if="showCheatWarning" class="overlay-blocker cheat-bg">
    <div class="alert-box">
      <h2 style="color: #c0392b">⚠️ CẢNH BÁO VI PHẠM NỘI QUY!</h2>
      <p style="font-size: 18px; font-weight: bold">{{ cheatMessage }}</p>
      <p>
        Số lần vi phạm: <b>{{ cheatCount }} / {{ maxCheats }}</b>
      </p>
      <p class="warning-text">
        Nếu vi phạm quá {{ maxCheats }} lần, bài thi sẽ tự động nộp.
      </p>
      <button class="btn btn-primary" @click="acknowledgeWarning">
        Tôi đã hiểu và cam kết không tái phạm
      </button>
    </div>
  </div>

  <!-- 📝 KHU VỰC THI -->
  <div class="quiz-container no-copy" v-if="!finished && questions.length">
    <h2>Câu hỏi {{ currentIndex + 1 }}/{{ questions.length }}</h2>
    <p class="question">
      <template
        v-for="(part, index) in formatQuestion(currentQuestion?.cauhoi)"
        :key="index"
      >
        <a
          v-if="part.type === 'link1'"
          :href="part.url"
          target="_blank"
          rel="noopener noreferrer"
          class="question-link"
          >Hệ thống thư điện tử công vụ</a
        >
        <a
          v-else-if="part.type === 'link2'"
          :href="part.url"
          target="_blank"
          rel="noopener noreferrer"
          class="question-link"
          >Hệ thống quản lý văn bản</a
        >
        <span v-else>{{ part.text }}</span>
      </template>
    </p>

    <div class="options">
      <button
        v-for="(opt, i) in currentQuestion?.traloi"
        :key="i"
        :class="['option-btn', { selected: answers[currentIndex] === i }]"
        @click="selectAnswer(i)"
      >
        {{ String.fromCharCode(65 + i) }}. {{ opt }}
      </button>
    </div>

    <div class="controls">
      <button @click="prevQuestion" :disabled="currentIndex === 0">
        ⬅ Trước
      </button>
      <button
        @click="nextQuestion"
        :disabled="currentIndex === questions.length - 1"
      >
        Tiếp ➡
      </button>
      <button @click="finishQuiz" class="btn-finish">✅ Hoàn thành</button>
    </div>
  </div>

  <!-- 🏁 KHU VỰC KẾT QUẢ -->
  <div v-else-if="finished" class="result">
    <h2>Kết quả bài thi</h2>
    <p>⏰ Thời gian làm: {{ elapsedTime }}</p>
    <p>🎯 Số câu đúng: {{ score }}/{{ questions.length }}</p>

    <!-- Cảnh báo bị nộp do vi phạm -->
    <p
      v-if="forceSubmitted"
      style="color: #c0392b; font-weight: bold; font-size: 18px"
    >
      🚫 BÀI THI BỊ NỘP SỚM DO VI PHẠM NỘI QUY QUÁ {{ maxCheats }} LẦN!
    </p>

    <div v-if="isOfflineError" class="offline-warning">
      <h3>⚠️ BÀI THI CHƯA ĐƯỢC ĐẨY LÊN HỆ THỐNG!</h3>
      <p>DO GẶP SỰ CỐ INTERNET</p>
      <p><b>KHÔNG TẮT MÁY HAY TẮT TRÌNH DUYỆT.</b></p>
      <p>
        Vui lòng gọi ngay cho <b>bộ phận CNTT</b> để được hỗ trợ đồng bộ kết
        quả.
      </p>
    </div>

    <button
      class="btn btn-danger"
      @click="logout"
      :disabled="isOfflineError"
      :class="{ 'btn-disabled': isOfflineError }"
    >
      Thoát
    </button>
  </div>

  <LoadingOverlay :show="isloading"></LoadingOverlay>
</template>

<script>
import { updateUser } from "@/services/Userservice";
import { fetchQuestions } from "@/services/Questionservice";
import { createSubmission } from "@/services/Submissionservice";
import LoadingOverlay from "./LoadingOverlay.vue";

export default {
  name: "QuizComponent",
  props: {
    timeValue: Number,
    user: Object,
    enableAntiCheat: {
      type: Boolean,
      default: false,
    },
  },
  components: { LoadingOverlay },
  emits: ["quiz-ready", "finished", "pause-timer", "resume-timer", "logout"],
  data() {
    return {
      isOnline: navigator.onLine,
      finished: false,
      isloading: false,
      isOfflineError: false,
      questions: [],
      currentIndex: 0,
      answers: [],
      score: 0,
      elapsedTime: "",

      // Biến chống gian lận
      cheatCount: 0,
      maxCheats: 5,
      showCheatWarning: false,
      cheatMessage: "",
      forceSubmitted: false,
      cheatHistory: [],
      isConfirming: false,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex];
    },
  },
  methods: {
    /* ==== 🚨 HỆ THỐNG CHỐNG GIAN LẬN 🚨 ==== */
    getCheatSummary() {
      if (this.cheatCount === 0 || !this.enableAntiCheat) return "";
      const uniqueReasons = [...new Set(this.cheatHistory)];
      return ` (Gian lận ${this.cheatCount} lần: ${uniqueReasons.join(" | ")})`;
    },

    async saveCheatCountToDB() {
      const userId = this.getUserId();
      if (!userId || !this.enableAntiCheat) return;
      try {
        await updateUser(String(userId), { solanvipham: this.cheatCount });
      } catch (e) {
        console.error("Lỗi khi đồng bộ số lần vi phạm lên server:", e);
      }
    },

    async triggerCheatAction(reason) {
      if (!this.enableAntiCheat) return;
      if (this.finished || this.showCheatWarning || this.isConfirming) return;

      this.cheatCount++;
      this.cheatMessage = reason;
      this.cheatHistory.push(reason);

      this.saveCheatCountToDB();

      if (this.cheatCount >= this.maxCheats) {
        alert("🚨 BẠN ĐÃ VI PHẠM QUÁ SỐ LẦN CHO PHÉP! BÀI THI SẼ TỰ ĐỘNG NỘP.");
        this.forceSubmitQuiz();
      } else {
        this.showCheatWarning = true;
        this.$emit("pause-timer");
      }
    },

    acknowledgeWarning() {
      this.showCheatWarning = false;
      if (this.isOnline) {
        this.$emit("resume-timer");
      }
    },

    handleVisibilityChange() {
      if (!this.enableAntiCheat || this.finished || this.isConfirming) return;
      if (document.hidden) {
        this.triggerCheatAction(
          "Bạn vừa chuyển tab, thu nhỏ trình duyệt hoặc mở ứng dụng khác",
        );
      }
    },

    handleWindowBlur() {
      if (!this.enableAntiCheat || this.finished || this.isConfirming) return;
      setTimeout(() => {
        if (!document.hidden && !document.hasFocus()) {
          this.triggerCheatAction(
            "Hành vi đáng ngờ: Bấm chuột ra ngoài vùng thi hoặc mở ứng dụng khác",
          );
        }
      }, 1000);
    },

    handleKeyboardShortcuts(e) {
      if (!this.enableAntiCheat || this.finished || this.isConfirming) return;

      if (
        e.metaKey &&
        e.shiftKey &&
        ["3", "4", "5", "s", "S"].includes(e.key)
      ) {
        e.preventDefault();
        this.triggerCheatAction("Hành động chụp màn hình bị nghiêm cấm");
        this.clearClipboard();
      }

      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key.toLowerCase() === "i" || e.key.toLowerCase() === "c")) ||
        (e.ctrlKey && e.key.toLowerCase() === "u")
      ) {
        e.preventDefault();
        this.triggerCheatAction(
          "Không được phép mở công cụ dành cho nhà phát triển",
        );
      }
    },

    handleKeyUp(e) {
      if (!this.enableAntiCheat || this.finished || this.isConfirming) return;
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        this.triggerCheatAction(
          "Hành động chụp màn hình bằng phím PrintScreen bị nghiêm cấm",
        );
        this.clearClipboard();
      }
    },

    preventCopyContext(e) {
      if (!this.enableAntiCheat || this.finished) return;
      e.preventDefault();
    },

    async clearClipboard() {
      if (!this.enableAntiCheat || this.finished) return;
      const warningText =
        "Hành vi chụp ảnh màn hình bài thi là vi phạm nội quy!";
      try {
        await navigator.clipboard.writeText(warningText);
      } catch (err) {
        const input = document.createElement("input");
        input.setAttribute("value", warningText);
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
    },

    /* ==== ⚙️ LOGIC CHÍNH BÀI THI & ĐỒNG BỘ MẠNG ⚙️ ==== */

    // HÀM MỚI: Gọi PUT API cập nhật user
    async updateUserInfo() {
      const userId = this.getUserId();
      if (!userId) return;

      const obj = {
        thoigianlambai: this.elapsedTime,
        traloidung: this.score,
      };

      if (this.enableAntiCheat) {
        obj.solanvipham = this.cheatCount;
      }

      try {
        await updateUser(String(userId), obj);
      } catch (e) {
        console.error("Lỗi cập nhật User Info:", e);
      }
    },

    async forceSubmitQuiz() {
      this.forceSubmitted = true;
      this.showCheatWarning = false;
      this.score = this.answers.filter(
        (ans, i) => ans === this.questions[i]?.dapan,
      ).length;

      this.elapsedTime =
        this.formatElapsedTime(this.timeValue) +
        " [NỘP DO VI PHẠM]" +
        this.getCheatSummary();

      this.isloading = true;

      // 1. Cập nhật User (Điểm số)
      await this.updateUserInfo();

      // 2. Lưu Submission (Đáp án chi tiết)
      const isSavedSuccessfully = await this.saveSubmission();

      this.isloading = false;
      this.finished = true;

      if (isSavedSuccessfully) {
        this.$emit("finished", {
          elapsedTime: this.elapsedTime,
          score: this.score,
        });
      } else {
        this.isOfflineError = true;
      }
    },

    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
      if (this.isOnline) {
        if (!this.showCheatWarning && !this.finished)
          this.$emit("resume-timer");
        this.syncOfflineData();
      } else {
        this.$emit("pause-timer");
      }
    },

    formatElapsedTime(totalSeconds) {
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    },

    getUserId() {
      let stored = localStorage.getItem("currentUserId");
      if (!stored || stored === "undefined" || stored === "null") return null;
      try {
        return JSON.parse(stored);
      } catch (e) {
        return stored;
      }
    },

    formatQuestion(text) {
      if (!text) return [];
      const result = [];
      const regex = /\$(link1|link2)\((.*?)\)/g;
      let lastIndex = 0,
        match;
      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          result.push({
            type: "text",
            text: text.substring(lastIndex, match.index),
          });
        }
        result.push({ type: match[1], url: match[2] });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < text.length)
        result.push({ type: "text", text: text.substring(lastIndex) });
      return result;
    },

    logout() {
      this.isConfirming = true;
      const ans = confirm("Bạn có chắc chắn muốn thoát không?");
      setTimeout(() => {
        this.isConfirming = false;
      }, 500);

      if (ans) {
        this.$emit("logout");
      }
      window.location.reload();
    },

    async getQuestions() {
      try {
        this.isloading = true;
        const res = await fetchQuestions();
        this.questions = Array.isArray(res) ? res : res.data;
        this.answers = new Array(this.questions.length).fill(null);
        this.currentIndex = 0;
        this.finished = false;
        this.isOfflineError = false;
        this.score = 0;

        this.cheatCount = 0;
        this.forceSubmitted = false;
        this.isConfirming = false;
        this.cheatHistory = [];

        this.$emit("quiz-ready");
      } catch (err) {
        console.error("❌ Lỗi lấy câu hỏi:", err);
      } finally {
        this.isloading = false;
      }
    },

    selectAnswer(i) {
      this.answers[this.currentIndex] = i;
    },
    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
    },
    prevQuestion() {
      if (this.currentIndex > 0) this.currentIndex--;
    },

    async finishQuiz() {
      this.isConfirming = true;
      const ans = confirm("Bạn có chắc chắn hoàn thành bài thi không?");
      setTimeout(() => {
        this.isConfirming = false;
      }, 500);

      if (ans) {
        this.score = this.answers.filter(
          (ans, i) => ans === this.questions[i]?.dapan,
        ).length;

        this.elapsedTime =
          this.formatElapsedTime(this.timeValue) + this.getCheatSummary();

        this.isloading = true;

        // 1. Cập nhật User (Điểm số)
        await this.updateUserInfo();

        // 2. Lưu Submission (Đáp án chi tiết)
        const isSavedSuccessfully = await this.saveSubmission();

        this.isloading = false;
        this.finished = true;

        if (isSavedSuccessfully) {
          this.$emit("finished", {
            elapsedTime: this.elapsedTime,
            score: this.score,
          });
        } else {
          this.isOfflineError = true;
          alert(
            "⚠️ LỖI KẾT NỐI MẠNG!\nKết quả thi đã được lưu tạm. Tuyệt đối không tắt trình duyệt và gọi CNTT.",
          );
        }
      }
    },

    async saveSubmission(syncPayload = null) {
      let payload = syncPayload;
      if (!payload) {
        const userId = this.getUserId();
        if (!userId) return false;

        const submissionAnswers = this.questions.map((q, i) => {
          const userAnswer = this.answers[i];
          const userChoice =
            userAnswer !== undefined && userAnswer !== null
              ? q.traloi[userAnswer]
              : "";
          return {
            cauhoi: String(q.cauhoi),
            dapanchon: String(userChoice || ""),
            dapan_dung: String(q.traloi[q.dapan] || ""),
          };
        });

        payload = {
          user_id: String(userId),
          diem: this.score,
          thoigianlambai: this.elapsedTime,
          answers: submissionAnswers,
        };

        if (this.enableAntiCheat) {
          payload.solanvipham = this.cheatCount;
        }
      }

      try {
        await createSubmission(payload);
        return true;
      } catch (err) {
        localStorage.setItem("offline_submission", JSON.stringify(payload));
        if (this.user) {
          const userName =
            this.user.hoten || this.user.name || this.user.ten || "";
          localStorage.setItem("offline_user_name", userName);
        }
        return false;
      }
    },

    async syncOfflineData() {
      const offlineData = localStorage.getItem("offline_submission");
      if (offlineData && navigator.onLine) {
        try {
          this.isloading = true;
          const payload = JSON.parse(offlineData);

          const success = await this.saveSubmission(payload);
          if (success) {
            // Nếu có mạng lại, phải cập nhật luôn điểm user bị lỗi chưa PUT được
            try {
              const userId = payload.user_id || this.getUserId();
              if (userId) {
                const updateObj = {
                  traloidung: payload.diem,
                  thoigianlambai: payload.thoigianlambai,
                };
                if (payload.solanvipham !== undefined) {
                  updateObj.solanvipham = payload.solanvipham;
                }
                await updateUser(String(userId), updateObj);
              }
            } catch (e) {
              console.error("Lỗi đồng bộ thông tin User Offline");
            }

            localStorage.removeItem("offline_submission");
            localStorage.removeItem("offline_user_name");
            this.isOfflineError = false;
            alert("✅ ĐÃ ĐỒNG BỘ THÀNH CÔNG BÀI THI LÊN HỆ THỐNG");
          }
        } catch (error) {
        } finally {
          this.isloading = false;
        }
      }
    },

    handleBeforeUnload(event) {
      if (!this.finished && this.questions.length > 0) {
        this.score = this.answers.filter(
          (ans, i) => ans === this.questions[i]?.dapan,
        ).length;

        this.elapsedTime =
          this.formatElapsedTime(this.timeValue) +
          ` [RELOAD]` +
          this.getCheatSummary();

        const userId = this.getUserId();
        if (userId) {
          const submissionAnswers = this.questions.map((q, i) => {
            const userAnswer = this.answers[i];
            const userChoice =
              userAnswer !== undefined && userAnswer !== null
                ? q.traloi[userAnswer]
                : "";
            return {
              cauhoi: String(q.cauhoi),
              dapanchon: String(userChoice || ""),
              dapan_dung: String(q.traloi[q.dapan] || ""),
            };
          });

          const payload = {
            user_id: String(userId),
            diem: this.score,
            thoigianlambai: this.elapsedTime,
            answers: submissionAnswers,
          };
          if (this.enableAntiCheat) {
            payload.solanvipham = this.cheatCount;
          }

          localStorage.setItem("offline_submission", JSON.stringify(payload));

          // Gửi một request PUT cập nhật thông tin user ngay lập tức trước khi tắt
          const updateData = {
            traloidung: this.score,
            thoigianlambai: this.elapsedTime,
          };
          if (this.enableAntiCheat) {
            updateData.solanvipham = this.cheatCount;
          }
          updateUser(String(userId), updateData).catch(() => {});

          if (this.user) {
            const userName =
              this.user.hoten || this.user.name || this.user.ten || "";
            localStorage.setItem("offline_user_name", userName);
          }
        }
        event.preventDefault();
        event.returnValue = "";
      }
    },
  },
  async mounted() {
    window.addEventListener("beforeunload", this.handleBeforeUnload);
    window.addEventListener("online", this.updateOnlineStatus);
    window.addEventListener("offline", this.updateOnlineStatus);

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("blur", this.handleWindowBlur);
    document.addEventListener("keydown", this.handleKeyboardShortcuts);
    document.addEventListener("contextmenu", this.preventCopyContext);
    document.addEventListener("copy", this.preventCopyContext);
    document.addEventListener("cut", this.preventCopyContext);
    document.addEventListener("paste", this.preventCopyContext);
    document.addEventListener("keyup", this.handleKeyUp);

    if (!this.isOnline) {
      this.$emit("pause-timer");
    }
    await this.syncOfflineData();
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    window.removeEventListener("online", this.updateOnlineStatus);
    window.removeEventListener("offline", this.updateOnlineStatus);

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    window.removeEventListener("blur", this.handleWindowBlur);
    document.removeEventListener("keydown", this.handleKeyboardShortcuts);
    document.removeEventListener("contextmenu", this.preventCopyContext);
    document.removeEventListener("copy", this.preventCopyContext);
    document.removeEventListener("cut", this.preventCopyContext);
    document.removeEventListener("paste", this.preventCopyContext);
    document.removeEventListener("keyup", this.handleKeyUp);
  },
};
</script>

<style scoped>
/* ========================================= */
/* 🛑 LỚP PHỦ CHUNG CHO POPUP (MẠNG + CHEAT) */
/* ========================================= */
.overlay-blocker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.offline-bg {
  background-color: rgba(0, 0, 0, 0.85);
}
.cheat-bg {
  background-color: rgba(231, 76, 60, 0.85);
}

.alert-box {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.offline-bg .alert-box {
  border: 3px solid #e74c3c;
  animation: pulse-border-red 1.5s infinite;
}

.cheat-bg .alert-box {
  border: 4px solid #c0392b;
}

.alert-box h2 {
  margin-top: 0;
  font-size: 24px;
}

.alert-box p {
  font-size: 16px;
  color: #333;
}

.warning-text {
  color: #c0392b !important;
  font-weight: bold;
  text-decoration: underline;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}
.btn-primary:hover {
  background-color: #2980b9;
}

/* ========================================= */
/* CÁC STYLE GỐC CỦA GIAO DIỆN BÀI THI       */
/* ========================================= */
.no-copy {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
.quiz-container {
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  z-index: 10;
}
.question {
  font-size: 20px;
  margin: 15px 0;
}
.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.option-btn {
  padding: 10px;
  border: 2px solid #3498db;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: 0.2s;
}
.option-btn:hover {
  background: #ecf0f1;
}
.option-btn.selected {
  background: #3498db;
  color: white;
}
.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
.controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #2ecc71;
  color: white;
  cursor: pointer;
  font-weight: bold;
}
.controls button:hover {
  background: #e67e22;
}
.controls button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
.btn-finish {
  background: #e67e22 !important;
}
.btn-finish:hover {
  background: #2ecc71 !important;
}
.result {
  text-align: center;
  padding: 20px;
  border: 2px solid #2ecc71;
  border-radius: 10px;
  position: relative;
  z-index: 10;
}
.btn-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}
.btn-danger:hover {
  background-color: #c0392b;
}
.btn-disabled {
  background-color: #95a5a6 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.offline-warning {
  background-color: #ffebee;
  color: #c62828;
  border: 2px solid #ef5350;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  text-align: center;
  animation: pulse-border-red 2s infinite;
}

@keyframes pulse-border-red {
  0% {
    border-color: #ef5350;
    box-shadow: 0 0 0 0 rgba(239, 83, 80, 0.4);
  }
  70% {
    border-color: #d32f2f;
    box-shadow: 0 0 0 10px rgba(239, 83, 80, 0);
  }
  100% {
    border-color: #ef5350;
    box-shadow: 0 0 0 0 rgba(239, 83, 80, 0);
  }
}

.question-link {
  color: #007bff;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
.question-link:hover {
  color: #0056b3;
}
</style>
