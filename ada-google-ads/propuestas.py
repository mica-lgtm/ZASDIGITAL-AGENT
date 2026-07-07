"""Maneja el ciclo de vida de una propuesta: creación, lectura, cambio de
estado, y el índice general. Una propuesta es un archivo markdown con
front-matter YAML (metadata + `operaciones`, machine-readable) más un cuerpo
en prosa para que Mica lo lea. Ver CLAUDE.md, sección "Formato de propuesta".

Este módulo NO ejecuta ninguna operación contra Google Ads -- solo lee y
escribe archivos locales. La ejecución vive en `aplicar_propuesta.py` +
`ads/mutate.py`."""

import glob
import os
import re

import yaml

_BASE = os.path.dirname(__file__)
_PROPUESTAS_DIR = os.path.join(_BASE, "propuestas")
_INDICE = os.path.join(_PROPUESTAS_DIR, "indice-propuestas.md")

TIPOS_VALIDOS = {
    "nueva_campana", "ajuste_presupuesto", "ajuste_bid", "nueva_keyword",
    "pausar_keyword", "nueva_negativa", "pausar_anuncio", "nuevo_anuncio",
}


def _slug_marca(marca):
    return marca.lower().replace(" ", "_")


def _carpeta_dia(fecha):
    return os.path.join(_PROPUESTAS_DIR, fecha)


def siguiente_numero(marca, fecha):
    """Cuenta cuántas propuestas ya existen para esta marca+fecha, para
    numerar la próxima (ADA-<MARCA>-<FECHA>-<NNN>)."""
    carpeta = _carpeta_dia(fecha)
    if not os.path.isdir(carpeta):
        return 1
    prefijo = f"{_slug_marca(marca).upper()}-"
    existentes = [f for f in os.listdir(carpeta) if f.upper().startswith(prefijo)]
    return len(existentes) + 1


def generar_id(marca, fecha, numero):
    fecha_compacta = fecha.replace("-", "")
    return f"ADA-{_slug_marca(marca).upper()}-{fecha_compacta}-{numero:03d}"


def crear_propuesta(marca, tipo, customer_id, rutina_origen, fecha, titulo, cuerpo_md,
                     operaciones, recurso_objetivo=None):
    if tipo not in TIPOS_VALIDOS:
        raise ValueError(f"Tipo de propuesta desconocido: {tipo}")

    numero = siguiente_numero(marca, fecha)
    id_propuesta = generar_id(marca, fecha, numero)

    front_matter = {
        "id": id_propuesta,
        "marca": marca,
        "tipo": tipo,
        "rutina_origen": rutina_origen,
        "fecha_creacion": fecha,
        "customer_id": customer_id,
        "recurso_objetivo": recurso_objetivo,
        "estado": "PROPUESTA",
        "operaciones": operaciones,
    }

    contenido = "---\n" + yaml.safe_dump(front_matter, allow_unicode=True, sort_keys=False) + "---\n\n"
    contenido += f"# {titulo}\n\n" + cuerpo_md.strip() + "\n"

    carpeta = _carpeta_dia(fecha)
    os.makedirs(carpeta, exist_ok=True)
    nombre_archivo = f"{_slug_marca(marca).upper()}-{tipo}-{id_propuesta}.md"
    ruta = os.path.join(carpeta, nombre_archivo)
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(contenido)

    ruta_relativa = os.path.relpath(ruta, _BASE)
    _agregar_a_indice(id_propuesta, marca, tipo, fecha, rutina_origen, "PROPUESTA", ruta_relativa)

    return id_propuesta, ruta


def _agregar_a_indice(id_propuesta, marca, tipo, fecha, rutina, estado, ruta_relativa):
    linea = f"| {id_propuesta} | {marca} | {tipo} | {fecha} | {rutina} | {estado} | {ruta_relativa} |\n"
    os.makedirs(_PROPUESTAS_DIR, exist_ok=True)
    if not os.path.isfile(_INDICE):
        with open(_INDICE, "w", encoding="utf-8") as f:
            f.write("# Índice de propuestas\n\n| ID | Marca | Tipo | Fecha | Rutina | Estado | Archivo |\n|---|---|---|---|---|---|---|\n")
    with open(_INDICE, "a", encoding="utf-8") as f:
        f.write(linea)


def buscar_archivo(id_propuesta):
    coincidencias = glob.glob(os.path.join(_PROPUESTAS_DIR, "**", f"*{id_propuesta}*.md"), recursive=True)
    if not coincidencias:
        raise FileNotFoundError(f"No encontré ninguna propuesta con ID {id_propuesta}")
    if len(coincidencias) > 1:
        raise ValueError(f"Más de un archivo coincide con {id_propuesta}: {coincidencias}")
    return coincidencias[0]


def leer_propuesta(id_propuesta):
    ruta = buscar_archivo(id_propuesta)
    with open(ruta, encoding="utf-8") as f:
        contenido = f.read()
    match = re.match(r"^---\n(.*?)\n---\n\n?(.*)$", contenido, re.DOTALL)
    if not match:
        raise ValueError(f"El archivo de {id_propuesta} no tiene front-matter válido")
    front_matter = yaml.safe_load(match.group(1))
    front_matter["_ruta"] = ruta
    front_matter["_cuerpo"] = match.group(2)
    return front_matter


def _reescribir_con_nuevo_front_matter(ruta, front_matter, cuerpo):
    contenido = "---\n" + yaml.safe_dump(
        {k: v for k, v in front_matter.items() if not k.startswith("_")},
        allow_unicode=True, sort_keys=False,
    ) + "---\n\n" + cuerpo
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(contenido)


def actualizar_estado(id_propuesta, nuevo_estado, campos_extra=None):
    propuesta = leer_propuesta(id_propuesta)
    ruta = propuesta.pop("_ruta")
    cuerpo = propuesta.pop("_cuerpo")
    propuesta["estado"] = nuevo_estado
    if campos_extra:
        propuesta.update(campos_extra)
    _reescribir_con_nuevo_front_matter(ruta, propuesta, cuerpo)
    _actualizar_estado_en_indice(id_propuesta, nuevo_estado)
    return propuesta


def _actualizar_estado_en_indice(id_propuesta, nuevo_estado):
    if not os.path.isfile(_INDICE):
        return
    with open(_INDICE, encoding="utf-8") as f:
        lineas = f.readlines()
    nuevas = []
    for linea in lineas:
        if linea.startswith("|") and id_propuesta in linea:
            partes = linea.split("|")
            # partes: ['', ' ID ', ' Marca ', ' Tipo ', ' Fecha ', ' Rutina ', ' Estado ', ' Archivo ', '\n']
            partes[6] = f" {nuevo_estado} "
            linea = "|".join(partes)
        nuevas.append(linea)
    with open(_INDICE, "w", encoding="utf-8") as f:
        f.writelines(nuevas)


def leer_indice():
    if not os.path.isfile(_INDICE):
        return []
    with open(_INDICE, encoding="utf-8") as f:
        lineas = f.readlines()
    filas = []
    for linea in lineas:
        if not linea.startswith("|"):
            continue
        celdas = [c.strip() for c in linea.strip().strip("|").split("|")]
        if celdas[0] in ("ID", "---"):
            continue
        if len(celdas) != 7:
            continue
        filas.append({
            "id": celdas[0], "marca": celdas[1], "tipo": celdas[2], "fecha": celdas[3],
            "rutina": celdas[4], "estado": celdas[5], "archivo": celdas[6],
        })
    return filas
