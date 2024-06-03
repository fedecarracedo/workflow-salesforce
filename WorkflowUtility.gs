class WorkflowUtility {
  // Calcula las horas a partir de los eventos de Calendar y en función de las etiquetas cargadas en Salesforce
  contabilizarHoras(
    MiembroTribu,
    eventosDeMiembroTribu,
    etiquetasEnSalesforce,
    asignacionesEnCirculo,
    fechaInicio,
    fechaFinal
  ) {
    let FuncionesAux = new FuncionesAuxiliares();
    let horas = {};

    // Ahora, es importante registrar también que la persona NO tiene horas en algunas de las etiquetas que tiene asignadas.
    const workingDays = FuncionesAux.getWorkingDays(fechaInicio, fechaFinal);
    asignacionesEnCirculo.forEach((Asignacion) => {
      const Etiqueta = etiquetasEnSalesforce.find(
        (Etiqueta) => Asignacion.Etiqueta.indexOf(Etiqueta.id) != -1
      );
      workingDays.forEach((WorkingDay) => {
        const idUnico =
          WorkingDay.toLocaleDateString("es-ar") + ":" + Etiqueta.nombre;
        horas[idUnico] = new HoraTribu(
          MiembroTribu,
          Etiqueta,
          0,
          0,
          WorkingDay,
          Asignacion.id
        );
      });
    });

    eventosDeMiembroTribu.forEach((Evento) => {
      let Etiqueta = FuncionesAux.encontrarEtiquetaEn(
        Evento.nombre,
        etiquetasEnSalesforce
      );
      if (Etiqueta) {
        const fechaString = Evento.fecha().toLocaleDateString("es-ar");
        const idUnico = fechaString + ":" + Etiqueta.nombre; // Confecciono una primary key para evitar duplicados
        const tiempoEvento = parseFloat(Evento.duracion()); // Lo casteo a Float para que el interpreter no se confunda y lo tome como String
        let asignacion = asignacionesEnCirculo.filter((Asignacion) =>
          Etiqueta.tipo == "Proyecto"
            ? Asignacion.Etiqueta.indexOf("a1Q3p000009Tz5jEAC") != -1
            : Asignacion.Etiqueta.indexOf(Etiqueta.id) != -1
        ); // Si la Etiqueta del evento es de un Proyecto, busco una asignacion de horas de LXD. Sino, busco la asignación según el id.
        asignacion = asignacion.length > 0 ? asignacion[0].id : "";
        if (horas[idUnico] == null) {
          Logger.log("No se encontró: " + idUnico);
          horas[idUnico] = new HoraTribu(
            MiembroTribu,
            Etiqueta,
            0,
            0,
            Evento.fecha(),
            asignacion
          );
        }

        // Si el evento tiene un solo invitado, entonces es tiempo de concentración y debe contabilizarse como "Horas individuales"
        if (Evento.invitados && Evento.invitados.length > 1) {
          horas[idUnico].sumarHorasDeReunion(tiempoEvento);
        } else {
          horas[idUnico].sumarHorasIndividuales(tiempoEvento);
        }
      }
    });
    return Object.values(horas); // Los valores del objeto "horas" son cáda uno de los registros HoraTribu que van a cargarse
  }
}
