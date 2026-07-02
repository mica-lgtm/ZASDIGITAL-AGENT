"""Adaptador de solo lectura sobre el toolkit de Tienda Nube que ya construyó
Dante (dante-desarrollo-tn/tn/). No reimplementa nada: solo importa
tn.tiendas/tn.metricas. Nunca importar tn.scripts/tn.checkout/tn.productos
acá (esos mutan la tienda viva) — ver CLAUDE.md, sección Ámbito."""

import os
import sys

_DANTE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "dante-desarrollo-tn")
if _DANTE_DIR not in sys.path:
    sys.path.insert(0, _DANTE_DIR)

from tn.tiendas import tienda as _tienda  # noqa: E402
from tn.metricas import resumen_ventana  # noqa: E402

from .base import fila


def stats_dia(marca, fecha):
    cliente = _tienda(marca)
    resumen = resumen_ventana(cliente, desde=fecha, hasta=fecha)
    return fila(
        "tienda_nube",
        marca,
        fecha,
        conversiones=resumen["pedidos"],
        ingresos=resumen["ingresos"],
    )
