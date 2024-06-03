function main() {
  let CalendarTRIBU = new CalendarEIDOS();
  let Salesforce = new SalesforceEIDOS();
  let Workflow = new WorkflowUtility();

  getTokenUsingRefresh();

  let fechaFinal = new Date();
  let fechaInicio = new Date(
    fechaFinal.getFullYear(),
    fechaFinal.getMonth() - 1,
    fechaFinal.getDate()
  );

  // Primer renglón del CSV. Declara las columnas que se van a cargar y su orden.
  // TO-DO: Abstraer el payload. Por ahí una nueva clase, new CSVPayload con métodos CSVPayload.append()
  let csvPayload =
    "Name,Etiqueta__c,Fecha__c,MiembroTribu__c,Horas_individuales__c,Horas_de_reuni_n__c,Nombre_unico__c,Asignaci_n_en_C_rculo__c\n";
  let etiquetasEnSalesforce = Salesforce.getEtiquetas();
  let miembrosTribu = Salesforce.getMiembrosTribu();
  let asignacionesEnCirculo = Salesforce.getAsignaciones();

  miembrosTribu.forEach((MiembroTribu) => {
    Logger.log("Procesando a: " + MiembroTribu.nombreCompleto);
    // Si no hay eventos de Calendar, debería cortar el proceso y no seguir.
    const eventosDeMiembroTribu = CalendarTRIBU.buscarEventosEtiquetados(
      MiembroTribu.mail,
      fechaInicio,
      fechaFinal
    );
    const asignacionesMiembroTribu = asignacionesEnCirculo.filter(
      (Asignacion) => Asignacion.mail == MiembroTribu.mail
    );
    const HorasMiembroTribu = Workflow.contabilizarHoras(
      MiembroTribu,
      eventosDeMiembroTribu,
      etiquetasEnSalesforce,
      asignacionesMiembroTribu,
      fechaInicio,
      fechaFinal
    );

    // Agrego todos los registros HoraTribu al CSV
    HorasMiembroTribu.forEach(
      (RegistroHora) => (csvPayload += RegistroHora.toString())
    );
  });

  Salesforce.cargarHorasCSV(csvPayload);
}
