import os
from dotenv import load_dotenv
from tn.client import TiendaNubeClient

PREFIJO = "DANTE_"


def cargar_tiendas(env=None):
    if env is None:
        load_dotenv(override=False)
        env = os.environ
    tiendas = {}
    for clave, valor in env.items():
        if not clave.startswith(PREFIJO) or not clave.endswith("_STORE_ID"):
            continue
        marca = clave[len(PREFIJO):-len("_STORE_ID")].lower()
        tiendas[marca] = {
            "store_id": valor,
            "token": env.get(f"{PREFIJO}{marca.upper()}_TOKEN"),
            "url": env.get(f"{PREFIJO}{marca.upper()}_URL"),
        }
    return tiendas


def tienda(nombre, env=None):
    datos = cargar_tiendas(env)[nombre.lower()]
    return TiendaNubeClient(store_id=datos["store_id"], token=datos["token"])
