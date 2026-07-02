from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.cro.backend.routers import experimentos, preview, tiendas, templates as templates_router

app = FastAPI(title="Dante CRO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tiendas.router)
app.include_router(templates_router.router)
app.include_router(preview.router)
app.include_router(experimentos.router)


@app.get("/health")
def health():
    return {"status": "ok"}
