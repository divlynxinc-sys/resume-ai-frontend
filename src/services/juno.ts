import api from "@/lib/api";

export interface JunoPrompt {
  id: number;
  text: string;
  category: string;
  display_order: number;
}

export const junoService = {
  listPrompts: (category?: string) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    return api.get<JunoPrompt[]>(`/juno/prompts${qs}`);
  },
};
