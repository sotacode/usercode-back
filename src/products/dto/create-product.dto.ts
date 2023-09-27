import { Transform } from "class-transformer";
import { IsString, MinLength, IsNumber, IsPositive, IsOptional, IsInt, IsArray, IsIn, MaxLength, Min, Max } from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(4)
    @MaxLength(25)
    name: string;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @IsPositive()
    @Min(0)
    @Max(2000000)
    price: number;

    @IsString()
    @IsIn(["Entretención", "Videojuegos", "Smart home"])
    category: string;

    @IsString()
    @IsIn(["Destacado", "Normal"])
    notification: string;

    @IsString()
    @IsOptional()
    images: string;
}
