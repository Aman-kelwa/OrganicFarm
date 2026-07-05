import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import socket from "../socket";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(res.data.notifications);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch when app starts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for realtime notifications
  useEffect(() => {
    socket.on("new-order", () => {
      fetchNotifications();
    });

    return () => {
      socket.off("new-order");
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
