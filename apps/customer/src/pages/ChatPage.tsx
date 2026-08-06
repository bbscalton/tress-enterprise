import { useEffect, useState, useRef } from 'react';
import { Send, Image, Mic, Square } from 'lucide-react';
import {
  subscribeChats,
  subscribeChatMessages,
  sendMessage,
  createChat,
  uploadFileToR2,
  uploadBlobToR2,
  type Chat,
  type ChatMessage,
} from '@fleetrentals/shared';
import { useAuth } from '../context/AuthContext';

export function ChatPage() {
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeChats((chats) => {
      const mine = chats.find((c) => c.customerId === user.uid);
      if (mine) setChat(mine);
    });
  }, [user]);

  useEffect(() => {
    if (!chat) return;
    return subscribeChatMessages(chat.id, setMessages);
  }, [chat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ensureChat = async () => {
    if (chat || !user) return null;
    const id = await createChat({
      customerId: user.uid,
      customerName: user.displayName,
      participants: { [user.uid]: true, business: true },
      unreadBusiness: 0,
      unreadCustomer: 0,
    });
    const newChat: Chat = {
      id,
      customerId: user.uid,
      customerName: user.displayName,
      participants: { [user.uid]: true, business: true },
    };
    setChat(newChat);
    return newChat;
  };

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const c = chat ?? await ensureChat();
    if (!c) return;
    await sendMessage(c.id, {
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
    if (!file || !user) return;
    const c = chat ?? await ensureChat();
    if (!c) return;
    try {
      const url = await uploadFileToR2(`chat/${c.id}`, file, user.uid);
      await sendMessage(c.id, {
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const c = chat ?? await ensureChat();
        if (!c || !user) return;
        try {
          const url = await uploadBlobToR2(`chat/${c.id}`, blob, 'webm', user.uid);
          await sendMessage(c.id, {
            senderId: user.uid,
            senderName: user.displayName,
            type: 'voice',
            mediaUrl: url,
            duration: 0,
            createdAt: Date.now(),
            read: false,
          });
        } catch {
          alert('Failed to upload voice note');
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert('Microphone access required for voice notes');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <h2 className="text-xl font-bold mb-4">Chat with Us</h2>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
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
              <p className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">Send a message to start chatting</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-slate-700 pt-3">
        <label className="p-2 hover:bg-slate-700 rounded-lg cursor-pointer">
          <Image size={20} />
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
        </label>
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`p-2 rounded-lg ${recording ? 'bg-red-600' : 'hover:bg-slate-700'}`}
        >
          {recording ? <Square size={20} /> : <Mic size={20} />}
        </button>
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
    </div>
  );
}
