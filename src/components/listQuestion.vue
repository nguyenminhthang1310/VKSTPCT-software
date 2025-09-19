<template>
  <div class="quiz-container no-copy" v-if="!finished">
    <h2>Câu hỏi {{ currentIndex + 1 }}/{{ questions.length }}</h2>
    <p class="question">{{ currentQuestion?.cauhoi }}</p>
    <div class="options">
      <button
        v-for="(opt, i) in currentQuestion?.traloi"
        :key="i"
        :class="['option-btn', { selected: answers[currentIndex] === i }]"
        @click="selectAnswer(i)"
      >
        {{ opt }}
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

  <div v-else class="result">
    <h2>Kết quả bài thi</h2>
    <p>⏰ Thời gian làm: {{ elapsedTime }}</p>
    <p>🎯 Số câu đúng: {{ score }}/{{ questions.length }}</p>
  </div>
  <LoadingOverlay :show="loading"> </LoadingOverlay>
</template>

<script>
import { updateUser } from "@/services/Userservice";
import { fetchQuestions } from "@/services/Questionservice";
import LoadingOverlay from "./LoadingOverlay.vue";

export default {
  name: "QuizComponent",
  emits: ["finished"],
  data() {
    return {
      questions: [],
      currentIndex: 0,
      answers: [],
      finished: false,
      score: 0,
      startTime: null,
      elapsedTime: "",
      loading: false,
    };
  },
  components: { LoadingOverlay },
  props: { timeValue: Number, user: Object },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex];
    },
  },
  methods: {
    async getQuestions() {
      try {
        this.loading = true;
        const res = await fetchQuestions(); // ✅ gọi service
        this.questions = res;
        this.loading = false;
      } catch (err) {
        console.error("Lỗi khi lấy câu hỏi:", err);
        this.loading = true;
      }
    },
    selectAnswer(i) {
      this.answers[this.currentIndex] = i; // Vue 3
      //   this.nextQuestion();
    },
    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
    },
    prevQuestion() {
      if (this.currentIndex > 0) this.currentIndex--;
    },
    async updatedUser(obj) {
      try {
        // ✅ gọi API cập nhật user
        const stored = JSON.parse(localStorage.getItem("currentUserId"));
        console.log(stored);
        const updated = await updateUser(stored, obj);
        console.log("Cập nhật thành công:", updated);
      } catch (err) {
        console.error("Lỗi khi cập nhật:", err);
      }
    },
    finishQuiz() {
      this.finished = true;
      this.score = this.answers.filter(
        (ans, i) => ans === this.questions[i].dapan
      ).length;
      const totalSeconds = this.timeValue;
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      // format về 2 chữ số
      const h = String(hrs).padStart(2, "0");
      const m = String(mins).padStart(2, "0");
      const s = String(secs).padStart(2, "0");
      this.elapsedTime = `${h}:${m}:${s}`;
      // 🚀 Báo lên ExamApp
      this.$emit("finished", {
        elapsedTime: this.timeValue,
        score: this.score,
        time: this.timeValue, // kết quả làm bài
      });
      const objFinish = {
        thoigianlambai: this.elapsedTime,
        traloidung: this.score,
      };
      console.log(objFinish);
      this.updatedUser(objFinish);
    },
    startQuiz() {
      this.finished = false;
      this.answers = [];
      this.currentIndex = 0;
      this.score = 0;
      this.startTime = Date.now();
    },
  },
  mounted() {
    this.getQuestions();
  },
};
</script>

<style scoped>
.no-copy {
  user-select: none; /* Không cho chọn text */
  -webkit-user-select: none;
  -ms-user-select: none;
}
.quiz-container {
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
</style>
