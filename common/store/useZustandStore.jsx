"use client";
import { create } from "zustand";

const useZustandStore = create((set) => ({
  // SSR 환경에서 localStorage에 접근하지 않도록 체크
  isDarkMode: typeof window !== "undefined" && localStorage.getItem("isDarkMode") === "true" ? true : false,
  setIsDarkMode: (isDarkMode) => set({ isDarkMode }),

  userInfo: null,
  setUserInfo: (userInfo) => set({ userInfo }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  modalMessage: {
    topMessage: "",
    bottomMessage: "",
  },
  setModalMessage: ({ topMessage = "", bottomMessage = "" }) =>
    set({
      modalMessage: {
        topMessage,
        bottomMessage,
      },
    }),

  modalButton: {
    cancelButton: "취소",
    confirmButton: "확인",
  },
  setModalButton: ({ cancelButton = "", confirmButton = "" }) =>
    set({
      modalButton: {
        cancelButton,
        confirmButton,
      },
    }),

  activeModal: {
    oneButtonModal: false,
    twoButtonModal: false,
  },
  setActiveModal: (modalStates) =>
    set((state) => ({
      activeModal: {
        ...state.activeModal,
        ...modalStates,
      },
    })),

  modalConfirmHandler: null,
  setModalConfirmHandler: (handler) =>
    set({
      modalConfirmHandler: handler,
    }),
}));

export default useZustandStore;
