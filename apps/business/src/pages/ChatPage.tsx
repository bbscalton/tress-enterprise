import { useEffect, useState, useRef } from 'react';
import { Send, Image, MessageCircle } from 'lucide-react';
import {
  subscribeChats,
  subscribeChatMessages,
  sendMessage,
  uploadFileToR2,
  type Chat,
  type ChatMessage,
} from '@fleetrentals/shared';
import { useAuth } from '../context/AuthContext';

export function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeChats((c) => setChats(c.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0)))), []);
  useEffect(() => {
    if (!selectedChat) return;
    return subscribeChatMessages(selectedChat.id, setMessages);
  }, [selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedChat || !user) return;
    await sendMessage(selectedChat.id, {
      senderId: user.uid,
      senderName: user.displayName,
      type: 'text',
      text: text.trim(),
      createdAt: Date.now(),
      read: false,
    });
    setText('');
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !user) return;
    try {
      const url = await uploadFileToR2(`chat/${selectedChat.id}`, file, user.uid);
      await sendMessage(selectedChat.id, {
        senderId: user.uid,
        senderName: user.displayName,
        type: 'image',
        mediaUrl: url,
        createdAt: Date.now(),
        read: false,
      });
    } catch {
      alert('Failed to upload image');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Chat</h2>

      <div className="flex gap-4 h-[70vh]">
        {/* Chat list */}
        <div className="w-full sm:w-80 card flex flex-col overflow-hidden">
          <h3 className="font-bold mb-3">Conversations</h3>
          <div className="flex-1 overflow-y-auto space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full text-left p-3 rounded-xl transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-brand-600' : 'hover:bg-slate-700'
                }`}
              >
                <p className="font-medium truncate">{chat.customerName}</p>
                <p className="text-xs text-slate-400 truncate">{chat.lastMessage ?? 'No messages'}</p>
              </button>
            ))}
            {chats.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No conversations yet</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 card flex flex-col overflow-hidden hidden sm:flex">
          {selectedChat ? (
            <>
              <div className="border-b border-slate-700 pb-3 mb-3">
                <p className="font-bold">{selectedChat.customerName}</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        m.senderId === user?.uid ? 'bg-brand-600' : 'bg-slate-700'
                      }`}
                    >
                      {m.type === 'text' && <p>{m.text}</p>}
                      {m.type === 'image' && m.mediaUrl && (
                        <img src={m.mediaUrl} className="max-w-full rounded-lg" alt="Photo" />
                      )}
                      {m.type === 'voice' && m.mediaUrl && (
                        <audio controls src={m.mediaUrl} className="max-w-full" />
                      )}
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-center gap-2 mt-3 border-t border-slate-700 pt-3">
                <label className="p-2 hover:bg-slate-700 rounded-lg cursor-pointer">
                  <Image size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
                <input
                  className="input flex-1"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className="btn-primary p-3">
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <MessageCircle size={48} className="mb-3 opacity-30" />
              <p>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
