import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { skillTaskApi } from '../../api/skillTaskApi';
import { messageApi } from '../../api/messageApi';
import { notificationApi } from '../../api/notificationApi';
import { connectSocket } from '../../lib/socket';
import Avatar from '../common/Avatar';
import ChatThread from '../common/ChatThread';
import type { AppNotification, Message } from '../../types';

type Contact = { id: string; name: string };
type Selection = { type: 'contact'; user: Contact } | { type: 'notification'; id: string } | null;
type NavState = { contact?: Contact };

const NotificationCenter = () => {
  const { role, profile } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selection, setSelection] = useState<Selection>(null);

  // Kept in refs so the socket listener (registered once) always sees the
  // latest values without re-subscribing.
  const myIdRef = useRef(profile?.id);
  myIdRef.current = profile?.id;
  const contactsRef = useRef(contacts);
  contactsRef.current = contacts;

  useEffect(() => {
    const taskContacts =
      role === 'worker' || role === 'admin'
        ? skillTaskApi.listTasks().then((tasks) => {
            const seen = new Map<string, Contact>();
            for (const task of tasks) {
              const contact = role === 'admin' ? task.worker : task.reviewer;
              if (contact) seen.set(contact.id, contact);
            }
            return Array.from(seen.values());
          })
        : Promise.resolve<Contact[]>([]);

    Promise.all([taskContacts, messageApi.listContacts()]).then(([fromTasks, fromHistory]) => {
      const merged = new Map<string, Contact>();
      for (const c of fromTasks) merged.set(c.id, c);
      for (const c of fromHistory) merged.set(c.id, c);

      const navContact = (location.state as NavState | null)?.contact;
      if (navContact) {
        merged.set(navContact.id, navContact);
        setSelection({ type: 'contact', user: merged.get(navContact.id)! });
      }

      setContacts(Array.from(merged.values()));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    notificationApi.listNotifications().then(setNotifications);
  }, []);

  // When someone new messages us, pull them into the contacts list so the
  // conversation is reachable without a refresh. The open thread itself is
  // kept live by <ChatThread>.
  useEffect(() => {
    const socket = connectSocket();
    const onNewMessage = (message: Message) => {
      if (
        message.senderId !== myIdRef.current &&
        !contactsRef.current.some((c) => c.id === message.senderId)
      ) {
        messageApi.listContacts().then((users) => {
          setContacts((current) => {
            const merged = new Map(current.map((c) => [c.id, c]));
            for (const user of users) merged.set(user.id, { id: user.id, name: user.name });
            return Array.from(merged.values());
          });
        });
      }
    };
    socket.on('message:new', onNewMessage);
    return () => {
      socket.off('message:new', onNewMessage);
    };
  }, []);

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
          <div className="notification-list-heading">Messages</div>
          {contacts.length === 0 ? (
            <p className="muted notification-list-empty">
              You haven't started any conversations yet — visit someone's profile to send them a
              message.
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
            <ChatThread
              key={selection.user.id}
              recipientId={selection.user.id}
              recipientName={selection.user.name}
              showHeader
            />
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
