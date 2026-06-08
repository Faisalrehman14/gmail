"use client";

import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import gjsNewsletter from "grapesjs-preset-newsletter";

interface EmailEditorProps {
  initialHtml?: string;
  initialDesign?: string;
  onChange?: (html: string, design: string) => void;
}

export function EmailEditor({ initialHtml, initialDesign, onChange }: EmailEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const gjsRef = useRef<ReturnType<typeof grapesjs.init> | null>(null);

  useEffect(() => {
    if (!editorRef.current || gjsRef.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      height: "600px",
      width: "auto",
      storageManager: false,
      plugins: [gjsNewsletter],
      pluginsOpts: {
        [gjsNewsletter as unknown as string]: {
          modalTitleImport: "Import template",
        },
      },
      canvas: {
        styles: [
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        ],
      },
    });

    if (initialDesign) {
      try {
        editor.loadProjectData(JSON.parse(initialDesign));
      } catch {
        if (initialHtml) editor.setComponents(initialHtml);
      }
    } else if (initialHtml) {
      editor.setComponents(initialHtml);
    }

    editor.on("update", () => {
      onChange?.(editor.getHtml(), JSON.stringify(editor.getProjectData()));
    });

    gjsRef.current = editor;

    return () => {
      editor.destroy();
      gjsRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border">
      <div ref={editorRef} />
    </div>
  );
}
