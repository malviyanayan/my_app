import axios from 'axios';

const API_URL = 'http://localhost:3000/api/chat';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all conversations (for admin)
export const getConversations = async () => {
  try {
    const response = await axios.get(`${API_URL}/conversations`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get messages with a specific user
export const getMessages = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/messages/${userId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send message (REST API fallback)
export const sendMessage = async (receiverId, message) => {
  try {
    const response = await axios.post(
      `${API_URL}/send`,
      { receiverId, message },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/unread-count`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Get admin user
export const getAdmin = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw error;
  }
};
