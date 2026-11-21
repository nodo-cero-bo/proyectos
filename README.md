<p align="center">
  <img src="assets/cabecera.png" alt="Proyectos de Nodo Cero: la vitrina de lo que construyen los equipos en la hackathon de la comunidad n8n en Bolivia" width="100%">
</p>

<p align="center">
  <a href="https://nodo-cero-bo.github.io">Página</a> ·
  <a href="https://github.com/nodo-cero-bo/workflows">Workflows</a> ·
  <a href="https://github.com/nodo-cero-bo/guias">Guías</a> ·
  <a href="https://github.com/nodo-cero-bo/proyectos/issues/new?template=proyecto.yml"><b>Registrá tu proyecto</b></a>
</p>

# Proyectos de Nodo Cero

La vitrina de lo que construyen los equipos en **Nodo Cero – Hackathon n8n Bolivia**: la hackathon de la comunidad n8n en Bolivia, enfocada en mujeres, de la mano de Women Techmakers Santa Cruz. Sábado 21 de noviembre de 2026, en el Centro de Educación Ambiental (CEA) de Santa Cruz de la Sierra.

Cada proyecto es un issue con su ficha: qué hace, en qué línea compite, con qué tecnologías y dónde verlo. La lista de abajo se arma sola a partir de esas fichas.

## Líneas, ganadores y menciones

Cada equipo elige **una línea** para su proyecto. Tocá cada una para ver su guía:

