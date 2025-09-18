import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier que la méthode est POST
  if (req.method !== "POST") return res.status(405).end();

  const { username, email, password } = req.body;

  // Vérifier si un utilisateur avec le même email existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ success: false, error: "Email déjà utilisé." });
  }

  // Hasher le mot de passe avant de le stocker
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer l'utilisateur dans la base de données avec email non vérifié
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      emailVerified: null,
    },
  });

  // Générer un token unique pour la vérification de l'email
  const token = randomBytes(32).toString("hex");

  // Enregistrer le token dans la table VerificationToken avec expiration 24h
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Configuration du transporteur pour l'envoi de mail
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  // Lien de vérification que l'utilisateur devra cliquer
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}&email=${email}`;
await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: email,
  subject: "Vérifiez votre email - Météo App",
  html: `
    <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px; font-family: Arial, sans-serif;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <h2 style="color: #2563eb; margin-bottom: 20px; text-align: center;">Météo App</h2>
        
        <h3 style="color: #333; margin-bottom: 15px;">Bonjour ${username},</h3>
        
        <p style="color: #666; line-height: 1.5; margin-bottom: 25px;">
          Merci de vous être inscrit ! Pour activer votre compte, cliquez sur le bouton ci-dessous :
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Vérifier mon email
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
        
        <p style="color: #999; font-size: 14px; text-align: center;">
          Si le bouton ne fonctionne pas, copiez ce lien :<br>
          <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
        </p>
        
      </div>
    </div>
  `,
});

  // Retourner succès au front-end
  return res.status(200).json({ success: true });
}
