# Producto

## Propósito

Reservas es la libreta digital, privada y multi-tenant para el personal de clubes de pádel. Sustituye la libreta física con una operación rápida, fiable y comprensible para personas con poca experiencia tecnológica.

No es un marketplace, una app de jugadores, CRM, ERP, TPV, facturación ni un sistema de reservas público.

## Usuarios y acceso

- El personal de cada club entra en `/c/[slug]` con un código compartido.
- El propietario de la plataforma usa el área privada `/superadmin` para crear, activar, editar y visualizar clubes.
- No hay usuarios individuales, roles de club ni clientes como entidad en el MVP.

## Alcance funcional

- Operación diaria: disponibilidad, creación, edición, movimiento, duplicación, repetición y cancelación de ocupaciones.
- Tipos de ocupación: Reserva, Clase, Bloqueo y Otro.
- Calendario diario, estadísticas operativas y ajustes de pistas, horarios y pago opcional.
- Acceso QR por club, PWA instalable, auditoría y preservación de históricos.

## Flujo principal

Ante una llamada sobre disponibilidad, el trabajador abre Hoy, identifica un hueco, lo pulsa, introduce opcionalmente el nombre y guarda. Fecha, pista y hora ya están seleccionadas. Este flujo tiene prioridad sobre cualquier interfaz secundaria.

## Límites explícitos

No se implementan pagos, tarifas, facturas, jugadores, socios, profesores, partidos, torneos, notificaciones, mensajería, IA, reservas públicas ni integraciones externas.

## Principios de decisión

1. Integridad de datos.
2. Simplicidad del usuario.
3. Accesibilidad y claridad.
4. Fiabilidad y conservación de información.
