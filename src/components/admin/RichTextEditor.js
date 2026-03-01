"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
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
  MdPostAdd,
} from "react-icons/md";

const Iframe = Node.create({
  name: "iframe",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "600",
      },
      frameborder: {
        default: "0",
      },
      allowfullscreen: {
        default: "true",
      },
      allow: {
        default:
          "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
      },
      style: {
        default: "border:none;overflow:auto",
      },
      scrolling: {
        default: "auto",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe",
        getAttrs: (node) => ({
          src: node.getAttribute("src"),
          width: node.getAttribute("width"),
          height: node.getAttribute("height"),
          frameborder: node.getAttribute("frameborder"),
          allowfullscreen: node.getAttribute("allowfullscreen"),
          allow: node.getAttribute("allow"),
          style: node.getAttribute("style"),
          scrolling: node.getAttribute("scrolling"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "iframe-container" },
      ["iframe", mergeAttributes(HTMLAttributes)],
    ];
  },
});

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

const Tooltip = ({ text, children, disabled }) => {
  if (!text || disabled) return children;
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-2.5 hidden group-hover:flex flex-col items-center z-[100] pointer-events-none">
        <div className="relative z-50 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap border border-white/10 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200">
          {text}
        </div>
        <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900/95 border-r border-b border-white/10" />
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, active, disabled, title, children }) => (
  <Tooltip text={title} disabled={disabled}>
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md text-sm transition-all duration-150 ${
        active
          ? "bg-primary text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-primary"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  </Tooltip>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;

export default function RichTextEditor({ content, onChange, placeholder }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [showEmbedInput, setShowEmbedInput] = useState(false);

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
      Iframe,
      Placeholder.configure({
        placeholder: placeholder || "Mula menulis kandungan pengumuman anda...",
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

  const addEmbed = useCallback(() => {
    if (!embedCode) return;

    // Check if it's a full iframe tag or just a URL
    if (embedCode.trim().startsWith("<iframe")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(embedCode, "text/html");
      const iframe = doc.querySelector("iframe");

      if (iframe) {
        const attrs = {
          src: iframe.getAttribute("src"),
          width: iframe.getAttribute("width") || "100%",
          height: iframe.getAttribute("height") || "400",
          frameborder: iframe.getAttribute("frameborder") || "0",
          allowfullscreen: iframe.getAttribute("allowfullscreen") || "true",
          allow: iframe.getAttribute("allow"),
          style: iframe.getAttribute("style"),
          scrolling: iframe.getAttribute("scrolling") || "auto",
        };
        editor.chain().focus().insertContent({ type: "iframe", attrs }).run();
      } else {
        alert("Kod benam tidak sah. Pastikan anda memasukkan tag <iframe>.");
      }
    } else {
      // If it looks like a URL, try to wrap it in a default iframe or just abort
      alert("Sila masukkan kod <iframe> yang sah.");
    }

    setEmbedCode("");
    setShowEmbedInput(false);
  }, [editor, embedCode]);

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
      alert("Gagal memuat naik. Sila cuba lagi.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  if (!editor) return null;
  const isColorActive = editor.getAttributes("textStyle").color;

  return (
    <div className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-visible">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-0.5 rounded-t-xl overflow-visible">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Batal Perbuatan"
        >
          <HiArrowUturnLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Ulang Perbuatan"
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
            title={`Tajuk ${level}`}
          >
            <span className="font-bold text-xs">H{level}</span>
          </ToolbarButton>
        ))}

        <Divider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Tebal"
        >
          <HiBold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Condong"
        >
          <HiItalic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Garis Bawah"
        >
          <MdFormatUnderlined className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Garis Tengah"
        >
          <MdFormatStrikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Serlahkan Teks"
        >
          <MdHighlight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Kod Baris"
        >
          <HiCodeBracket className="w-4 h-4" />
        </ToolbarButton>

        {/* Font Color */}
        <div className="flex items-center gap-1 px-1.5 h-8">
          <Tooltip text="Warna Teks">
            <div className="flex items-center gap-1">
              <label htmlFor="fontColor" className="cursor-pointer">
                <MdFormatColorText
                  className="w-4 h-4 transition-colors"
                  style={{ color: isColorActive || "#4b5563" }}
                />
              </label>
              <input
                id="fontColor"
                type="color"
                onInput={(e) =>
                  editor.chain().focus().setColor(e.target.value).run()
                }
                value={isColorActive || "#000000"}
                className="w-4 h-4 p-0 border-none bg-transparent cursor-pointer rounded overflow-hidden"
              />
            </div>
          </Tooltip>
        </div>

        <Divider />

        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Jajar Kiri"
        >
          <MdFormatAlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Jajar Tengah"
        >
          <MdFormatAlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Jajar Kanan"
        >
          <MdFormatAlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Jajar Penuh"
        >
          <MdFormatAlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Senarai Bullet"
        >
          <HiListBullet className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Senarai Bernombor"
        >
          <HiQueueList className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Petikan"
        >
          <MdFormatQuote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Garis Melintang"
        >
          <HiMinus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={() => setShowLinkInput(!showLinkInput)}
          active={editor.isActive("link") || showLinkInput}
          title="Masukkan Pautan"
        >
          <HiLink className="w-4 h-4" />
        </ToolbarButton>

        {/* Image */}
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => setShowImageInput(!showImageInput)}
            active={showImageInput}
            title="Imej (melalui URL)"
          >
            <HiPhoto className="w-4 h-4" />
          </ToolbarButton>
          <Tooltip text="Muat Naik Imej">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className={`p-1.5 rounded-md text-sm transition-all duration-150 text-gray-600 hover:bg-gray-100 hover:text-primary ${uploading ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <HiArrowUpTray className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* File Attachment */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Lampirkan Fail (PDF/Dokumen)"
        >
          <HiPaperClip className="w-4 h-4" />
        </ToolbarButton>

        {/* Embed */}
        <ToolbarButton
          onClick={() => setShowEmbedInput(!showEmbedInput)}
          active={showEmbedInput}
          title="Benamkan Kiriman (FB/Video/Iframe)"
        >
          <MdPostAdd className="w-4 h-4" />
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
            Masukkan
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetLink().run();
              setShowLinkInput(false);
            }}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Alih Keluar
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
            Masukkan
          </button>
          <button
            type="button"
            onClick={() => setShowImageInput(false)}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      {/* Embed Input */}
      {showEmbedInput && (
        <div className="bg-purple-50 border-b border-purple-100 px-3 py-2 flex items-center gap-2">
          <MdPostAdd className="w-4 h-4 text-purple-500 shrink-0" />
          <input
            type="text"
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEmbed()}
            placeholder="Tampal kod <iframe> di sini (cth: dari Facebook atau YouTube)"
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
          />
          <button
            type="button"
            onClick={addEmbed}
            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Benamkan
          </button>
          <button
            type="button"
            onClick={() => setShowEmbedInput(false)}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Word Count */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-1.5 flex justify-end rounded-b-xl">
        <span className="text-[10px] text-gray-400">
          {editor.storage.characterCount?.words?.() ?? 0} patah perkataan ·{" "}
          {editor.getText().length} aksara
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
        .iframe-container {
          position: relative;
          width: 100%;
          margin: 1.5rem 0;
          display: flex;
          justify-content: center;
          background: #f9fafb;
          border-radius: 8px;
          padding: 1rem;
          border: 1px dashed #e5e7eb;
        }
        .iframe-container iframe {
          max-width: 100%;
          border-radius: 4px;
        }
        .ProseMirror-selectednode.iframe-container {
          outline: 3px solid #3b82f6;
          border-style: solid;
        }
      `}</style>
    </div>
  );
}
