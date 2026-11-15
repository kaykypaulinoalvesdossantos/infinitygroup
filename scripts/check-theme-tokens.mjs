import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const cssPath = new URL("../src/app/globals.css", import.meta.url)
const tailwindPath = new URL("../tailwind.config.ts", import.meta.url)
const layoutPath = new URL("../src/app/layout.tsx", import.meta.url)
const css = await readFile(cssPath, "utf8")
const tailwind = await readFile(tailwindPath, "utf8")
const layout = await readFile(layoutPath, "utf8")
const repoRoot = fileURLToPath(new URL("../", import.meta.url))

const publicTokens = [
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "primary-hover", "primary-active", "secondary",
  "secondary-foreground", "muted", "muted-foreground", "accent", "accent-foreground",
  "destructive", "destructive-foreground", "border", "input", "ring", "surface-raised",
  "foreground-subtle", "link", "overlay",
  "status-success", "status-success-foreground", "status-success-border",
  "status-warning", "status-warning-foreground", "status-warning-border",
  "status-danger", "status-danger-foreground", "status-danger-border",
  "status-info", "status-info-foreground", "status-info-border",
]

function block(selector, source) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))
  if (!match) throw new Error(`Não encontrei o bloco CSS ${selector}.`)
  return match[1]
}

function readTokens(selector, source) {
  const body = block(selector, source)
  const tokens = new Map()
  for (const name of publicTokens) {
    const match = body.match(new RegExp(`--${name}:\\s*([^;]+);`))
    if (!match) throw new Error(`${selector}: falta --${name}. Defina o token para este tema.`)
    const value = match[1].trim()
    if (!/^\d+(?:\.\d+)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/.test(value)) {
      throw new Error(`${selector}: --${name} deve usar canais HSL, recebido: ${value}`)
    }
    tokens.set(name, value.split(/\s+/).map((part) => Number.parseFloat(part)))
  }
  return tokens
}

function rgb([h, s, l]) {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  return [0, 8, 4].map((n) => {
    const channel = l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
}

function luminance(channels) {
  const [r, g, b] = rgb(channels)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

const contrastPairs = [
  ["foreground", "background", 4.5],
  ["card-foreground", "card", 4.5],
  ["popover-foreground", "popover", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["primary-foreground", "primary-hover", 4.5],
  ["primary-foreground", "primary-active", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["destructive-foreground", "destructive", 4.5],
  ["foreground-subtle", "background", 4.5],
  ["foreground-subtle", "surface-raised", 4.5],
  ["link", "background", 4.5],
  ["status-success-foreground", "status-success", 4.5],
  ["status-warning-foreground", "status-warning", 4.5],
  ["status-danger-foreground", "status-danger", 4.5],
  ["status-info-foreground", "status-info", 4.5],
  ["input", "background", 3],
  ["input", "card", 3],
  ["input", "surface-raised", 3],
  ["ring", "background", 3],
  ["ring", "card", 3],
  ["ring", "surface-raised", 3],
]

const fixedSurfacePairs = [
  { path: "src/app/loja/page.tsx", surface: "#25D366", foreground: "#000000", utility: "text-black", minimum: 4.5 },
  { path: "src/app/loja/page.tsx", surface: "#1ebe5a", foreground: "#000000", utility: "text-black", minimum: 4.5 },
  { path: "src/app/produtos/page.tsx", surface: "#00B8FF", foreground: "#000000", utility: "text-black", minimum: 4.5 },
  { path: "src/app/produtos/page.tsx", surface: "#009bd6", foreground: "#000000", utility: "text-black", minimum: 4.5 },
  { path: "src/components/home/solutions-showcase.tsx", surface: "#F8FAFF", foreground: "#10243A", utility: "text-[#10243A]", minimum: 4.5 },
  { path: "src/components/home/solutions-showcase.tsx", surface: "#EFF6FF", foreground: "#10243A", utility: "text-[#10243A]", minimum: 4.5 },
]

function hexRgb(hex) {
  const value = hex.replace("#", "")
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255)
}

function rgbLuminance(channels) {
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function hexContrast(a, b) {
  const values = [rgbLuminance(hexRgb(a)), rgbLuminance(hexRgb(b))].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

const tailwindRequired = [
  "background:", "foreground:", "card: {", "popover: {", '"primary-hover"', '"primary-active"',
  '"surface-raised"', '"foreground-subtle"', "success: {", "warning: {", "danger: {", "info: {",
]
for (const entry of tailwindRequired) {
  if (!tailwind.includes(entry)) throw new Error(`Tailwind não expõe o alias de tema ${entry}.`)
}

for (const alias of [
  "--pipeline-bg: var(--background)",
  "--column-bg: var(--muted)",
  "--card-bg: var(--card)",
  "--card-border: var(--border)",
]) {
  if (!css.includes(alias)) throw new Error(`Pipeline deixou de herdar a fundação de tema: ${alias}.`)
}
if (!css.includes("--radius:")) throw new Error("Falta --radius, necessário às primitivas compartilhadas.")
if (!layout.includes('defaultTheme="dark"') || !layout.includes("enableSystem={false}")) {
  throw new Error("O tema padrão escuro precisa permanecer sem seguir o tema do sistema.")
}

let errors = 0

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = join(directory, entry.name)
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath]
  }))
  return nested.flat()
}

function repoPath(absolutePath) {
  return relative(repoRoot, absolutePath).replaceAll("\\", "/")
}

function lineAt(source, index) {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source.charCodeAt(cursor) === 10) line += 1
  }
  return line
}

