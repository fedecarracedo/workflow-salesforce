class CalendarEIDOS {
  buscarEventosEtiquetados(mail, fechaInicio, fechaFinal) {
    try {
      const limiteInf = fechaInicio;
      const limiteSup = fechaFinal;

      const calendarId = mail;
      var optionalArgs = {
        timeMin: limiteInf.toISOString(), // Desde esta fecha busca los eventos
        timeMax: limiteSup.toISOString(), // Hasta esta fecha (no inclusive).
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 9999,
      };

      var response = Calendar.Events.list(calendarId, optionalArgs);

      let events = response.items
        .filter((event) => {
          // La primera condición para aceptar el evento como válido es que tenga fecha de inicio, nombre y hashtag
          let cond1 =
            event.start.dateTime &&
            event.summary &&
            event.summary.indexOf("#") != -1;
          if (cond1 && event.attendees) {
            // La segunda es que, si es un evento con invitados, no lo haya rechazado
            let myResponse = event.attendees.find(
              (invitado) => invitado.self == true
            );
            let cond2 = myResponse && myResponse.responseStatus == "accepted";
            return cond1 && cond2;
          }
          return cond1;
        })
        // Transformo la información a una Clase conocida para un manejo más intuitivo.
        .map(
          (event) =>
            new Evento(
              event.summary,
              event.start.dateTime,
              event.end.dateTime,
              event.attendees
                ? Object.values(event.attendees).map(
                    (invitado) => invitado.email
                  )
                : null // De la información de los invitados (si hay), sólamente me quedo con el mail
            )
        );
      return events;
    } catch (e) {
      return [];
    }
  }
}
