import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Calendar,
  AlertTriangle,
  Info,
  Trash2,
  CheckCheck,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';
import { PageLoader, EmptyState, Badge, Button } from '../../components/ui';

export default function PatientNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await patientService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await patientService.markNotificationAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      // Silent fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await patientService.markAllNotificationsAsRead();
      if (res.success) {
        toast.success('All notifications marked as read.');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await patientService.deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success('Notification removed.');
      }
    } catch (err) {
      toast.error('Failed to delete notification.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment_reminder':
      case 'appointment_confirmed':
      case 'new_appointment':
        return <Calendar className="w-4 h-4 text-brand-600" />;
      case 'appointment_cancelled':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) {
    return <PageLoader message="Loading notifications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-extrabold text-slate-900">
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay updated with appointment reminders, booking confirmations, and care notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10">
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You don't have any notifications right now. When you book an appointment, reminders will appear here."
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => {
            const timeAgo = notif.createdAt
              ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
              : 'Recent';

            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  notif.isRead
                    ? 'hover:bg-slate-50/70 bg-white'
                    : 'bg-brand-50/40 hover:bg-brand-50/70'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.isRead ? 'bg-slate-100' : 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                      )}
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          notif.isRead ? 'text-slate-700' : 'text-slate-900'
                        }`}
                      >
                        {notif.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif._id);
                    }}
                    title="Delete notification"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
