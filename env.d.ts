interface ImportMetaEnv {
    readonly REACT_APP_API_DEEZER_PATH: string;
    readonly REACT_APP_DEEZER_APP_ID: string;
    readonly REACT_APP_DEEZER_SECRET : string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}