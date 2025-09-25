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

  <LoadingOverlay :show="loading" />
</template>

<script>
import { updateUser } from "@/services/Userservice";
import { fetchQuestions } from "@/services/Questionservice";
import { createSubmission } from "@/services/Submissionservice";
import LoadingOverlay from "./LoadingOverlay.vue";

export default {
  name: "QuizComponent",
  emits: ["finished", "quiz-ready"],
  data() {
    return {
      questions: [],
      currentIndex: 0,
      answers: [], // lưu index đáp án mà user chọn
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
    // 🔹 Lấy danh sách câu hỏi
    async getQuestions() {
      try {
        this.loading = true;
        const res = await fetchQuestions();
        this.questions = res;
        // console.log("📥 Questions loaded:", this.questions);
        this.$emit("quiz-ready");
        this.loading = false;
      } catch (err) {
        console.error("❌ Lỗi khi lấy câu hỏi:", err);
      }
    },

    // 🔹 Chọn đáp án
    selectAnswer(i) {
      this.answers[this.currentIndex] = i;
      // console.log(`👉 Câu ${this.currentIndex + 1} chọn đáp án:`, i);
    },

    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
    },
    prevQuestion() {
      if (this.currentIndex > 0) this.currentIndex--;
    },

    // 🔹 Cập nhật thông tin User (thoigianlambai, traloidung)
    async updatedUser(obj) {
      try {
        const stored = JSON.parse(localStorage.getItem("currentUserId"));
        if (!stored) {
          console.error("⚠ Không tìm thấy user_id trong localStorage");
          return;
        }
        // console.log("📤 Cập nhật User:", stored, obj);
        const updated = await updateUser(stored, obj);
        // console.log("✅ User updated:", updated);
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật User:", err);
      }
    },

    // 🔹 Lưu submission chi tiết (ép string cho dapanchon & dapan_dung)
    async saveSubmission() {
      try {
        const stored = JSON.parse(localStorage.getItem("currentUserId"));
        if (!stored) {
          console.error("⚠ Không tìm thấy user_id trong localStorage");
          return;
        }

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
          thoigianlambai: String(this.elapsedTime),
          answers: submissionAnswers,
        };

        // console.log("📤 Payload chuẩn bị gửi Submission:", JSON.stringify(payload, null, 2));

        const res = await createSubmission(payload);
        // console.log("✅ Submission saved:", res);
      } catch (err) {
        console.error("❌ Lỗi lưu Submission:", err);
      }
    },

    // 🔹 Kết thúc bài thi
    async finishQuiz() {
      this.finished = true;

      // Tính điểm
      this.score = this.answers.filter(
        (ans, i) => ans === this.questions[i].dapan
      ).length;

      // Format thời gian
      const totalSeconds = this.timeValue;
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      this.elapsedTime = `${String(hrs).padStart(2, "0")}:${String(
        mins
      ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      // console.log("🎯 Kết quả:", {
      //   score: this.score,
      //   elapsedTime: this.elapsedTime,
      //   rawTime: this.timeValue,
      // });

      // Báo kết quả lên App cha
      this.$emit("finished", {
        elapsedTime: this.timeValue,
        score: this.score,
        time: this.timeValue,
      });

      // Cập nhật User
      const objFinish = {
        thoigianlambai: this.elapsedTime,
        traloidung: this.score,
      };
      this.updatedUser(objFinish);

      // Lưu Submission chi tiết
      await this.saveSubmission();
    },

    // 🔹 Reset quiz
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
