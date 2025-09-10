export default function PriceList({
  prices = [],
  isFree = false,
  locale = "fr-CH",
  defaultCurrency = "CHF",
}) {
  if (isFree) return <p className="mt-2 font-medium">Gratuit</p>;
  if (!Array.isArray(prices) || prices.length === 0) return null;

  const fmt = (amount, currency) =>
    typeof amount === "number"
      ? new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency || defaultCurrency,
        }).format(amount)
      : null;

  return (
    <ul className="mt-2 space-y-1">
      {prices.map((p, i) => (
        <li key={i} className="flex justify-between gap-2 ">
          <span className="font-medium">{p.label || "—"}</span>
          <span className="opacity-80">
            {fmt(p.amount, p.currency) || p.note || "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}
