const CACHE = 'mytruck-mate-v2-v15';
const APP_FILES = [
 './','./index.html','./mytruck_mate_header.jpg','./icon.svg','./manifest.json',
 './ma_journee.html','./detail_journee.html','./feuille.html','./frais.html',
 './historique.html','./recapitulatif.html','./profil.html',
 './assets/css/home.css','./assets/js/home.js','./assets/3d/mytruck-mate-bandeau-v2.webp',
 './assets/3d/mytruck-mate-banniere-accueil-v2.webp',
 './assets/3d/tile-entretien.webp',
 './assets/3d/tile-ma-journee.webp',
 './assets/3d/tile-ma-semaine.webp',
 './assets/3d/tile-mes-bilans.webp',
 './assets/3d/tile-mes-docs.webp',
 './assets/3d/tile-mes-frais.webp',
 './assets/3d/tile-objectifs.webp',
 './assets/3d/tile-services.webp',
 './assets/icons/icone-accueil.webp',
 './assets/icons/icone-app-512.webp',
 './assets/icons/icone-camion.webp',
 './assets/icons/icone-deconnexion.webp',
 './assets/icons/icone-parametres.webp',
 './assets/icons/icone-stats.webp',
 './assets/icons/icone-support.webp','./assets/3d/dashboard-icons.svg','./assets/3d/home-scania-hero.webp','./assets/3d/detail-journee-apercu.svg',
 './assets/3d/documents-fond.svg','./assets/3d/food.svg','./assets/3d/fuel.svg',
 './assets/3d/historique-approuve.svg','./assets/3d/historique-corrige.svg',
 './assets/3d/historique-maquette.jpg','./assets/3d/ma-feuille-semaine-3d.jpg',
 './assets/3d/ma-feuille-semaine-scania.jpg','./assets/3d/ma-journee-bandeau-fourni.svg',
 './assets/3d/ma-journee-realiste.jpg','./assets/3d/maintenance.svg',
 './assets/3d/mes-frais-cadre.svg','./assets/3d/mes-frais-maquette.webp','./assets/3d/mes-frais.svg',
 './assets/3d/mytruck-buttons-sprite.jpg','./assets/3d/mytruck-icons.svg',
 './assets/3d/navigation.svg','./assets/3d/parking.svg','./assets/3d/profil-fond.svg',
 './assets/3d/recap-cockpit.svg','./assets/3d/recap-cockpit.webp','./assets/3d/recapitulatif-vignette.svg',
 './assets/3d/sauvegardes-fond.svg','./assets/3d/week.svg',
 './assets/fiche-entete-app.svg','./assets/fiche-entete-impression.svg',
 './assets/recap-amplitude.svg','./assets/recap-bandeau-mytruck-mate.jpg',
 './assets/recap-conduite.svg','./assets/recap-hero.svg','./assets/recap-journees.svg',
 './assets/recap-reference-sprite.jpg'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mytruck-mate-v2-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'||request.destination==='document'){
  event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(()=>caches.match(request).then(cached=>cached||caches.match('./index.html'))));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;})));
});
