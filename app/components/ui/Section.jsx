export default function Section({ title, children, right = null, className = "" }) {
  return (
    <section className={"grid grid-cols-4 px-4 " + className}>
      <h2 className="col-span-4 md:col-span-1 text-3xl">{title}</h2>
      <div className="col-span-4 md:col-span-2">{children}</div>
      <div className="hidden md:block">{right}</div>
    </section>
  )
}