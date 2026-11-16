import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ahgdzxgowadoehqhlmqa.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Oja8VvG-iIv-mTKoz3Nicw_R9EnJG9P';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
supabase.from=()=>{throw new Error('Mode test V2 : données locales isolées de la version officielle')};

const $ = id => document.getElementById(id);
const authSection = $('authSection');
const appSection = $('appSection');
let authMode = 'login';


/* Météo réelle selon la position actuelle du chauffeur. */
function weatherPresentation(code){
 if(code===0)return ['☀️','Ensoleillé'];
 if([1,2].includes(code))return ['🌤️','Éclaircies'];
 if(code===3)return ['☁️','Nuageux'];
 if([45,48].includes(code))return ['🌫️','Brouillard'];
 if([51,53,55,56,57].includes(code))return ['🌦️','Bruine'];
 if([61,63,65,66,67,80,81,82].includes(code))return ['🌧️','Pluie'];
 if([71,73,75,77,85,86].includes(code))return ['🌨️','Neige'];
 if([95,96,99].includes(code))return ['⛈️','Orage'];
 return ['🌡️','Météo actuelle'];
}
async function updateDriverWeather(){
 const cityTarget=document.getElementById('homeCity');
 const tempTarget=document.getElementById('weatherTemp');
 const iconTarget=document.getElementById('weatherIcon');
 if(!cityTarget||!navigator.geolocation){if(cityTarget)cityTarget.textContent='Localisation indisponible';return;}
 cityTarget.textContent='Localisation…';
 if(tempTarget)tempTarget.textContent='-- °C';
 if(iconTarget)iconTarget.textContent='📍';
 navigator.geolocation.getCurrentPosition(async pos=>{
  try{
   const {latitude,longitude}=pos.coords;
   const [weather,place]=await Promise.all([
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+latitude+'&longitude='+longitude+'&current=temperature_2m,weather_code&timezone=auto').then(r=>{if(!r.ok)throw new Error('Météo indisponible');return r.json()}),
    fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+latitude+'&lon='+longitude+'&zoom=10').then(r=>{if(!r.ok)throw new Error('Ville indisponible');return r.json()})
   ]);
   const a=place.address||{};
   const city=a.city||a.town||a.village||a.municipality||a.county||'Position actuelle';
   const temp=Math.round(weather.current.temperature_2m);
   const [symbol,description]=weatherPresentation(Number(weather.current.weather_code));
   if(tempTarget)tempTarget.textContent=temp+' °C';
   cityTarget.textContent=city;
   cityTarget.title=description;
   if(iconTarget)iconTarget.textContent=symbol;
  }catch{
   cityTarget.textContent='Météo indisponible';
   if(iconTarget)iconTarget.textContent='⚠️';
  }
 },()=>{
  cityTarget.textContent='Localisation désactivée';
  if(tempTarget)tempTarget.textContent='-- °C';
  if(iconTarget)iconTarget.textContent='📍';
 },{enableHighAccuracy:false,timeout:10000,maximumAge:600000});
}

