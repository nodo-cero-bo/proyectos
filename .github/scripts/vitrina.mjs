// Vitrina de Nodo Cero: etiqueta cada proyecto por tecnología y rearma la lista del README.
//
// Lo corre .github/workflows/vitrina.yml cada vez que se abre, edita, cierra o reabre un issue (y a mano desde Actions).
// No tiene dependencias: usa fetch de Node 24 contra la API REST de GitHub con el GITHUB_TOKEN del workflow.
//
// 1. Crea las etiquetas que falten (proyecto, una por tecnología y las del ecosistema Avalanche).
// 2. A cada issue de proyecto abierto le pone las etiquetas según las casillas que marcó el equipo.
// 3. Lee los issues abiertos con la etiqueta «proyecto» y reescribe la lista entre las marcas del README:
//    <!-- vitrina:inicio --> y <!-- vitrina:fin -->. Para sacar un proyecto de la vitrina, se cierra su issue.
//
// Prueba local sin red:  node .github/scripts/vitrina.mjs --previa issues.json   (imprime la lista armada)

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const API = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
const REPO = process.env.GITHUB_REPOSITORY || 'nodo-cero-bo/proyectos';
const TOKEN = process.env.GITHUB_TOKEN || '';
const MARCA_INICIO = '<!-- vitrina:inicio -->';
const MARCA_FIN = '<!-- vitrina:fin -->';
const EXPLORADOR_FUJI = 'https://build.avax.network/explorer/fuji/c-chain/tx/';
const FORMULARIO = `https://github.com/${REPO}/issues/new?template=proyecto.yml`;

// Casillas del formulario (proyecto.yml) -> etiqueta. Si cambia un texto del formulario, se cambia acá.
const TECNOLOGIAS = [
  { casilla: 'n8n', etiqueta: 'n8n', nombre: 'n8n', color: 'FF91AC' },
  { casilla: 'IA (agentes, modelos o embeddings)', etiqueta: 'ia', nombre: 'IA', color: 'FFD0D9' },
  { casilla: 'Supabase', etiqueta: 'supabase', nombre: 'Supabase', color: '3ECF8E' },
  { casilla: 'Clerk', etiqueta: 'clerk', nombre: 'Clerk', color: '6C47FF' },
  { casilla: 'Avalanche Fuji', etiqueta: 'avalanche-fuji', nombre: 'Avalanche Fuji', color: 'E84142' },
];
const ECOSISTEMA = [
  { casilla: 'Instalamos Core Wallet', etiqueta: 'core-wallet', nombre: 'Core Wallet', color: 'F2F2F2' },
  { casilla: 'Nos inscribimos en Avalanche Academy', etiqueta: 'avalanche-academy', nombre: 'Avalanche Academy', color: 'F2F2F2' },
  { casilla: 'Nos sumamos a la comunidad de Team1 LATAM', etiqueta: 'team1-latam', nombre: 'Team1 LATAM', color: 'F2F2F2' },
];
const ETIQUETA_PROYECTO = { etiqueta: 'proyecto', color: '5A0026', descripcion: 'Proyecto registrado en la vitrina de Nodo Cero' };
const GESTIONADAS = new Set([ETIQUETA_PROYECTO.etiqueta, ...TECNOLOGIAS.map((t) => t.etiqueta), ...ECOSISTEMA.map((t) => t.etiqueta)]);

const CAMPOS = {
  proyecto: 'Nombre del proyecto',
  equipo: 'Nombre del equipo',
  queHace: 'Qué hace',
  tecnologias: 'Tecnologías que usaron',
  base: '¿Partieron de algún workflow del repo?',
  enlace: 'Enlace al repo o al video (opcional)',
  hash: 'Hash de una transacción en Fuji (opcional)',
  ecosistema: 'Ecosistema Avalanche (opcional)',
};

