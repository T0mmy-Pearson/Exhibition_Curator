export interface AppConfig {
    nodeEnv: string;
    port: number;
    mongoUri: string;
    jwtSecret: string;
    corsOrigin: string | string[];
    rateLimiting: {
        windowMs: number;
        maxRequests: number;
    };
    museum: {
        metApiUrl: string;
        rijksApiKey: string;
        rijksApiUrl: string;
        vaApiUrl: string;
    };
}
export declare const getConfig: () => AppConfig;
export declare const config: AppConfig;
//# sourceMappingURL=index.d.ts.map