function updateHomeFees(entries) {
 const now=new Date(),ym=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
 const monthLabel=now.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
 const monthEl=document.getElementById('homeMonthLabel');if(monthEl)monthEl.textContent='— '+monthLabel;
 let rates={breakfast:8.87,lunch:16.36,dinner:16.36,night:52.31};try{rates={...rates,...JSON.parse(localStorage.getItem('truckpilote_fee_rates_v1')||'{}')}}catch{}
 let total=0,days=0,km=0,missions=0;
 Object.entries(entries||{}).forEach(([date,e])=>{
  if(!date.startsWith(ym)||!e||typeof e!=='object')return;
  const meaningful=['tractor','start','end','drive','place','kmstart','kmend'].some(k=>String(e[k]??'').trim()!=='')||['breakfast','lunch','dinner','night','train'].some(k=>e[k]===true)||(Array.isArray(e.transports)&&e.transports.some(t=>t&&Object.values(t).some(v=>String(v??'').trim()!=='')));
  if(!meaningful)return;days++;const r=e.feeRates||rates;
  if(e.breakfast===true)total+=Number(r.breakfast??rates.breakfast);if(e.lunch===true)total+=Number(r.lunch??rates.lunch);if(e.night===true)total+=Number(r.night??rates.night);else if(e.dinner===true)total+=Number(r.dinner??rates.dinner);if(e.train===true)total+=30;
  const start=Number(String(e.kmstart??e.kmStart??'').replace(',','.')),end=Number(String(e.kmend??e.kmEnd??'').replace(',','.'));if(Number.isFinite(start)&&Number.isFinite(end)&&end>=start)km+=end-start;
  if(Array.isArray(e.transports))missions+=e.transports.filter(t=>t&&Object.values(t).some(v=>String(v??'').trim()!=='')).length;else if(e.client||e.place||e.transport)missions++;
 });
 const fee=document.getElementById('homeFeesValue');if(fee)fee.textContent=total.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
 const dayEl=document.getElementById('homeDaysValue');if(dayEl)dayEl.textContent=String(days);
 const primeDays=document.getElementById('homePrimeDays');if(primeDays)primeDays.textContent=days+' journée'+(days>1?'s':'')+' saisie'+(days>1?'s':'');
 const kmEl=document.getElementById('homeKmValue');if(kmEl)kmEl.textContent=Math.round(km).toLocaleString('fr-FR')+' km';
 const missionsEl=document.getElementById('homeMissionsValue');if(missionsEl)missionsEl.textContent=String(missions);
}
function localDailyEntries(){try{return JSON.parse(localStorage.getItem('truckpilote_daily_entries_v1')||'{}')}catch{return {}}}
function showStatus(message, isError = false) {
  $('authStatus').textContent = message;
  $('authStatus').style.color = isError ? '#b42318' : '#187044';
}
function setMode(mode) {
  authMode = mode;
  $('nameInput').classList.toggle('hidden', mode !== 'signup');
  $('nameLabel').classList.toggle('hidden', mode !== 'signup');
  $('loginBtn').classList.toggle('hidden', mode !== 'login');
  $('signupBtn').classList.toggle('hidden', mode !== 'signup');
  $('switchModeBtn').textContent = mode === 'signup' ? 'Déjà inscrit ? Se connecter' : 'Première visite ? Créer mon compte';
  $('passwordInput').setAttribute('autocomplete', mode === 'signup' ? 'new-password' : 'current-password');
  showStatus(mode === 'signup' ? 'Renseignez votre nom, votre e-mail et un mot de passe.' : 'Connectez-vous avec votre adresse e-mail et votre mot de passe.');
}
async function showSignedIn(user) {
  updateHomeFees(localDailyEntries());
  updateDriverWeather();
  const weatherModule=document.getElementById('weatherModule');if(weatherModule&&!weatherModule.dataset.bound){weatherModule.dataset.bound='1';weatherModule.addEventListener('click',updateDriverWeather);}
  try {
    const {data,error}=await supabase.from('truckpilote_daily_entries').select('work_date,entry').eq('user_id',user.id);
    if(!error){
      const merged=localDailyEntries();
      (data||[]).forEach(row=>{merged[row.work_date]=row.entry||{date:row.work_date}});
      localStorage.setItem('truckpilote_daily_entries_v1',JSON.stringify(merged));
      updateHomeFees(merged);
    }
  } catch {}
  const localMeta=(()=>{try{return JSON.parse(localStorage.getItem('truckpilote_profile_v2_metadata')||'{}')}catch{return {}}})();
  const localProfile=(()=>{try{return JSON.parse(localStorage.getItem('truckpilote_profile')||'{}')}catch{return {}}})();
  const metadata = {...(user.user_metadata || {}),...localMeta};
  const fullName = metadata.full_name || [localProfile.firstname,localProfile.lastname].filter(Boolean).join(' ') || localStorage.getItem('truckpilote_profile_name') || '';
  const firstName = fullName.trim().split(/\s+/)[0] || 'chauffeur';
  $('helloName').textContent = firstName;
  const avatarInitials = fullName.trim().split(/\s+/).slice(0,2).map(part=>part[0]?.toLocaleUpperCase('fr-FR')||'').join('');
  const avatarNode = $('homeAvatarInitials'); if(avatarNode) avatarNode.textContent = avatarInitials || 'CH';
  const avatarPhoto = $('homeAvatarPhoto');
  const savedAvatar = localStorage.getItem('truckpilote_profile_avatar_v1::'+user.id);
  if(avatarPhoto && savedAvatar){ avatarPhoto.src=savedAvatar; avatarPhoto.classList.remove('hidden'); if(avatarNode) avatarNode.classList.add('hidden'); }
  else { if(avatarPhoto){avatarPhoto.removeAttribute('src');avatarPhoto.classList.add('hidden');} if(avatarNode) avatarNode.classList.remove('hidden'); }
  const appMeta = user.app_metadata || {};
  const isPremium = appMeta.is_premium === true || String(appMeta.plan || '').toLowerCase() === 'premium' || String(appMeta.subscription_status || '').toLowerCase() === 'active';
  const premiumBadge = $('homePremiumBadge'); if(premiumBadge) premiumBadge.classList.toggle('hidden', !isPremium);
  $('accountName').textContent = fullName || 'Compte chauffeur';
  $('accountEmail').textContent = user.email || '';
  $('profileName').textContent = fullName || 'Profil chauffeur';
  $('profileEmail').textContent = user.email || 'Profil à compléter';
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
}
function showSignedOut() {
  appSection.classList.add('hidden');
  authSection.classList.remove('hidden');
  $('helloName').textContent = 'chauffeur';
}

$('switchModeBtn').addEventListener('click', () => setMode(authMode === 'login' ? 'signup' : 'login'));

