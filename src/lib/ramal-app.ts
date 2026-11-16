import ramalRelease from '../../public/downloads/infinity-ramal-update.json';

/**
 * Instalador do app Android "Infinity Ramal" (pasta ramal-app). O APK fica hospedado no
 * proprio site (public/downloads). Para trocar o link sem novo deploy do arquivo, defina
 * NEXT_PUBLIC_RAMAL_APP_URL. Ao publicar uma versao nova do app, substitua o arquivo em
 * public/downloads pelo script scripts/stage-ramal-release.ps1.
 */
export const RAMAL_APP_DOWNLOAD_URL = process.env.NEXT_PUBLIC_RAMAL_APP_URL || '/downloads/infinity-ramal.apk';
export const RAMAL_APP_VERSION = ramalRelease.versionName;
export const RAMAL_APP_FILE_NAME = `InfinityRamal-${RAMAL_APP_VERSION}.apk`;
