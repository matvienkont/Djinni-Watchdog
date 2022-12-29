import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Job {
    @PrimaryColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    seen: boolean;

    @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    date: Date;
}