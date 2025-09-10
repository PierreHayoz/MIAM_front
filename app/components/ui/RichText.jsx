// app/components/ui/RichTextServer.jsx
// (pas de "use client")
import React from "react";

// helpers
const cx = (...xs) => xs.filter(Boolean).join(" ");

const isBlockType = (t) =>
  t === "paragraph" ||
  t === "heading" ||
  t === "list" ||
  t === "list-item" ||
  t === "quote" ||
  t === "image";

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
  if (node?.type === "link" || node?.type === "a") {
    const href = node.href || node.url || "#";
    const kids = (node.children ?? []).map((c, i) => renderInline(c, `${key}-k${i}`));
    const isExternal =
      /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
    return (
      <a
        key={key}
        href={href}
        className="underline underline-offset-2 hover:opacity-80"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {kids.length ? kids : node.title || href}
      </a>
    );
  }
  return <React.Fragment key={key}>{textFrom(node)}</React.Fragment>;
}

export default function RichTextServer({
  value,
  tone = "default", // "default" | "inherit" | "light" | "dark"
}) {
  const nodes = Array.isArray(value) ? value : value ? [value] : [];
  if (!nodes.length) return null;

  // -------- Couleurs par tonalité --------
  const toneTo = {
    default: {
      para: "text-MIAMgreytext",
      heading: "text-MIAMblack",
      list: "text-MIAMgreytext",
      marker: "marker:text-MIAMgreytext",
      quote: "text-MIAMgrey",
      before: "before:text-MIAMgreen",
    },
    inherit: {
      para: "text-inherit",
      heading: "text-inherit",
      list: "text-inherit",
      marker: "marker:text-current",
      quote: "text-inherit",
      before: "before:text-current",
    },
    light: {
      para: "text-MIAMwhite",
      heading: "text-MIAMwhite",
      list: "text-MIAMwhite",
      marker: "marker:text-MIAMwhite",
      quote: "text-MIAMwhite/80",
      before: "before:text-MIAMwhite",
    },
    dark: {
      para: "text-MIAMblack",
      heading: "text-MIAMblack",
      list: "text-MIAMblack",
      marker: "marker:text-MIAMblack",
      quote: "text-MIAMgreytext",
      before: "before:text-MIAMblack",
    },
  };
  const colors = toneTo[tone] ?? toneTo.default;
  // --------------------------------------

  const renderChildren = (kids, keyPrefix) =>
    (kids ?? []).map((c, i) => {
      if (c && typeof c === "object" && c.type && isBlockType(c.type)) {
        return renderBlock(c, `${keyPrefix}-b${i}`);
      }
      return renderInline(c, `${keyPrefix}-l${i}`);
    });

  function renderBlock(node, idx) {
    const children = (node?.children ?? []).map((c, i) => {
      if (c && typeof c === "object" && c.type && isBlockType(c.type)) {
        return renderBlock(c, `${idx}-b${i}`);
      }
      return renderInline(c, `${idx}-l${i}`);
    });

    switch (node?.type) {
      case "paragraph":
        return (
          <p key={idx} className={cx("leading-tight mb-2 ", colors.para)}>
            {children}
          </p>
        );

      case "heading": {
        const L = Math.min(Math.max(Number(node.level || 2), 1), 6);
        const Tag = `h${L}`;
        return (
          <Tag key={idx} className={cx("text-xl mb-2", colors.heading)}>
            {children}
          </Tag>
        );
      }

      case "list": {
        const isOrdered = node.format === "ordered";

        if (isOrdered) {
          const items = (node.children ?? []).map((li, i) => (
            <li key={`${idx}-oli${i}`} className={cx(" mb-1", colors.list)}>
              {renderChildren(li.children, `${idx}-oli${i}`)}
            </li>
          ));
          return (
            <ol
              key={idx}
              className={cx(
                "list-decimal list-outside ml-5 leading-tight mb-2 space-y-1",
                colors.list
              )}
            >
              {items}
            </ol>
          );
        }

        const items = (node.children ?? []).map((li, i) => (
          <li
            key={`${idx}-uli${i}`}
            className={cx(
              " mb-1 pl-4 marker:content-['→'] marker:font-semibold",
              colors.list,
              colors.marker
            )}
          >
            {renderChildren(li.children, `${idx}-uli${i}`)}
          </li>
        ));
        return (
          <ul
            key={idx}
            className={cx("list-outside ml-5 leading-tight mb-2 space-y-1", colors.list)}
          >
            {items}
          </ul>
        );
      }

      case "list-item":
        return (
          <li
            key={idx}
            className={cx(
              "relative mb-1 flex items-center",
              colors.list,
              colors.before,
              "before:content-['→'] before:absolute before:left-0 before:top-[0.35em] before:font-semibold"
            )}
          >
            {renderChildren(node.children, idx)}
          </li>
        );

      case "quote":
        return (
          <blockquote key={idx} className={cx("border-l-4 pl-3 italic my-3", colors.quote)}>
            {children}
          </blockquote>
        );

      case "image": {
        const src = node?.image?.url || node?.url;
        const alt = node?.alt || "";
        if (!src) return null;
        return <img key={idx} src={src} alt={alt} className="my-3 rounded-xl" />;
      }

      default: {
        const txt = textFrom(node);
        if (!txt) return null;
        return <p key={idx} className={cx("leading-relaxed", colors.para)}>{txt}</p>;
      }
    }
  }

  return <div className="max-w-none">{nodes.map((n, i) => renderBlock(n, i))}</div>;
}