function classNameExpressions(source) {
  const expressions = []
  const attribute = /className\s*=\s*/g
  for (const match of source.matchAll(attribute)) {
    const start = (match.index ?? 0) + match[0].length
    const quote = source[start]
    if (quote === "'" || quote === '"' || quote === "`") {
      let end = start + 1
      while (end < source.length) {
        if (source[end] === "\\") end += 2
        else if (source[end++] === quote) break
      }
      expressions.push({ text: source.slice(start + 1, end - 1), start: start + 1, conditional: false, direct: true })
      continue
    }
    if (quote !== "{") continue

    let depth = 1
    let stringQuote = null
    let end = start + 1
    while (end < source.length && depth > 0) {
      const character = source[end]
      if (stringQuote) {
        if (character === "\\") end += 2
        else {
          if (character === stringQuote) stringQuote = null
          end += 1
        }
        continue
      }
      if (character === "'" || character === '"' || character === "`") stringQuote = character
      else if (character === "{") depth += 1
      else if (character === "}") depth -= 1
      end += 1
    }

    const text = source.slice(start + 1, end - 1)
    let quoteState = null
    let conditional = false
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index]
      if (quoteState) {
        if (character === "\\") index += 1
        else if (character === quoteState) quoteState = null
      } else if (character === "'" || character === '"' || character === "`") quoteState = character
      else if (character === "?" && text[index - 1] !== "?" && text[index + 1] !== "?") conditional = true
    }
    expressions.push({ text, start: start + 1, conditional, direct: false })
  }
  return expressions
}

function utilityPart(token) {
  let bracketDepth = 0
  for (let cursor = token.length - 1; cursor >= 0; cursor -= 1) {
    if (token[cursor] === "]") bracketDepth += 1
    else if (token[cursor] === "[") bracketDepth -= 1
    else if (token[cursor] === ":" && bracketDepth === 0) {
      return { state: token.slice(0, cursor), utility: token.slice(cursor + 1) }
    }
  }
  return { state: "", utility: token }
}

const colorUtilityPattern = /(?<![\w-])((?:(?:[A-Za-z0-9_./-]+|\[[^\]]+\]):)*(?:bg|text|border|ring|ring-offset|outline|decoration|placeholder|caret)-[^\s"'`<>]+)/g
const namedColorPattern = /^(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))(?:\/\d{1,3})?$/i

function isRawColorUtility(token) {
  const { utility } = utilityPart(token.replace(/[),};]+$/, ""))
  const separator = utility.indexOf("-")
  const value = utility.slice(separator + 1)
  if (namedColorPattern.test(value)) return true
  return /^\[(?:#(?:[\da-f]{3,8})(?:\/[\d.]+)?|(?:rgba?|hsla?)\(|(?:white|black|red|blue|green|yellow|transparent)\])/i.test(value)
}

function tokenCollision(token) {
  const { utility } = utilityPart(token.replace(/[),};]+$/, ""))
  const match = utility.match(/^(bg|text|border|ring|ring-offset|outline|decoration|placeholder|caret)-(.+)$/)
  if (!match) return null
  const [, , color] = match
  if (/^status-(?:success|warning|danger|info)(?:-(?:foreground|border))?$/.test(color)) {
    return "status tokens are top-level (`bg-success`, `text-success-foreground`, `border-success-border`), without a `status-` Tailwind prefix"
  }
  if (/^(?:success|warning|danger|info)\d+$/.test(color)) {
    return `unknown token \`${color}\`; check for an accidental digit suffix such as \`warning0\``
  }
  return null
}

