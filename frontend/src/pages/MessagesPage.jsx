import { useEffect, useMemo, useRef, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import { createChatSocket } from '../lib/socket.js';

const sortByCreatedAt = (items) =>
  [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

const mergeMessages = (items, nextMessage) => {
  const withoutDuplicate = items.filter(
    (message) =>
      message._id !== nextMessage._id &&
      (!nextMessage.clientId || message.clientId !== nextMessage.clientId)
  );
  return sortByCreatedAt([...withoutDuplicate, nextMessage]);
};

const formatTime = (date) =>
  new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(date));

const MessagesPage = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [query, setQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadByConnection, setUnreadByConnection] = useState({});
  const [socketState, setSocketState] = useState('connecting');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const activeRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null);

  const otherUser = (connection) =>
    connection?.requester._id === user._id ? connection.recipient : connection?.requester;

  const activePeer = active ? otherUser(active) : null;
  const isActivePeerOnline = activePeer ? onlineUsers[activePeer._id] : false;
  const activeTyping = active ? typingUsers[active._id] : false;

  const filteredConnections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return connections;

    return connections.filter((connection) => {
      const peer = otherUser(connection);
      return [peer?.name, peer?.location, peer?.availability]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [connections, query, user._id]);

  const activeLastMessage = useMemo(() => messages[messages.length - 1], [messages]);

  useEffect(() => {
    api.get('/connections').then(({ data }) => {
      const accepted = data.filter((connection) => connection.status === 'accepted');
      setConnections(accepted);
      setActive(accepted[0] || null);
    });
  }, []);

  useEffect(() => {
    if (!user?.token) return;

    const socket = createChatSocket(user.token);
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketState('connected');
      setError('');
    });
    socket.on('disconnect', () => setSocketState('offline'));
    socket.on('connect_error', (socketError) => {
      setSocketState('offline');
      setError(socketError.message || 'Real-time chat is offline');
    });
    socket.on('presence:update', ({ userId, online }) => {
      setOnlineUsers((current) => ({ ...current, [userId]: online }));
    });
    socket.on('typing:update', ({ connectionId, userId, typing }) => {
      if (userId === user._id) return;
      setTypingUsers((current) => ({ ...current, [connectionId]: typing }));
    });
    socket.on('message:new', ({ connectionId, message }) => {
      const viewingConversation = activeRef.current?._id === connectionId;
      if (viewingConversation) {
        setMessages((current) => mergeMessages(current, message));
        socket.emit('message:read', { connectionId });
      } else if (message.sender?._id !== user._id) {
        setUnreadByConnection((current) => ({
          ...current,
          [connectionId]: (current[connectionId] || 0) + 1
        }));
      }
    });
    socket.on('message:read', ({ connectionId, readerId, readAt }) => {
      if (activeRef.current?._id !== connectionId || readerId === user._id) return;
      setMessages((current) =>
        current.map((message) =>
          message.sender?._id === user._id && !message.readAt ? { ...message, readAt } : message
        )
      );
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user._id, user.token]);

  useEffect(() => {
    activeRef.current = active;
    if (!active) return;

    const peer = otherUser(active);
    setUnreadByConnection((current) => ({ ...current, [active._id]: 0 }));
    setTypingUsers((current) => ({ ...current, [active._id]: false }));

    api.get(`/messages/${peer._id}`).then(({ data }) => {
      setMessages(data);
      api.put(`/messages/${peer._id}/read`, { connectionId: active._id }).catch(() => {});
    });

    const socket = socketRef.current;
    socket?.emit('conversation:join', { connectionId: active._id }, (response) => {
      if (!response?.ok) {
        setError(response?.message || 'Unable to join the real-time conversation');
        return;
      }
      setOnlineUsers((current) => ({ ...current, [response.peerId]: response.peerOnline }));
      socket.emit('message:read', { connectionId: active._id });
    });

    return () => {
      socket?.emit('typing:stop', { connectionId: active._id });
      socket?.emit('conversation:leave', { connectionId: active._id });
    };
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, activeTyping]);

  const stopTypingSoon = (connectionId) => {
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socketRef.current?.emit('typing:stop', { connectionId });
    }, 900);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
    if (!active || !socketRef.current?.connected) return;
    socketRef.current.emit('typing:start', { connectionId: active._id });
    stopTypingSoon(active._id);
  };

  const send = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !active || !activePeer) return;

    const clientId = `client-${Date.now()}`;
    const optimisticMessage = {
      _id: clientId,
      clientId,
      content: trimmed,
      sender: user,
      receiver: activePeer,
      connectionId: active._id,
      createdAt: new Date().toISOString(),
      pending: true
    };

    setContent('');
    setMessages((current) => mergeMessages(current, optimisticMessage));
    socketRef.current?.emit('typing:stop', { connectionId: active._id });

    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', { connectionId: active._id, content: trimmed }, (response) => {
        if (!response?.ok) {
          setError(response?.message || 'Message failed to send');
          setMessages((current) =>
            current.map((message) => (message.clientId === clientId ? { ...message, failed: true, pending: false } : message))
          );
          return;
        }

        setMessages((current) =>
          mergeMessages(
            current.map((message) => (message.clientId === clientId ? { ...message, _id: response.message._id } : message)),
            response.message
          )
        );
      });
      return;
    }

    try {
      const { data } = await api.post('/messages', {
        receiver: activePeer._id,
        content: trimmed,
        connectionId: active._id
      });
      setMessages((current) => mergeMessages(current, { ...data, clientId }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Message failed to send');
      setMessages((current) =>
        current.map((message) => (message.clientId === clientId ? { ...message, failed: true, pending: false } : message))
      );
    }
  };

  if (connections.length === 0) {
    return <EmptyState title="No accepted connections" text="Accept or create a connection request before starting a conversation." />;
  }

  return (
    <div className="space-y-6">
      <section className="premium-card rounded-2xl p-6">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-lagoon">Live skill exchange</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">Chat, plan, and stay in sync.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-ink px-5 py-4 text-white">
              <p className="text-sm text-white/55">Active chats</p>
              <p className="font-display text-4xl font-extrabold text-mango">{connections.length}</p>
            </div>
            <div className="rounded-2xl bg-white px-5 py-4 text-ink ring-1 ring-ink/10">
              <p className="text-sm text-ink/55">Socket</p>
              <p className="font-extrabold capitalize">{socketState}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
        <aside className="panel rounded-2xl p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow text-lagoon">Connections</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold">Chats</h2>
            </div>
          </div>
          <input
            className="field mt-5"
            placeholder="Search chats..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="mt-5 space-y-3">
            {filteredConnections.map((connection) => {
              const peer = otherUser(connection);
              const unread = unreadByConnection[connection._id] || 0;
              const online = onlineUsers[peer._id];
              return (
                <button
                  key={connection._id}
                  onClick={() => setActive(connection)}
                  className={`w-full rounded-2xl p-4 text-left font-bold transition ${
                    active?._id === connection._id
                      ? 'bg-ink text-white shadow-sm'
                      : 'bg-white text-ink ring-1 ring-ink/5 hover:-translate-y-0.5 hover:bg-amber-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                      style={{ backgroundColor: peer.avatarColor || '#0f766e' }}
                    >
                      {peer.name?.charAt(0)}
                      <span
                        className={`absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full ring-2 ${
                          active?._id === connection._id ? 'ring-ink' : 'ring-white'
                        } ${online ? 'bg-emerald-400' : 'bg-slate-300'}`}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-black">{peer.name}</span>
                      <span className="block truncate text-sm opacity-60">
                        {typingUsers[connection._id] ? 'Typing...' : online ? 'Online now' : 'Accepted connection'}
                      </span>
                    </span>
                    {unread > 0 && (
                      <span className="grid h-7 min-w-7 place-items-center rounded-full bg-mango px-2 text-xs font-black text-ink">
                        {unread}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink/5">
          <div className="dark-panel aurora-shell p-5 text-white">
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 place-items-center rounded-xl text-lg font-black text-white ring-1 ring-white/20"
                  style={{ backgroundColor: activePeer?.avatarColor || '#0f766e' }}
                >
                  {activePeer?.name?.charAt(0)}
                </div>
                <div>
                  <p className="eyebrow text-mango">Conversation</p>
                  <h2 className="mt-1 font-display text-3xl font-extrabold">{activePeer?.name || 'Conversation'}</h2>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">
                {isActivePeerOnline ? 'Online now' : 'Offline'}
              </div>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div ref={scrollRef} className="flex h-[30rem] flex-col gap-3 overflow-y-auto bg-paper p-5">
            {messages.map((message) => {
              const mine = message.sender?._id === user._id;
              return (
                <div
                  key={message._id}
                  className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                    mine ? 'ml-auto bg-lagoon text-white' : 'bg-white text-ink'
                  } ${message.failed ? 'ring-2 ring-red-300' : ''}`}
                >
                  <p className="break-words">{message.content}</p>
                  <p className={`mt-1 text-xs ${mine ? 'text-white/70' : 'text-ink/50'}`}>
                    {message.pending ? 'Sending...' : message.failed ? 'Failed' : formatTime(message.createdAt)}
                  </p>
                </div>
              );
            })}
            {activeTyping && (
              <div className="w-fit rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm">
                {activePeer?.name} is typing...
              </div>
            )}
          </div>

          <div className="flex min-h-10 items-center justify-between gap-3 border-t border-ink/5 bg-white px-4 py-2 text-xs font-bold text-ink/55">
            <span>{activeLastMessage?.readAt && activeLastMessage.sender?._id === user._id ? `Read ${formatTime(activeLastMessage.readAt)}` : 'Messages sync instantly when both users are online.'}</span>
            <span className="capitalize">{socketState}</span>
          </div>

          <form onSubmit={send} className="flex gap-3 border-t border-ink/5 bg-white p-4">
            <input
              className="field flex-1"
              placeholder="Write a message..."
              value={content}
              onChange={handleContentChange}
            />
            <button className="btn-accent">Send</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
