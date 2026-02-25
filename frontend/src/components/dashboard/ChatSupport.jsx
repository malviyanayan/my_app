import { useState, useEffect, useRef, useCallback } from "react";
import { FaPaperPlane, FaUser, FaSearch, FaArrowLeft, FaComments } from "react-icons/fa";
import socketService from "../../services/socket";
import * as chatApi from "../../services/chatApi";
import "./ChatSupport.css";

const ChatSupport = ({ role }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  
  // Get current user ID from token
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Decode JWT token (simple base64 decode of payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id; // Token stores 'id' not 'userId'
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  
  const currentUserId = getCurrentUserId();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Connect socket on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Connecting socket with token...');
      const socket = socketService.connect(token);
      setConnectionStatus('connecting');
      
      // Listen for connection events
      socket.on('connect', () => {
        console.log('Socket connected successfully');
        setConnectionStatus('connected');
      });
      
      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnectionStatus('disconnected');
      });
      
      socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        setConnectionStatus('disconnected');
      });
      
      socket.on('authenticated', (data) => {
        if (data.success) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      });
    } else {
      console.error('No token found!');
      setConnectionStatus('disconnected');
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  // Initialize based on role
  useEffect(() => {
    const initializeChat = async () => {
      if (role === 'user') {
        // For users, get admin info and show chat directly
        setShowChat(true); // Show chat immediately
        
        try {
          setLoading(true);
          console.log('Fetching admin info...');
          console.log('Token:', localStorage.getItem('token') ? 'exists' : 'missing');
          console.log('Role:', role);
          
          const admin = await chatApi.getAdmin();
          console.log('Admin info received:', admin);
          
          if (admin && admin._id) {
            console.log('Setting admin ID:', admin._id);
            console.log('Admin name:', admin.name);
            console.log('Admin email:', admin.email);
            
            setAdminId(admin._id);
            setSelectedUser({ 
              id: admin._id, 
              name: 'Support Team', // Always show "Support Team" for users
              email: admin.email || 'support@myapp.com'
            });
            
            // Load existing messages
            console.log('Loading messages with admin:', admin._id);
            await loadMessages(admin._id);
          } else {
            console.error('Invalid admin data received:', admin);
          }
        } catch (error) {
          console.error('Error loading admin:', error);
          console.error('Error details:', error.response?.data || error.message);
          
          // Show error message but keep chat visible
          setMessages([{
            id: 'error',
            sender: 'system',
            text: 'Unable to connect to support team. Please make sure an admin user exists in the system.',
            timestamp: formatTime(new Date())
          }]);
        } finally {
          setLoading(false);
        }
      } else if (role === 'admin') {
        // For admin, load conversations
        await loadConversations();
      }
    };

    initializeChat();
  }, [role]);

  // Load conversations for admin
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading conversations for admin...');
      const data = await chatApi.getConversations();
      console.log(`✅ Loaded ${data.length} conversations`);
      
      setUsersList(data.map(conv => ({
        id: conv.userId,
        name: conv.name,
        email: conv.email,
        lastMessage: conv.lastMessage,
        timestamp: formatTime(conv.lastMessageTime),
        unread: conv.unreadCount,
        online: onlineUsers.has(conv.userId?.toString())
      })));
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [onlineUsers]);

  // Load messages with a user
  const loadMessages = async (userId) => {
    try {
      setLoading(true);
      const data = await chatApi.getMessages(userId);
      setMessages(data.map(msg => ({
        id: msg._id,
        sender: msg.sender._id === currentUserId ? (role === 'admin' ? 'admin' : 'user') : (role === 'admin' ? 'user' : 'admin'),
        text: msg.message,
        timestamp: formatTime(msg.createdAt),
        senderName: msg.sender.name
      })));
      
      // Mark messages as read
      socketService.markAsRead(userId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for socket events
  useEffect(() => {
    const socket = socketService.socket;
    if (!socket) return;

    // Receive new message
    const handleReceiveMessage = (message) => {
      console.log('📨 Received message:', message);
      console.log('   Current role:', role);
      console.log('   Current user ID:', currentUserId);
      console.log('   Message sender ID:', message.sender._id);
      console.log('   Message receiver ID:', message.receiver._id);
      console.log('   Selected user:', selectedUser);
      console.log('   Admin ID:', adminId);
      
      // Check if this message is for current user
      const isForMe = message.receiver._id === currentUserId || message.receiver === currentUserId;
      const isFromMe = message.sender._id === currentUserId || message.sender === currentUserId;
      
      console.log('   Is for me:', isForMe);
      console.log('   Is from me:', isFromMe);
      
      // For admin: Handle incoming messages from users
      if (role === 'admin') {
        console.log('   Admin: Reloading conversations...');
        loadConversations();
        
        // If currently chatting with this user, add message to chat
        if (selectedUser && message.sender._id === selectedUser.id) {
          console.log('   Admin: Adding user message to current chat');
          setMessages(prev => [...prev, {
            id: message._id,
            sender: 'user',
            text: message.message,
            timestamp: formatTime(message.createdAt),
            senderName: message.sender.name
          }]);
          
          // Mark as read
          socketService.markAsRead(message.sender._id);
        }
      }
      
      // For user: Add message if it's from admin (check adminId)
      if (role === 'user') {
        console.log('   User: Checking if message is from admin');
        console.log('   Message sender:', message.sender._id);
        console.log('   Admin ID:', adminId);
        
        // Check if message is from admin
        if (adminId && (message.sender._id === adminId || message.sender === adminId)) {
          console.log('   User: Adding admin message to chat');
          setMessages(prev => [...prev, {
            id: message._id,
            sender: 'admin',
            text: message.message,
            timestamp: formatTime(message.createdAt),
            senderName: message.sender.name
          }]);
          
          // Mark as read
          socketService.markAsRead(message.sender._id);
        } else {
          console.log('   User: Message not from admin, ignoring');
        }
      }
    };

    // Message sent confirmation
    const handleMessageSent = (message) => {
      console.log('✅ Message sent confirmation:', message);
      console.log('   Message ID:', message._id);
      console.log('   Sender:', message.sender._id);
      console.log('   Current user:', currentUserId);
      
      // Only add if message is from current user
      if (message.sender._id === currentUserId || message.sender === currentUserId) {
        // Don't add duplicate if already added
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.id === message._id);
          if (exists) {
            console.log('   Message already in list, skipping');
            return prev;
          }
          
          console.log('   Adding sent message to chat');
          return [...prev, {
            id: message._id,
            sender: role === 'admin' ? 'admin' : 'user',
            text: message.message,
            timestamp: formatTime(message.createdAt),
            senderName: message.sender.name
          }];
        });
      } else {
        console.log('   Message not from current user, skipping');
      }
    };

    // User online/offline status
    const handleUserOnline = (data) => {
      console.log('User online:', data.userId);
      setOnlineUsers(prev => new Set([...prev, data.userId]));
      if (role === 'admin') {
        setUsersList(prev => prev.map(u => 
          u.id === data.userId ? { ...u, online: true } : u
        ));
      }
    };

    const handleUserOffline = (data) => {
      console.log('User offline:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
      if (role === 'admin') {
        setUsersList(prev => prev.map(u => 
          u.id === data.userId ? { ...u, online: false } : u
        ));
      }
    };

    // Typing indicators
    const handleUserTyping = (data) => {
      if (selectedUser && data.userId === selectedUser.id) {
        setOtherUserTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (selectedUser && data.userId === selectedUser.id) {
        setOtherUserTyping(false);
      }
    };

    // Register all event listeners
    socket.on('receive-message', handleReceiveMessage);
    socket.on('message-sent', handleMessageSent);
    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    // Cleanup function
    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('message-sent', handleMessageSent);
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline', handleUserOffline);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
    };
  }, [selectedUser, role, loadConversations, adminId, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    console.log('📤 Sending message...');
    console.log('   Role:', role);
    console.log('   Current User ID:', currentUserId);
    console.log('   Selected User:', selectedUser);
    console.log('   Admin ID:', adminId);

    const receiverId = role === 'user' ? adminId : selectedUser?.id;
    
    if (!receiverId) {
      console.error('❌ No receiver ID found!');
      alert('Unable to send message. Please refresh the page.');
      return;
    }

    console.log('   Receiver ID:', receiverId);
    console.log('   Message:', inputMessage.trim());

    // Check if socket is connected
    if (!socketService.isConnected()) {
      console.error('❌ Socket not connected!');
      alert('Connection lost. Please refresh the page.');
      return;
    }

    console.log('   Emitting send-message event...');
    socketService.sendMessage(receiverId, inputMessage.trim());
    setInputMessage("");
    
    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    
    if (receiverId) {
      socketService.stopTyping(receiverId);
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Determine receiver ID based on role
    const receiverId = role === 'user' ? adminId : selectedUser?.id;
    
    // Send typing indicator
    if (receiverId && !isTyping) {
      setIsTyping(true);
      socketService.startTyping(receiverId);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (receiverId) {
        socketService.stopTyping(receiverId);
      }
    }, 2000);
  };

  // Select user (admin only)
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setShowChat(true);
    await loadMessages(user.id);
    
    // Mark messages as read
    setUsersList(prev => prev.map(u => 
      u.id === user.id ? { ...u, unread: 0 } : u
    ));
  };

  // Back to list (admin only)
  const handleBackToList = () => {
    setShowChat(false);
    setSelectedUser(null);
    setMessages([]);
  };

  // Filter users
  const filteredUsers = usersList.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // User view (chat with admin only)
  if (role === "user") {
    return (
      <div className="chat-support-container">
        <div className="chat-window-full">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <FaUser />
              </div>
              <div>
                <h3>{selectedUser?.name || 'Support Team'}</h3>
                <span className={`status ${connectionStatus === 'connected' ? 'online' : 'offline'}`}>
                  {connectionStatus === 'connected' ? 'Online' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {loading ? (
              <div className="loading-messages">
                <div className="loading-spinner"></div>
                <p>Loading chat...</p>
              </div>
            ) : !adminId ? (
              <div className="no-messages">
                <FaComments size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p>Unable to connect to support team.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Please refresh the page or contact administrator.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="no-messages">
                <FaComments size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )}
            {otherUserTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">Support is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder={adminId ? "Type your message..." : "Unable to send messages..."}
              className="chat-input"
              disabled={loading || !adminId}
            />
            <button 
              type="submit" 
              className="send-btn" 
              disabled={!inputMessage.trim() || loading || !adminId}
              title={!adminId ? "Support team unavailable" : "Send message"}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin view - WhatsApp style
  return (
    <div className="chat-support-container">
      {/* Users List View */}
      <div className={`users-list-view ${showChat ? 'hidden' : ''}`}>
        <div className="users-list-header">
          <h3>Messages {usersList.length > 0 && `(${usersList.length})`}</h3>
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="users-list">
          {loading ? (
            <div className="loading-users">
              <div className="loading-spinner"></div>
              <p>Loading conversations...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-users">
              <FaComments size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
              {searchQuery ? (
                <p>No users found matching "{searchQuery}"</p>
              ) : (
                <>
                  <p>No conversations yet</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '5px', opacity: 0.7 }}>
                    Conversations will appear when users send messages
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="user-item"
                onClick={() => handleUserSelect(user)}
              >
                <div className="user-avatar">
                  <FaUser />
                  {user.online && <span className="online-indicator"></span>}
                </div>
                <div className="user-info">
                  <div className="user-header">
                    <h4>{user.name}</h4>
                    <span className="timestamp">{user.timestamp}</span>
                  </div>
                  <p className="last-message">{user.lastMessage}</p>
                </div>
                {user.unread > 0 && (
                  <span className="unread-badge">{user.unread}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className={`chat-window-full ${!showChat ? 'hidden' : ''}`}>
        {selectedUser && (
          <>
            <div className="chat-header">
              <button className="back-btn" onClick={handleBackToList}>
                <FaArrowLeft />
              </button>
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <FaUser />
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <span className="user-email">{selectedUser.email}</span>
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {loading ? (
                <div className="loading-messages">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages">
                  <FaComments size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
              {otherUserTyping && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">{selectedUser?.name} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="chat-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="send-btn" 
                disabled={!inputMessage.trim() || loading}
              >
                <FaPaperPlane />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSupport;
