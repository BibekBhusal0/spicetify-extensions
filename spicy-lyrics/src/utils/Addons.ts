function DeepFreeze<T extends Record<string, any>>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== "object") {
    return obj as any;
  }

  const clone: Record<string, any> = Array.isArray(obj) ? [] : {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    clone[key] = DeepFreeze(value);
  });

  return Object.freeze(clone) as Readonly<T>;
}

function IsPlaying() {
  const state = Spicetify?.Player?.isPlaying?.();
  return state;
}

export const ArabicPersianRegex = /[\u0600-\u06FF]/;

export { DeepFreeze, IsPlaying };
