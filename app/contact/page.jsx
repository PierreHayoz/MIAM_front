export const metadata = {
  title: "Contact — MIAM",
  description: "Écrivez‑nous pour une résidence, un partenariat ou une question sur le programme.",
};

export default function Page () {
  return (
    <div className="grid grid-cols-4 px-4 gap-6">
      <h1 className="col-span-4 md:col-span-1 text-3xl">Contact</h1>
      <div className="col-span-4 md:col-span-2 space-y-6">
        <p className="text-MIAMgrey">
          Pour toute demande : partenariat, réservation de l’espace, presse,
          ou questions liées au programme.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <a href="mailto:hello@miam.example" className="inline-flex h-12 items-center justify-center rounded-full border border-black px-6 hover:bg-MIAMblack hover:text-white transition">
            hello@miam.example
          </a>
          <a href="https://maps.google.com/?q=Avenue%20du%20G%C3%A9n%C3%A9ral%20Guisan%201%2C%201700%20Fribourg" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-full border border-black px-6 hover:bg-MIAMblack hover:text-white transition">
            Avenue du Général Guisan 1, 1700 Fribourg
          </a>
        </div>
      </div>
      <div className="col-span-4 md:col-span-1" />
    </div>
  );
}