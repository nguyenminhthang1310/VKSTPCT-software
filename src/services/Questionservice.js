import axios from "axios";
const API_URL = "https://vkstpct-databasequestion.onrender.com/questions"; // đổi theo backend của bạn

// Hàm lấy bộ câu hỏi
export async function fetchQuestions() {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`, // 👈 header thêm ở đây
        "Content-Type": "application/json", // (nếu cần)
      },
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy câu hỏi:", err);
    throw err;
  }
}
