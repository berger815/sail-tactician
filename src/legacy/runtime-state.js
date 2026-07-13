'use strict';

// Authoritative live runtime state. This classic script loads before the
// legacy application so existing call sites retain their bindings unchanged.
const NAV={lat:null,lon:null,hdg:null,sog:0,cog:null,gpsAcc:null,gpsAlt:null,gpsSpeedRaw:null,gpsHeadingRaw:null,
           pLat:null,pLon:null,pT:null,track:[]};
const WIND={twd:null,tws:null,hist:[],fetchedAt:null};
const CRS={pinA:null,pinB:null,finA:null,finB:null,
           wpts:[],activeMark:-1,tackDur:20};
const RACE={on:false,epoch:null,started:false};
const VIEW={scale:1,ox:0,oy:0,map:true,dev:false,drag:false,
            lx:0,ly:0,pd:null,bs:1,box:0,boy:0,locked:false};
const POLAR_TWS=[6,10,15,20,25];
let polarTable={},polarAngles=[];
let dirty=true,tileCache={};
let demoInt=null,demoT=0;
let sensorsOn=false,gpsW=null,absOri=false;
const IMU_CAL={alpha:null,beta:null,gamma:null,calibrated:false};
const IMU_CUR={alpha:null,beta:null,gamma:null,rollRate:null,pitchRate:null,peakG:0};
let imuAccBuf=[];
const IMU_ACC_MAX=240;

const TELEM_MAX_SAMPLES=3600;
const TELEM_TRAIL_MAX=600;
const TELEM={
  active:false,
  startTime:null,
  samples:[],
  meta:{},
  yAxis:'sog',
  logMode:'dev',
  lastSample:null,
  stats:{},
  _lastLogAt:0,
  _lastEvent:{}
};
let seqSel=5,gunInt=null,rafId=null;
let appMode='start';
let optPath=[];
let routePortfolio={recommended:null,alternatives:[],all:[],diag:null};
let windSrcIdx=0;
