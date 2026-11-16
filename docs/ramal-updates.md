# Atualizações do Infinity Ramal

O Ramal 1.0.3 é a primeira versão que busca atualizações pelo próprio app. No Android, use **Permitir atualizações do Ramal** uma vez. Caso o Android peça confirmação nas versões seguintes, toque na notificação para abrir a tela de instalação.

O app prepara a atualização em segundo plano e só a entrega ao Android quando não há ligação, fila ativa ou fila pausada. Se o Android impedir a reconexão automática após a instalação, abra o Ramal novamente.

## Publicar uma versão

1. Aumente o versionCode e o versionName no projeto Android. Compile o APK com a mesma chave usada pela versão publicada.
2. Execute **pwsh -File scripts/stage-ramal-release.ps1 -Apk <caminho-do-apk>** na cópia do site. O script verifica a assinatura e gera o manifesto com o código da versão e o SHA-256.
3. Publique o APK e o manifesto em public/downloads no mesmo commit. O build verifica se o manifesto corresponde ao APK.

O aplicativo carrega o APK e o manifesto pelo domínio oficial. O Android valida a assinatura antes de instalar.
