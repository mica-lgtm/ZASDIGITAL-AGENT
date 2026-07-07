"""ÚNICO script que importa `ads/mutate.py`. NUNCA se corre solo ni
programado -- solo cuando Mica dice `APROBADO <ID>` o `ACTIVAR <ID>` en una
sesión de Claude Code bajo el CLAUDE.md de Ada. Ver CLAUDE.md, sección
"Puerta de aprobación"."""

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

import propuestas
from ads import mutate as ads_mutate
from ads.client import cliente_desde_env
from ads.reportes import reporte_presupuestos

ARGENTINA = timezone(timedelta(hours=-3))

_CAMPOS_RESULTADO = [
    "campaign_result", "campaign_budget_result", "ad_group_result",
    "ad_group_criterion_result", "ad_group_ad_result", "campaign_criterion_result",
]


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        description="Ada -- ejecutar una propuesta aprobada. NUNCA programar este script."
    )
    grupo = parser.add_mutually_exclusive_group(required=True)
    grupo.add_argument("--ejecutar", metavar="ID", help="ID de la propuesta a ejecutar (requiere estado PROPUESTA)")
    grupo.add_argument("--activar", metavar="ID", help="ID de una nueva_campana ya SUBIDA PAUSADA, para pasarla a ENABLED")
    return parser.parse_args(argv)


def _resolver_ajuste_presupuesto(cliente_lectura, customer_id, operaciones):
    """Reemplaza `ajuste_pct` por `monto_nuevo_micros`, resuelto contra el
    presupuesto ACTUAL de la cuenta (lectura fresca) -- no el que tenía
    cuando se generó la propuesta, que puede haber cambiado desde entonces."""
    resueltas = []
    cache_presupuestos = None
    for op in operaciones:
        if op.get("tipo") == "campaign_budget_amount" and "monto_nuevo_micros" not in op:
            if cache_presupuestos is None:
                cache_presupuestos = {p["budget_resource"]: p for p in reporte_presupuestos(cliente_lectura, customer_id)}
            actual = cache_presupuestos.get(op["budget_resource"])
            if actual is None:
                raise RuntimeError(f"No encontré el presupuesto {op['budget_resource']} en la cuenta -- no puedo resolver el ajuste")
            monto_actual_micros = int(actual["monto_diario"] * 1_000_000)
            op = dict(op)
            op["monto_nuevo_micros"] = int(monto_actual_micros * (1 + op.get("ajuste_pct", 0) / 100))
        resueltas.append(op)
    return resueltas


def _extraer_resource_names(respuesta):
    resource_names = []
    for resp in getattr(respuesta, "mutate_operation_responses", []):
        for campo in _CAMPOS_RESULTADO:
            resultado = getattr(resp, campo, None)
            if resultado is not None and getattr(resultado, "resource_name", None):
                resource_names.append(resultado.resource_name)
                break
    return resource_names


def _registrar_decision(id_propuesta, marca, accion, resource_names, base_dir=None):
    base_dir = base_dir or os.path.dirname(__file__)
    ruta = os.path.join(base_dir, "memoria", "decisiones.md")
    fecha = datetime.now(ARGENTINA).strftime("%Y-%m-%d %H:%M")
    ids_texto = ", ".join(resource_names) if resource_names else "sin IDs"
    with open(ruta, "a", encoding="utf-8") as f:
        f.write(f"{fecha} · {id_propuesta} · {marca} · {accion} · {ids_texto} · aprobado por Mica\n")


def ejecutar(id_propuesta, env=None, cliente_lectura=None, cliente_mutate=None, base_dir=None):
    env = env or os.environ
    propuesta = propuestas.leer_propuesta(id_propuesta)
    if propuesta["estado"] != "PROPUESTA":
        raise RuntimeError(f"{id_propuesta} está en estado '{propuesta['estado']}', no en PROPUESTA -- no ejecuto")

    customer_id = propuesta["customer_id"]
    cliente_lectura = cliente_lectura or cliente_desde_env(env)
    operaciones = _resolver_ajuste_presupuesto(cliente_lectura, customer_id, propuesta["operaciones"])

    cliente_mutate = cliente_mutate or ads_mutate.cliente_mutate_desde_env(env)
    try:
        respuesta = ads_mutate.ejecutar(cliente_mutate, customer_id, operaciones)
    except Exception as exc:
        print(f"[Ada] Falló la ejecución de {id_propuesta}: {exc}", file=sys.stderr)
        print("[Ada] No reintento sin confirmación -- revisar qué se creó (con IDs) antes de continuar.", file=sys.stderr)
        raise

    resource_names = _extraer_resource_names(respuesta)
    nuevo_estado = "SUBIDA PAUSADA" if propuesta["tipo"] == "nueva_campana" else "EJECUTADA"
    campos_extra = {}
    if resource_names:
        campos_extra["recurso_objetivo"] = resource_names[-1]
    propuestas.actualizar_estado(id_propuesta, nuevo_estado, campos_extra=campos_extra)

    _registrar_decision(id_propuesta, propuesta["marca"], f"ejecutado ({propuesta['tipo']})", resource_names, base_dir=base_dir)
    return propuesta, resource_names


def activar(id_propuesta, env=None, cliente_mutate=None, base_dir=None):
    env = env or os.environ
    propuesta = propuestas.leer_propuesta(id_propuesta)
    if propuesta["tipo"] != "nueva_campana":
        raise RuntimeError(f"{id_propuesta} no es de tipo nueva_campana -- ACTIVAR no aplica")
    if propuesta["estado"] != "SUBIDA PAUSADA":
        raise RuntimeError(f"{id_propuesta} está en estado '{propuesta['estado']}', no en SUBIDA PAUSADA -- no activo")

    campaign_resource = propuesta.get("recurso_objetivo")
    if not campaign_resource:
        raise RuntimeError(f"{id_propuesta} no tiene recurso_objetivo registrado -- no sé qué campaña activar")

    cliente_mutate = cliente_mutate or ads_mutate.cliente_mutate_desde_env(env)
    ads_mutate.activar_campana(cliente_mutate, propuesta["customer_id"], campaign_resource)

    propuestas.actualizar_estado(id_propuesta, "ACTIVADA")
    _registrar_decision(id_propuesta, propuesta["marca"], "activada (ENABLED)", [campaign_resource], base_dir=base_dir)
    return propuesta


def main():
    load_dotenv()
    args = parse_args()
    if args.ejecutar:
        propuesta, resource_names = ejecutar(args.ejecutar)
        print(f"[Ada] {args.ejecutar} ejecutado. Recursos: {resource_names}")
        if propuesta["tipo"] == "nueva_campana":
            print(f"[Ada] Campaña subida PAUSADA. Para activarla: python3 aplicar_propuesta.py --activar {args.ejecutar}")
    elif args.activar:
        activar(args.activar)
        print(f"[Ada] {args.activar} activada (ENABLED).")


if __name__ == "__main__":
    main()
