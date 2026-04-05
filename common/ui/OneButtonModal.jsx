"use client";
import { useZustandStore } from "@/common/store";
import { Box, Modal } from "@mui/material";
import React from "react";
import styled from "styled-components";

export const OneButtonModal = () => {
  const { activeModal, setActiveModal, modalMessage } = useZustandStore();

  return (
    <Modal open={activeModal.oneButtonModal} onClose={() => setActiveModal({ ...activeModal, oneButtonModal: false })}>
      <ModalBox>
        <MessageBox>
          {modalMessage?.topMessage && <Message className="top-message">{modalMessage?.topMessage}</Message>}
          {modalMessage?.bottomMessage && <Message className="bottom-message">{modalMessage?.bottomMessage}</Message>}
        </MessageBox>
        <ButtonBox>
          <ConfirmButton onClick={() => setActiveModal({ ...activeModal, oneButtonModal: false })}>확인</ConfirmButton>
        </ButtonBox>
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
    color: var(--Brand-Colors);
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
`;

const MessageBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
`;

const ConfirmButton = styled.div`
  display: flex;
  width: 108px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: var(--Brand-Colors);
  cursor: pointer;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover {
    background: #369970;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;
