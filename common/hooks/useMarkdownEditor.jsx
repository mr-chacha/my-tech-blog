"use client";
import { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";

export function useMarkdownEditor(enabled) {
  const editorRef = useRef(null), editorViewRef = useRef(null), latestContent = useRef("");
  const [content, setContent] = useState("");
  latestContent.current = content;
  useEffect(() => {
    if (!enabled || !editorRef.current) return;
    const view = new EditorView({ parent: editorRef.current, state: EditorState.create({
      doc: latestContent.current,
      extensions: [basicSetup, markdown(), EditorView.lineWrapping,
        EditorView.theme({ "&": { fontSize: "16px" }, ".cm-content": { padding: "20px", minHeight: "400px", fontFamily: "'Noto Sans KR', sans-serif", lineHeight: "1.7" }, ".cm-gutters": { display: "none" } }),
        EditorView.updateListener.of((update) => { if (update.docChanged) setContent(update.state.doc.toString()); }),
      ],
    }) });
    editorViewRef.current = view;
    return () => { editorViewRef.current = null; view.destroy(); };
  }, [enabled]);
  const replaceContent = (value) => {
    setContent(value); latestContent.current = value;
    const view = editorViewRef.current;
    if (view) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  };
  const insertText = (before, after = "", placeholder = "") => {
    const view = editorViewRef.current;
    if (!view) return;
    const selection = view.state.selection.main;
    const text = view.state.sliceDoc(selection.from, selection.to) || placeholder;
    view.dispatch({ changes: { from: selection.from, to: selection.to, insert: before + text + after }, selection: { anchor: selection.from + before.length, head: selection.from + before.length + text.length } });
    view.focus();
  };
  const insertHeading = (level) => {
    const view = editorViewRef.current;
    if (!view) return;
    const line = view.state.doc.lineAt(view.state.selection.main.from);
    insertText(`${line.text.trim() ? "\n" : ""}${"#".repeat(level)} `);
  };
  const insertList = () => {
    const view = editorViewRef.current;
    if (!view) return;
    const selection = view.state.selection.main;
    const line = view.state.doc.lineAt(selection.from);
    view.dispatch({ changes: { from: line.from, insert: "- " }, selection: { anchor: selection.from + 2, head: selection.to + 2 } });
    view.focus();
  };
  return { editorRef, editorViewRef, content, replaceContent, insertText, insertHeading, insertList };
}
