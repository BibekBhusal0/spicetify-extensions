import { $simpleLyricsMode } from "../../../../utils/stores.ts";

// The shortest word that can be split, per mode.
const MinDuration = 1000;
const SimpleLyricsModeMinDuration = 1050;

const Simple = (letterLength: number, totalDuration: number) => {
  return totalDuration >= MinDuration;
};

const SimpleLyricsModeCapable = (letterLength: number, totalDuration: number) => {
  if (letterLength > 12) {
    return false;
  }

  //const maxDuration = 8550;

  return totalDuration >= SimpleLyricsModeMinDuration; // && totalDuration <= maxDuration;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _Complex = (letterLength: number, totalDuration: number) => {
  // Enforce a maximum letter length of 12
  if (letterLength > 12) {
    return false;
  }

  // Calculate the minimum duration based on the letter length
  const minDuration = 1000 + ((letterLength - 1) / 1) * 25; // Increases duration as letter length increases

  // Return whether the letter length and duration meet the criteria
  return totalDuration >= minDuration;
};

/**
 * Below this duration IsLetterCapable is false whatever the letter count, so a caller can
 * skip splitting the word just to count its letters.
 */
export function MinLetterCapableDuration(): number {
  if (!$simpleLyricsMode.get()) return MinDuration;
  return SimpleLyricsModeMinDuration;
}

export function IsLetterCapable(letterLength: number, totalDuration: number) {
  return $simpleLyricsMode.get()
    ? SimpleLyricsModeCapable(letterLength, totalDuration)
    : Simple(letterLength, totalDuration);
}
