"use client";
import { useState } from "react";
import { useParams } from "next/navigation";

const MESSAGES = {
  fr: {
    title1: "Abonne toi à notre newsletter",
    title2: "pour ne rien manquer",
    placeholder: "hello@mail.ch",
    subscribe: "s'abonner",
    loading: "...",
    success: "Merci pour ton inscription 🎉",
    errUnknown: "Erreur inconnue",
    errNetwork: "Erreur réseau",
  },
  en: {
    title1: "Subscribe to our newsletter",
    title2: "so you don’t miss a thing",
    placeholder: "your@email.com",
    subscribe: "subscribe",
    loading: "...",
    success: "Thanks for subscribing 🎉",
    errUnknown: "Unknown error",
    errNetwork: "Network error",
  },
  de: {
    title1: "Newsletter abonnieren",
    title2: "damit du nichts verpasst",
    placeholder: "deine@mail.ch",
    subscribe: "abonnieren",
    loading: "...",
    success: "Danke für deine Anmeldung 🎉",
    errUnknown: "Unbekannter Fehler",
    errNetwork: "Netzwerkfehler",
  },
};

const baseLang = (l) => String(l || "fr").toLowerCase().split("-")[0];
const t = (l, k) => (MESSAGES[baseLang(l)]?.[k] ?? MESSAGES.en[k] ?? k);

const Newsletter = ({ locale: explicitLocale }) => {
  const params = useParams();
  const locale = explicitLocale || params?.locale || "fr";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // on garde ton style: pas d’info en plus
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus({ type: "error", msg: data?.error || t(locale, "errUnknown") });
      }
    } catch {
      setStatus({ type: "error", msg: t(locale, "errNetwork") });
    }
  }

  return (
    <div>
      <h2 className="text-xl leading-tight pb-4">
        {t(locale, "title1")} <br />
        {t(locale, "title2")}
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
          placeholder={t(locale, "placeholder")}
          className="pl-1 w-full bg-transparent focus:outline-none"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-MIAMblack text-MIAMwhite w-fit rounded-full px-2"
        >
          {status === "loading" ? t(locale, "loading") : t(locale, "subscribe")}
        </button>
      </form>

      {status === "success" && (
        <p className="text-green-600 mt-2 text-sm">
          {t(locale, "success")}
        </p>
      )}
      {status?.type === "error" && (
        <p className="text-red-600 mt-2 text-sm">
          {String(status.msg || t(locale, "errUnknown"))}
        </p>
      )}
    </div>
  );
};

export default Newsletter;
