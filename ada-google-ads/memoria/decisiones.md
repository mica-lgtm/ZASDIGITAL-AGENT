# Decisiones ejecutadas

Log append-only. Una línea por cada `APROBADO <ID>` o `ACTIVAR <ID>` que `aplicar_propuesta.py` ejecutó de verdad contra una cuenta real, con los IDs que devolvió Google Ads. Nunca se edita retroactivamente -- si algo se revierte, se agrega una entrada nueva, no se borra la vieja.

## Formato

`<fecha> · <ID de propuesta> · <marca> · <qué se ejecutó> · <IDs de Google Ads resultantes> · aprobado por Mica`

(Vacío -- se completa con el uso real.)
