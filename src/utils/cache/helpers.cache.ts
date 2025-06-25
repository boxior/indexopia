export const combineCacheTags = (...tags: (string | number | undefined | null)[]) => tags.filter(Boolean).join("_");
