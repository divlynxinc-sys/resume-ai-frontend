export function readSavedJobDescription(
  resume: { content?: { job_description?: { description?: unknown } } },
  maxLength?: number,
): { description: string; error: string } {
  const description = resume.content?.job_description?.description;
  if (typeof description !== "string" || !description.trim()) {
    return { description: "", error: "This résumé has no saved job description. Choose another résumé or paste one." };
  }
  if (maxLength && description.length > maxLength) {
    return { description: "", error: `This page accepts at most ${maxLength.toLocaleString()} characters. Paste and shorten the description manually.` };
  }
  return { description, error: "" };
}
