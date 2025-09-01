export default function GlossaryItem({ term, definition }) {
  return (
    <div className="py-6 border-b border-black/10">
      <h3 className="text-xl">{term}</h3>
      <p className="text-MIAMgrey mt-1">{definition}</p>
    </div>
  );
}