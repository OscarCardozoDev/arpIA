# Servicios

Documentación detallada de cada servicio, un archivo por servicio. El listado
de todos los servicios con su descripción corta está en
[`../CATALOGO.md`](../CATALOGO.md).

## Plantilla para un servicio nuevo

```md
# Servicio: <name>

**Archivo:** `src/pages/<Page>/services/<file>.ts`
**Endpoint:** `<MÉTODO> /ruta`

## Qué hace
## Funciones exportadas
| Función | Entrada | Salida | Errores |
## Dependencias (interfaces / guards)
## Estados de UI que genera (loading / error / empty)
```
