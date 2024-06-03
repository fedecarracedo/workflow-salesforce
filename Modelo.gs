class Evento {
  constructor(nombre, fechaInicioString, fechaFinalString, invitados) {
    this.nombre = nombre;
    this.fechaInicio = new Date(fechaInicioString);
    this.fechaFinal = new Date(fechaFinalString);
    this.invitados = invitados;
  }

  duracion() {
    let dt1 = this.fechaInicio.getTime();
    let dt2 = this.fechaFinal.getTime();
    return ((dt2 - dt1) / 60000 / 60).toFixed(2); // Paso el tiempo a horas, con dos decimales.
  }

  fecha() {
    return this.fechaInicio;
  }
}

class Etiqueta {
  constructor(nombre, id, tipo) {
    this.nombre = nombre;
    this.id = id;
    this.tipo = tipo;
  }
}

class MiembroTribu {
  constructor(nombreCompleto, mail, id) {
    this.nombreCompleto = nombreCompleto;
    this.mail = mail;
    this.id = id;
  }
}

class AsignacionEnCirculo {
  constructor(id, Etiqueta, mail) {
    this.id = id;
    this.Etiqueta = Etiqueta;
    this.mail = mail;
  }
}

class HoraTribu {
  constructor(
    MiembroTribu,
    Etiqueta,
    horasIndividuales,
    horasDeReunion,
    fecha,
    asignacionEnCirculo
  ) {
    this.MiembroTribu = MiembroTribu;
    this.Etiqueta = Etiqueta;
    this.horasIndividuales = horasIndividuales;
    this.horasDeReunion = horasDeReunion;
    this.fecha = fecha;
    this.asignacionEnCirculo = asignacionEnCirculo;
  }

  // Retorna el nombre unico que representa un registro HoraTribu en Salesforce
  // Ej: 2023-07-21.fede@eidosglobal.org.@OP
  nombreUnico() {
    return (
      this.fecha.toLocaleDateString("es-ar").replaceAll("/", "-") + // Cambio "/" por "-" porque sino Salesforce tira error
      "." +
      this.MiembroTribu.mail +
      "." +
      this.Etiqueta.nombre.replace("#", "@")
    ); // Mismo que antes
  }

  sumarHorasIndividuales(valor) {
    this.horasIndividuales += valor;
  }

  sumarHorasDeReunion(valor) {
    this.horasDeReunion += valor;
  }

  // Retorna una representación del registro HoraTribu en formato CSV
  toString() {
    let registroString =
      this.nombreUnico() +
      "," +
      this.Etiqueta.id +
      "," +
      this.fecha.toJSON() +
      "," +
      this.MiembroTribu.id +
      "," +
      this.horasIndividuales +
      "," +
      this.horasDeReunion +
      "," +
      this.nombreUnico() +
      "," +
      this.asignacionEnCirculo +
      "\n";
    return registroString;
  }
}
