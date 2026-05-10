# Template Render Outputs

Open these files locally to verify the resume template without logging into the app.

## Files

| File | What it is |
|------|------------|
| `pipeline-output.pdf` | The reference resume (Abdullah Tahir data) put through the **complete** pipeline used by the running app: backend `ResumeContent` → `mapContentToLocal` → `toTemplateInput` → `modernMinimal`. Open this side-by-side with `../../resume template.pdf` to verify a match. |
| `pipeline-output.html` | Same as above, raw HTML. |
| `placeholder-output.pdf` | The empty-resume placeholder (John Doe / Lorem Ipsum) — what the preview pane shows when the user hasn't filled in any fields. |
| `placeholder-output.html` | Raw HTML for the placeholder. |
| `broken-backend-output.pdf` | Regression test — the **malformed** backend shape your AI optimizer produces (project content baked into FAIR's experience description, no customSections, no skillCategories). The sanitizer in `mapContentToLocal` should heal this and produce a clean resume. If this PDF looks broken, the sanitizer regressed. |
| `broken-backend-output.html` | Raw HTML for the broken-backend test. |
| `templates/<slug>.pdf` | One PDF per registered template — proves they all render non-blank with the CSS scoper applied. Open all 5 to compare designs side-by-side. |

## Regenerating

If you change the template (`src/lib/resume-templates/modern-minimal.ts`) or
the data flow (`src/components/modal/resume-builder.tsx`), regenerate these:

```
npm run pipeline:test     # writes pipeline-output.{html,pdf}
npm run placeholder:test  # writes placeholder-output.{html,pdf}
npm run broken:test       # writes broken-backend-output.{html,pdf}
npm run templates:test    # writes templates/<slug>.{html,pdf} for all 5 templates
```

## DOCX limitation

The "Download as DOCX" button uses Word HTML (`.doc` with Office MIME) — it
opens cleanly in Word/Google Docs/Pages but Word's HTML renderer doesn't
support the table-cell, flex-like layouts the template uses for the
"company on left / date on right" row. Expect slightly different formatting
in the DOCX vs. the PDF — for pixel-perfect output, use the PDF.

Both scripts also print a checklist of assertions so it's obvious if a
regression slipped in (e.g. "Bug: 'PROJECT' inside experience" must be `false`).

## Why are you seeing the OLD render in the running app?

If the app is showing a render that doesn't match `pipeline-output.pdf`:

1. **Restart the dev server** — `npm run dev`. Vite caches modules; a hot reload may not pick up changes to deeply-imported helpers like the template.
2. **Hard-refresh the browser** — `Ctrl+Shift+R`. The browser caches the bundled JS.
3. **The user's saved resume on the backend** may be corrupted (e.g. project content concatenated into an experience's `description`). The fixture used here represents the *correct* shape; if your saved data is malformed, the template will render that malformed shape faithfully.

If after restart + hard-refresh the app still doesn't match this PDF, capture
the JSON the backend returns for `GET /resumes/:id` and we can diagnose the
data shape directly.
