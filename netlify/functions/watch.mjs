import { getStore } from "@netlify/blobs";
import { yahoo } from "../lib/data.mjs";
export const config = { schedule: "*/30 * * * *" };

async function mail(p, why, price) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: "Bearer " + process.env.RESEND_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Radar de inversión <onboarding@resend.dev>",
      to: [process.env.ALERT_EMAIL],
      subject: `Hora de vender ${p.t}: ${why}`,
      html: `<h2>Hora de vender ${p.t} (${p.type})</h2><p>${why}.</p><p>Precio actual: ${price}. Tu entrada: ${p.entry}. Monto: US$ ${p.amt}.</p><p style="color:#666">Aviso orientativo, no es asesoría financiera.</p>`
    })
  });
  if (!r.ok) throw new Error("Resend " + r.status);
}

export default async () => {
  const s = getStore("radar"), pos = (await s.get("pos", { type: "json" })) || [];
  let changed = false;
  for (const p of pos) {
    if (p.notified) continue;
    try {
      const { price } = await yahoo(p.t, "5d"), g = (price / p.entry - 1) * 100;
      const why = g >= p.obj ? `Objetivo alcanzado (+${g.toFixed(1)} %)` : g <= -p.stop ? `Stop alcanzado (${g.toFixed(1)} %)` : Date.now() >= p.sell ? "Se cumplió el plazo de tenencia" : null;
      if (why) { await mail(p, why, price); p.notified = why; changed = true; }
    } catch (e) { console.error(p.t, e.message); }
  }
  if (changed) await s.setJSON("pos", pos);
};
