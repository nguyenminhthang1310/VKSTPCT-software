import axios from "axios";
const API_URL = "https://vkstpct-databasequestion.onrender.com/users"; // đổi theo backend của bạn
const token = import.meta.env.VITE_API_TOKEN;

// Hàm update user
export const updateUser = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi update user:", error);
    throw error.response?.data || { message: error.message };
  }
};

// 🟢 Lấy toàn bộ user
export const getAllUsers = async () => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi getAllUsers:", error);
    throw error.response?.data || { message: error.message };
  }
};

// Hàm tạo user mới
export const createUser = async (data) => {
  try {
    const res = await axios.post(API_URL, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi create user:", error);
    throw error.response?.data || { message: error.message };
  }
};
