"use client";
import styled from "styled-components";

export default function TableEditorModal({ open, tableData, setTableData, onClose, onInsert }) {
    if (!open) return null;

    const addRow = () => {
      const newRow = Array(tableData[0].length).fill("");
      setTableData([...tableData, newRow]);
    };

    const addColumn = () => {
      setTableData(tableData.map((row) => [...row, ""]));
    };

    const deleteRow = (index) => {
      if (tableData.length > 1) {
        setTableData(tableData.filter((_, i) => i !== index));
      }
    };

    const deleteColumn = (index) => {
      if (tableData[0].length > 1) {
        setTableData(tableData.map((row) => row.filter((_, i) => i !== index)));
      }
    };

    const updateCell = (rowIndex, colIndex, value) => {
      setTableData((rows) => rows.map((row, r) => row.map((cell, c) => r === rowIndex && c === colIndex ? value : cell)));
    };

    return (
      <ModalOverlay onClick={() => onClose()}>
        <ModalContent role="dialog" aria-modal="true" aria-label="표 편집" onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h3>표 편집</h3>
            <CloseButton onClick={() => onClose()}>×</CloseButton>
          </ModalHeader>

          <ModalBody>
            <div style={{marginBottom: "20px"}}>
              <button
                onClick={addRow}
                style={{
                  marginRight: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                + 행 추가
              </button>
              <button
                onClick={addColumn}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                + 열 추가
              </button>
            </div>

            <table style={{borderCollapse: "collapse", width: "100%"}}>
              <thead>
                <tr>
                  {tableData[0].map((_, colIndex) => (
                    <th
                      key={colIndex}
                      style={{
                        border: "1px solid #e2e8f0",
                        padding: "0",
                        position: "relative",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <input
                        value={tableData[0][colIndex]}
                        onChange={(e) => updateCell(0, colIndex, e.target.value)}
                        placeholder="헤더"
                        style={{
                          border: "none",
                          outline: "none",
                          width: "100%",
                          padding: "12px",
                          background: "transparent",
                        }}
                      />
                      <button
                        onClick={() => deleteColumn(colIndex)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} style={{border: "1px solid #e2e8f0", padding: "0"}}>
                        <input
                          value={cell}
                          onChange={(e) => updateCell(rowIndex + 1, colIndex, e.target.value)}
                          placeholder="내용"
                          style={{
                            border: "none",
                            outline: "none",
                            width: "100%",
                            padding: "12px",
                            background: "transparent",
                          }}
                        />
                      </td>
                    ))}
                    <td style={{border: "1px solid #e2e8f0", padding: "0"}}>
                      <button
                        onClick={() => deleteRow(rowIndex + 1)}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => onClose()}>취소</Button>
            <Button
              onClick={() => {
                onInsert();
                onClose();
              }}
            >
              삽입
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    );
  }

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const ModalBody = styled.div`
  margin-bottom: 20px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:first-child {
    background: #6c757d;
    color: white;
  }

  &:last-child {
    background: #007bff;
    color: white;
  }
`;
