export const combineTags = (...tags: (string | number | undefined | null)[]) => tags.filter(Boolean).join("_");
