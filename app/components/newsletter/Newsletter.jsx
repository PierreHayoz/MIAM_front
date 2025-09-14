"use client";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus({ type: "error", msg: data?.error || "Erreur inconnue" });
      }
    } catch {
      setStatus({ type: "error", msg: "Erreur réseau" });
    }
  }

  return (
    <div>
      <h2 className="text-xl leading-tight pb-4">
        Abonne toi à notre newsletter <br />
        pour ne rien manquer
      </h2>

      <form
        onSubmit={onSubmit}
        className="bg-MIAMlightgrey rounded-full flex p-2 w-fit"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@mail.ch"
          className="pl-1 w-full bg-transparent focus:outline-none"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-MIAMblack text-MIAMwhite w-fit rounded-full px-2"
        >
          {status === "loading" ? "..." : "s'abonner"}
        </button>
      </form>

      {status === "success" && (
        <p className="text-green-600 mt-2 text-sm">
          Merci pour ton inscription 🎉
        </p>
      )}
      {status?.type === "error" && (
        <p className="text-red-600 mt-2 text-sm">
          {String(status.msg || "Une erreur est survenue, réessaie.")}
        </p>
      )}
    </div>
  );
};

export default Newsletter;
