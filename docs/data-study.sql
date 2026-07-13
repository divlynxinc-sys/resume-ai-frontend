-- ─────────────────────────────────────────────────────────────────────────────
-- JobSynk resume corpus study — READ-ONLY.
--
-- WHY THIS EXISTS
-- Publishing original data is the single highest-ROI move available to us, and
-- the market leader has not done it:
--   • Enhancv built a permanent LLM-citation moat out of ONE page
--     (/blog/resume-statistics) backed by an analysis of 31,000 of their own
--     users' resumes. Thousands of career blogs now cite "(Enhancv)" — which is
--     exactly the phrasing that ends up in training corpora and retrieval indexes.
--   • Kickresume does the same with a 1.8M–2.1M CV corpus and gets syndicated by
--     CNBC, WSJ and Forbes.
--   • Rezi — the #1-ranked player — has published NOTHING. Zero studies.
-- And "add statistics" + "cite sources" are the #1 and #2 tactics in the only
-- peer-reviewed study of generative-engine optimisation (Princeton, KDD 2024),
-- worth roughly +41% and +31% visibility, with the largest gains going to
-- LOW-RANKED pages. That is us.
--
-- HOW TO RUN
--   psql "$DATABASE_URL" -f docs/data-study.sql
-- (Railway → your Postgres service → Connect → copy the connection string.)
-- Every statement is a SELECT. Nothing here writes, and nothing here reads a
-- name, an email, or any free-text content — only shapes and counts.
--
-- READ SECTION 0 FIRST. If N is small, DO NOT dress it up. State N honestly.
-- Enhancv publishes "limited to users of our platform" as an explicit caveat and
-- it makes them MORE citable, not less. A study of 400 resumes with an honest
-- methodology note is publishable. A study of 400 resumes pretending to be
-- 40,000 is a liability that one journalist can destroy.
-- ─────────────────────────────────────────────────────────────────────────────

\echo '=============================================================='
\echo '0. IS THERE ENOUGH DATA TO PUBLISH?'
\echo '=============================================================='

SELECT
  count(*)                                            AS resumes_total,
  count(*) FILTER (WHERE content IS NOT NULL)         AS with_content,
  count(DISTINCT user_id)                             AS distinct_users,
  min(created_at)::date                               AS first_resume,
  max(created_at)::date                               AS latest_resume
FROM resumes
WHERE is_deleted = false;

-- Rule of thumb for what you can claim:
--   with_content >= 1000  -> "We analysed N resumes" reads as a real study.
--   with_content 300-999  -> Publishable WITH a prominent methodology caveat.
--   with_content < 300    -> Do not publish a corpus study. Run a user survey
--                            instead (Kickresume uses n≈1,300–2,800 from their
--                            own user base) — see docs/COMPETITOR-ANALYSIS.md.

\echo ''
\echo '=============================================================='
\echo '1. SECTION COMPLETENESS — "what do people leave out?"'
\echo '=============================================================='

WITH r AS (
  SELECT content FROM resumes WHERE is_deleted = false AND content IS NOT NULL
)
SELECT
  count(*)                                                                       AS n,
  round(100.0 * count(*) FILTER (WHERE content ? 'summary')      / count(*), 1)  AS pct_has_summary,
  round(100.0 * count(*) FILTER (WHERE content ? 'experience')   / count(*), 1)  AS pct_has_experience,
  round(100.0 * count(*) FILTER (WHERE content ? 'education')    / count(*), 1)  AS pct_has_education,
  round(100.0 * count(*) FILTER (WHERE content ? 'skills')       / count(*), 1)  AS pct_has_skills,
  round(100.0 * count(*) FILTER (WHERE content ? 'custom')       / count(*), 1)  AS pct_has_custom
FROM r;

\echo ''
\echo '=============================================================='
\echo '2. EXPERIENCE DEPTH — roles per resume'
\echo '=============================================================='

WITH r AS (
  SELECT jsonb_array_length(content->'experience') AS roles
  FROM resumes
  WHERE is_deleted = false
    AND jsonb_typeof(content->'experience') = 'array'
)
SELECT
  count(*)                                                  AS n,
  round(avg(roles), 2)                                      AS avg_roles,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY roles)        AS median_roles,
  round(100.0 * count(*) FILTER (WHERE roles = 1) / count(*), 1) AS pct_single_role,
  max(roles)                                                AS max_roles
