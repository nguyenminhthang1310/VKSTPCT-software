<template>
  <div class="quiz-container no-copy" v-if="!finished && questions.length">
    <h2>Câu hỏi {{ currentIndex + 1 }}/{{ questions.length }}</h2>
    <p class="question">{{ currentQuestion?.cauhoi }}</p>

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

  <div v-else-if="finished" class="result">
    <h2>Kết quả bài thi</h2>
    <p>⏰ Thời gian làm: {{ elapsedTime }}</p>
    <p>🎯 Số câu đúng: {{ score }}/{{ questions.length }}</p>
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
      isloading: false,
      questions: [],
      currentIndex: 0,
      answers: [],
      finished: false,
      score: 0,
      elapsedTime: "",
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex];
    },
  },
  methods: {
    // 🔹 Gọi từ bên ngoài khi user nhấn "Bắt đầu làm bài"
    async getQuestions() {
      try {
        this.isloading = true;
        const res = await fetchQuestions();
        this.questions = res;
        this.answers = new Array(this.questions.length).fill(null);
        this.$emit("quiz-ready");
        this.isloading = false;
      } catch (err) {
        this.isloading = true;
        console.error("❌ Lỗi khi lấy câu hỏi:", err);
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
          (ans, i) => ans === this.questions[i]?.dapan
        ).length;

        // Format thời gian
        const totalSeconds = this.timeValue;
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        this.elapsedTime = `${String(hrs).padStart(2, "0")}:${String(
          mins
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
          const userChoiceIndex = this.answers[i];
          const userChoice =
            userChoiceIndex !== undefined ? q.traloi[userChoiceIndex] : "";

          return {
            cauhoi: String(q.cauhoi),
            dapanchon: String(userChoice || ""),
            dapan_dung: String(q.traloi[q.dapan] || ""),
          };
        });

        const payload = {
          user_id: String(stored),
          diem: this.score,
          thoigianlambai: this.elapsedTime,
          answers: submissionAnswers,
        };

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
