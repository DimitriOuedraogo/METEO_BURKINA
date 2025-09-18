import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Récupérer le token et l'email depuis les paramètres de la requête
    const { token, email } = req.query;

    // Vérifier que le token et l'email sont présents
    if (!token || !email) {
        return res.status(400).json({ success: false, error: "Lien invalide." });
    }

    // Chercher le token de vérification dans la base de données
    const record = await prisma.verificationToken.findUnique({
        where: { token: decodeURIComponent(String(token)) },
    });

    const emailDecoded = decodeURIComponent(String(email));

    // Vérifier que le token existe, correspond à l'email et n'a pas expiré
    if (!record || record.identifier !== emailDecoded || record.expires < new Date()) {
        return res.status(400).json({ success: false, error: "Lien expiré ou invalide." });
    }

    // Mettre à jour l'utilisateur pour marquer son email comme vérifié
    await prisma.user.update({
        where: { email: String(email) },
        data: { emailVerified: new Date() },
    });

    // Supprimer le token de vérification pour éviter une réutilisation
    await prisma.verificationToken.delete({
        where: { token: String(token) },
    });

    // Retourner un succès au front
    return res.status(200).json({ success: true, message: "Email vérifié avec succès !" });
}
