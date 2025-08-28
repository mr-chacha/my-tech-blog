import {useCsStore, useZustandStore} from "@/common/store";
import {Box, Modal} from "@mui/material";
import React from "react";
import styled from "styled-components";

export const TwoButtonModal = () => {
  const {activeModal, setActiveModal, modalMessage, modalConfirmHandler} = useZustandStore();

  return (
    <Modal open={activeModal.twoButtonModal} onClose={() => setActiveModal({...activeModal, twoButtonModal: false})}>
      <ModalBox>
        <MessageBox>
          {modalMessage?.topMessage && <Message className="top-message">{modalMessage?.topMessage}</Message>}
          {modalMessage?.bottomMessage && <Message className="bottom-message">{modalMessage?.bottomMessage}</Message>}
        </MessageBox>
        <ButtonSection>
          <CancelButton onClick={() => setActiveModal({...activeModal, twoButtonModal: false})}>취소</CancelButton>

          <ConfirmButton onClick={modalConfirmHandler}>확인</ConfirmButton>
        </ButtonSection>
      </ModalBox>
    </Modal>
  );
};

const Message = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: #333333;
  text-align: center;
  line-height: 1.5;

  &.top-message {
    color: #42b883;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
  }
`;

const MessageBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
`;

const CancelButton = styled.div`
  display: flex;
  padding: 15px 40px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: #8b98a3;
  cursor: pointer;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;
  font: var(--Body-M);
  &:hover {
    background: #6c7884;
  }
`;

const ConfirmButton = styled.div`
  display: flex;
  padding: 15px 40px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: #42b883;
  cursor: pointer;
  color: #ffffff;
  line-height: 1;

  transition: background-color 0.2s ease;
  font: var(--Body-M);
  &:hover {
    background: #369970;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
`;
const ModalBox = styled(Box)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1003;
  min-width: 360px;
  min-height: 200px;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  outline: none;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;
