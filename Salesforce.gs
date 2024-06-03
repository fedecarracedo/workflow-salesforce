// TO-DO: Boletear el checkCredentials() que está completamente al pedo. Directamente generar las credenciales y ya está.
// TO-DO: Centralizar la version de la API de Salesforce. Ya vamos por la v59.0, y estaría bueno poder cambiarlo desde un solo lugar.

class SalesforceEIDOS {
  getEtiquetas() {
    let registros = this.runSOQL(
      "SELECT FIELDS(All) FROM Etiqueta__c LIMIT 100"
    ).records;
    let Etiquetas = registros
      .filter((etiqueta) => etiqueta.Activa__c == true) // Me quedo con aquellas etiquetas que se encuentren activas
      .map(
        ({ Name, Id_de_Etiqueta__c, Tipo__c }) =>
          new Etiqueta(Name, Id_de_Etiqueta__c, Tipo__c)
      );
    return Etiquetas;
  }

  getMiembrosTribu() {
    let registros = this.runSOQL(
      "SELECT FIELDS(ALL) FROM MiembroTribu__c LIMIT 100"
    ).records;
    let MiembrosTribu = registros
      .filter(({ Vigente__c }) => Vigente__c == true)
      .map(
        ({ Nombre_Completo__c, Mail__c, Id }) =>
          new MiembroTribu(Nombre_Completo__c, Mail__c, Id)
      );
    return MiembrosTribu;
  }

  getAsignaciones() {
    let registros = this.runSOQL(
      "Select FIELDS(ALL) FROM Asignaci_n_en_C_rculo__c LIMIT 100"
    ).records;
    let Asignaciones = registros.map(
      ({ Etiqueta__c, Mail_de_MiembroTribu__c, Id__c }) =>
        new AsignacionEnCirculo(Id__c, Etiqueta__c, Mail_de_MiembroTribu__c)
    );
    return Asignaciones;
  }

  createJob() {
    let jobPayload = {
      object: "Hora_Tribu__c",
      externalIdFieldName: "Nombre_unico__c",
      contentType: "CSV",
      operation: "upsert",
      lineEnding: "LF",
    };

    var getDataURL =
      PropertiesService.getUserProperties().getProperty(baseURLPropertyName) +
      "/services/data/v58.0/jobs/ingest/";
    let response = UrlFetchApp.fetch(
      getDataURL,
      getUrlFetchPOSTOptions(JSON.stringify(jobPayload))
    );
    let responseJSON = JSON.parse(response);
    return responseJSON;
  }

  completeJob(jobID) {
    var getDataURL =
      PropertiesService.getUserProperties().getProperty(baseURLPropertyName) +
      "/services/data/v58.0/jobs/ingest/" +
      jobID +
      "/";
    let payload = {
      state: "UploadComplete",
    };
    let response = UrlFetchApp.fetch(
      getDataURL,
      getUrlFetchPATCHOptions(JSON.stringify(payload))
    );
    return response.getContentText();
  }

  cargarHorasCSV(csvPayload) {
    // Abro un nuevo Job que recibirá y cargará los datos en CSV
    const job = this.createJob();

    // Convierto los datos del CSV al formato UTF-8 aceptado por Salesforce
    let blob = Utilities.newBlob(csvPayload).getDataAsString();
    var getDataURL =
      PropertiesService.getUserProperties().getProperty(baseURLPropertyName) +
      "/" +
      job.contentUrl +
      "/";

    // Cargo los datos en el Job para que los procese y cree los registros
    UrlFetchApp.fetch(getDataURL, getUrlFetchCSVOptions(blob));

    // Cierro el job, completando la carga
    this.completeJob(job.id);
    return;
  }

  runSOQL(soql) {
    var getDataURL =
      PropertiesService.getUserProperties().getProperty(baseURLPropertyName) +
      "/services/data/v58.0/query/?q=" +
      soql;
    var dataResponse = UrlFetchApp.fetch(getDataURL, getUrlFetchOptions());
    return JSON.parse(dataResponse.getContentText());
  }
}
