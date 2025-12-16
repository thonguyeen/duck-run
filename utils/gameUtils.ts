import { Racer, RacerType, RACER_COLORS } from "../types";

export const parseNamesFile = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        resolve([]);
        return;
      }
      // Split by new line, remove empty lines
      const names = text
        .split(/\r?\n/)
        .map(n => n.trim())
        .filter(n => n.length > 0);
      resolve(names);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const createRacersFromNames = (names: string[], type: RacerType, durationSeconds: number = 10, randomizeColors: boolean = false): Racer[] => {
  // Target distance is 100 units.
  // We run at 60 FPS typically.
  const targetFPS = 60;
  const totalFrames = durationSeconds * targetFPS;
  
  // Base speed needed to cover 100 units in exactly durationSeconds
  const baseSpeedPerFrame = 100 / totalFrames;

  let assignedColors: string[] = [];

  if (randomizeColors) {
    const count = names.length;
    // Generate evenly spaced hues to ensure every racer has a distinctly different color
    // 360 degrees divided by the number of racers gives the step size
    const step = 360 / Math.max(count, 1);
    const startHue = Math.random() * 360; // Randomize start point on the color wheel
    
    const palette = Array.from({ length: count }, (_, i) => {
       const hue = (startHue + i * step) % 360;
       // High saturation (80-90%) and medium-lightness (55-65%) for vibrant, distinct colors
       return `hsl(${hue.toFixed(1)}, 85%, 60%)`;
    });

    // Shuffle the palette so the gradient isn't obvious (e.g., Red -> Orange -> Yellow)
    // Fisher-Yates shuffle
    for (let i = palette.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [palette[i], palette[j]] = [palette[j], palette[i]];
    }
    
    assignedColors = palette;
  } else {
    // Loop through the preset RACER_COLORS if not random
    assignedColors = names.map((_, i) => RACER_COLORS[i % RACER_COLORS.length]);
  }

  return names.map((name, index) => {
    // We add a randomized multiplier to the base speed.
    // This represents the racer's "talent".
    const inherentSpeedFactor = 0.9 + Math.random() * 0.2; 
    
    const color = assignedColors[index];
    
    return {
      id: `racer-${index}-${Date.now()}`,
      code: String(index + 1).padStart(2, '0'), // Generate 01, 02, etc.
      name: name,
      color: color,
      position: 0,
      // Store the calculated speed.
      speed: baseSpeedPerFrame * inherentSpeedFactor,
      isFinished: false,
      rank: null,
      waddleState: Math.random() * 10,
      type: type,
      // Initialize Momentum Mechanics
      currentSpeedMultiplier: 1.0,
      speedChangeTimer: Math.random() * 60, // Random start time for first change
    };
  });
};