$('authForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (authMode !== 'login') return;
  const email = $('emailInput').value.trim();
  const password = $('passwordInput').value;
  $('loginBtn').disabled = true;
  showStatus('Connexion en cours…');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  $('loginBtn').disabled = false;
  if (error) return showStatus(error.message, true);
  if (data.user) showSignedIn(data.user);
});
$('signupBtn').addEventListener('click', async () => {
  const fullName = $('nameInput').value.trim();
  const email = $('emailInput').value.trim();
  const password = $('passwordInput').value;
  if (!fullName) return showStatus('Saisissez votre nom et prénom.', true);
  if (!email || !password) return showStatus('Saisissez votre e-mail et votre mot de passe.', true);
  if (password.length < 6) return showStatus('Le mot de passe doit contenir au moins 6 caractères.', true);
  $('signupBtn').disabled = true;
  showStatus('Création du compte en cours…');
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: window.location.origin + window.location.pathname
    }
  });
  $('signupBtn').disabled = false;
  if (error) return showStatus(error.message, true);
  localStorage.setItem('truckpilote_profile_name', fullName);
  if (data.session && data.user) {
    // If Supabase returns a session immediately, email confirmation is probably disabled.
    // Sign out so the app does not bypass the intended email-verification step.
    await supabase.auth.signOut();
    setMode('login');
    showStatus('Le compte a été créé, mais Supabase autorise une connexion sans confirmation. Activez « Confirm email » dans Authentication > Sign In / Providers > Email, puis demandez au chauffeur de confirmer son adresse.', true);
  } else {
    setMode('login');
    showStatus('Compte créé ! Consultez votre boîte e-mail (et les courriers indésirables), puis cliquez sur le lien de confirmation. Vous pourrez ensuite vous connecter.');
  }
});
$('logoutBtn').addEventListener('click', async () => {
  $('logoutBtn').disabled = true;
  const { error } = await supabase.auth.signOut();
  $('logoutBtn').disabled = false;
  if (error) return alert('Déconnexion impossible : ' + error.message);
  showSignedOut();
  $('passwordInput').value = '';
  setMode('login');
});
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) {
  try {
    const {data} = await supabase.from('truckpilote_daily_entries').select('work_date,entry').eq('user_id',session.user.id);
    const merged=localDailyEntries();(data||[]).forEach(row=>{merged[row.work_date]=row.entry||{date:row.work_date}});
    localStorage.setItem('truckpilote_daily_entries_v1',JSON.stringify(merged));updateHomeFees(merged);
  } catch { updateHomeFees(localDailyEntries()); }
} else updateHomeFees(localDailyEntries());
if (session?.user) showSignedIn(session.user);
else { showSignedOut(); setMode('login'); }
supabase.auth.onAuthStateChange((_event, sessionNow) => {
  if (sessionNow?.user) showSignedIn(sessionNow.user);
  else showSignedOut();
});

// Navigation accueil / menu et personnalisation par chauffeur
const homeView=document.getElementById('homeView'),menuView=document.getElementById('menuView');
document.getElementById('menuToggle')?.addEventListener('click',()=>{homeView.classList.add('hidden');menuView.classList.remove('hidden');document.body.classList.add('menu-open')});
document.getElementById('backHome')?.addEventListener('click',()=>{menuView.classList.add('hidden');homeView.classList.remove('hidden');document.body.classList.remove('menu-open')});
document.getElementById('openPrimes')?.addEventListener('click',()=>location.href='frais.html');
document.getElementById('openActivity')?.addEventListener('click',()=>location.href='recapitulatif.html');
document.getElementById('notificationsBtn')?.addEventListener('click',()=>alert('Tu es à jour. Les notifications seront activées dans une prochaine évolution.'));
document.querySelectorAll('[data-coming]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();alert(el.dataset.coming+' : fonctionnalité prévue dans une prochaine version.')}));
const prefKey='mymate_home_widgets_v2';
function applyHomePrefs(){let p={primes:true,activity:true,shortcuts:true};try{p={...p,...JSON.parse(localStorage.getItem(prefKey)||'{}')}}catch{};document.getElementById('homePrimesCard').classList.toggle('hidden',!p.primes);document.getElementById('homeActivityCard').classList.toggle('hidden',!p.activity);document.getElementById('homeShortcuts').classList.toggle('hidden',!p.shortcuts);document.querySelectorAll('#customPanel input[data-widget]').forEach(i=>i.checked=!!p[i.dataset.widget])}
document.getElementById('customizeToggle')?.addEventListener('click',()=>document.getElementById('customPanel').classList.toggle('hidden'));
document.getElementById('saveHomePrefs')?.addEventListener('click',()=>{const p={};document.querySelectorAll('#customPanel input[data-widget]').forEach(i=>p[i.dataset.widget]=i.checked);localStorage.setItem(prefKey,JSON.stringify(p));applyHomePrefs();document.getElementById('customStatus').textContent='Accueil personnalisé enregistré sur cet appareil.'});
applyHomePrefs();

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
