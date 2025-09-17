import axios from "axios";
const API_URL = "http://localhost:3000/users"; // đổi theo backend của bạn

// Hàm update user
export const updateUser = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
// POST user mới
export const createUser = async (data) => {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
