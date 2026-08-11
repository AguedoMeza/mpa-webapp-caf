// OJO: el backend del CAF NO se configura aquí.
//
// Las services (caf-solicitud, building, user) leen process.env.REACT_APP_API_URL
// directo de frontend/.env, así que ese es el único lugar donde se cambia entre
// local y producción. Create React App congela el valor al momento del build.
//
// De este archivo solo se consume API_URL_AML, en AuthService.

const config = {
  // Sin uso hoy. Se deja apuntando a producción para que nadie herede un
  // localhost por accidente si algún día lo empieza a consumir.
  API_URL: "https://webapplication.mpagroup.mx/mpa-webapp-caf-servicios",
  API_URL_AML: "https://webapplication.mpagroup.mx/aml-servicios",
};

export default config;
