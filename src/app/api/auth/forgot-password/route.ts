import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user — return 200 regardless to avoid enumeration
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete any existing reset token for this email
    await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });

    // Generate a secure token
    const token = crypto.randomUUID();

    // Save token, valid for 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetLink = `${appUrl}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: normalizedEmail,
      subject: "Réinitialisation de ton mot de passe — Trookie",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Réinitialisation de mot de passe</title>
          </head>
          <body style="margin:0;padding:0;background-color:#fffcf5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffcf5;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
                    <tr>
                      <td style="padding-bottom:32px;text-align:center;">
                        <span style="font-size:28px;font-weight:900;color:#0e59c3;text-decoration:none;">Trookie</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color:#ffffff;border-radius:16px;padding:40px;border:1px solid rgba(0,0,0,0.08);">
                        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#000000;">
                          Réinitialise ton mot de passe
                        </h1>
                        <p style="margin:0 0 8px;font-size:15px;color:rgba(0,0,0,0.6);line-height:1.6;">
                          Bonjour ${user.name},
                        </p>
                        <p style="margin:0 0 28px;font-size:15px;color:rgba(0,0,0,0.6);line-height:1.6;">
                          Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable <strong>1 heure</strong>.
                        </p>
                        <table cellpadding="0" cellspacing="0" style="width:100%;">
                          <tr>
                            <td align="center">
                              <a
                                href="${resetLink}"
                                style="display:inline-block;background-color:#0e59c3;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;"
                              >
                                Réinitialiser mon mot de passe
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:28px 0 0;font-size:13px;color:rgba(0,0,0,0.4);line-height:1.6;">
                          Si tu n'es pas à l'origine de cette demande, ignore cet email — ton mot de passe restera inchangé.
                        </p>
                        <hr style="margin:28px 0;border:none;border-top:1px solid rgba(0,0,0,0.08);" />
                        <p style="margin:0;font-size:12px;color:rgba(0,0,0,0.35);line-height:1.6;word-break:break-all;">
                          Ou copie ce lien dans ton navigateur :<br />
                          ${resetLink}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:24px;text-align:center;">
                        <p style="margin:0;font-size:12px;color:rgba(0,0,0,0.3);">
                          © ${new Date().getFullYear()} Trookie. Tous droits réservés.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[forgot-password] error:", err);
    return NextResponse.json(
      { error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
