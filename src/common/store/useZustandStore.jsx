import {create} from "zustand";
const useZustandStore = create((set, get) => ({
  isDarkMode: localStorage.getItem("isDarkMode") === "true" ? true : false,
  setIsDarkMode: (isDarkMode) => set({isDarkMode}),

  userInfo: null,
  setUserInfo: (userInfo) => set({userInfo}),

  isOpenModal: {
    addFinance: true,
  },
  openModal: (modalName) =>
    set((state) => ({
      isOpenModal: {
        ...state.isOpenModal,
        [modalName]: true,
      },
    })),
  closeModal: (modalName) =>
    set((state) => ({
      isOpenModal: {
        ...state.isOpenModal,
        [modalName]: false,
      },
    })),
}));

export default useZustandStore;
