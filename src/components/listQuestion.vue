<template>
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
        >
          Hệ thống thư điện tử công vụ
        </a>
        <a
          v-else-if="part.type === 'link2'"
          :href="part.url"
          target="_blank"
          rel="noopener noreferrer"
          class="question-link"
        >
          Hệ thống quản lý văn bản
        </a>
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
    <div v-if="currentIndex < 2" class="tinhhuong">
      <textarea
        class="answer-box"
        :id="'answer-' + currentIndex"
        :name="'answer-' + currentIndex"
        rows="8"
        cols="60"
        placeholder="Nhập câu trả lời của bạn tại đây..."
        v-model="traloitinhhuong[currentIndex]"
      ></textarea>
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
  <div v-else-if="finished" class="result">
    <h2>Kết quả bài thi</h2>
    <p>⏰ Thời gian làm: {{ elapsedTime }}</p>
    <p>🎯 Số câu đúng: {{ score }}/{{ questions.length - 2 }}</p>
    <!-- -1 tình huống -->
    <button class="btn btn-danger" @click="logout">Thoát</button>
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
  },
  components: { LoadingOverlay },
  emits: ["quiz-ready", "finished"],
  data() {
    return {
      finished: false, // đặt true khi nộp bài thi
      isloading: false,
      questions: [],
      currentIndex: 0,
      answers: [],
      finished: false,
      score: 0,
      elapsedTime: "",
      traloitinhhuong: ["", ""],
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex];
    },
  },
  methods: {
    formatQuestion(text) {
      if (!text) return [];

      const result = [];

      // Nhận diện cả $link1(...) và $link2(...)
      const regex = /\$(link1|link2)\((.*?)\)/g;

      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Text trước link
        if (match.index > lastIndex) {
          result.push({
            type: "text",
            text: text.substring(lastIndex, match.index),
          });
        }

        // Link
        result.push({
          type: match[1], // link1 hoặc link2
          url: match[2],
        });

        lastIndex = regex.lastIndex;
      }

      // Text còn lại
      if (lastIndex < text.length) {
        result.push({
          type: "text",
          text: text.substring(lastIndex),
        });
      }

      return result;
    },
    logout() {
      if (confirm("Bạn có chắc chắn muốn thoát không?")) {
        window.location.reload();
      }
    },
    // 🔹 Gọi từ bên ngoài khi user nhấn "Bắt đầu làm bài"
    async getQuestions() {
      try {
        this.isloading = true;

        const res = await fetchQuestions();

        console.log("========== DEBUG ==========");
        console.log("Dữ liệu nhận được:", res);
        console.log("Có phải mảng không:", Array.isArray(res));
        console.log("Số câu nhận được:", res?.length);
        console.log("===========================");

        this.questions = Array.isArray(res) ? res : res.data;

        console.log("Số câu trong this.questions:", this.questions.length);

        this.answers = new Array(this.questions.length).fill(null);

        this.traloitinhhuong = ["", ""];

        this.currentIndex = 0;
        this.finished = false;
        this.score = 0;

        this.$emit("quiz-ready");
      } catch (err) {
        console.error("❌ Lỗi khi lấy câu hỏi:", err);
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
      if (confirm("Bạn có chắn chắn hoàn thành bài thì không ?")) {
        this.finished = true;

        // Tính điểm
        this.score = this.answers.filter(
          (ans, i) => ans === this.questions[i]?.dapan,
        ).length;

        // Format thời gian
        const totalSeconds = this.timeValue;
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        this.elapsedTime = `${String(hrs).padStart(2, "0")}:${String(
          mins,
        ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        // Gửi dữ liệu về component cha
        this.$emit("finished", {
          elapsedTime: this.elapsedTime,
          score: this.score,
        });

        // Cập nhật user nếu có userId
        await this.updateUserInfo();
        await this.saveSubmission();
      }
    },

    async updateUserInfo() {
      try {
        const stored = JSON.parse(localStorage.getItem("currentUserId"));
        if (!stored) return;
        const obj = {
          thoigianlambai: this.elapsedTime,
          traloidung: this.score,
        };
        await updateUser(stored, obj);
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật user:", err);
      }
    },

    async saveSubmission() {
      try {
        const stored = JSON.parse(localStorage.getItem("currentUserId"));
        if (!stored) return;

        const submissionAnswers = this.questions.map((q, i) => {
          const userAnswer = this.answers[i];

          // 2 câu đầu là tình huống "đã xử lý câu hỏi trách nghiệm"
          const isTinhHuong = i < 2;

          if (isTinhHuong) {
            return {
              cauhoi: String(q.cauhoi),
              dapanchon: this.traloitinhhuong[i],
              dapan_dung: this.traloitinhhuong[i],
            };
          }

          // Câu trắc nghiệm bình thường
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
          user_id: String(stored),
          diem: this.score, // tình huống
          thoigianlambai: this.elapsedTime,
          answers: submissionAnswers,
        };

        console.log("Payload:", payload);

        await createSubmission(payload);
      } catch (err) {
        console.error("❌ Lỗi lưu bài:", err);
      }
    },

    // 🔹 Reset khi bắt đầu lại
    startQuiz() {
      this.finished = false;
      this.answers = new Array(this.questions.length).fill(null);
      this.currentIndex = 0;
      this.score = 0;
    },
    handleBeforeUnload(event) {
      if (!this.finished) {
        // Tính điểm
        this.score = this.answers.filter(
          (ans, i) => i >= 2 && ans === this.questions[i]?.dapan,
        ).length;

        // Format thời gian
        const totalSeconds = this.timeValue;
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        this.elapsedTime = `${String(hrs).padStart(2, "0")}:${String(
          mins,
        ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        const stored = JSON.parse(localStorage.getItem("currentUserId"));
        const obj = {
          thoigianlambai: this.elapsedTime + ` RELOAD`,
          traloidung: this.score,
        };
        updateUser(stored, obj);
        this.saveSubmission();
        event.preventDefault();
        // Chrome/Edge/Firefox sẽ chỉ hiện cảnh báo mặc định, không cho custom text
        event.returnValue = "Cảnh báo bài thi sẽ không được luôn!";
      }
    },
  },
  mounted() {
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
};
</script>

<style scoped>
.no-copy {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
.quiz-container {
  margin-bottom: 20px;
  text-align: center;
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
}
/* tinh huong */
.answer-box {
  width: 100%;
  min-height: 180px;
  padding: 16px 18px;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.answer-box::placeholder {
  color: #999;
}

.answer-box:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

.answer-box:hover {
  border-color: #b8c4d6;
}
/* link */
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
