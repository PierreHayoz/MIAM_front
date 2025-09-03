// components/ui/CategoryPills.jsx
export default function CategoryPills({
  categories = [],
  className = '',
  pillClass = '',
  hoverClass = '', // ex: categoryHoverClass
}) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <div className={`flex pt-4 gap-1 flex-wrap ${className}`}>
      {categories.map((c, i) => (
        <div
          key={`${c}-${i}`}
          className={[
            "text-xs px-2 py-0.5 rounded-full border transition-colors duration-300",
            pillClass,
            hoverClass,
          ].filter(Boolean).join(" ")}
        >
          {c}
        </div>
      ))}
    </div>
  );
}
