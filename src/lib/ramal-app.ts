/**
 * Instalador do app Android "Infinity Ramal" (pasta ramal-app). O APK fica hospedado no
 * proprio site (public/downloads). Para trocar o link sem novo deploy do arquivo, defina
 * NEXT_PUBLIC_RAMAL_APP_URL. Ao publicar uma versao nova do app, substitua o arquivo em
 * public/downloads/infinity-ramal.apk e atualize RAMAL_APP_VERSION.
 */
export const RAMAL_APP_DOWNLOAD_URL = process.env.NEXT_PUBLIC_RAMAL_APP_URL || '/downloads/infinity-ramal.apk';
export const RAMAL_APP_VERSION = '1.0.0';
export const RAMAL_APP_FILE_NAME = `InfinityRamal-${RAMAL_APP_VERSION}.apk`;
