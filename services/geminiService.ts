import { GoogleGenAI } from "@google/genai";
import { Racer, RACER_LABELS } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRaceCommentary = async (
  racers: Racer[], 
  phase: 'start' | 'mid' | 'end', 
  winner?: Racer
): Promise<string> => {
  const names = racers.map(d => d.name).join(', ');
  const racerType = racers[0]?.type || 'duck';
  const racerLabel = RACER_LABELS[racerType].split('(')[1].replace(')', '').toLowerCase(); // e.g. "duck", "horse"
  
  let prompt = "";
  if (phase === 'start') {
    prompt = `You are an energetic sports commentator for a ${racerLabel} race. The racers are: ${names}. Give a short, 2-sentence hype intro.`;
  } else if (phase === 'mid') {
    const leader = racers.reduce((prev, current) => (prev.position > current.position) ? prev : current);
    prompt = `You are a sports commentator for a ${racerLabel} race. The current leader is ${leader.name}. Give a 1-sentence funny update on the race situation. Mention something specific about ${racerLabel}s.`;
  } else if (phase === 'end' && winner) {
    prompt = `You are a sports commentator. The winner of the ${racerLabel} race is ${winner.name}! Give a short 2-sentence congratulatory speech.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The commentator is speechless!";
  }
};