import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Validation ultra simple
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Email invalide" }, { status: 400 });
    }

    // Option: honeypot anti-bot
    const url = new URL(req.url);
    const hp = url.searchParams.get("hp");
    if (hp) {
      // Si quelqu’un remplit le honeypot, on fait comme si tout allait bien
      return NextResponse.json({ ok: true });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listId = Number(process.env.BREVO_LIST_ID);

    if (!apiKey || !listId) {
      return NextResponse.json(
        { ok: false, error: "Configuration serveur manquante" },
        { status: 500 }
      );
    }

    // Docs Brevo: POST /v3/contacts
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true, // met à jour si déjà inscrit
      }),
    });

    // 201 créé, 204 mis à jour
    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    const data = await res.json().catch(() => ({}));
    // Si déjà présent, on considère que c’est OK pour l’UX
    if (res.status === 400 && /already exists/i.test(JSON.stringify(data))) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: data?.message || "Erreur d’inscription" },
      { status: res.status || 500 }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur inattendue" },
      { status: 500 }
    );
  }
}
