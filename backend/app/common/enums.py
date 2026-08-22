from enum import Enum


class EstadoCita(str, Enum):
    PENDIENTE_APROBACION = "pendiente_aprobacion"
    APROBADA = "aprobada"
    CANCELADA = "cancelada"
    COMPLETADA = "completada"


class TipoDescuento(str, Enum):
    PORCENTAJE = "porcentaje"

class TipoDocumento(str, Enum):
    CEDULA_CHILENA = 'cedula_chilena'
    CEDULA_EXTRANJERO = 'cedula_extranjero'
    PASAPORTE_CHILENO = 'pasaporte_chileno'
    PASAPORTE_EXTRANJERO = 'pasaporte_extranjero'
    DOCUMENTO_EXTRANJERO = 'documento_extranjero'
    
class Sexo(str, Enum):
    MASCULINO = 'masculino'
    FEMENINO = 'femenino'


class Genero(str, Enum):
    MASCULINO           = 'masculino'
    FEMENINO            = 'femenino'
    NO_BINARIO          = 'no_binario'
    TRANSGENERO         = 'transgenero'
    GENERO_FLUIDO       = 'genero_fluido'
    PREFIERO_NO_DECIR   = 'prefiero_no_decir'
    OTRO                = 'otro'