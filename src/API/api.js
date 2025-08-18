import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const getChatHistory = async (sender, receiver) => {
  try {
    const res = await api.get(`/chat/history/`, {
      params: { sender, receiver },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

export const sendChatMessage = async (sender, receiver, content) => {
  try {
    const res = await api.post(`/chat/send/`, { sender, receiver, content });
    return res.data;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};

export default api;
