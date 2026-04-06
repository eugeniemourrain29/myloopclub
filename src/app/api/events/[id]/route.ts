import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { resend } from "@/lib/resend";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().optional(),
  timeSlot: z.string().optional(),
  maxParticipants: z.number().int().min(2).optional(),
  price: z.number().min(0).optional(),
  venueSuggestion: z.string().min(1).optional(),
  venueAddress: z.string().min(1).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        include: { user: { select: { email: true, name: true } } },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }

  if (event.createdById !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.title) updateData.title = data.title;
  if (data.timeSlot) updateData.timeSlot = data.timeSlot;
  if (data.maxParticipants) updateData.maxParticipants = data.maxParticipants;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.venueSuggestion) updateData.fripeirieName = data.venueSuggestion;
  if (data.venueAddress) {
    updateData.address = data.venueAddress;
    // Regeocode if address changed
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.venueAddress)}&format=json&limit=1&countrycodes=fr`;
      const geoRes = await fetch(url, {
        headers: { "User-Agent": "Trookie/1.0 (trookie.vercel.app)" },
      });
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        updateData.lat = parseFloat(geoData[0].lat);
        updateData.lng = parseFloat(geoData[0].lon);
      }
    } catch {}
  }
  if (data.date) updateData.date = new Date(data.date);

  const updated = await prisma.event.update({
    where: { id: params.id },
    data: updateData,
  });

  // Notify registered participants
  const participants = event.registrations.map((r) => r.user);
  if (participants.length > 0) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const eventLink = `${appUrl}/events/${params.id}`;
    const newDate = data.date ? new Date(data.date) : event.date;
    const dateStr = newDate.toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    await Promise.allSettled(
      participants.map((p) =>
        resend.emails.send({
          from: "Trookie <onboarding@resend.dev>",
          to: p.email,
          subject: `Modification d'un Loop Club — ${updated.title}`,
          html: `
            <!DOCTYPE html>
            <html lang="fr">
              <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
              <body style="margin:0;padding:0;background-color:#fffcf5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffcf5;padding:40px 20px;">
                  <tr><td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
                      <tr><td style="padding-bottom:32px;text-align:center;">
                        <span style="font-size:28px;font-weight:900;color:#0e59c3;">Trookie</span>
                      </td></tr>
                      <tr><td style="background-color:#ffffff;border-radius:16px;padding:40px;border:1px solid rgba(0,0,0,0.08);">
                        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#000;">
                          Un Loop Club a été modifié
                        </h1>
                        <p style="margin:0 0 8px;font-size:15px;color:rgba(0,0,0,0.6);line-height:1.6;">
                          Bonjour ${p.name},
                        </p>
                        <p style="margin:0 0 24px;font-size:15px;color:rgba(0,0,0,0.6);line-height:1.6;">
                          Le Loop Club <strong>${updated.title}</strong> auquel tu es inscrit(e) a été mis à jour.
                        </p>
                        <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8f8f8;border-radius:12px;padding:16px;margin-bottom:24px;">
                          <tr><td style="font-size:14px;color:rgba(0,0,0,0.7);line-height:2;">
                            <strong>Lieu :</strong> ${updated.fripeirieName}<br/>
                            <strong>Adresse :</strong> ${updated.address}<br/>
                            <strong>Date :</strong> ${dateStr}<br/>
                            <strong>Créneau :</strong> ${updated.timeSlot}<br/>
                            <strong>Prix :</strong> ${updated.price === 0 ? "Gratuit" : `${updated.price} €`}
                          </td></tr>
                        </table>
                        <table cellpadding="0" cellspacing="0" style="width:100%;">
                          <tr><td align="center">
                            <a href="${eventLink}" style="display:inline-block;background-color:#0e59c3;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;">
                              Voir l'événement
                            </a>
                          </td></tr>
                        </table>
                        <p style="margin:28px 0 0;font-size:13px;color:rgba(0,0,0,0.4);line-height:1.6;">
                          Si tu ne peux plus participer, contacte l'organisateur.
                        </p>
                      </td></tr>
                      <tr><td style="padding-top:24px;text-align:center;">
                        <p style="margin:0;font-size:12px;color:rgba(0,0,0,0.3);">
                          © ${new Date().getFullYear()} Trookie. Tous droits réservés.
                        </p>
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
              </body>
            </html>
          `,
        })
      )
    );
  }

  return NextResponse.json({ event: updated, notified: participants.length });
}
