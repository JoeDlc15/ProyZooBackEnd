import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column('text', { unique: true })
    email: string;

    @Column('text')
    fullName: string;
    
    @Column('text', { nullable: true })
    password: string;

    @Column('bool', { default: false })
    isActive: boolean;

    @Column('text', { array: true, default: ['user'] })
    roles: string[];

    //TODO: Firebase Auth
    @Column('text', { unique: true })
    firebaseUuid: string;
}
