import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
export class Job {
    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn({ unique: true })
    jobId: number;

    @Column({ unique: true })
    jobUrl: string;

    @Column()
    title: string;

    @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    date: Date;

    @Column()
    company: string;

    @Column()
    recruiter: string;

    @Column()
    description: string;
}