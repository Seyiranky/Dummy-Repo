import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Col, Empty, List, Row, Segmented, Typography } from 'antd';
import { useAppSelector } from '../../store/hooks';
import { skillTaskApi } from '../../api/skillTaskApi';
import { messageApi } from '../../api/messageApi';
import { notificationApi } from '../../api/notificationApi';
import { connectSocket } from '../../lib/socket';
import PageContainer from '../Layout/PageContainer';
import Avatar from '../common/Avatar';
import ChatThread from '../common/ChatThread';
import type { AppNotification, Message } from '../../types';

type Contact = { id: string; name: string };
type NavState = { contact?: Contact };

const NotificationCenter = () => {
  const { t } = useTranslation();
  const { role } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [tab, setTab] = useState<'messages' | 'updates'>('messages');

  const myIdRef = useRef<string | undefined>(undefined);
  myIdRef.current = useAppSelector((state) => state.auth.profile?.id);
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
            return [...seen.values()];
          })
        : Promise.resolve<Contact[]>([]);

    Promise.all([taskContacts, messageApi.listContacts()]).then(([fromTasks, fromHistory]) => {
      const merged = new Map<string, Contact>();
      for (const c of fromTasks) merged.set(c.id, c);
      for (const c of fromHistory) merged.set(c.id, { id: c.id, name: c.name });
      const navContact = (location.state as NavState | null)?.contact;
      if (navContact) {
        merged.set(navContact.id, navContact);
        setSelectedContact(merged.get(navContact.id)!);
      }
      setContacts([...merged.values()]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    notificationApi.listNotifications().then(setNotifications);
  }, []);

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
            return [...merged.values()];
          });
        });
      }
    };
    socket.on('message:new', onNewMessage);
    return () => {
      socket.off('message:new', onNewMessage);
    };
  }, []);

  const markRead = async (n: AppNotification) => {
    if (n.readAt) return;
    const updated = await notificationApi.markRead(n.id);
    setNotifications((cur) => cur.map((x) => (x.id === updated.id ? updated : x)));
  };

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <PageContainer title={t('sidebar.notifications')}>
      <Segmented
        value={tab}
        onChange={(v) => setTab(v as 'messages' | 'updates')}
        style={{ marginBottom: 20 }}
        options={[
          { label: 'Messages', value: 'messages' },
          {
            label: (
              <Badge count={unread} size="small" offset={[8, 0]}>
                <span>Updates</span>
              </Badge>
            ),
            value: 'updates',
          },
        ]}
      />

      {tab === 'messages' ? (
        <Row gutter={16}>
          <Col xs={24} md={8} lg={7}>
            <Card styles={{ body: { padding: 8 } }}>
              {contacts.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No conversations yet — message someone from their profile."
                />
              ) : (
                <List
                  dataSource={contacts}
                  renderItem={(contact) => (
                    <List.Item
                      onClick={() => setSelectedContact(contact)}
                      style={{
                        cursor: 'pointer',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background:
                          selectedContact?.id === contact.id ? 'rgba(24,24,27,0.05)' : undefined,
                      }}
                    >
                      <List.Item.Meta
                        avatar={<Avatar name={contact.name} size={32} />}
                        title={contact.name}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} md={16} lg={17}>
            <Card>
              {selectedContact ? (
                <ChatThread
                  key={selectedContact.id}
                  recipientId={selectedContact.id}
                  recipientName={selectedContact.name}
                  showHeader
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Select a conversation."
                />
              )}
            </Card>
          </Col>
        </Row>
      ) : (
        <Card>
          {notifications.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing yet." />
          ) : (
            <List
              dataSource={notifications}
              renderItem={(n) => (
                <List.Item
                  onClick={() => markRead(n)}
                  style={{ cursor: n.readAt ? 'default' : 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={<Badge dot={!n.readAt} />}
                    title={<Typography.Text strong={!n.readAt}>{n.title}</Typography.Text>}
                    description={
                      <>
                        <div>{n.body}</div>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </Typography.Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}
    </PageContainer>
  );
};

export default NotificationCenter;
