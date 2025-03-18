import { useState, useEffect, useRef } from 'react';
import { db } from '~/lib/firebase.client';
import { ref, onValue, off, push, set, query, limitToLast, orderByChild } from 'firebase/database';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import { nanoid } from 'nanoid';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  isAdmin: boolean;
}

interface OnlineUser {
  userId: string;
  username: string;
  lastActive: number;
  isAdmin: boolean;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useLocalStorage('chat_user_id', '');
  const [showJoin, setShowJoin] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_USERS = 300;

  useEffect(() => {
    if (userId) {
      setShowJoin(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // 채팅 메시지 구독
    const messagesRef = query(ref(db, 'messages'), orderByChild('timestamp'), limitToLast(50));
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMessages(messageList);
        scrollToBottom();
      }
    });

    // 온라인 사용자 구독
    const usersRef = ref(db, 'onlineUsers');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map(key => ({
          userId: key,
          ...data[key]
        }));
        
        // 5분 이상 활동이 없는 사용자 필터링
        const now = Date.now();
        const activeUsers = userList.filter(user => now - user.lastActive < 5 * 60 * 1000);
        
        setOnlineUsers(activeUsers);
      }
    });

    // 접속 기록 갱신
    const userRef = ref(db, `onlineUsers/${userId}`);
    const updateOnlineStatus = () => {
      set(userRef, {
        username: username,
        lastActive: Date.now(),
        isAdmin: adminMode
      });
    };
    
    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 30000);

    // 연결 해제 시 정리
    return () => {
      clearInterval(interval);
      off(messagesRef);
      off(usersRef);
      set(userRef, null);
    };
  }, [userId, username, adminMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleJoin = () => {
    if (!username.trim()) {
      alert('사용자명을 입력해주세요.');
      return;
    }

    if (onlineUsers.length >= MAX_USERS) {
      alert(`최대 ${MAX_USERS}명까지만 접속 가능합니다. 나중에 다시 시도해주세요.`);
      return;
    }

    // 아이디 중복 체크
    if (onlineUsers.some(user => user.username === username)) {
      alert('이미 사용 중인 사용자명입니다. 다른 이름을 선택해주세요.');
      return;
    }

    const newUserId = nanoid();
    setUserId(newUserId);
    setShowJoin(false);
  };

  const handleAdminLogin = () => {
    // 실제 환경에서는 서버 측에서 검증해야 합니다
    if (adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
      setAdminMode(true);
      setUsername(adminUsername);
      setShowJoin(false);
      
      const newUserId = nanoid();
      setUserId(newUserId);
    } else {
      alert('관리자 비밀번호가 올바르지 않습니다.');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const newMessage = {
      userId,
      username,
      message: message.trim(),
      timestamp: Date.now(),
      isAdmin: adminMode
    };
    
    push(ref(db, 'messages'), newMessage);
    setMessage('');
  };

  if (showJoin) {
    return (
      <div className="bg-[#1a1a1a] text-white p-4 rounded-lg shadow-lg max-w-md mx-auto mt-10">
        <h2 className="text-xl font-bold mb-4 text-center">채팅 참여하기</h2>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="border-b border-purple-500 flex-grow"></div>
            <div className="px-4">일반 사용자</div>
            <div className="border-b border-purple-500 flex-grow"></div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">사용자명</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded focus:outline-none focus:border-purple-500"
              placeholder="사용할 이름을 입력하세요"
            />
          </div>
          
          <button
            onClick={handleJoin}
            className="w-full bg-purple-600 p-2 rounded hover:bg-purple-700 transition-colors"
          >
            참여하기
          </button>
        </div>
        
        <div>
          <div className="flex items-center mb-4">
            <div className="border-b border-purple-500 flex-grow"></div>
            <div className="px-4">관리자 로그인</div>
            <div className="border-b border-purple-500 flex-grow"></div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">관리자명</label>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full p-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded focus:outline-none focus:border-purple-500"
              placeholder="관리자 이름을 입력하세요"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">비밀번호</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded focus:outline-none focus:border-purple-500"
              placeholder="관리자 비밀번호"
            />
          </div>
          
          <button
            onClick={handleAdminLogin}
            className="w-full bg-red-600 p-2 rounded hover:bg-red-700 transition-colors"
          >
            관리자 로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* 채팅 영역 */}
      <div className="flex-grow flex flex-col h-[70vh]">
        <div className="bg-[#1a1a1a] p-4 shadow-md">
          <h2 className="text-lg font-bold">채팅방</h2>
          <p className="text-sm text-gray-300">접속자 수: {onlineUsers.length}/{MAX_USERS}</p>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 bg-[#242424] space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${msg.userId === userId ? 'ml-auto' : ''} max-w-[80%]`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.userId === userId
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : msg.isAdmin
                    ? 'bg-red-600 text-white rounded-bl-none'
                    : 'bg-[#333] text-white rounded-bl-none'
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {msg.username} {msg.isAdmin && '👑'}
                </div>
                <div>{msg.message}</div>
                <div className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form
          onSubmit={sendMessage}
          className="p-4 bg-[#1a1a1a] border-t border-[#333] flex"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-l focus:outline-none focus:border-purple-500"
            placeholder="메시지를 입력하세요..."
          />
          <button
            type="submit"
            className="bg-purple-600 px-4 rounded-r hover:bg-purple-700 transition-colors"
          >
            전송
          </button>
        </form>
      </div>
      
      {/* 사용자 목록 */}
      <div className="w-64 bg-[#1a1a1a] p-4 border-l border-[#333] hidden md:block">
        <h3 className="font-bold mb-3">접속자 목록</h3>
        <div className="space-y-2 max-h-[calc(70vh-60px)] overflow-y-auto">
          {onlineUsers.map((user) => (
            <div key={user.userId} className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>
                {user.username} {user.isAdmin && '👑'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}