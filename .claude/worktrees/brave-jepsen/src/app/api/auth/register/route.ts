import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  accountType: z.enum(["BUSINESS", "PARTICULIER"]),
  companyName: z.string().optional(),
  address: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 400 }
      );
    }

    const { name, email, password, accountType, companyName, address } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + related records in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          accountType,
        },
      });

      // Create UserPoints record
      await tx.userPoints.create({
        data: { userId: newUser.id, totalPoints: 0 },
      });

      // Create Business profile if needed
      if (accountType === "BUSINESS" && companyName && address) {
        await tx.business.create({
          data: {
            userId: newUser.id,
            companyName,
            address,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      { message: "Compte créé avec succès.", userId: user.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
