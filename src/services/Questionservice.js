import axios from "axios";
const API_URL = "http://localhost:3000/questions"; // đổi theo backend của bạn

// Hàm lấy bộ câu hỏi
export async function fetchQuestions() {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy câu hỏi:", err);
    throw err;
  }
}
