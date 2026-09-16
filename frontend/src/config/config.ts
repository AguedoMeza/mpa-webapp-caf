// OJO: el backend del CAF NO se configura aquí.
//
// Las services (caf-solicitud, building, user) leen process.env.REACT_APP_API_URL
// directo de frontend/.env, así que ese es el único lugar donde se cambia.
// Create React App congela el valor al momento del build.
//
// De este archivo solo se consume API_URL_AML, en AuthService.

// El backend vive en el mismo origen que el front, bajo su ruta en IIS. Usar rutas
// relativas hace que funcione igual en produccion, en localhost y desde cualquier
// maquina de la red: no hay que resolver hostnames ni exponer puertos.

const config = {
  API_URL: "/mpa-webapp-caf-servicios",
  API_URL_AML: "/aml-servicios",
};

export default config;
