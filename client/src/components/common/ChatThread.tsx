import { useEffect, useState, type FormEvent } from 'react';
import { useAppSelector } from '../../store/hooks';
import { messageApi } from '../../api/messageApi';
import { connectSocket } from '../../lib/socket';
import Avatar from './Avatar';
import type { Message } from '../../types';

interface ChatThreadProps {
  recipientId: string;
  recipientName?: string;
  showHeader?: boolean;
  placeholder?: string;
  emptyText?: string;
}

// Self-contained one-to-one conversation: loads history, appends messages
// pushed over the socket in real time, and sends new ones. Reused by the
// Notifications page and the marketplace gig detail view.
const ChatThread = ({
  recipientId,
  recipientName,
  showHeader = false,
  placeholder,
  emptyText,
}: ChatThreadProps) => {
  const myId = useAppSelector((state) => state.auth.profile?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    messageApi.listMessages(recipientId).then((loaded) => {
      if (active) setMessages(loaded);
    });
    return () => {
      active = false;
    };
  }, [recipientId]);

  useEffect(() => {
    const socket = connectSocket();
    const onNewMessage = (message: Message) => {
      const other = message.senderId === myId ? message.recipientId : message.senderId;
      if (other !== recipientId) return;
      setMessages((current) =>
        current.some((m) => m.id === message.id) ? current : [...current, message],
      );
    };
    socket.on('message:new', onNewMessage);
    return () => {
      socket.off('message:new', onNewMessage);
    };
  }, [recipientId, myId]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const sent = await messageApi.sendMessage({ recipientId, body });
      setDraft('');
      setMessages((current) =>
        current.some((m) => m.id === sent.id) ? current : [...current, sent],
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showHeader && recipientName && (
        <div className="identity chat-header">
          <Avatar name={recipientName} size={28} />
          <span className="identity-name">{recipientName}</span>
        </div>
      )}
      <div className="message-thread" key={recipientId}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${message.senderId === myId ? 'own' : ''}`}
          >
            {message.body}
          </div>
        ))}
        {messages.length === 0 && (
          <p className="muted">{emptyText ?? 'No messages yet — say hello.'}</p>
        )}
      </div>
      <form className="message-form" onSubmit={handleSend}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder ?? (recipientName ? `Message ${recipientName}` : 'Message')}
        />
        <button type="submit" className="btn-primary" disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
    </>
  );
};

export default ChatThread;
