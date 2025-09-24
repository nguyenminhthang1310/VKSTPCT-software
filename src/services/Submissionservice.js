import axios from "axios";

const API_URL = "https://vkstpct-databasequestion.onrender.com/submission"; // đổi theo backend của bạn
const token = import.meta.env.VITE_API_TOKEN;

// Hàm GET - lấy tất cả submission
export async function fetchSubmission() {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`, // 👈 header
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Lấy danh sách submission:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi fetchSubmission:", err);
    throw err;
  }
}

// Hàm POST - tạo submission mới
export async function createSubmission(payload) {
  try {
    console.log("📤 Gửi submission:", payload);

    const res = await axios.post(API_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // 👈 header
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Submission đã lưu:", res.data);
    return res.data;
  } catch (err) {
    console.error(
      "❌ Lỗi createSubmission:",
      err.response?.data || err.message
    );
    throw err;
  }
}
