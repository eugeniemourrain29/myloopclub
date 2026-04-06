import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const businessEventSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  timeSlot: z.string(),
  maxParticipants: z.number().int().min(2),
  price: z.number().min(0),
  venueSuggestion: z.string().min(1),
  venueAddress: z.string().min(1),
  accountType: z.literal("BUSINESS"),
});

const particulierEventSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  timeSlot: z.string(),
  maxParticipants: z.number().int().min(2),
  price: z.number().min(0),
  venueSuggestion: z.string().min(1),
  venueAddress: z.string().min(1),
  accountType: z.literal("PARTICULIER"),
});

const eventSchema = z.union([businessEventSchema, particulierEventSchema]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const data = parsed.data;
    const eventDate = new Date(data.date);

    if (eventDate < new Date()) {
      return NextResponse.json(
        { error: "La date ne peut pas être dans le passé." },
        { status: 400 }
      );
    }

    if (data.accountType === "BUSINESS") {
      const event = await prisma.event.create({
        data: {
          title: data.title,
          fripeirieName: data.venueSuggestion,
          address: data.venueAddress,
          date: eventDate,
          timeSlot: data.timeSlot,
          maxParticipants: data.maxParticipants,
          price: data.price,
          status: "UPCOMING",
          createdById: session.user.id,
        },
      });

      return NextResponse.json({ event }, { status: 201 });
    } else {
      // Particulier suggestion — store as UPCOMING but flag with a note
      // In production, admin would review these. Status could be PENDING.
      const event = await prisma.event.create({
        data: {
          title: data.title,
          fripeirieName: data.venueSuggestion,
          address: data.venueAddress,
          date: eventDate,
          timeSlot: data.timeSlot,
          maxParticipants: data.maxParticipants,
          price: data.price,
          status: "UPCOMING",
          createdById: session.user.id,
        },
      });

      return NextResponse.json({ event }, { status: 201 });
    }
  } catch (err) {
    console.error("[events POST] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "UPCOMING";

  const now = new Date();

  // Auto-expire past events on query
  await prisma.event.updateMany({
    where: {
      status: "UPCOMING",
      date: { lt: now },
    },
    data: { status: "PAST" },
  });

  const events = await prisma.event.findMany({
    where: { status: status as "UPCOMING" | "PAST" | "CANCELLED" },
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ events });
}
