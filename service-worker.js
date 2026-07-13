'use strict';

const CACHE_NAME='tactician-shell-v1';
const SHELL=[
  './','./index.html','./manifest.webmanifest',
  './icons/tactician.svg',
  './src/styles/legacy.css','./src/generated/tactician-core.js',
  './src/legacy/runtime-state.js','./src/legacy/app-1.js','./src/legacy/app-2.js','./src/legacy/app-3.js',
  './src/services/pwa.js'
];

self.addEventListener('install',(event)=>{
  event.waitUntil(caches.open(CACHE_NAME).then((cache)=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',(event)=>{
  event.waitUntil(caches.keys()
    .then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE_NAME).map((key)=>caches.delete(key))))
    .then(()=>self.clients.claim()));
});

self.addEventListener('fetch',(event)=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request)
      .then((response)=>{const copy=response.clone();caches.open(CACHE_NAME).then((cache)=>cache.put('./index.html',copy));return response;})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached)=>cached||fetch(event.request)));
});
