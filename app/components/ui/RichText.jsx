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

  const renderChildren = (kids, keyPrefix) =>
    (kids ?? []).map((c, i) => {
      // si enfant est un block (ex: une sous-liste), on le rend récursivement
      if (c && typeof c === "object" && c.type && c.type !== "text") {
        return renderBlock(c, `${keyPrefix}-b${i}`);
      }
      return renderInline(c, `${keyPrefix}-l${i}`);
    });

  const children = (node?.children ?? []).map((c, i) => {
    // si c a un type block, le rendre comme block récursif
    if (c && typeof c === "object" && c.type && c.type !== "text") {
      return renderBlock(c, `${idx}-b${i}`);
    }
    return renderInline(c, `${idx}-l${i}`);
  });

  switch (node?.type) {
    case "paragraph":
      return <p key={idx} className="leading-tight text-MIAMgreytext mb-2 text-sm ">{children}</p>;

    case "heading": {
      const L = Math.min(Math.max(Number(node.level || 2), 1), 6);
      const Tag = `h${L}`;
      const cls = L === 1 ? "text-xl" : L === 2 ? "text-xl" : L === 3 ? "text-xl" : "text-xl";
      return <Tag key={idx} className={`${cls}  text-MIAMblack mb-2`}>{children}</Tag>;
    }

    case "list": {
  const isOrdered = node.format === "ordered";

  if (isOrdered) {
    const items = (node.children ?? []).map((li, i) => (
      <li key={`${idx}-oli${i}`} className="text-sm text-MIAMgreytext mb-1">
        {renderChildren(li.children, `${idx}-oli${i}`)}
      </li>
    ));
    return (
      <ol
        key={idx}
        className="list-decimal list-outside ml-5 marker:text-MIAMgreen marker:font-semibold
                   text-MIAMgreytext text-sm leading-tight mb-2 space-y-1"
      >
        {items}
      </ol>
    );
  }

  // ✅ UL : puce flèche via ::marker (alignement nickel)
  const items = (node.children ?? []).map((li, i) => (
    <li
      key={`${idx}-uli${i}`}
      className="text-sm text-MIAMgreytext mb-1 pl-4
                 marker:content-['→'] marker:text-MIAMgreytext marker:font-semibold"
    >
      {renderChildren(li.children, `${idx}-uli${i}`)}
    </li>
  ));

  return (
    <ul
      key={idx}
      className="list-outside list-disc ml-5
                 text-MIAMgreytext text-sm leading-tight mb-2 space-y-1"
    >
      {items}
    </ul>
  );
}

   case "list-item":
  // (facultatif — utile si ton éditeur émet des <li> directement)
  return (
    <li
      key={idx}
      className="relative pl-6 text-sm text-MIAMgreytext mb-1 flex items-center
                 before:content-['→'] before:absolute before:left-0 before:top-[0.35em]
                 before:text-MIAMgreen before:font-semibold"
    >
      {renderChildren(node.children, idx)}
    </li>
  );
  
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
    <div className=" max-w-none">
      {nodes.map((n, i) => renderBlock(n, i))}
    </div>
  );
}
