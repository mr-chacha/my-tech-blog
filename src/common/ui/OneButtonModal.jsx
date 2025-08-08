import {useZustandStore} from "@/common/store";
import {Box, Modal} from "@mui/material";
import React from "react";
import styled from "styled-components";

export const OneButtonModal = () => {
  const {activeModal, setActiveModal, setModalMessage, modalMessage, modalConfirmHandler} = useZustandStore();
  const confirmHandler = () => {
    setActiveModal({...activeModal, oneButtonModal: false});
    setModalMessage({
      topMessage: "",
      bottomMessage: "",
    });
  };

  const handleConfirmClick = () => {
    if (modalConfirmHandler) {
      modalConfirmHandler();
    } else {
      confirmHandler();
    }
  };

  return (
    <Modal open={activeModal.oneButtonModal} onClose={() => setActiveModal({...activeModal, oneButtonModal: false})}>
      <ModalBox>
        <MessageBox>
          {modalMessage?.topMessage && (
            <Message font="var(--Font-14-700)" color="#754eea">
              {modalMessage?.topMessage}
            </Message>
          )}
          {modalMessage?.bottomMessage && (
            <Message font="var(--Font-14-400)" color="#1a1b20">
              {modalMessage?.bottomMessage}
            </Message>
          )}
        </MessageBox>
        <ButtonBox>
          <ConfirmButton onClick={handleConfirmClick}>확인</ConfirmButton>
        </ButtonBox>
      </ModalBox>
    </Modal>
  );
};

const Message = styled.div`
  font: ${(props) => props.font};
  color: ${(props) => props.color};
  white-space: pre-line;
  text-align: center;
`;
const MessageBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 4px;
`;
const ConfirmButton = styled.div`
  display: flex;
  width: 108px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: #754eea;
  cursor: pointer;
  color: #fff;
  font: var(--Headline-B);
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
  min-width: 335px;
  min-height: 168px;
  padding: 40px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  outline: none;
  gap: 24px;
`;
