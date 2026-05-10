import type { TemplateFn, TemplateInput } from './types';
import { modernMinimal } from './modern-minimal';
import { classicProfessional } from './classic-professional';
import { leftSidebar } from './left-sidebar';
import { compactSingleColumn } from './compact-single-column';
import { creativeBold } from './creative-bold';
import { applyResumeRootScoping } from './utils';

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

/**
 * Render a resume using the template identified by slug. Output goes through
 * `applyResumeRootScoping` so unscoped CSS (which most templates ship with)
 * gets isolated to a `.resume-root` wrapper — without this, the template's
 * styles leak onto the host page during PDF export and produce a blank PDF
 * (plus the form-shrinking glitch users were reporting).
 */
export function renderTemplate(slug: string, data: TemplateInput): string {
  const tpl = TEMPLATES[slug];
  if (!tpl) throw new Error(`Unknown template: ${slug}`);
  return applyResumeRootScoping(tpl.render(data));
}

export type { TemplateInput, TemplateFn } from './types';
