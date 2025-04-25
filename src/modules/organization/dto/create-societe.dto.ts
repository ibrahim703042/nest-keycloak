import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({
    example: 'Le Délice Resto-Bar',
    description: 'Name of the restaurant or bar',
  })
  @IsString()
  businessName: string;

  @ApiProperty({
    example: 'Avenue du Commerce, Bujumbura, Burundi',
    description: 'Main address of the establishment',
  })
  @IsString()
  primaryAddress: string;

  @ApiProperty({
    example: 'Rohero District, Bujumbura',
    description: 'Secondary address if applicable',
    required: false,
  })
  @IsOptional()
  @IsString()
  secondaryAddress?: string;

  @ApiProperty({
    example: 'BP 1234',
    description: 'Postal code of the restaurant/bar',
    required: false,
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({
    example: 'Bujumbura',
    description: 'City where the establishment is located',
  })
  @IsString()
  city: string;

  @ApiProperty({
    example: 'Burundi',
    description: 'Country where the restaurant/bar is registered',
  })
  @IsString()
  country: string;

  @ApiProperty({
    example: '400123456',
    description: 'Tax Identification Number (NIF) of the restaurant/bar',
  })
  @IsString()
  nif: string;

  @ApiProperty({
    example: 'RC-2024-56789',
    description: 'Business Registration Number (RC)',
  })
  @IsString()
  rc: string;

  @ApiProperty({
    example: '+257 79 123 456',
    description: 'Primary phone number of the establishment',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'www.ledeliceresto.bi',
    description: 'Website of the restaurant/bar',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    example: '+257 22 345 678',
    description: 'Fax number',
    required: false,
  })
  @IsOptional()
  @IsString()
  fax?: string;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the establishment is a reseller',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  reseller?: boolean;

  @ApiProperty({
    example: 'contact@ledeliceresto.bi',
    description: 'Official email address of the restaurant/bar',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Thank you for your visit! Follow us on Instagram @ledeliceresto',
    description: 'Text displayed at the bottom of invoices',
    required: false,
  })
  @IsOptional()
  @IsString()
  invoiceFooter?: string;
}
