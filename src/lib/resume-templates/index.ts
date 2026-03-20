import type { TemplateFn, TemplateInput } from './types';
import { modernMinimal } from './modern-minimal';
import { classicProfessional } from './classic-professional';
import { leftSidebar } from './left-sidebar';
import { compactSingleColumn } from './compact-single-column';
import { creativeBold } from './creative-bold';

export interface TemplateEntry {
  name: string;
  slug: string;
  render: TemplateFn;
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'modern-minimal':        { name: 'Modern Minimal',        slug: 'modern-minimal',        render: modernMinimal },
  'classic-professional':  { name: 'Classic Professional',  slug: 'classic-professional',  render: classicProfessional },
  'left-sidebar':          { name: 'Left Sidebar Layout',   slug: 'left-sidebar',          render: leftSidebar },
  'compact-single-column': { name: 'Compact Single-Column', slug: 'compact-single-column', render: compactSingleColumn },
  'creative-bold':         { name: 'Creative Bold Design',  slug: 'creative-bold',         render: creativeBold },
};

/** Render a resume using the template identified by slug */
export function renderTemplate(slug: string, data: TemplateInput): string {
  const tpl = TEMPLATES[slug];
  if (!tpl) throw new Error(`Unknown template: ${slug}`);
  return tpl.render(data);
}

export type { TemplateInput, TemplateFn } from './types';