function stateIsCompatible(first, second) {
  if (!first || !second || first === second) return true
  const a = first.split(":")
  const b = second.split(":")
  const shorter = a.length <= b.length ? a : b
  const longer = a.length <= b.length ? b : a
  return shorter.every((part, index) => part === longer[index])
}

const scopedColorExceptions = new Map([
  // Inverse controls must stay white over the fixed dark hero that embeds them.
  ["src/components/theme-switcher.tsx|text-white", "inverse tone for fixed-color heroes"],
  ["src/components/theme-switcher.tsx|text-white/85", "inverse tone for fixed-color heroes"],
  ["src/components/theme-switcher.tsx|hover:text-white", "inverse tone for fixed-color heroes"],
  ["src/components/theme-switcher.tsx|hover:bg-white/15", "inverse hover surface over fixed-color heroes"],
  ["src/components/theme-switcher.tsx|focus-visible:ring-white", "inverse focus ring over fixed-color heroes"],
  ["src/components/navbar.tsx|text-white", "public navigation over fixed-color hero media"],
  ["src/components/navbar.tsx|text-white/90", "public navigation over fixed-color hero media"],
  ["src/components/navbar.tsx|hover:text-white", "public navigation over fixed-color hero media"],
  ["src/components/navbar.tsx|bg-white/10", "translucent navigation surface over fixed-color hero media"],
  ["src/components/navbar.tsx|hover:bg-white/10", "translucent navigation hover over fixed-color hero media"],
  ["src/components/navbar.tsx|border-white/20", "translucent navigation border over fixed-color hero media"],
  ["src/components/navbar.tsx|hover:bg-white/20", "translucent navigation hover over fixed-color hero media"],
  ["src/app/admin/layout.tsx|bg-black/50", "mobile navigation scrim; fixed dimming overlay"],
])

const allAppFiles = await walk(fileURLToPath(new URL("../src/app", import.meta.url)))
const allComponentFiles = await walk(fileURLToPath(new URL("../src/components", import.meta.url)))
const allTsxFiles = [...allAppFiles, ...allComponentFiles].filter((file) => file.endsWith(".tsx"))
const allSources = await Promise.all(allTsxFiles.map(async (file) => ({
  path: repoPath(file),
  source: await readFile(file, "utf8"),
})))

for (const pair of fixedSurfacePairs) {
  const entry = allSources.find(({ path }) => path === pair.path)
  const surfaceLine = entry?.source.split(/\r?\n/).find((line) => line.includes(pair.surface) && line.includes(pair.utility))
  const ratio = hexContrast(pair.surface, pair.foreground)
  if (!surfaceLine) {
    console.error(`${pair.path}: falta o par explícito ${pair.utility} sobre ${pair.surface}.`)
    errors += 1
  }
  if (ratio < pair.minimum) {
    console.error(`${pair.path}: ${pair.foreground} sobre ${pair.surface} = ${ratio.toFixed(2)}:1; mínimo ${pair.minimum}:1.`)
    errors += 1
  }
}

