import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAppSelector } from '../../store/hooks';
import { skillTaskApi } from '../../api/skillTaskApi';
import { messageApi } from '../../api/messageApi';
import type { Message, User } from '../../types';

const ChatWindow = () => {
  const { role, profile } = useAppSelector((state) => state.auth);
  const [contacts, setContacts] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    skillTaskApi.listTasks().then((tasks) => {
      const seen = new Map<string, User>();
      for (const task of tasks) {
        const contact = role === 'mentor' ? task.worker : task.reviewer;
        if (contact) seen.set(contact.id, contact);
      }
      const list = Array.from(seen.values());
      setContacts(list);
      setSelected((current) => current ?? list[0] ?? null);
    });
  }, [role]);

  useEffect(() => {
    if (!selected) return;
    messageApi.listMessages(selected.id).then(setMessages);
  }, [selected]);

  const threadKey = useMemo(() => selected?.id ?? 'none', [selected]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !draft.trim()) return;
    setSending(true);
    try {
      await messageApi.sendMessage({ recipientId: selected.id, body: draft.trim() });
      setDraft('');
      const updated = await messageApi.listMessages(selected.id);
      setMessages(updated);
    } finally {
      setSending(false);
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="section">
        <h2>Mentorship messaging</h2>
        <p className="muted">
          {role === 'mentor'
            ? "You'll be able to message a worker once you've been assigned to review one of their skill tasks."
            : "You'll be able to message your mentor once your skill task has been assigned for review."}
        </p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>Mentorship messaging</h2>
      <div className="chat-layout">
        <div className="contact-list">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              className={contact.id === selected?.id ? 'active' : ''}
              onClick={() => setSelected(contact)}
            >
              {contact.name}
            </button>
          ))}
        </div>
        <div>
          <div className="message-thread" key={threadKey}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${message.senderId === profile?.id ? 'own' : ''}`}
              >
                {message.body}
              </div>
            ))}
            {messages.length === 0 && <p className="muted">No messages yet — say hello.</p>}
          </div>
          <form className="message-form" onSubmit={handleSend}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${selected?.name ?? ''}`}
            />
            <button type="submit" disabled={sending || !draft.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
