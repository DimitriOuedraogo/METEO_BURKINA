import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).json({ success: false, error: "Lien invalide." });
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token: String(token) },
  });

  if (!record || record.identifier !== email || record.expires < new Date()) {
    return res.status(400).json({ success: false, error: "Lien expiré ou invalide." });
  }

  // Vérifier l'utilisateur
  await prisma.user.update({
    where: { email: String(email) },
    data: { emailVerified: new Date() },
  });

  // Supprimer le token
  await prisma.verificationToken.delete({
    where: { token: String(token) },
  });

  return res.status(200).json({ success: true, message: "Email vérifié avec succès !" });
}
