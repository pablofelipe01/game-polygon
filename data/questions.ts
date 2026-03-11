import type { Question } from "@/types";

// ═══════════════════════════════════════════════
//  BANCO DE PREGUNTAS COMPLETO — Code Quest
// ═══════════════════════════════════════════════

// ── MUNDO 1: HTML ─────────────────────────────
const htmlQuestions: Question[] = [
  {
    id: "html-1",
    world: 1,
    question: "¿Cómo se escribe un título principal en HTML?",
    code: null,
    options: [
      "<title>Hola</title>",
      "<h1>Hola</h1>",
      "<header>Hola</header>",
      "<bold>Hola</bold>",
    ],
    correct: 1,
    explanation: "<h1> es el heading nivel 1, el más importante.",
    fgt: 5,
  },
  {
    id: "html-2",
    world: 1,
    question: "¿Cuál etiqueta se usa para insertar una imagen?",
    code: null,
    options: [
      "<image src='foto.jpg'>",
      "<picture src='foto.jpg'>",
      "<img src='foto.jpg'>",
      "<photo src='foto.jpg'>",
    ],
    correct: 2,
    explanation: "<img> es la etiqueta estándar y es auto-cerrada.",
    fgt: 5,
  },
  {
    id: "html-3",
    world: 1,
    question: "¿Cómo se crea un enlace en HTML?",
    code: null,
    options: [
      "<link href='url'>texto</link>",
      "<a href='url'>texto</a>",
      "<url href='url'>texto</url>",
      "<nav href='url'>texto</nav>",
    ],
    correct: 1,
    explanation: "<a> significa anchor. href es la URL destino.",
    fgt: 5,
  },
  {
    id: "html-4",
    world: 1,
    question: "¿Cuál es la etiqueta para lista SIN orden?",
    code: null,
    options: ["<ol>", "<list>", "<ul>", "<li>"],
    correct: 2,
    explanation: "ul = unordered list, ol = ordered list, li = list item.",
    fgt: 5,
  },
  {
    id: "html-5",
    world: 1,
    question: "¿Cómo se escribe un párrafo?",
    code: null,
    options: [
      "<paragraph>texto</paragraph>",
      "<par>texto</par>",
      "<text>texto</text>",
      "<p>texto</p>",
    ],
    correct: 3,
    explanation: "<p> es la etiqueta de párrafo estándar en HTML.",
    fgt: 5,
  },
  {
    id: "html-6",
    world: 1,
    question: "¿Cuál es la estructura básica correcta?",
    code: null,
    options: [
      "<html><head></head><body></body></html>",
      "<html><body></body><head></head></html>",
      "<head><html></html><body></body></head>",
      "<body><head></head><html></html></body>",
    ],
    correct: 0,
    explanation: "Siempre: html → head → body, en ese orden exacto.",
    fgt: 5,
  },
];

// ── MUNDO 2: CSS ──────────────────────────────
const cssQuestions: Question[] = [
  {
    id: "css-1",
    world: 2,
    question: "¿Cómo se cambia el color de texto en CSS?",
    code: "p {\n  ???: red;\n}",
    options: [
      "text-color: red",
      "font-color: red",
      "color: red",
      "text: red",
    ],
    correct: 2,
    explanation: "La propiedad 'color' controla el color del texto.",
    fgt: 8,
  },
  {
    id: "css-2",
    world: 2,
    question: "¿Qué propiedad centra elementos con flexbox?",
    code: ".container {\n  display: flex;\n  ???: center;\n}",
    options: [
      "align: center",
      "justify-content: center",
      "text-align: center",
      "position: center",
    ],
    correct: 1,
    explanation: "justify-content centra horizontalmente en flexbox.",
    fgt: 8,
  },
  {
    id: "css-3",
    world: 2,
    question: "¿Cómo se selecciona una CLASE en CSS?",
    code: null,
    options: [
      "#miClase { }",
      "*miClase { }",
      ".miClase { }",
      "@miClase { }",
    ],
    correct: 2,
    explanation: "El punto (.) selecciona clases. # selecciona IDs.",
    fgt: 8,
  },
  {
    id: "css-4",
    world: 2,
    question: "¿Qué propiedad controla el espacio DENTRO del elemento?",
    code: null,
    options: ["margin", "spacing", "border", "padding"],
    correct: 3,
    explanation: "padding = espacio interior. margin = espacio exterior.",
    fgt: 8,
  },
  {
    id: "css-5",
    world: 2,
    question: "¿Cómo se hace texto en negrita con CSS?",
    code: "p {\n  ???: bold;\n}",
    options: [
      "font-weight: bold",
      "text-weight: bold",
      "font-style: bold",
      "text-bold: true",
    ],
    correct: 0,
    explanation: "font-weight: bold hace el texto en negrita.",
    fgt: 8,
  },
  {
    id: "css-6",
    world: 2,
    question: "¿Cuál valor de display pone elementos en FILA?",
    code: null,
    options: [
      "display: block",
      "display: flex",
      "display: grid",
      "display: row",
    ],
    correct: 1,
    explanation: "display: flex crea un contenedor flexible en fila.",
    fgt: 8,
  },
];

