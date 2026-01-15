import { useEffect, useState } from "react";
import { Dropdown, Badge, Spinner } from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import apiAuth from "../services/apiAuth";

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiAuth.get("notifications/", { params: { unread_only: true } });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiAuth.patch(`notifications/${id}/read/`);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <Dropdown align="end" autoClose="outside">
      <Dropdown.Toggle
        variant="link"
        className="position-relative text-decoration-none p-0"
        style={{ color: "inherit" }}
      >
        <FaBell size={22} />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: "0.7rem" }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: "320px", maxHeight: "420px", overflowY: "auto" }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2">
          <span className="fw-semibold">Notifications</span>
          {loading ? <Spinner animation="border" size="sm" /> : null}
        </div>
        <Dropdown.Divider className="my-1" />

        {notifications.length === 0 ? (
          <Dropdown.Item disabled className="text-muted">
            No notifications
          </Dropdown.Item>
        ) : (
          notifications.map((notif) => (
            <Dropdown.Item
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={!notif.read ? "fw-semibold bg-light" : ""}
            >
              <div className="small">{notif.description}</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                {new Date(notif.time).toLocaleString()}
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