| Línea | De qué se trata |
|---|---|
| [**IA para tu comunidad**](https://github.com/nodo-cero-bo/guias/blob/main/lineas/ia.md) | Agentes y asistentes con Gemini (Google AI Studio o Vertex AI en Google Cloud) y búsqueda en tus documentos con Supabase. |
| [**Web3 con Avalanche Fuji**](https://github.com/nodo-cero-bo/guias/blob/main/lineas/web3.md) | Leer la red, verificar pagos, contratos y eventos, y agentes que leen Fuji. Con Team1. |
| [**Apps con login y datos**](https://github.com/nodo-cero-bo/guias/blob/main/lineas/apps.md) | Clerk para el login, Supabase para los datos y n8n como backend. |
| [**Impacto social y ambiental**](https://github.com/nodo-cero-bo/guias/blob/main/lineas/impacto.md) | Problemas reales de Santa Cruz y de Bolivia: reportes ciudadanos, educación, salud, emprendimiento. |

- **3 equipos ganadores:** 1.er, 2.º y 3.er lugar.
- **2 menciones especiales:** «Mejor uso de Avalanche Fuji», para el equipo que mejor integre Avalanche Fuji en su proyecto, y «Mejor uso de Google Cloud», para el que mejor use Google Cloud.
- Cualquier línea puede quedar entre los 3 lugares y postularse a las 2 menciones. Para postularse, marquen la mención en el formulario.

## Registrá tu proyecto en 3 pasos

1. Entrá a **[Registrá tu proyecto](https://github.com/nodo-cero-bo/proyectos/issues/new?template=proyecto.yml)**. Necesitás una cuenta de GitHub; si no tenés, [creala gratis](https://github.com/signup).
2. Completá el formulario: nombre del proyecto y del equipo, la línea, qué hace y qué tecnologías usaron. Si quieren, marquen a qué mención especial se postulan y sumen el enlace al repo o al video y el hash de una transacción en Fuji.
3. Envialo con el botón verde del final. Con una persona por equipo alcanza.

## Qué pasa después

- El issue recibe la etiqueta `proyecto`, una por cada tecnología que marcaron (`n8n`, `ia`, `supabase`, `clerk`, `avalanche-fuji` o `google-cloud`), una por la línea (`linea-ia`, `linea-web3`, `linea-apps` o `linea-impacto`) y una por cada mención a la que se postulan (`mencion-avalanche-fuji` o `mencion-google-cloud`).
- En un par de minutos el proyecto aparece en la lista de abajo, con su línea, su enlace y, si lo informaron, la transacción en el explorador de Fuji.
- Si algo cambia, editá el issue: la ficha y la lista se actualizan solas.
- Para documentar el proyecto en su propio repo, copien [PLANTILLA_README.md](PLANTILLA_README.md): problema, solución, cómo funciona el flujo, tecnologías, cómo probarlo y equipo.
- Pueden seguir construyendo después del evento y actualizar su ficha cuando quieran.

## Proyectos registrados

<!-- vitrina:inicio -->

Todavía no hay proyectos registrados. [Registrá el de tu equipo](https://github.com/nodo-cero-bo/proyectos/issues/new?template=proyecto.yml).

<!-- vitrina:fin -->

> La lista la arma el workflow de GitHub Actions [Vitrina](.github/workflows/vitrina.yml) con los issues abiertos que tienen la etiqueta `proyecto`. Si la automatización estuviera apagada, se completa a mano con el mismo formato, entre las marcas `vitrina:inicio` y `vitrina:fin`.

## Cuidá tus datos

- Todo lo que se publica acá es público.
- No pongas correos, teléfonos, claves privadas, frases semilla ni credenciales de n8n, de Supabase, de Clerk o de Google Cloud (tampoco el archivo JSON de una cuenta de servicio).
- El hash de una transacción es un dato público: no es una clave y se puede compartir.
- Si te equivocaste, editá el issue y borrá el dato. Si es una clave, además cambiala (rotala) en el servicio donde la creaste: lo que se publicó una vez puede haber quedado copiado.

## Para quienes organizan

- **Antes del primer registro**, creá la etiqueta `proyecto` para que el formulario la aplique desde el inicio (la Vitrina crea las demás sola):

  ```bash
  gh label create proyecto --repo nodo-cero-bo/proyectos --color 5A0026 --description "Proyecto registrado en la vitrina de Nodo Cero"
  gh workflow run vitrina.yml --repo nodo-cero-bo/proyectos
  ```

- Las etiquetas que maneja la Vitrina, por si preferís crearlas a mano (`gh label create <nombre> --repo nodo-cero-bo/proyectos --color <color>`):

  | Etiqueta | Color | Cuándo se pone |
  |---|---|---|
  | `proyecto` | `5A0026` | A todo issue del formulario |
  | `n8n`, `ia`, `supabase`, `clerk`, `avalanche-fuji`, `google-cloud` | `FF91AC`, `FFD0D9`, `3ECF8E`, `6C47FF`, `E84142`, `4285F4` | Una por cada casilla de «Tecnologías que usaron» |
  | `linea-ia`, `linea-web3`, `linea-apps`, `linea-impacto` | `F7A8B8`, `E05774`, `B0284F`, `7A1238` | La línea elegida en «Línea» |
  | `mencion-avalanche-fuji`, `mencion-google-cloud` | `FFC857` | Una por cada mención especial a la que se postula el equipo |
  | `core-wallet`, `avalanche-academy`, `team1-latam` | `F2F2F2` | Las casillas de «Ecosistema Avalanche» |

  La Vitrina las vuelve a calcular cada vez que se edita un issue: si alguien las cambia a mano, se corrigen solas según lo que dice el formulario.

- La Vitrina necesita que GitHub Actions esté habilitado en el repo. Los permisos que usa (`contents: write` e `issues: write`) están declarados en el workflow.
- Para sacar un proyecto de la vitrina, cerrá su issue. Para volver a mostrarlo, reabrilo.
- Cómo medir los KPIs del evento con estos issues (proyectos por tecnología, equipos por línea, postulaciones a cada mención, Core Wallet, Avalanche Academy, Team1 LATAM y hashes de Fuji): [KPIS.md](https://github.com/nodo-cero-bo/.github/blob/main/KPIS.md).
- Para probar el armado de la lista sin red: `node .github/scripts/vitrina.mjs --previa issues.json`, con la salida de `gh issue list --repo nodo-cero-bo/proyectos --label proyecto --json number,title,body,labels,state,url`.

## Licencia

El código y las plantillas de este repo están bajo la licencia [MIT](LICENSE). Cada ficha de proyecto es de su equipo.

n8n, Supabase, Clerk, Avalanche, Team1, Google Cloud, Women Techmakers y los demás nombres y logos son marcas de sus dueños. Los logos no entran en ninguna licencia de este repo.
