// services/geminiWeatherAdvisor.ts
import { Plan } from "../../types/plan";
import { WeatherAdvice } from "../../types/weatherAdvice";
import { WeatherData } from "./weatherService";

type PlanType = "free" | "premium" | "enterprise";

class GeminiWeatherAdvisor {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getAdvice(weatherData: WeatherData, plan: Plan): Promise<WeatherAdvice> {
    const prompt = this.buildPrompt(weatherData, plan);

    try {
      const response = await fetch("/api/gemini/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Erreur Gemini:", data);
        throw new Error(`[${data.status || "500"}] ${data.error.message}`);
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      return this.parseResponse(generatedText, plan);
    } catch (error: any) {
      console.error("Erreur Gemini conseils:", error.message);

      // Retour fallback avec distinction des plans
      return {
        ...this.getFallbackAdvice(weatherData, plan),
        general: [
          "⚠️ Service Gemini momentanément indisponible.",
          ...this.getFallbackAdvice(weatherData, plan).general,
        ],
      };
    }
  }

  private buildPrompt(weather: WeatherData, plan: Plan): string {
    let base = `Tu es un expert météorologue spécialisé dans le climat du Burkina Faso. 

Conditions météo actuelles pour ${weather.name}, Burkina Faso :
🌡️ Température: ${weather.temperature}°C (ressenti ${weather.feels_like}°C)
💧 Humidité: ${weather.humidity}%
🌪️ Vent: ${weather.wind_speed} km/h
☁️ Conditions: ${weather.description}

Donne des conseils pratiques organisés EXACTEMENT comme ceci :`;

    if (plan.type === "free") {
      base += `
**GÉNÉRAL:**
- Premier conseil général pratique
- Deuxième conseil général pratique

**SANTÉ:**
- Premier conseil santé/confort
- Deuxième conseil santé/confort

(Réponds uniquement avec ces deux sections)`;
    } else if (plan.type === "premium") {
      base += `
**GÉNÉRAL:**
- Premier conseil général pratique
- Deuxième conseil général pratique

**SANTÉ:**
- Premier conseil santé/confort
- Deuxième conseil santé/confort

**ACTIVITÉS:**
- Premier conseil activités/sorties
- Deuxième conseil activités/sorties

**AGRICULTURE:**
- Conseil agriculture si pertinent (sinon ignore cette section)`;
    } else if (plan.type === "enterprise") {
      base += `
**GÉNÉRAL:**
- Premier conseil général pratique
- Deuxième conseil général pratique

**SANTÉ:**
- Premier conseil santé/confort
- Deuxième conseil santé/confort

**ENTREPRISE:**
- Premier conseil pour les entreprises
- Deuxième conseil pour les entreprises

**ACTIVITÉS:**
- Premier conseil activités/sorties
- Deuxième conseil activités/sorties

**AGRICULTURE:**
- Conseil agriculture si pertinent (sinon ignore cette section)`;
    }

    base += `
Adapte au contexte burkinabé : climat sahélien, Harmattan, saison des pluies, cultures locales (mil, sorgho, coton).
Reste concis et pratique. Utilise le français simple.`;

    return base;
  }

  private parseResponse(response: string, plan: Plan): WeatherAdvice {
    const advice: WeatherAdvice = { general: [], health: [], activities: [], agriculture: [], enterprise: [] };
    const sections = response.split("**");

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      const nextSection = sections[i + 1] || "";

      if (section.toLowerCase().includes("général")) advice.general = this.extractBullets(nextSection);
      else if (section.toLowerCase().includes("santé")) advice.health = this.extractBullets(nextSection);
      else if (plan.type !== "free" && section.toLowerCase().includes("activités")) advice.activities = this.extractBullets(nextSection);
      else if (plan.type !== "free" && section.toLowerCase().includes("agriculture")) advice.agriculture = this.extractBullets(nextSection);
      else if (plan.type === "enterprise" && section.toLowerCase().includes("entreprise")) advice.enterprise = this.extractBullets(nextSection);
    }

    if (advice.general.length === 0 && advice.health.length === 0) {
      return this.parseSimpleResponse(response, plan);
    }

    return advice;
  }

  private extractBullets(text: string): string[] {
    return text
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.trim().substring(1).trim())
      .filter((line) => line.length > 0);
  }

  private parseSimpleResponse(response: string, plan: Plan): WeatherAdvice {
    const lines = response.split("\n").filter((line) => line.trim().startsWith("-"));
    const advice: WeatherAdvice = { general: [], health: [], activities: [], agriculture: [], enterprise: [] };

    lines.slice(0, 2).forEach((line) => advice.general.push(line.trim().substring(1).trim()));
    lines.slice(2, 4).forEach((line) => advice.health.push(line.trim().substring(1).trim()));

    if (plan.type !== "free") lines.slice(4, 6).forEach((line) => advice.activities.push(line.trim().substring(1).trim()));
    if (plan.type === "enterprise") lines.slice(6, 8).forEach((line) => advice.enterprise!.push(line.trim().substring(1).trim()));

    return advice;
  }

  private getFallbackAdvice(weather: WeatherData, plan: Plan): WeatherAdvice {
    const advice: WeatherAdvice = { general: [], health: [], activities: [], agriculture: [], enterprise: [] };

    if (weather.temperature > 35) {
      advice.general.push("Température très élevée, évitez l'exposition au soleil entre 12h et 16h");
      advice.health.push("Buvez au minimum 2-3 litres d'eau par jour");
    } else if (weather.temperature > 30) {
      advice.general.push("Journée chaude, privilégiez les activités matinales ou en soirée");
      advice.health.push("Restez hydraté et portez des vêtements légers");
    } else if (weather.temperature < 25) advice.general.push("Température agréable, idéale pour les activités extérieures");

    if (weather.humidity > 70) advice.health.push("Humidité élevée, attention aux moustiques, utilisez des répulsifs");

    if (weather.wind_speed > 25) {
      advice.general.push("Vent fort, sécurisez vos affaires et évitez les activités en hauteur");
      if (plan.type !== "free") advice.activities.push("Évitez les sports en extérieur, préférez les activités à l'intérieur");
    } else if (weather.wind_speed < 10 && plan.type !== "free") advice.activities.push("Pas de vent, parfait pour les pique-niques et activités extérieures");

    if (weather.description.toLowerCase().includes("pluie")) {
      advice.general.push("Temps pluvieux, pensez à prendre un parapluie ou imperméable");
      if (plan.type !== "free") advice.activities.push("Privilégiez les activités intérieures ou sous abri");
    }

    // Conseils fictifs pour entreprise si plan enterprise
    if (plan.type === "enterprise") {
      advice.enterprise!.push("Prévoyez des protections pour vos marchandises en cas d'intempéries.");
      advice.enterprise!.push("Planifiez les horaires de travail en fonction des conditions climatiques.");
    }

    return advice;
  }
}

// Export singleton
const geminiAdvisor = new GeminiWeatherAdvisor(
  process.env.GEMINI_API_KEY || "",
  process.env.GEMINI_BASE_URL || ""
);

export default geminiAdvisor;
