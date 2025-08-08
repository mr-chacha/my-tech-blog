import {create} from "zustand";
const useZustandStore = create((set, get) => ({
  isDarkMode: localStorage.getItem("isDarkMode") === "true" ? true : false,
  setIsDarkMode: (isDarkMode) => set({isDarkMode}),

  userInfo: null,
  setUserInfo: (userInfo) => set({userInfo}),

  // 모달 텍스트
  modalMessage: {
    topMessage: "",
    bottomMessage: "",
  },
  setModalMessage: ({topMessage = "", bottomMessage = ""}) =>
    set({
      modalMessage: {
        topMessage,
        bottomMessage,
      },
    }),
  // 모달 버튼
  modalButton: {
    cancelButton: "취소",
    confirmButton: "확인",
  },
  setModalButton: ({cancelButton = "", confirmButton = ""}) =>
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
  // 모달 컨펌 버튼 여부
  modalConfirmHandler: null,
  setModalConfirmHandler: (handler) =>
    set({
      modalConfirmHandler: handler,
    }),
}));

export default useZustandStore;
