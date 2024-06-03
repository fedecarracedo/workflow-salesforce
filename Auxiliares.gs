function getUrlFetchOptions() {
  var token =
    PropertiesService.getUserProperties().getProperty(tokenPropertyName);
  return {
    contentType: "text/csv",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "text/csv",
    },
    muteHttpExceptions: true,
  };
}

function getUrlFetchPOSTOptions(payload) {
  var token =
    PropertiesService.getUserProperties().getProperty(tokenPropertyName);
  return {
    method: "post",
    contentType: "application/json",
    payload: payload,
    headers: {
      Authorization: "Bearer " + token,
    },
    muteHttpExceptions: true,
  };
}

function getUrlFetchPATCHOptions(payload) {
  var token =
    PropertiesService.getUserProperties().getProperty(tokenPropertyName);
  return {
    method: "PATCH",
    contentType: "application/json",
    payload: payload,
    headers: {
      Authorization: "Bearer " + token,
    },
    muteHttpExceptions: true,
  };
}

function getUrlFetchCSVOptions(payload) {
  var token =
    PropertiesService.getUserProperties().getProperty(tokenPropertyName);
  return {
    method: "PUT",
    contentType: "text/csv",
    payload: payload,
    headers: {
      Authorization: "Bearer " + token,
    },
    muteHttpExceptions: true,
  };
}

class FuncionesAuxiliares {
  // To-Do: Rehacer esta función. Fija que puede hacerse más simple.
  encontrarEtiquetaEn(NombreEvento, etiquetasActuales) {
    let existeEtiqueta = false;
    let etiquetaActual = null;
    // Busco en qué etiqueta debo cargar las horas. Hay que mejorar esto, por ej: Busqueda binaria.
    let i = 0;
    while (i < etiquetasActuales.length && !existeEtiqueta) {
      // Paso todo a minúsculas para que la comparación sea independiente del formato
      let nombreEtiqueta = etiquetasActuales[i].nombre.toString().toLowerCase();
      const isTagPresent = NombreEvento.toString()
        .toLowerCase()
        .match(nombreEtiqueta + "$|" + nombreEtiqueta + " "); // RegExp para encontrar la etiqueta en el nombre del evento
      if (isTagPresent) {
        existeEtiqueta = true;
        etiquetaActual = etiquetasActuales[i];
      }
      i++;
    }
    return etiquetaActual;
  }

  getWorkingDays(firstDay, lastDay) {
    var weeksArr = [];

    var currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      var nueva = new Date(currentDate);
      if (nueva.getDay() != 0 && nueva.getDay() != 6) {
        weeksArr.push(nueva);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeksArr;
  }
}
