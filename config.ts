import { config as configEnv } from 'dotenv';

const envVariables = [
    'POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_USERNAME', 'POSTGRES_PASSWORD',
    'DJINNI_DOCUMENT_COOKIE', 'TRACKING_URL',
];

type cfgType = {
    postgresHost: string,
    postgresPort: number,
    postgresUsername: string,
    postgresPassword: string,
    djinniDocumentCookie: string,
    trackingUrl: string,
};

let cfg: cfgType;

configEnv({ path: '.env' });

envVariables.forEach(envVariable => {
    if (process.env[envVariable] === undefined) {
        throw new Error(`The following ENV variable is undefined ${envVariable}`);
    }
});

cfg = {
    postgresHost: process.env.POSTGRES_HOST!,
    postgresPort: Number(process.env.POSTGRES_PORT!),
    postgresUsername: process.env.POSTGRES_USERNAME!,
    postgresPassword: process.env.POSTGRES_PASSWORD!,
    djinniDocumentCookie: process.env.DJINNI_DOCUMENT_COOKIE!,
    trackingUrl: process.env.TRACKING_URL!,
}

export default cfg;