// ---------------------------------------------------------------- lectura del issue
/** Separa el cuerpo de un issue de formulario en { «título de la sección»: «contenido» }. */
export function secciones(cuerpo = '') {
  const out = {};
  const partes = String(cuerpo).replace(/\r\n/g, '\n').split(/^###[ \t]+(.+?)[ \t]*$/m);
  for (let i = 1; i < partes.length; i += 2) {
    const valor = partes[i + 1].trim();
    out[partes[i].trim()] = valor === '_No response_' ? '' : valor;
  }
  return out;
}

/** Casillas marcadas de una sección («- [X] texto»). */
export function marcadas(texto = '') {
  return [...String(texto).matchAll(/^\s*[-*]\s*\[[xX]\]\s*(.+?)\s*$/gm)].map((m) => m[1]);
}

/** Etiquetas que le tocan al issue según sus casillas. */
export function etiquetasDe(cuerpo) {
  const s = secciones(cuerpo);
  const elegidas = new Set([...marcadas(s[CAMPOS.tecnologias]), ...marcadas(s[CAMPOS.ecosistema])]);
  return [...TECNOLOGIAS, ...ECOSISTEMA].filter((t) => elegidas.has(t.casilla)).map((t) => t.etiqueta);
}

export function esProyecto(issue) {
  const nombres = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
  return nombres.includes(ETIQUETA_PROYECTO.etiqueta) || /^\s*\[proyecto\]/i.test(issue.title || '');
}

// ---------------------------------------------------------------- texto seguro para el README
/** Una línea de texto plano, sin HTML ni sintaxis de Markdown que cambie el formato, recortada a `max` caracteres. */
export function limpio(s, max = 120) {
  let t = String(s || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > max) t = t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
  return t
    .replace(/([\\`*_{}[\]()#+!|<>~])/g, '\\$1')
    .replace(/^(\d+)([.)])/, '$1\\$2') // que no arranque una lista numerada
    .replace(/^-/, '\\-')
    .replace(/@/g, '@​'); // sin menciones
}

export function enlaceSeguro(s) {
  const t = String(s || '').trim();
  return /^https:\/\/[^\s<>"'()[\]`]{4,300}$/.test(t) ? t : '';
}

export function hashFuji(s) {
  const t = String(s || '').trim();
  return /^0x[0-9a-fA-F]{64}$/.test(t) ? t : '';
}

// ---------------------------------------------------------------- la lista
export function armarLista(issues) {
  const proyectos = issues
    .filter((i) => !i.pull_request && String(i.state || 'open').toLowerCase() !== 'closed' && esProyecto(i))
    .sort((a, b) => a.number - b.number)
    .map((i) => {
      const s = secciones(i.body);
      const etiquetas = etiquetasDe(i.body);
      return {
        numero: i.number,
        url: i.html_url || i.url, // la API da html_url; gh issue list --json da url
        nombre: limpio(s[CAMPOS.proyecto] || (i.title || '').replace(/^\s*\[proyecto\]\s*/i, '') || `Proyecto ${i.number}`, 80),
        equipo: limpio(s[CAMPOS.equipo], 60),
        queHace: limpio(s[CAMPOS.queHace], 240),
        tecnologias: TECNOLOGIAS.filter((t) => etiquetas.includes(t.etiqueta)),
        enlace: enlaceSeguro(s[CAMPOS.enlace]),
        hash: hashFuji(s[CAMPOS.hash]),
      };
    });

  const l = [MARCA_INICIO, ''];
  if (!proyectos.length) {
    l.push(`Todavía no hay proyectos registrados. [Registrá el de tu equipo](${FORMULARIO}).`, '');
  } else {
    const cuenta = TECNOLOGIAS.map((t) => `${t.nombre}: ${proyectos.filter((p) => p.tecnologias.includes(t)).length}`).join(' · ');
    l.push(`**${proyectos.length} ${proyectos.length === 1 ? 'proyecto registrado' : 'proyectos registrados'}** · ${cuenta}`, '');
    for (const p of proyectos) {
      l.push(`#### [${p.nombre}](${p.url})`);
      const linea = [p.equipo ? `Equipo **${p.equipo}**` : '', p.tecnologias.map((t) => `\`${t.nombre}\``).join(' ')].filter(Boolean);
      if (linea.length) l.push('', linea.join(' · '));
      if (p.queHace) l.push('', p.queHace);
      const enlaces = [
        p.enlace ? `[Repo o video](${p.enlace})` : '',
        p.hash ? `[Transacción en Fuji](${EXPLORADOR_FUJI}${p.hash})` : '',
        `[Ficha del proyecto](${p.url})`,
      ].filter(Boolean);
      l.push('', enlaces.join(' · '), '');
    }
  }
  l.push(MARCA_FIN);
  return l.join('\n');
}

export function reemplazarLista(readme, lista) {
  const a = readme.indexOf(MARCA_INICIO);
  const b = readme.indexOf(MARCA_FIN);
  if (a < 0 || b < a) return null;
  return readme.slice(0, a) + lista + readme.slice(b + MARCA_FIN.length);
}

// ---------------------------------------------------------------- API de GitHub
async function gh(metodo, ruta, cuerpo) {
  const r = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'vitrina-nodo-cero',
      ...(cuerpo ? { 'content-type': 'application/json' } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const texto = await r.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!r.ok) {
    const e = new Error(`${metodo} ${ruta}: ${r.status} ${datos && datos.message ? datos.message : texto.slice(0, 200)}`);
    e.status = r.status;
    throw e;
  }
  return datos;
}

async function todas(ruta) {
  const out = [];
  for (let pagina = 1; pagina <= 20; pagina++) {
    const sep = ruta.includes('?') ? '&' : '?';
    const lote = await gh('GET', `${ruta}${sep}per_page=100&page=${pagina}`);
    out.push(...lote);
    if (lote.length < 100) break;
  }
  return out;
}

async function asegurarEtiquetas() {
  const hay = new Set((await todas(`/repos/${REPO}/labels`)).map((l) => l.name));
  const faltan = [
    { name: ETIQUETA_PROYECTO.etiqueta, color: ETIQUETA_PROYECTO.color, description: ETIQUETA_PROYECTO.descripcion },
    ...TECNOLOGIAS.map((t) => ({ name: t.etiqueta, color: t.color, description: `Usa ${t.nombre}` })),
    ...ECOSISTEMA.map((t) => ({ name: t.etiqueta, color: t.color, description: `El equipo marcó: ${t.casilla}` })),
  ].filter((e) => !hay.has(e.name));
  for (const e of faltan) {
    try {
      await gh('POST', `/repos/${REPO}/labels`, e);
      console.log(`Etiqueta creada: ${e.name}`);
    } catch (err) {
      if (err.status !== 422) throw err; // 422: ya existe (otra corrida la creó)
    }
  }
}

async function etiquetar(issue) {
  const actuales = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
  const nuevas = [...new Set([...actuales.filter((n) => !GESTIONADAS.has(n)), ETIQUETA_PROYECTO.etiqueta, ...etiquetasDe(issue.body)])];
  const igual = nuevas.length === actuales.length && nuevas.every((n) => actuales.includes(n));
  if (igual) return;
  await gh('PUT', `/repos/${REPO}/issues/${issue.number}/labels`, { labels: nuevas });
  issue.labels = nuevas.map((name) => ({ name }));
  console.log(`#${issue.number}: etiquetas ${nuevas.join(', ')}`);
}

async function actualizarReadme(proyectos) {
  const lista = armarLista(proyectos);
  for (let intento = 1; intento <= 3; intento++) {
    const archivo = await gh('GET', `/repos/${REPO}/contents/README.md`);
    const actual = Buffer.from(archivo.content, 'base64').toString('utf8');
    const nuevo = reemplazarLista(actual, lista);
    if (nuevo === null) {
      console.log(`El README no tiene las marcas ${MARCA_INICIO} y ${MARCA_FIN}: no se toca.`);
      return;
    }
    if (nuevo === actual) {
      console.log(`La vitrina ya estaba al día (${proyectos.length} proyectos).`);
      return;
    }
    try {
      await gh('PUT', `/repos/${REPO}/contents/README.md`, {
        message: 'Vitrina: actualizar la lista de proyectos',
        content: Buffer.from(nuevo, 'utf8').toString('base64'),
        sha: archivo.sha,
      });
      console.log(`Vitrina actualizada: ${proyectos.length} proyectos.`);
      return;
    } catch (err) {
      if (err.status !== 409 || intento === 3) throw err; // 409: el README cambió entre medio, se vuelve a leer
    }
  }
}

async function main() {
  const i = process.argv.indexOf('--previa');
  if (i > 0) {
    console.log(armarLista(JSON.parse(readFileSync(process.argv[i + 1], 'utf8'))));
    return;
  }
  if (!TOKEN) throw new Error('Falta GITHUB_TOKEN.');
  await asegurarEtiquetas();
  // Todos los proyectos abiertos (con la etiqueta o con «[Proyecto]» en el título): se les sincronizan las etiquetas
  // en cada corrida, así una corrida manual desde Actions deja todo en orden.
  const proyectos = (await todas(`/repos/${REPO}/issues?state=open`)).filter((x) => !x.pull_request && esProyecto(x));
  for (const issue of proyectos) await etiquetar(issue);
  await actualizarReadme(proyectos);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
