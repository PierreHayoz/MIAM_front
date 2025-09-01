import GlossaryItem from './GlossaryItem';

export default function GlossaryList({ items = [] }) {
  if (!items.length) {
    return <p className="text-MIAMgrey">Aucun terme pour le moment.</p>;
  }
  return (
    <div>
      {items.map((it) => (
        <GlossaryItem key={it.term} {...it} />
      ))}
    </div>
  );
}