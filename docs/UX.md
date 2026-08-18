# UX

## Navegación

Cada club tiene solo cuatro destinos: Hoy, Calendario, Estadísticas y Ajustes. En escritorio se usa una barra lateral compacta; en móvil, navegación inferior fija con iconos Lucide y texto. Las acciones globales se reducen a una búsqueda y `+ Reserva` claramente visibles.

## Pantalla Hoy

Muestra fecha completa, filtro `Todas` / `Con huecos`, próximos huecos y una cuadrícula de horas por pista en escritorio. En móvil, cada pista se presenta verticalmente para evitar scroll horizontal. Cada bloque comunica estado con texto y color: Libre, Reserva, Clase, Bloqueo u Otro. Pulsar Libre inicia una reserva con el contexto conocido.

## Formularios y feedback

Los formularios usan etiquetas explícitas, controles grandes y datos preseleccionados cuando existen. `Nombre` se sugiere desde reservas previas sin crear clientes. Las acciones asíncronas bloquean el envío y muestran un estado como “Guardando...”. Las respuestas muestran toasts claros, con `Deshacer` para cancelaciones y cambios reversibles cuando sea seguro.

## Accesibilidad

- HTML semántico, labels, foco visible y navegación por teclado.
- Contraste suficiente y estado nunca expresado solo con color.
- Objetivos táctiles amplios, mensajes de error humanos y nombres accesibles en botones iconográficos.
- Mobile-first: formularios y vistas diarias se adaptan estructuralmente, no solo por escala.

## Lenguaje visual

Fondos neutros claros, verde de pista como acento moderado y tonos diferenciados de alto contraste para ocupaciones. El resultado es software deportivo profesional y sobrio, sin degradados, emojis ni estética de juego.

## Estados vacíos y errores

Las listas sin datos explican qué hacer, por ejemplo “Todavía no hay pistas” con un CTA. Errores de disponibilidad, horario y pistas inactivas indican el siguiente paso, sin terminología técnica.
