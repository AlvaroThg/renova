import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TIPOS_VARIABLE, TipoVariable } from '@renova/shared';

/**
 * Validación del borde HTTP. Es deliberadamente distinta de las reglas del
 * dominio: acá se rechaza basura sintáctica, allá se protege el invariante.
 */

export class LoginRequestDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}

export class HistoricoQueryDto {
  @IsIn(TIPOS_VARIABLE, { message: 'Variable desconocida' })
  variable: TipoVariable;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(720)
  horas?: number;
}

export class ProduccionQueryDto {
  @IsOptional()
  @IsIn(['dia', 'semana', 'mes'])
  rango?: 'dia' | 'semana' | 'mes';
}

export class RegistrarEntregaRequestDto {
  @IsString()
  @IsNotEmpty()
  generadorId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1, { message: 'La cantidad debe ser mayor a 0 kg' })
  @Max(10000, { message: 'La cantidad supera el máximo por entrega' })
  cantidadKg: number;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha debe ser ISO 8601' })
  fecha?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  observaciones?: string;
}

export class CrearGeneradorRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  @MaxLength(60)
  tipo: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contacto?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ActualizarGeneradorRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contacto?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