// ── MUNDO 3: JAVASCRIPT ───────────────────────
const jsQuestions: Question[] = [
  {
    id: "js-1",
    world: 3,
    question: "¿Cómo se declara una variable en JS moderno?",
    code: null,
    options: [
      "var nombre = 'Ana'",
      "let nombre = 'Ana'",
      "variable nombre = 'Ana'",
      "set nombre = 'Ana'",
    ],
    correct: 1,
    explanation: "let y const son la forma moderna. var es obsoleto.",
    fgt: 12,
  },
  {
    id: "js-2",
    world: 3,
    question: "¿Cómo se escribe una función?",
    code: null,
    options: [
      "def miFuncion() { }",
      "func miFuncion() { }",
      "function miFuncion() { }",
      "fun miFuncion() { }",
    ],
    correct: 2,
    explanation: "En JavaScript se usa la palabra clave 'function'.",
    fgt: 12,
  },
  {
    id: "js-3",
    world: 3,
    question: "¿Cómo se imprime algo en la consola?",
    code: null,
    options: [
      "print('hola')",
      "echo('hola')",
      "console.log('hola')",
      "log.console('hola')",
    ],
    correct: 2,
    explanation: "console.log() es el método estándar para imprimir.",
    fgt: 12,
  },
  {
    id: "js-4",
    world: 3,
    question: "¿Cuál es el resultado de: 2 + '3'?",
    code: "console.log(2 + '3')",
    options: ["5", "Error", "'23'", "23"],
    correct: 2,
    explanation: "JS convierte el número a string: '2' + '3' = '23'.",
    fgt: 12,
  },
  {
    id: "js-5",
    world: 3,
    question: "¿Cómo se accede a un elemento por su ID?",
    code: "// El elemento tiene id='miBoton'",
    options: [
      "document.getElement('miBoton')",
      "document.querySelector('miBoton')",
      "document.getElementById('miBoton')",
      "document.findById('miBoton')",
    ],
    correct: 2,
    explanation:
      "getElementById es el método estándar. querySelector necesita '#'.",
    fgt: 12,
  },
  {
    id: "js-6",
    world: 3,
    question: "¿Qué hace el método .push() en un array?",
    code: "const arr = [1, 2, 3]\narr.push(4)",
    options: [
      "Elimina el último elemento",
      "Agrega un elemento al final",
      "Ordena el array",
      "Cuenta los elementos",
    ],
    correct: 1,
    explanation: "push() agrega al final. pop() elimina del final.",
    fgt: 12,
  },
];

// ── Exportar todo el banco de preguntas ───────
export const allQuestions: Question[] = [
  ...htmlQuestions,
  ...cssQuestions,
  ...jsQuestions,
];

// ── Helpers para obtener preguntas por mundo ──
export function getQuestionsByWorld(worldId: number): Question[] {
  return allQuestions.filter((q) => q.world === worldId);
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}

// ── Preguntas cortas para QuizTimer ───────────
// (mismas preguntas pero se usan en modo contrarreloj)
export function getQuizQuestions(worldId: number): Question[] {
  return getQuestionsByWorld(worldId);
}
