import { Product } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {unique: true})
    email: string;

    @Column('text',{select: false})
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {default: true})
    isActive: Boolean;

    @Column('text', {array: true, default: ['user']})
    roles: string[];
}
