// Configuración de entorno para la API de mpa_seguridad
// Puedes establecer esto en tu archivo .env:
// REACT_APP_API_URL=http://localhost:8000

const config = {
  API_URL: "http://localhost:8001", 
  //API_URL: "https://webapplication.mpagroup.mx/trabajos-whse-servicios", // process.env.REACT_APP_API_URL || "http://localhost:8000",
  API_URL_AML: "https://webapplication.mpagroup.mx/aml-servicios",
  // Agrega otras configuraciones si es necesario
};

export default config;
