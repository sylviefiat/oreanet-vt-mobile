# oreanet-vt-mobile
> Signalement participatif d'acanthasters à Vanuatu - Réseau [OREANET Vanuatu](http://fisheries.gov.vu "OREANET VANUATU")

OREANET-VU est une application de signalement participatif d'Acanthasters planci, une étoile de mer qui se nourrit entre autres de coraux, pour les archipels du Vanuatu en collaboration  avec le Vanuatu Fisheries Department. Les données sont directement envoyées sur le site web des Fisheries, hébergé par le service informatique du premier ministre du Vanuatu.
Mise en ligne par l'IRD, elle permet aux scientifiques de pouvoir étudier leurs déplacements et leur reproduction ainsi qu'essayer de comprendre les explosions démographiques qui parfois entraînent la destruction de récifs coralliens.
Pour signaler une ou plusieurs Acanthaster planci, il suffit d'ouvrir l'application, de nous fournir un contact et de cliquer sur la carte interactive pour localiser le ou les animaux.
L'application fonctionne en partie hors ligne, vous pouvez créer un formulaire et attendre d'être connecté pour positionner l'observation sur la carte et envoyer le rapport.
Les signalements envoyés sont visibles sur le site oreanet.ird.nc.

- Signaler la présence d'acanthasters en cliquant sur une carte intéractive
- Enregistrer un formulaire non fini
- Disponile hors-ligne
- Disponible uniquement sur Android, à partir de Android 6

## Build Android APK

![](http://oreanet-fj.ird.nc/images/pin5-oreanet.png)

[Download](https://play.google.com/store/apps/details?id=nc.oreanet_fj.mobile "download-play")


**PhonegapCLI & Cordova**

###PhonegapCLI & Cordova

####Commandes utiles

Créer projet

    $ cordova create hello com.example.hello HelloWorld
Si appli existante (codehtml) la placer appli dans www

    TODO
Ajout plateform android au projet phonegap

    $ phonegap platform add android
Build apk de test 

    $ phonegap build
Lancer sur browser

    $ phonegap serve
Changer la version de l'appli
- dans config.xml à la racine du projet (pas dans www) 
ET 
- dans platforms/android/app/src/main/AndroidManifest.xml

Lancer dans l'émulateur ou sur tablette/portable si connecté à l'ordi en mode debug

    $ sudo chown sfiat /dev/kvm 
    
    $ cordova run android --release -- --keystore=/home/sfiat/Documents/Entropie/PROJETS/OREANET/phonegap/oreanet.keystore --storePassword=oreanet15 --alias=oreanet --password=oreanet15 --packageType=apk
Build la release apk

    $ cordova build android --release -- --keystore=/home/sfiat/Documents/Entropie/PROJETS/OREANET/phonegap/oreanet.keystore --storePassword=oreanet15 --alias=oreanet --password=oreanet15 --packageType=apk
OU avec phonegap

    $ phonegap run android --release -- --keystore=/home/sfiat/Documents/Entropie/PROJETS/OREANET/phonegap/oreanet.keystore --storePassword=oreanet15 --alias=oreanet --password=oreanet15 --packageType=apk

    $ phonegap build android --release -- --keystore=/home/sfiat/Documents/Entropie/PROJETS/OREANET/phonegap/oreanet.keystore --storePassword=oreanet15 --alias=oreanet --password=oreanet15 --packageType=apk

Pour débugguer dans
    `platforms/android/app/src/main/AndroidManifest.xml`
Ajouter debuggable

    <application android:debuggable="true" android:hardwareAccelerated="true" android:icon="@drawable/icon" android:label="@string/app_name" android:supportsRtl="true">

Pour enlever les authorisations non voulues les enlever dans:

    myapp\platforms\android\app\src\main\AndroidManifest.xml
    myapp\platforms\android\android.json
    
###End
