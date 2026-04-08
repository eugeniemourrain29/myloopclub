import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProposeEventForm } from "./ProposeEventForm";

export default async function ProposePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/propose");
  }

  const accountType = session.user.accountType;

  // If business, fetch their friperies for the dropdown
  let friperies: { id: string; name: string; address: string }[] = [];
  if (accountType === "BUSINESS") {
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
      include: { friperies: true },
    });
    friperies = business?.friperies ?? [];
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] py-12 px-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0e59c3]">Proposer un Loop Club</h1>
          <p className="mt-2 text-black/50 text-sm">
            {accountType === "BUSINESS"
              ? "En tant que partenaire, tu peux organiser des Loop Clubs dans tes friperies."
              : "Tu peux suggérer un lieu pour un prochain Loop Club."}
          </p>
        </div>

        <ProposeEventForm
          accountType={accountType}
          friperies={friperies}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
