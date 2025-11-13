
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.main import api_router
from app.events.observer_initializer import initialize_observers


app = FastAPI(title="NINTEX MRI CONNECTOR")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia esto a los orígenes permitidos en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar observers al arrancar la aplicación
@app.on_event("startup")
async def startup_event():
    """Inicializa los observers del patrón Observer al arrancar la aplicación."""
    print("🚀 Inicializando observers del sistema...")
    initialize_observers()  # Ahora usa FRONTEND_BASE_URL del .env automáticamente
    print("✅ Observers inicializados correctamente")

# Registrar todos los routers de la API
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Backend API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002, reload=True)
