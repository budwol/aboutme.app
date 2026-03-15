export const stripHtml = (str?: string) =>
  str?.replace(/(<([^>]+)>)/gi, "") ?? "";

export const isHtml = (str?: string) => /(<([^>]+)>)/i.test(str ?? "");