const requiredVisualPairs = [
  ["src/app/produtos/page.tsx", /text-white\/90 mb-8 leading-relaxed[\s\S]*?text-white\/90 text-lg mt-2[\s\S]*?text-white\/85/],
  ["src/app/produtos/page.tsx", /bg-slate-950\/85 px-4 py-3 text-white[\s\S]*?text-white\/85/],
  ["src/components/home/solutions-showcase.tsx", /bg-slate-900[\s\S]*?text-white\/90 mb-8[\s\S]*?text-white\/90 font-medium/],
  ["src/app/sobre/page.tsx", /!bg-transparent[\s\S]*?hover:!bg-white\/15[\s\S]*?focus-visible:ring-2 focus-visible:ring-white/],
  ["src/app/admin/equipe/page.tsx", /bg-muted text-muted-foreground/],
  ["src/app/admin/atendimento/discador/page.tsx", /bg-muted px-4 py-3 text-sm text-muted-foreground[\s\S]*?text-foreground">Última fila/],
  ["src/app/admin/configuracoes/whatsapp/page.tsx", /text-muted-foreground">\{section\.description\}/],
  ["src/app/admin/clientes/novo/page.tsx", /bg-card\/95 text-foreground[\s\S]*?text-muted-foreground text-sm[\s\S]*?bg-background text-foreground hover:bg-muted/],
  ...[
    "src/app/admin/atendimento/page.tsx",
    "src/app/admin/atendimento/discador/page.tsx",
    "src/app/admin/atendimento/configuracoes/page.tsx",
    "src/app/admin/atendimento/relatorios/page.tsx",
    "src/app/admin/atendimento/supervisao/page.tsx",
    "src/app/admin/crm/roteiro/page.tsx",
  ].map((path) => [path, /from-background to-muted\/50/]),
  ["src/app/produtos/page.tsx", /text-primary-foreground uppercase text-sm font-bold mb-4[\s\S]*?text-primary-foreground\/90 leading-relaxed/],
  ["src/app/orcamento/page.tsx", /bg-primary rounded-3xl p-8 text-primary-foreground[\s\S]*?text-primary-foreground\/90/],
  ["src/app/portal/dashboard/page.tsx", /text-primary-foreground\/90 text-sm mb-8/],
  ["src/app/portal/dashboard/page.tsx", /bg-card shadow-xl[\s\S]*?text-muted-foreground font-medium/],
  ["src/app/admin/equipe/page.tsx", /text-foreground">\s*\{u\.name\}/],
  ["src/app/admin/configuracoes/page.tsx", /bg-card[\s\S]*?text-muted-foreground/],
  ["src/app/portal/primeiro-acesso/page.tsx", /bg-card rounded-\[2\.5rem\][\s\S]*?text-foreground/],
  ["src/components/admin/crm/proposals/ProposalDocument.tsx", /bg-white text-black[\s\S]*?print:bg-white print:text-black/],
  ["src/components/ui/alert.tsx", /bg-danger text-danger-foreground/],
  ["src/components/admin/sidebar.tsx", /text-danger-foreground hover:bg-danger/],
  ["src/components/atendimento/helpers.tsx", /text-foreground tracking-tight[\s\S]*?text-muted-foreground text-base[\s\S]*?text-foreground">\{title\}/],
  ["src/components/admin/crm/goals/GoalProgressCard.tsx", /bg-card[\s\S]*?text-foreground/],
  ["src/app/admin/crm/metas/page.tsx", /text-lg font-semibold text-foreground">Metas por vendedor/],
  ["src/app/login/page.tsx", /<ThemeSwitcher/],
  ["src/app/ramal/layout.tsx", /<ThemeSwitcher[\s\S]*?<ThemedToaster/],
]
for (const [path, expected] of requiredVisualPairs) {
  const source = allSources.find((entry) => entry.path === path)?.source ?? ""
  if (!expected.test(source)) {
    console.error(`${path}: falta o par/acessório visual esperado pela auditoria.`)
    errors += 1
  }
}

for (const [path, source] of [
  ["src/app/conceito-evolucao/pages.module.css", await readFile(new URL("../src/app/conceito-evolucao/pages.module.css", import.meta.url), "utf8")],
  ["src/app/conceito/concept.module.css", await readFile(new URL("../src/app/conceito/concept.module.css", import.meta.url), "utf8")],
]) {
  if (!source.includes("color:#0f172a; --ink:#0f172a; --muted:#334155; --blue:#1d4ed8;")) {
    console.error(`${path}: falta uma paleta explícita legível para painéis claros fixos.`)
    errors += 1
  }
}

for (const [path, source] of [
  ["src/app/conceito/concept.module.css", await readFile(new URL("../src/app/conceito/concept.module.css", import.meta.url), "utf8")],
  ["src/app/conceito-evolucao/pages.module.css", await readFile(new URL("../src/app/conceito-evolucao/pages.module.css", import.meta.url), "utf8")],
]) {
  const required = path.endsWith("concept.module.css")
    ? [".solutionSection { color:#0f172a;", "color:hsl(var(--card-foreground))"]
    : [".valuesGrid article", ".contactJourney", ".outcomeGrid article", "color:hsl(var(--card-foreground))"]
  for (const rule of required) {
    if (!source.includes(rule)) {
      console.error(`${path}: falta regra de foreground para a superfície fixa ${rule}.`)
      errors += 1
    }
  }
}

const scopedShells = new Set([
  ...allAppFiles.filter((file) => file.endsWith("layout.tsx")).map(repoPath),
  ...allComponentFiles.filter((file) => repoPath(file).startsWith("src/components/ui/")).map(repoPath),
  "src/components/theme-provider.tsx",
  "src/components/theme-switcher.tsx",
  "src/components/navbar.tsx",
  "src/components/conditional-layout.tsx",
  "src/components/admin/header.tsx",
  "src/components/admin/sidebar.tsx",
  "src/components/portal/sidebar.tsx",
  "src/app/login/page.tsx",
])

for (const { path, source } of allSources) {
  for (const match of source.matchAll(colorUtilityPattern)) {
    const token = match[1].replace(/[),};]+$/, "")
    const line = lineAt(source, match.index ?? 0)
    const collision = tokenCollision(token)
    if (collision) {
      console.error(`${path}:${line}: token Tailwind inválido/colidido \`${token}\`: ${collision}.`)
      errors += 1
    }
  }

  for (const expression of classNameExpressions(source)) {
    const stringLiteral = /(["'`])((?:\\.|[^\\])*?)\1/g
    const literalGroups = [...expression.text.matchAll(stringLiteral)]
    const groups = expression.direct
      ? [{ text: expression.text, start: expression.start }]
      : expression.conditional
        ? literalGroups.map((literal) => ({ text: literal[2], start: expression.start + literal.index + 1 }))
        : [{ text: literalGroups.map((literal) => literal[2]).join(" "), start: expression.start }]
    for (const group of groups) {
      const classes = [...group.text.matchAll(colorUtilityPattern)].map((match) => ({
        token: match[1].replace(/[),};]+$/, ""),
        index: group.start + match.index,
      }))
      const backgrounds = classes
        .map(({ token, index }) => ({ token, index, ...utilityPart(token) }))
        .filter(({ utility }) => /^bg-primary(?:-hover|-active)?(?:\/[^\s]+)?$/.test(utility))
      const whiteText = classes
        .map(({ token, index }) => ({ token, index, ...utilityPart(token) }))
        .filter(({ utility }) => /^text-white(?:\/[^\s]+)?$/.test(utility))
      const semanticText = classes
        .map(({ token, index }) => ({ token, index, ...utilityPart(token) }))
        .filter(({ utility }) => /^text-primary-foreground(?:\/[^\s]+)?$/.test(utility))
      for (const background of backgrounds) {
        const text = whiteText.find((candidate) => stateIsCompatible(background.state, candidate.state))
        const hasSemanticText = semanticText.some((candidate) => stateIsCompatible(background.state, candidate.state))
        if (text && !hasSemanticText) {
          console.error(`${path}:${lineAt(source, text.index)}: \`${text.token}\` shares a state with \`${background.token}\`; use \`text-primary-foreground\` for primary surfaces.`)
          errors += 1
        }
      }
    }
  }
}

for (const { path, source } of allSources.filter(({ path }) => scopedShells.has(path))) {
  for (const match of source.matchAll(colorUtilityPattern)) {
    const token = match[1].replace(/[),};]+$/, "")
    if (!isRawColorUtility(token)) continue
    const exception = scopedColorExceptions.get(`${path}|${token}`)
    if (exception) continue
    console.error(`${path}:${lineAt(source, match.index ?? 0)}: raw color utility \`${token}\` in a shared UI/themed shell; use a semantic token or document a file+token exception.`)
    errors += 1
  }
}

for (const [label, selector] of [["Claro", ":root"], ["Escuro", ".dark"]]) {
  try {
    const tokens = readTokens(selector, css)
    for (const [foreground, surface, minimum] of contrastPairs) {
      const ratio = contrast(tokens.get(foreground), tokens.get(surface))
      if (ratio < minimum) {
        console.error(`${label}: ${foreground} sobre ${surface} = ${ratio.toFixed(2)}:1; mínimo ${minimum}:1.`)
        errors += 1
      }
    }
  } catch (error) {
    console.error(`${label}: ${error.message}`)
    errors += 1
  }
}

if (errors) {
  console.error(`Falha: ${errors} problema(s) nos tokens de tema.`)
  process.exitCode = 1
} else {
  console.log("Tokens claro/escuro presentes; pares de texto e controles passaram nos limiares configurados.")
}
