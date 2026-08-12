import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAppSelector } from '../../store/hooks';
import { skillTaskApi } from '../../api/skillTaskApi';
import { messageApi } from '../../api/messageApi';
import { notificationApi } from '../../api/notificationApi';
import Avatar from '../common/Avatar';
import type { AppNotification, Message, User } from '../../types';

type Selection = { type: 'contact'; user: User } | { type: 'notification'; id: string } | null;

const NotificationCenter = () => {
  const { role, profile } = useAppSelector((state) => state.auth);
  const [contacts, setContacts] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selection, setSelection] = useState<Selection>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const showMessagesSection = role === 'worker' || role === 'admin';

  useEffect(() => {
    if (!showMessagesSection) return;
    skillTaskApi.listTasks().then((tasks) => {
      const seen = new Map<string, User>();
      for (const task of tasks) {
        const contact = role === 'admin' ? task.worker : task.reviewer;
        if (contact) seen.set(contact.id, contact);
      }
      setContacts(Array.from(seen.values()));
    });
  }, [role, showMessagesSection]);

  useEffect(() => {
    notificationApi.listNotifications().then(setNotifications);
  }, []);

  useEffect(() => {
    if (selection?.type !== 'contact') return;
    messageApi.listMessages(selection.user.id).then(setMessages);
  }, [selection]);

  const threadKey = useMemo(
    () => (selection?.type === 'contact' ? selection.user.id : 'none'),
    [selection],
  );

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (selection?.type !== 'contact' || !draft.trim()) return;
    setSending(true);
    try {
      await messageApi.sendMessage({ recipientId: selection.user.id, body: draft.trim() });
      setDraft('');
      const updated = await messageApi.listMessages(selection.user.id);
      setMessages(updated);
    } finally {
      setSending(false);
    }
  };

  const selectNotification = async (notification: AppNotification) => {
    setSelection({ type: 'notification', id: notification.id });
    if (!notification.readAt) {
      const updated = await notificationApi.markRead(notification.id);
      setNotifications((current) => current.map((n) => (n.id === updated.id ? updated : n)));
    }
  };

  const selectedNotification =
    selection?.type === 'notification' ? notifications.find((n) => n.id === selection.id) : null;

  return (
    <div className="section">
      <h2>Notifications</h2>
      <div className="chat-layout">
        <div className="notification-list">
          {showMessagesSection && (
            <>
              <div className="notification-list-heading">Messages</div>
              {contacts.length === 0 ? (
                <p className="muted notification-list-empty">
                  {role === 'admin'
                    ? "You'll be able to message a worker once you've been assigned to review one of their skill tasks."
                    : "You'll be able to message an admin once your skill task has been assigned for review."}
                </p>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    className={`identity notification-row ${
                      selection?.type === 'contact' && selection.user.id === contact.id ? 'active' : ''
                    }`}
                    onClick={() => setSelection({ type: 'contact', user: contact })}
                  >
                    <Avatar name={contact.name} size={28} />
                    <span className="identity-name">{contact.name}</span>
                  </button>
                ))
              )}
            </>
          )}

          <div className="notification-list-heading">Updates</div>
          {notifications.length === 0 && <p className="muted notification-list-empty">Nothing yet.</p>}
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={`notification-row ${!notification.readAt ? 'unread' : ''} ${
                selection?.type === 'notification' && selection.id === notification.id ? 'active' : ''
              }`}
              onClick={() => selectNotification(notification)}
            >
              {!notification.readAt && <span className="notification-dot" aria-hidden="true" />}
              <span className="notification-row-text">
                <span className="notification-row-title">{notification.title}</span>
                <span className="notification-row-preview">{notification.body}</span>
              </span>
            </button>
          ))}
        </div>

        <div>
          {selection?.type === 'contact' && (
            <>
              <div className="identity chat-header">
                <Avatar name={selection.user.name} size={28} />
                <span className="identity-name">{selection.user.name}</span>
              </div>
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
                  placeholder={`Message ${selection.user.name}`}
                />
                <button type="submit" className="btn-primary" disabled={sending || !draft.trim()}>
                  Send
                </button>
              </form>
            </>
          )}

          {selectedNotification && (
            <div className="notification-detail">
              <h3>{selectedNotification.title}</h3>
              <p className="muted">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
              <p>{selectedNotification.body}</p>
            </div>
          )}

          {!selection && <p className="muted">Select a message or update to view it.</p>}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
