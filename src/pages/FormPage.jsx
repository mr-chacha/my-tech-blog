import React, {useRef, useEffect, useState} from "react";
import styled from "styled-components";
import {EditorView, basicSetup} from "codemirror";
import {EditorState} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {oneDark} from "@codemirror/theme-one-dark";

export const FormPage = () => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [code, setCode] = useState("// Write your code here\nconsole.log('Hello World!');");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          javascript(),
          isDarkMode ? oneDark : [],
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setCode(update.state.doc.toString());
            }
          }),
        ],
      });

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [isDarkMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted code:", code);
    alert("Code submitted! Check console for details.");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Container>
      <Header>
        <Title>Code Editor Form</Title>
        <ThemeToggle onClick={toggleTheme}>{isDarkMode ? "🌞 Light" : "🌙 Dark"}</ThemeToggle>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Code Editor</Label>
          <EditorContainer
            ref={editorRef}
            className={`CodeMirror ${isDarkMode ? "cm-s-one-dark" : "cm-s-one-light"} CodeMirror-wrap`}
          />
        </FormGroup>

        <FormGroup>
          <Label>Output Preview</Label>
          <CodePreview>
            <pre>{code}</pre>
          </CodePreview>
        </FormGroup>

        <ButtonGroup>
          <SubmitButton type="submit">Submit Code</SubmitButton>
          <ClearButton
            type="button"
            onClick={() => {
              setCode("");
              if (viewRef.current) {
                viewRef.current.dispatch({
                  changes: {
                    from: 0,
                    to: viewRef.current.state.doc.length,
                    insert: "",
                  },
                });
              }
            }}
          >
            Clear
          </ClearButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #333;

  @media (prefers-color-scheme: dark) {
    color: #fff;
  }
`;

const ThemeToggle = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
  }

  @media (prefers-color-scheme: dark) {
    border-color: #475569;
    background-color: #334155;
    color: #fff;

    &:hover {
      background-color: #475569;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;

  @media (prefers-color-scheme: dark) {
    color: #d1d5db;
  }
`;

const EditorContainer = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  overflow: hidden;
  min-height: 300px;

  &.cm-s-one-light {
    background-color: #fafafa;
  }

  &.cm-s-one-dark {
    background-color: #282c34;
  }

  .cm-editor {
    height: 300px;
  }

  .cm-focused {
    outline: none;
    border-color: #3b82f6;
  }

  @media (prefers-color-scheme: dark) {
    border-color: #475569;
  }
`;

const CodePreview = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8fafc;
  max-height: 200px;
  overflow-y: auto;

  pre {
    margin: 0;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #374151;
  }

  @media (prefers-color-scheme: dark) {
    border-color: #475569;
    background-color: #1e293b;

    pre {
      color: #d1d5db;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
  }
`;

const ClearButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #dc2626;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #ef4444;
  }
`;
