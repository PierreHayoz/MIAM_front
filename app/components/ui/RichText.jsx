// app/components/ui/RichTextServer.jsx
// (pas de "use client")
import React from "react";

function textFrom(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textFrom).join("");
  if (typeof node === "object") {
    if (typeof node.text === "string") return node.text;
    if (Array.isArray(node.children)) return node.children.map(textFrom).join("");
    return Object.values(node).map(textFrom).join("");
  }
  return "";
}

function renderInline(node, key) {
  // Leaf
  if (node && typeof node === "object" && typeof node.text === "string") {
  let parts = node.text.split("\n");
  let children = parts.flatMap((p, i) =>
    i === 0 ? [p] : [<br key={`br-${key}-${i}`} />, p]
  );
  // styles (gras, italique, etc.)
  if (node.bold) children = <strong>{children}</strong>;
  if (node.italic) children = <em>{children}</em>;
  if (node.underline) children = <u>{children}</u>;
  if (node.code) children = <code>{children}</code>;
  return <React.Fragment key={key}>{children}</React.Fragment>;
}

  // Link inline node
  if (node?.type === "link") {
    const href = node.url || "#";
    const ext = /^https?:\/\//i.test(href);
    const kids = (node.children ?? []).map((c, i) => renderInline(c, `${key}-k${i}`));
    return (
      <a
        key={key}
        href={href}
        className="underline underline-offset-2 hover:opacity-80"
        {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {kids}
      </a>
    );
  }

  // Fallback: rendu du texte
  return <React.Fragment key={key}>{textFrom(node)}</React.Fragment>;
}

function renderBlock(node, idx) {
  const children = (node?.children ?? []).map((c, i) => {
    // si c a un type block, le rendre comme block récursif
    if (c && typeof c === "object" && c.type && c.type !== "text") {
      return renderBlock(c, `${idx}-b${i}`);
    }
    return renderInline(c, `${idx}-l${i}`);
  });

  switch (node?.type) {
    case "paragraph":
      return <p key={idx} className="leading-tight text-MIAMgreytext mb-8 text-sm">{children}</p>;

    case "heading": {
      const L = Math.min(Math.max(Number(node.level || 2), 1), 6);
      const Tag = `h${L}`;
      const cls = L === 1 ? "text-xl" : L === 2 ? "text-xl" : L === 3 ? "text-xl" : "text-xl";
      return <Tag key={idx} className={`${cls}  text-MIAMblack  mb-1`}>{children}</Tag>;
    }

    case "list": {
      const Tag = node.format === "ordered" ? "ol" : "ul";
      const items = (node.children ?? []).map((li, i) => (
        <li key={`${idx}-li${i}`}>{(li.children ?? []).map((c, j) => renderInline(c, `${idx}-li${i}-l${j}`))}</li>
      ));
      return <Tag key={idx} className="list-inside ml-5 my-2">{items}</Tag>;
    }

    case "list-item":
      return <li className="list-disc" key={idx}>{children}</li>;

    case "quote":
      return <blockquote key={idx} className="border-l-4 pl-3 italic my-3 text-MIAMgrey">{children}</blockquote>;

    // image/embeds éventuels
    case "image": {
      const src = node?.image?.url || node?.url;
      const alt = node?.alt || "";
      if (!src) return null;
      return <img key={idx} src={src} alt={alt} className="my-3 rounded-xl" />;
    }

    default:
      // Pas de type ou non géré : on tente le texte
      const txt = textFrom(node);
      if (!txt) return null;
      return <p key={idx} className="leading-relaxed">{txt}</p>;
  }
}

export default function RichTextServer({ value }) {
  const nodes = Array.isArray(value) ? value : (value ? [value] : []);
  if (!nodes.length) return null;
  return (
    <div className="prose max-w-none">
      {nodes.map((n, i) => renderBlock(n, i))}
    </div>
  );
}