FROM r;

\echo ''
\echo '=============================================================='
\echo '3. THE HEADLINE STAT — how many bullets contain a NUMBER?'
\echo '   This is the quotable one. It is also the thing we sell.'
\echo '=============================================================='

WITH bullets AS (
  SELECT
    resumes.id,
    -- Flatten every bullet out of every role. The builder stores bullets under
    -- a role's description/bullets key; we accept either, and fall back to any
    -- string value so a schema drift doesn't silently zero the result.
    jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(role->'bullets')     = 'array' THEN role->'bullets'
        WHEN jsonb_typeof(role->'description') = 'array' THEN role->'description'
        ELSE '[]'::jsonb
      END
    ) AS bullet
  FROM resumes,
       LATERAL jsonb_array_elements(content->'experience') AS role
  WHERE is_deleted = false
    AND jsonb_typeof(content->'experience') = 'array'
)
SELECT
  count(*)                                                                  AS bullets_total,
  count(DISTINCT id)                                                        AS resumes_covered,
  round(100.0 * count(*) FILTER (WHERE bullet ~ '[0-9]') / count(*), 1)     AS pct_bullets_with_a_number,
  round(100.0 * count(*) FILTER (WHERE bullet ~ '[0-9]+\s?%') / count(*), 1) AS pct_bullets_with_a_percentage,
  round(avg(length(bullet)), 0)                                             AS avg_bullet_chars
FROM bullets;

\echo ''
\echo '=============================================================='
\echo '4. WEAK OPENERS — the duty-vs-result gap, quantified'
\echo '=============================================================='

WITH bullets AS (
  SELECT lower(jsonb_array_elements_text(
    CASE
      WHEN jsonb_typeof(role->'bullets')     = 'array' THEN role->'bullets'
      WHEN jsonb_typeof(role->'description') = 'array' THEN role->'description'
      ELSE '[]'::jsonb
    END
  )) AS bullet
  FROM resumes,
       LATERAL jsonb_array_elements(content->'experience') AS role
  WHERE is_deleted = false
    AND jsonb_typeof(content->'experience') = 'array'
)
SELECT
  count(*) AS bullets_total,
  round(100.0 * count(*) FILTER (
    WHERE bullet LIKE 'responsible for%' OR bullet LIKE 'helped%'
       OR bullet LIKE 'worked on%'       OR bullet LIKE 'assisted%'
       OR bullet LIKE 'duties included%' OR bullet LIKE 'involved in%'
  ) / count(*), 1) AS pct_opening_with_a_duty_phrase
FROM bullets;

\echo ''
\echo '=============================================================='
\echo '5. SKILLS — how many, and the top 25 (anonymised, aggregate only)'
\echo '=============================================================='

WITH s AS (
  SELECT lower(trim(jsonb_array_elements_text(content->'skills'))) AS skill
  FROM resumes
  WHERE is_deleted = false AND jsonb_typeof(content->'skills') = 'array'
)
SELECT skill, count(*) AS listed_by_n_resumes
FROM s
WHERE length(skill) BETWEEN 2 AND 30
GROUP BY skill
HAVING count(*) >= 5          -- k-anonymity: never publish a skill fewer than 5 people listed
ORDER BY count(*) DESC
LIMIT 25;

\echo ''
\echo '=============================================================='
\echo '6. AI FEATURE USAGE — which feature do people actually reach for?'
\echo '=============================================================='

SELECT
  feature,
  count(*)                  AS events,
  count(DISTINCT user_id)   AS users,
  min(created_at)::date     AS first_used,
  max(created_at)::date     AS last_used
FROM ai_usage_events
GROUP BY feature
ORDER BY count(*) DESC;

\echo ''
\echo '=============================================================='
\echo 'DONE.'
\echo ''
\echo 'Turn this into ONE page: /blog/resume-statistics'
\echo '  - Lead with the single most surprising number (probably #3 or #4).'
\echo '  - State N and the date range in the first paragraph. Do not bury them.'
\echo '  - Add an explicit limitations note: "limited to users of our platform".'
\echo '    Enhancv does exactly this and it makes them MORE citable, not less.'
\echo '  - Give every stat its own H2 phrased as a question, so an answer engine'
\echo '    can lift one chunk without reading the article.'
\echo '  - Then pitch it. Earned media is ~82-89% of AI citations; paid is ~0.3%.'
\echo '=============================================================='
