// Task list nodes for the RichTextEditor's "/" menu. Built on the Tiptap core that @tiptap/react re-exports, so the
// editor needs no extra package. Loaded only by rich-text-editor-inner.tsx (the lazy chunk).
import { mergeAttributes, Node, wrappingInputRule } from "@tiptap/react"

export const TaskList = Node.create({
  name: "taskList",
  group: "block list",
  content: "taskItem+",
  parseHTML() {
    return [{ tag: 'ul[data-type="taskList"]', priority: 51 }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["ul", mergeAttributes(HTMLAttributes, { "data-type": "taskList" }), 0]
  },
})

export const TaskItem = Node.create({
  name: "taskItem",
  content: "paragraph+",
  defining: true,
  addAttributes() {
    return {
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: (element: HTMLElement) => {
          const value = element.getAttribute("data-checked")
          return value === "" || value === "true"
        },
        renderHTML: (attributes: { checked?: boolean }) => ({ "data-checked": attributes.checked ? "true" : "false" }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'li[data-type="taskItem"]', priority: 51, contentElement: (el: HTMLElement) => el.querySelector("div") ?? el }]
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "li",
      mergeAttributes(HTMLAttributes, { "data-type": "taskItem" }),
      ["label", { contenteditable: "false" }, ["input", { type: "checkbox", checked: node.attrs.checked ? "checked" : null }]],
      ["div", 0],
    ]
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      "Shift-Tab": () => this.editor.commands.liftListItem(this.name),
    }
  },
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const item = document.createElement("li")
      const label = document.createElement("label")
      const checkbox = document.createElement("input")
      const content = document.createElement("div")
      const sync = (n: typeof node) => {
        item.dataset.checked = n.attrs.checked ? "true" : "false"
        checkbox.checked = Boolean(n.attrs.checked)
        checkbox.setAttribute("aria-label", `${n.attrs.checked ? "Done" : "To do"}: ${n.textContent || "empty task"}`)
      }
      for (const [key, value] of Object.entries(HTMLAttributes)) if (value != null) item.setAttribute(key, String(value))
      item.dataset.type = "taskItem"
      label.contentEditable = "false"
      checkbox.type = "checkbox"
      checkbox.addEventListener("mousedown", (event) => event.preventDefault())
      checkbox.addEventListener("change", () => {
        if (!editor.isEditable || typeof getPos !== "function") {
          checkbox.checked = !checkbox.checked
          return
        }
        editor
          .chain()
          .focus(undefined, { scrollIntoView: false })
          .command(({ tr }) => {
            const pos = getPos()
            if (typeof pos !== "number") return false
            tr.setNodeMarkup(pos, undefined, { ...tr.doc.nodeAt(pos)?.attrs, checked: checkbox.checked })
            return true
          })
          .run()
      })
      sync(node)
      label.append(checkbox)
      item.append(label, content)
      return {
        dom: item,
        contentDOM: content,
        update: (updated) => {
          if (updated.type !== node.type) return false
          sync(updated)
          return true
        },
      }
    }
  },
  addInputRules() {
    return [
      wrappingInputRule({
        find: /^\s*(\[([( |x])?\])\s$/,
        type: this.type,
        getAttributes: (match) => ({ checked: match[match.length - 1] === "x" }),
      }),
    ]
  },
})
