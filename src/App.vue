<script>
import Header from "./components/header.vue";
import Timer from "./components/timer.vue";
import ListQuestion from "./components/listQuestion.vue";
import Footer from "./components/footer.vue";
import LoginForm from "./components/loginForm.vue";

export default {
  name: "ExamApp",
  components: { Header, Timer, ListQuestion, LoginForm, Footer },
  data() {
    return {
      examStarted: false,
      timed: 0, // Thời gian đã làm bài
      user: null,
      questionsLoaded: false,
    };
  },
  methods: {
    // Khi user nhấn nút "Bắt đầu làm bài"
    async startExam() {
      this.examStarted = true;
      this.questionsLoaded = false;

      this.$nextTick(async () => {
        if (this.$refs.quiz) {
          await this.$refs.quiz.getQuestions();
        }
      });
    },
    // Khi câu hỏi đã load xong từ QuizComponent
    startTimer() {
      this.questionsLoaded = true;

      if (this.$refs.quiz) {
        this.$refs.quiz.startQuiz(); // reset lại trạng thái quiz
      }

      if (this.$refs.timer) {
        this.$refs.timer.start(); // Bắt đầu tính giờ
      }
    },

    // Nhận thời gian làm bài từ Timer (mỗi giây)
    receiveTimefromtimer(time) {
      this.timed = time;
    },

    // Khi hết giờ thì tự nộp bài
    autoFinish() {
      if (this.$refs.quiz) {
        this.$refs.quiz.finishQuiz();
      }
    },

    // Khi người dùng hoàn thành bài thi (thủ công hoặc tự động)
    handleQuizFinished(payload) {
      if (this.$refs.timer) {
        this.$refs.timer.stop(); // Dừng đồng hồ
      }

      console.log("🎯 Kết quả bài thi:", payload);
      console.log("⏱️ Thời gian làm bài (giây):", this.timed);
    },

    // Khi đăng nhập xong
    onLogin(user) {
      this.user = user;
    },
  },
};
</script>

<template>
  <div class="main">
    <!-- HEADER -->
    <div class="header-VKS">
      <Header />
    </div>

    <!-- LOGIN FORM -->
    <LoginForm v-if="!user" @login="onLogin" />

    <!-- EXAM INTERFACE -->
    <div v-else class="base-VKS">
      <div class="base-header">
        <h3 class="base-header-text">PHẦN MỀM TRẢ LỜI CÂU HỎI VKS</h3>
      </div>

      <div class="base-question">
        <!-- TIMER -->
        <div class="timer-question">
          <Timer
            ref="timer"
            :duration="1200"
            @send-time="receiveTimefromtimer"
            @start="startExam"
            @timeup="autoFinish"
          />
        </div>

        <!-- QUIZ -->
        <div class="list-question">
          <ListQuestion
            v-if="examStarted"
            ref="quiz"
            :user="user"
            :timeValue="timed"
            @quiz-ready="startTimer"
            @finished="handleQuizFinished"
          />
        </div>
      </div>

      <!-- USER INFO BOX -->
      <div class="user-box">
        <div class="avatar">
          <img src="../public/img/avatarKS.jpg" alt="avatar" />
        </div>
        <div class="info">
          <p class="name">{{ user.name }}</p>
          <p class="id">🎟️ {{ user.id }}</p>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer-VKS">
      <Footer />
    </div>
  </div>
</template>

<style scoped>
.base-header {
  margin: 12px;
  min-height: 100%;
}
.base-VKS {
  position: relative;
  height: 100%;
  flex: 1;
}

.base-header-text {
  text-align: center;
}

/* User box */
.user-box {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.user-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
}
.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.info {
  text-align: left;
}
.name {
  font-weight: bold;
  margin: 0;
  font-size: 14px;
}
.id {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}
.footer-VKS {
  margin-top: 20px;
}
</style>
