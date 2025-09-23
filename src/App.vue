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
    return { examStarted: false, timed: 0, user: null };
  },
  computed: {
    initials() {
      if (!this.user) return "";
      return this.user.name
        .split(" ")
        .map((n) => n[0].toUpperCase())
        .join("")
        .slice(1, 2); // Lấy 2 ký tự đầu
    },
  },
  methods: {
    startExam() {
      this.examStarted = true;
      if (this.$refs.quiz) this.$refs.quiz.startQuiz();
    },
    startTimer() {
      if (this.$refs.timer) {
        this.$refs.timer.start(); // gọi start() trong Timer
      }
    },
    autoFinish() {
      if (this.$refs.quiz) this.$refs.quiz.finishQuiz();
    },
    handleQuizFinished(payload) {
      // dừng timer
      if (this.$refs.timer) this.$refs.timer.stop();
      console.log("Kết quả:", payload);
      console.log(this.timed);
    },
    // nhận thời gian từ component con
    receiveTimefromtimer(time) {
      this.timed = time;
    },
    onLogin(u) {
      this.user = u;
    },
  },
};
</script>

<template>
  <div class="main">
    <div class="header-VKS">
      <Header></Header>
    </div>
    <LoginForm v-if="!user" @login="onLogin" />
    <div v-else class="base-VKS">
      <div class="base-header">
        <h3 class="base-header-text">PHẦN MỀM TRẢ LỜI CÂU HỎI VKS</h3>
      </div>
      <div class="base-question">
        <div class="timer-question">
          <Timer
            ref="timer"
            :duration="1200"
            @send-time="receiveTimefromtimer"
            @start="startExam"
            @timeup="autoFinish"
            @quiz-ready="startTimer"
          />
        </div>
        <div class="list-question">
          <listQuestion
            v-if="examStarted"
            ref="quiz"
            @finished="handleQuizFinished"
            :timeValue="timed"
            :user="user"
          />
        </div>
      </div>
      <!-- Hộp thông tin nhỏ góc phải -->
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

    <div class="footer-VKS">
      <Footer></Footer>
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
/* User box sinh động */
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

/* Avatar tròn */
.avatar img {
  width: 40px;
  height: 40px;
  background: white;
  color: #2575fc;
  font-weight: bold;
  font-size: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Thông tin */
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
</style>
