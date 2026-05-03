import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import axios from "axios";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create((set, get) => ({
  //states that will be used in the chat component
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  //functions that will be used in the chat component
  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    // Show the message immediately in the UI
    const tempId = `temp-${Date.now()}`; // Generate a temporary ID for the optimistic message
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, 
    };
    set({messages:[...messages, optimisticMessage]}); // Add the optimistic message to the state
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: messages.concat(res.data) }); // add the new messages to the existing messages
    } catch (error) {
      set({messages:messages}) // optimistic message removed on failure
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => { 
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return; // if no user is selected so no new messages received
    
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return; // if the new message is not from the selected user, ignore it

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] }); // add the new message to the existing messages
      
      if (isSoundEnabled) {
        const NotificationSound = new Audio("/sound/notification.mp3");
        NotificationSound.currentTime = 0; // reset sound to start
        NotificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
      })

  },

  unsubscribeFromMessages: () => { 
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
