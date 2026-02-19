"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useState, useRef } from "react";
import { uploadToCloudinary, deleteFromCloudinary } from "@lib/cloudinary";
import {
  HiBold,
  HiItalic,
  HiListBullet,
  HiLink,
  HiPhoto,
  HiArrowUturnLeft,
  HiArrowUturnRight,
  HiMinus,
  HiQueueList,
  HiCodeBracket,
  HiPaperClip,
  HiArrowUpTray,
} from "react-icons/hi2";
import {
  MdFormatUnderlined,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdFormatStrikethrough,
  MdFormatQuote,
  MdHighlight,
  MdFormatColorText,
} from "react-icons/md";

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-public-id": {
        default: null,
      },
      "data-resource-type": {
        default: "image",
      },
    };
  },
});

const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-public-id": {
        default: null,
      },
      "data-resource-type": {
        default: "raw",
      },
    };
  },
});

const ToolbarButton = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md text-sm transition-all duration-150 ${
      active
        ? "bg-primary text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-primary"
    } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;

export default function RichTextEditor({ content, onChange, placeholder }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [activeAttachments, setActiveAttachments] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const getEditorCloudinaryIds = useCallback((editor) => {
    const ids = new Set();
    editor.state.doc.descendants((node) => {
      if (node.type.name === "image" && node.attrs["data-public-id"]) {
        ids.add(node.attrs["data-public-id"]);
      }
      node.marks?.forEach((mark) => {
        if (mark.type.name === "link" && mark.attrs["data-public-id"]) {
          ids.add(mark.attrs["data-public-id"]);
        }
      });
    });
    return ids;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CustomLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline cursor-pointer hover:text-primary-dark font-medium",
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-4 shadow-sm cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder:
          placeholder || "Start writing your announcement content...",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Handle deletion tracking
      if (isInitialized) {
        const currentIds = getEditorCloudinaryIds(editor);
        activeAttachments.forEach((id) => {
          if (!currentIds.has(id)) {
            // ID was removed, destroy from Cloudinary
            deleteFromCloudinary(id).catch((err) =>
              console.error("Error deleting attachment:", err),
            );
          }
        });
        setActiveAttachments(currentIds);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none text-gray-800",
      },
    },
    immediatelyRender: false,
  });

  // Initialize tracked IDs once editor is ready
  useEffect(() => {
    if (editor && !isInitialized) {
      const initialIds = getEditorCloudinaryIds(editor);
      setActiveAttachments(initialIds);
      setIsInitialized(true);
    }
  }, [editor, isInitialized, getEditorCloudinaryIds]);

  // Sync external content changes (e.g. when editing existing announcement)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkToLink({ href: "" }).run();
      return;
    }
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const handleFileUpload = async (event, type = "image") => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadToCloudinary(file);
      if (result) {
        if (type === "image") {
          editor
            .chain()
            .focus()
            .setImage({
              src: result.url,
              "data-public-id": result.public_id,
              "data-resource-type": result.resource_type,
            })
            .run();
        } else {
          // If no text is selected, use file name as text
          if (editor.state.selection.empty) {
            editor
              .chain()
              .focus()
              .insertContent(
                `<a href="${result.url}" data-public-id="${result.public_id}" data-resource-type="${result.resource_type}">${file.name}</a>`,
              )
              .run();
          } else {
            editor
              .chain()
              .focus()
              .setLink({
                href: result.url,
                "data-public-id": result.public_id,
                "data-resource-type": result.resource_type,
              })
              .run();
          }
        }
        // Update active attachments immediately to include the new one
        setActiveAttachments((prev) => new Set([...prev, result.public_id]));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-0.5">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <HiArrowUturnLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <HiArrowUturnRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        {[1, 2, 3].map((level) => (
          <ToolbarButton
            key={level}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level }).run()
            }
            active={editor.isActive("heading", { level })}
            title={`Heading ${level}`}
          >
            <span className="font-bold text-xs">H{level}</span>
          </ToolbarButton>
        ))}

        <Divider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <HiBold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <HiItalic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <MdFormatUnderlined className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <MdFormatStrikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <MdHighlight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <HiCodeBracket className="w-4 h-4" />
        </ToolbarButton>

        {/* Font Color */}
        <div className="flex items-center gap-1 px-1.5 h-8">
          <label htmlFor="fontColor" className="cursor-pointer">
            <MdFormatColorText className="w-4 h-4 text-gray-600" />
          </label>
          <input
            id="fontColor"
            type="color"
            onInput={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            value={editor.getAttributes("textStyle").color || "#000000"}
            className="w-4 h-4 p-0 border-none bg-transparent cursor-pointer rounded overflow-hidden"
            title="Font Color"
          />
        </div>

        <Divider />

        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <MdFormatAlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <MdFormatAlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <MdFormatAlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <MdFormatAlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <HiListBullet className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <HiQueueList className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <MdFormatQuote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <HiMinus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={() => setShowLinkInput(!showLinkInput)}
          active={editor.isActive("link") || showLinkInput}
          title="Insert Link"
        >
          <HiLink className="w-4 h-4" />
        </ToolbarButton>

        {/* Image */}
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => setShowImageInput(!showImageInput)}
            active={showImageInput}
            title="Insert Image (URL)"
          >
            <HiPhoto className="w-4 h-4" />
          </ToolbarButton>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            title="Upload Image"
            className={`p-1.5 rounded-md text-sm transition-all duration-150 text-gray-600 hover:bg-gray-100 hover:text-primary ${uploading ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <HiArrowUpTray className="w-4 h-4" />
          </button>
        </div>

        {/* File Attachment */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach File"
        >
          <HiPaperClip className="w-4 h-4" />
        </ToolbarButton>

        {/* Hidden inputs for uploads */}
        <input
          type="file"
          ref={imageInputRef}
          onChange={(e) => handleFileUpload(e, "image")}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e, "file")}
          className="hidden"
        />

        {uploading && (
          <div className="flex items-center px-2">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="bg-blue-50 border-b border-blue-100 px-3 py-2 flex items-center gap-2">
          <HiLink className="w-4 h-4 text-blue-500 shrink-0" />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setLink()}
            placeholder="https://example.com"
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
          <button
            type="button"
            onClick={setLink}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetLink().run();
              setShowLinkInput(false);
            }}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      {/* Image URL Input */}
      {showImageInput && (
        <div className="bg-green-50 border-b border-green-100 px-3 py-2 flex items-center gap-2">
          <HiPhoto className="w-4 h-4 text-green-500 shrink-0" />
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addImage()}
            placeholder="https://example.com/image.jpg or Google Drive link"
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
          />
          <button
            type="button"
            onClick={addImage}
            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => setShowImageInput(false)}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Word Count */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-1.5 flex justify-end">
        <span className="text-[10px] text-gray-400">
          {editor.storage.characterCount?.words?.() ?? 0} words ·{" "}
          {editor.getText().length} characters
        </span>
      </div>

      <style jsx global>{`
        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1rem;
          margin-left: 0;
          color: #6b7280;
          font-style: italic;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: monospace;
          font-size: 0.875em;
          color: #dc2626;
        }
        .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .ProseMirror a {
          color: #6366f1;
          text-decoration: underline;
        }
        .ProseMirror img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 1rem 0 0.5rem;
          color: #1f2937;
        }
        .ProseMirror h2 {
          font-size: 1.375rem;
          font-weight: 700;
          margin: 0.875rem 0 0.5rem;
          color: #374151;
        }
        .ProseMirror h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0.75rem 0 0.375rem;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}
