!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Vizzy=e()}(this,(function(){"use strict";function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,o(r.key),r)}}function e(t,e,n){return(e=o(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function n(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function r(t){for(var r=1;r<arguments.length;r++){var o=null!=arguments[r]?arguments[r]:{};r%2?n(Object(o),!0).forEach((function(n){e(t,n,o[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(o)):n(Object(o)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(o,e))}))}return t}function o(t){var e=function(t,e){if("object"!=typeof t||!t)return t;var n=t[Symbol.toPrimitive];if(void 0!==n){var r=n.call(t,e||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:e+""}var i="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},a=function(t){return t&&t.Math===Math&&t},c=a("object"==typeof globalThis&&globalThis)||a("object"==typeof window&&window)||a("object"==typeof self&&self)||a("object"==typeof i&&i)||a("object"==typeof i&&i)||function(){return this}()||Function("return this")(),u={},f=function(t){try{return!!t()}catch(t){return!0}},l=!f((function(){return 7!==Object.defineProperty({},1,{get:function(){return 7}})[1]})),s=!f((function(){var t=function(){}.bind();return"function"!=typeof t||t.hasOwnProperty("prototype")})),d=s,p=Function.prototype.call,g=d?p.bind(p):function(){return p.apply(p,arguments)},v={},h={}.propertyIsEnumerable,y=Object.getOwnPropertyDescriptor,m=y&&!h.call({1:2},1);v.f=m?function(t){var e=y(this,t);return!!e&&e.enumerable}:h;var b,w,S=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}},O=s,x=Function.prototype,E=x.call,j=O&&x.bind.bind(E,E),I=O?j:function(t){return function(){return E.apply(t,arguments)}},P=I,T=P({}.toString),R=P("".slice),k=function(t){return R(T(t),8,-1)},L=f,C=k,M=Object,A=I("".split),F=L((function(){return!M("z").propertyIsEnumerable(0)}))?function(t){return"String"===C(t)?A(t,""):M(t)}:M,D=function(t){return null==t},N=D,z=TypeError,G=function(t){if(N(t))throw new z("Can't call method on "+t);return t},V=F,_=G,B=function(t){return V(_(t))},W="object"==typeof document&&document.all,K=void 0===W&&void 0!==W?function(t){return"function"==typeof t||t===W}:function(t){return"function"==typeof t},q=K,$=function(t){return"object"==typeof t?null!==t:q(t)},U=c,H=K,J=function(t,e){return arguments.length<2?(n=U[t],H(n)?n:void 0):U[t]&&U[t][e];var n},Y=I({}.isPrototypeOf),X="undefined"!=typeof navigator&&String(navigator.userAgent)||"",Q=c,Z=X,tt=Q.process,et=Q.Deno,nt=tt&&tt.versions||et&&et.version,rt=nt&&nt.v8;rt&&(w=(b=rt.split("."))[0]>0&&b[0]<4?1:+(b[0]+b[1])),!w&&Z&&(!(b=Z.match(/Edge\/(\d+)/))||b[1]>=74)&&(b=Z.match(/Chrome\/(\d+)/))&&(w=+b[1]);var ot=w,it=ot,at=f,ct=c.String,ut=!!Object.getOwnPropertySymbols&&!at((function(){var t=Symbol("symbol detection");return!ct(t)||!(Object(t)instanceof Symbol)||!Symbol.sham&&it&&it<41})),ft=ut&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,lt=J,st=K,dt=Y,pt=Object,gt=ft?function(t){return"symbol"==typeof t}:function(t){var e=lt("Symbol");return st(e)&&dt(e.prototype,pt(t))},vt=String,ht=K,yt=function(t){try{return vt(t)}catch(t){return"Object"}},mt=TypeError,bt=function(t){if(ht(t))return t;throw new mt(yt(t)+" is not a function")},wt=bt,St=D,Ot=function(t,e){var n=t[e];return St(n)?void 0:wt(n)},xt=g,Et=K,jt=$,It=TypeError,Pt={exports:{}},Tt=c,Rt=Object.defineProperty,kt=function(t,e){try{Rt(Tt,t,{value:e,configurable:!0,writable:!0})}catch(n){Tt[t]=e}return e},Lt=c,Ct=kt,Mt="__core-js_shared__",At=Pt.exports=Lt[Mt]||Ct(Mt,{});(At.versions||(At.versions=[])).push({version:"3.37.1",mode:"global",copyright:"© 2014-2024 Denis Pushkarev (zloirock.ru)",license:"https://github.com/zloirock/core-js/blob/v3.37.1/LICENSE",source:"https://github.com/zloirock/core-js"});var Ft=Pt.exports,Dt=Ft,Nt=function(t,e){return Dt[t]||(Dt[t]=e||{})},zt=G,Gt=Object,Vt=function(t){return Gt(zt(t))},_t=Vt,Bt=I({}.hasOwnProperty),Wt=Object.hasOwn||function(t,e){return Bt(_t(t),e)},Kt=I,qt=0,$t=Math.random(),Ut=Kt(1..toString),Ht=function(t){return"Symbol("+(void 0===t?"":t)+")_"+Ut(++qt+$t,36)},Jt=Nt,Yt=Wt,Xt=Ht,Qt=ut,Zt=ft,te=c.Symbol,ee=Jt("wks"),ne=Zt?te.for||te:te&&te.withoutSetter||Xt,re=function(t){return Yt(ee,t)||(ee[t]=Qt&&Yt(te,t)?te[t]:ne("Symbol."+t)),ee[t]},oe=g,ie=$,ae=gt,ce=Ot,ue=function(t,e){var n,r;if("string"===e&&Et(n=t.toString)&&!jt(r=xt(n,t)))return r;if(Et(n=t.valueOf)&&!jt(r=xt(n,t)))return r;if("string"!==e&&Et(n=t.toString)&&!jt(r=xt(n,t)))return r;throw new It("Can't convert object to primitive value")},fe=TypeError,le=re("toPrimitive"),se=function(t,e){if(!ie(t)||ae(t))return t;var n,r=ce(t,le);if(r){if(void 0===e&&(e="default"),n=oe(r,t,e),!ie(n)||ae(n))return n;throw new fe("Can't convert object to primitive value")}return void 0===e&&(e="number"),ue(t,e)},de=se,pe=gt,ge=function(t){var e=de(t,"string");return pe(e)?e:e+""},ve=$,he=c.document,ye=ve(he)&&ve(he.createElement),me=function(t){return ye?he.createElement(t):{}},be=me,we=!l&&!f((function(){return 7!==Object.defineProperty(be("div"),"a",{get:function(){return 7}}).a})),Se=l,Oe=g,xe=v,Ee=S,je=B,Ie=ge,Pe=Wt,Te=we,Re=Object.getOwnPropertyDescriptor;u.f=Se?Re:function(t,e){if(t=je(t),e=Ie(e),Te)try{return Re(t,e)}catch(t){}if(Pe(t,e))return Ee(!Oe(xe.f,t,e),t[e])};var ke={},Le=l&&f((function(){return 42!==Object.defineProperty((function(){}),"prototype",{value:42,writable:!1}).prototype})),Ce=$,Me=String,Ae=TypeError,Fe=function(t){if(Ce(t))return t;throw new Ae(Me(t)+" is not an object")},De=l,Ne=we,ze=Le,Ge=Fe,Ve=ge,_e=TypeError,Be=Object.defineProperty,We=Object.getOwnPropertyDescriptor,Ke="enumerable",qe="configurable",$e="writable";ke.f=De?ze?function(t,e,n){if(Ge(t),e=Ve(e),Ge(n),"function"==typeof t&&"prototype"===e&&"value"in n&&$e in n&&!n[$e]){var r=We(t,e);r&&r[$e]&&(t[e]=n.value,n={configurable:qe in n?n[qe]:r[qe],enumerable:Ke in n?n[Ke]:r[Ke],writable:!1})}return Be(t,e,n)}:Be:function(t,e,n){if(Ge(t),e=Ve(e),Ge(n),Ne)try{return Be(t,e,n)}catch(t){}if("get"in n||"set"in n)throw new _e("Accessors not supported");return"value"in n&&(t[e]=n.value),t};var Ue=ke,He=S,Je=l?function(t,e,n){return Ue.f(t,e,He(1,n))}:function(t,e,n){return t[e]=n,t},Ye={exports:{}},Xe=l,Qe=Wt,Ze=Function.prototype,tn=Xe&&Object.getOwnPropertyDescriptor,en=Qe(Ze,"name"),nn={EXISTS:en,PROPER:en&&"something"===function(){}.name,CONFIGURABLE:en&&(!Xe||Xe&&tn(Ze,"name").configurable)},rn=K,on=Ft,an=I(Function.toString);rn(on.inspectSource)||(on.inspectSource=function(t){return an(t)});var cn,un,fn,ln=on.inspectSource,sn=K,dn=c.WeakMap,pn=sn(dn)&&/native code/.test(String(dn)),gn=Ht,vn=Nt("keys"),hn=function(t){return vn[t]||(vn[t]=gn(t))},yn={},mn=pn,bn=c,wn=$,Sn=Je,On=Wt,xn=Ft,En=hn,jn=yn,In="Object already initialized",Pn=bn.TypeError,Tn=bn.WeakMap;if(mn||xn.state){var Rn=xn.state||(xn.state=new Tn);Rn.get=Rn.get,Rn.has=Rn.has,Rn.set=Rn.set,cn=function(t,e){if(Rn.has(t))throw new Pn(In);return e.facade=t,Rn.set(t,e),e},un=function(t){return Rn.get(t)||{}},fn=function(t){return Rn.has(t)}}else{var kn=En("state");jn[kn]=!0,cn=function(t,e){if(On(t,kn))throw new Pn(In);return e.facade=t,Sn(t,kn,e),e},un=function(t){return On(t,kn)?t[kn]:{}},fn=function(t){return On(t,kn)}}var Ln={set:cn,get:un,has:fn,enforce:function(t){return fn(t)?un(t):cn(t,{})},getterFor:function(t){return function(e){var n;if(!wn(e)||(n=un(e)).type!==t)throw new Pn("Incompatible receiver, "+t+" required");return n}}},Cn=I,Mn=f,An=K,Fn=Wt,Dn=l,Nn=nn.CONFIGURABLE,zn=ln,Gn=Ln.enforce,Vn=Ln.get,_n=String,Bn=Object.defineProperty,Wn=Cn("".slice),Kn=Cn("".replace),qn=Cn([].join),$n=Dn&&!Mn((function(){return 8!==Bn((function(){}),"length",{value:8}).length})),Un=String(String).split("String"),Hn=Ye.exports=function(t,e,n){"Symbol("===Wn(_n(e),0,7)&&(e="["+Kn(_n(e),/^Symbol\(([^)]*)\).*$/,"$1")+"]"),n&&n.getter&&(e="get "+e),n&&n.setter&&(e="set "+e),(!Fn(t,"name")||Nn&&t.name!==e)&&(Dn?Bn(t,"name",{value:e,configurable:!0}):t.name=e),$n&&n&&Fn(n,"arity")&&t.length!==n.arity&&Bn(t,"length",{value:n.arity});try{n&&Fn(n,"constructor")&&n.constructor?Dn&&Bn(t,"prototype",{writable:!1}):t.prototype&&(t.prototype=void 0)}catch(t){}var r=Gn(t);return Fn(r,"source")||(r.source=qn(Un,"string"==typeof e?e:"")),t};Function.prototype.toString=Hn((function(){return An(this)&&Vn(this).source||zn(this)}),"toString");var Jn=Ye.exports,Yn=K,Xn=ke,Qn=Jn,Zn=kt,tr=function(t,e,n,r){r||(r={});var o=r.enumerable,i=void 0!==r.name?r.name:e;if(Yn(n)&&Qn(n,i,r),r.global)o?t[e]=n:Zn(e,n);else{try{r.unsafe?t[e]&&(o=!0):delete t[e]}catch(t){}o?t[e]=n:Xn.f(t,e,{value:n,enumerable:!1,configurable:!r.nonConfigurable,writable:!r.nonWritable})}return t},er={},nr=Math.ceil,rr=Math.floor,or=Math.trunc||function(t){var e=+t;return(e>0?rr:nr)(e)},ir=function(t){var e=+t;return e!=e||0===e?0:or(e)},ar=ir,cr=Math.max,ur=Math.min,fr=ir,lr=Math.min,sr=function(t){var e=fr(t);return e>0?lr(e,9007199254740991):0},dr=sr,pr=function(t){return dr(t.length)},gr=B,vr=function(t,e){var n=ar(t);return n<0?cr(n+e,0):ur(n,e)},hr=pr,yr=function(t){return function(e,n,r){var o=gr(e),i=hr(o);if(0===i)return!t&&-1;var a,c=vr(r,i);if(t&&n!=n){for(;i>c;)if((a=o[c++])!=a)return!0}else for(;i>c;c++)if((t||c in o)&&o[c]===n)return t||c||0;return!t&&-1}},mr={includes:yr(!0),indexOf:yr(!1)},br=Wt,wr=B,Sr=mr.indexOf,Or=yn,xr=I([].push),Er=function(t,e){var n,r=wr(t),o=0,i=[];for(n in r)!br(Or,n)&&br(r,n)&&xr(i,n);for(;e.length>o;)br(r,n=e[o++])&&(~Sr(i,n)||xr(i,n));return i},jr=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],Ir=Er,Pr=jr.concat("length","prototype");er.f=Object.getOwnPropertyNames||function(t){return Ir(t,Pr)};var Tr={};Tr.f=Object.getOwnPropertySymbols;var Rr=J,kr=er,Lr=Tr,Cr=Fe,Mr=I([].concat),Ar=Rr("Reflect","ownKeys")||function(t){var e=kr.f(Cr(t)),n=Lr.f;return n?Mr(e,n(t)):e},Fr=Wt,Dr=Ar,Nr=u,zr=ke,Gr=f,Vr=K,_r=/#|\.prototype\./,Br=function(t,e){var n=Kr[Wr(t)];return n===$r||n!==qr&&(Vr(e)?Gr(e):!!e)},Wr=Br.normalize=function(t){return String(t).replace(_r,".").toLowerCase()},Kr=Br.data={},qr=Br.NATIVE="N",$r=Br.POLYFILL="P",Ur=Br,Hr=c,Jr=u.f,Yr=Je,Xr=tr,Qr=kt,Zr=function(t,e,n){for(var r=Dr(e),o=zr.f,i=Nr.f,a=0;a<r.length;a++){var c=r[a];Fr(t,c)||n&&Fr(n,c)||o(t,c,i(e,c))}},to=Ur,eo=function(t,e){var n,r,o,i,a,c=t.target,u=t.global,f=t.stat;if(n=u?Hr:f?Hr[c]||Qr(c,{}):Hr[c]&&Hr[c].prototype)for(r in e){if(i=e[r],o=t.dontCallGetSet?(a=Jr(n,r))&&a.value:n[r],!to(u?r:c+(f?".":"#")+r,t.forced)&&void 0!==o){if(typeof i==typeof o)continue;Zr(i,o)}(t.sham||o&&o.sham)&&Yr(i,"sham",!0),Xr(n,r,i,t)}},no=k,ro=Array.isArray||function(t){return"Array"===no(t)},oo=TypeError,io=l,ao=ke,co=S,uo={};uo[re("toStringTag")]="z";var fo="[object z]"===String(uo),lo=fo,so=K,po=k,go=re("toStringTag"),vo=Object,ho="Arguments"===po(function(){return arguments}()),yo=lo?po:function(t){var e,n,r;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(t){}}(e=vo(t),go))?n:ho?po(e):"Object"===(r=po(e))&&so(e.callee)?"Arguments":r},mo=I,bo=f,wo=K,So=yo,Oo=ln,xo=function(){},Eo=J("Reflect","construct"),jo=/^\s*(?:class|function)\b/,Io=mo(jo.exec),Po=!jo.test(xo),To=function(t){if(!wo(t))return!1;try{return Eo(xo,[],t),!0}catch(t){return!1}},Ro=function(t){if(!wo(t))return!1;switch(So(t)){case"AsyncFunction":case"GeneratorFunction":case"AsyncGeneratorFunction":return!1}try{return Po||!!Io(jo,Oo(t))}catch(t){return!0}};Ro.sham=!0;var ko=!Eo||bo((function(){var t;return To(To.call)||!To(Object)||!To((function(){t=!0}))||t}))?Ro:To,Lo=ro,Co=ko,Mo=$,Ao=re("species"),Fo=Array,Do=function(t){var e;return Lo(t)&&(e=t.constructor,(Co(e)&&(e===Fo||Lo(e.prototype))||Mo(e)&&null===(e=e[Ao]))&&(e=void 0)),void 0===e?Fo:e},No=function(t,e){return new(Do(t))(0===e?0:e)},zo=f,Go=ot,Vo=re("species"),_o=eo,Bo=f,Wo=ro,Ko=$,qo=Vt,$o=pr,Uo=function(t){if(t>9007199254740991)throw oo("Maximum allowed index exceeded");return t},Ho=function(t,e,n){io?ao.f(t,e,co(0,n)):t[e]=n},Jo=No,Yo=function(t){return Go>=51||!zo((function(){var e=[];return(e.constructor={})[Vo]=function(){return{foo:1}},1!==e[t](Boolean).foo}))},Xo=ot,Qo=re("isConcatSpreadable"),Zo=Xo>=51||!Bo((function(){var t=[];return t[Qo]=!1,t.concat()[0]!==t})),ti=function(t){if(!Ko(t))return!1;var e=t[Qo];return void 0!==e?!!e:Wo(t)};_o({target:"Array",proto:!0,arity:1,forced:!Zo||!Yo("concat")},{concat:function(t){var e,n,r,o,i,a=qo(this),c=Jo(a,0),u=0;for(e=-1,r=arguments.length;e<r;e++)if(ti(i=-1===e?a:arguments[e]))for(o=$o(i),Uo(u+o),n=0;n<o;n++,u++)n in i&&Ho(c,u,i[n]);else Uo(u+1),Ho(c,u++,i);return c.length=u,c}});var ei=k,ni=I,ri=function(t){if("Function"===ei(t))return ni(t)},oi=bt,ii=s,ai=ri(ri.bind),ci=function(t,e){return oi(t),void 0===e?t:ii?ai(t,e):function(){return t.apply(e,arguments)}},ui=F,fi=Vt,li=pr,si=No,di=I([].push),pi=function(t){var e=1===t,n=2===t,r=3===t,o=4===t,i=6===t,a=7===t,c=5===t||i;return function(u,f,l,s){for(var d,p,g=fi(u),v=ui(g),h=li(v),y=ci(f,l),m=0,b=s||si,w=e?b(u,h):n||a?b(u,0):void 0;h>m;m++)if((c||m in v)&&(p=y(d=v[m],m,g),t))if(e)w[m]=p;else if(p)switch(t){case 3:return!0;case 5:return d;case 6:return m;case 2:di(w,d)}else switch(t){case 4:return!1;case 7:di(w,d)}return i?-1:r||o?o:w}},gi={forEach:pi(0),map:pi(1),filter:pi(2),some:pi(3),every:pi(4),find:pi(5),findIndex:pi(6),filterReject:pi(7)},vi=f,hi=gi.forEach,yi=function(t,e){var n=[][t];return!!n&&vi((function(){n.call(null,e||function(){return 1},1)}))}("forEach")?[].forEach:function(t){return hi(this,t,arguments.length>1?arguments[1]:void 0)};eo({target:"Array",proto:!0,forced:[].forEach!==yi},{forEach:yi});var mi=Vt,bi=se;eo({target:"Date",proto:!0,arity:1,forced:f((function(){return null!==new Date(NaN).toJSON()||1!==Date.prototype.toJSON.call({toISOString:function(){return 1}})}))},{toJSON:function(t){var e=mi(this),n=bi(e,"number");return"number"!=typeof n||isFinite(n)?e.toISOString():null}});var wi=yo,Si=fo?{}.toString:function(){return"[object "+wi(this)+"]"};fo||tr(Object.prototype,"toString",Si,{unsafe:!0});var Oi=yo,xi=String,Ei=function(t){if("Symbol"===Oi(t))throw new TypeError("Cannot convert a Symbol value to a string");return xi(t)},ji="\t\n\v\f\r                　\u2028\u2029\ufeff",Ii=G,Pi=Ei,Ti=ji,Ri=I("".replace),ki=RegExp("^["+Ti+"]+"),Li=RegExp("(^|[^"+Ti+"])["+Ti+"]+$"),Ci=function(t){return function(e){var n=Pi(Ii(e));return 1&t&&(n=Ri(n,ki,"")),2&t&&(n=Ri(n,Li,"$1")),n}},Mi={start:Ci(1),end:Ci(2),trim:Ci(3)},Ai=c,Fi=f,Di=I,Ni=Ei,zi=Mi.trim,Gi=ji,Vi=Ai.parseInt,_i=Ai.Symbol,Bi=_i&&_i.iterator,Wi=/^[+-]?0x/i,Ki=Di(Wi.exec),qi=8!==Vi(Gi+"08")||22!==Vi(Gi+"0x16")||Bi&&!Fi((function(){Vi(Object(Bi))}))?function(t,e){var n=zi(Ni(t));return Vi(n,e>>>0||(Ki(Wi,n)?16:10))}:Vi;eo({global:!0,forced:parseInt!==qi},{parseInt:qi});var $i=Fe,Ui=f,Hi=c.RegExp,Ji=Ui((function(){var t=Hi("a","y");return t.lastIndex=2,null!==t.exec("abcd")})),Yi=Ji||Ui((function(){return!Hi("a","y").sticky})),Xi={BROKEN_CARET:Ji||Ui((function(){var t=Hi("^r","gy");return t.lastIndex=2,null!==t.exec("str")})),MISSED_STICKY:Yi,UNSUPPORTED_Y:Ji},Qi={},Zi=Er,ta=jr,ea=Object.keys||function(t){return Zi(t,ta)},na=l,ra=Le,oa=ke,ia=Fe,aa=B,ca=ea;Qi.f=na&&!ra?Object.defineProperties:function(t,e){ia(t);for(var n,r=aa(e),o=ca(e),i=o.length,a=0;i>a;)oa.f(t,n=o[a++],r[n]);return t};var ua,fa=J("document","documentElement"),la=Fe,sa=Qi,da=jr,pa=yn,ga=fa,va=me,ha="prototype",ya="script",ma=hn("IE_PROTO"),ba=function(){},wa=function(t){return"<"+ya+">"+t+"</"+ya+">"},Sa=function(t){t.write(wa("")),t.close();var e=t.parentWindow.Object;return t=null,e},Oa=function(){try{ua=new ActiveXObject("htmlfile")}catch(t){}var t,e,n;Oa="undefined"!=typeof document?document.domain&&ua?Sa(ua):(e=va("iframe"),n="java"+ya+":",e.style.display="none",ga.appendChild(e),e.src=String(n),(t=e.contentWindow.document).open(),t.write(wa("document.F=Object")),t.close(),t.F):Sa(ua);for(var r=da.length;r--;)delete Oa[ha][da[r]];return Oa()};pa[ma]=!0;var xa,Ea,ja=Object.create||function(t,e){var n;return null!==t?(ba[ha]=la(t),n=new ba,ba[ha]=null,n[ma]=t):n=Oa(),void 0===e?n:sa.f(n,e)},Ia=f,Pa=c.RegExp,Ta=Ia((function(){var t=Pa(".","s");return!(t.dotAll&&t.test("\n")&&"s"===t.flags)})),Ra=f,ka=c.RegExp,La=Ra((function(){var t=ka("(?<a>b)","g");return"b"!==t.exec("b").groups.a||"bc"!=="b".replace(t,"$<a>c")})),Ca=g,Ma=I,Aa=Ei,Fa=function(){var t=$i(this),e="";return t.hasIndices&&(e+="d"),t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.dotAll&&(e+="s"),t.unicode&&(e+="u"),t.unicodeSets&&(e+="v"),t.sticky&&(e+="y"),e},Da=Xi,Na=ja,za=Ln.get,Ga=Ta,Va=La,_a=Nt("native-string-replace",String.prototype.replace),Ba=RegExp.prototype.exec,Wa=Ba,Ka=Ma("".charAt),qa=Ma("".indexOf),$a=Ma("".replace),Ua=Ma("".slice),Ha=(Ea=/b*/g,Ca(Ba,xa=/a/,"a"),Ca(Ba,Ea,"a"),0!==xa.lastIndex||0!==Ea.lastIndex),Ja=Da.BROKEN_CARET,Ya=void 0!==/()??/.exec("")[1];(Ha||Ya||Ja||Ga||Va)&&(Wa=function(t){var e,n,r,o,i,a,c,u=this,f=za(u),l=Aa(t),s=f.raw;if(s)return s.lastIndex=u.lastIndex,e=Ca(Wa,s,l),u.lastIndex=s.lastIndex,e;var d=f.groups,p=Ja&&u.sticky,g=Ca(Fa,u),v=u.source,h=0,y=l;if(p&&(g=$a(g,"y",""),-1===qa(g,"g")&&(g+="g"),y=Ua(l,u.lastIndex),u.lastIndex>0&&(!u.multiline||u.multiline&&"\n"!==Ka(l,u.lastIndex-1))&&(v="(?: "+v+")",y=" "+y,h++),n=new RegExp("^(?:"+v+")",g)),Ya&&(n=new RegExp("^"+v+"$(?!\\s)",g)),Ha&&(r=u.lastIndex),o=Ca(Ba,p?n:u,y),p?o?(o.input=Ua(o.input,h),o[0]=Ua(o[0],h),o.index=u.lastIndex,u.lastIndex+=o[0].length):u.lastIndex=0:Ha&&o&&(u.lastIndex=u.global?o.index+o[0].length:r),Ya&&o&&o.length>1&&Ca(_a,o[0],n,(function(){for(i=1;i<arguments.length-2;i++)void 0===arguments[i]&&(o[i]=void 0)})),o&&d)for(o.groups=a=Na(null),i=0;i<d.length;i++)a[(c=d[i])[0]]=o[c[1]];return o});var Xa=Wa;eo({target:"RegExp",proto:!0,forced:/./.exec!==Xa},{exec:Xa});var Qa=g,Za=tr,tc=Xa,ec=f,nc=re,rc=Je,oc=nc("species"),ic=RegExp.prototype,ac=function(t,e,n,r){var o=nc(t),i=!ec((function(){var e={};return e[o]=function(){return 7},7!==""[t](e)})),a=i&&!ec((function(){var e=!1,n=/a/;return"split"===t&&((n={}).constructor={},n.constructor[oc]=function(){return n},n.flags="",n[o]=/./[o]),n.exec=function(){return e=!0,null},n[o](""),!e}));if(!i||!a||n){var c=/./[o],u=e(o,""[t],(function(t,e,n,r,o){var a=e.exec;return a===tc||a===ic.exec?i&&!o?{done:!0,value:Qa(c,e,n,r)}:{done:!0,value:Qa(t,n,e,r)}:{done:!1}}));Za(String.prototype,t,u[0]),Za(ic,o,u[1])}r&&rc(ic[o],"sham",!0)},cc=I,uc=ir,fc=Ei,lc=G,sc=cc("".charAt),dc=cc("".charCodeAt),pc=cc("".slice),gc=function(t){return function(e,n){var r,o,i=fc(lc(e)),a=uc(n),c=i.length;return a<0||a>=c?t?"":void 0:(r=dc(i,a))<55296||r>56319||a+1===c||(o=dc(i,a+1))<56320||o>57343?t?sc(i,a):r:t?pc(i,a,a+2):o-56320+(r-55296<<10)+65536}},vc={codeAt:gc(!1),charAt:gc(!0)}.charAt,hc=g,yc=Fe,mc=K,bc=k,wc=Xa,Sc=TypeError,Oc=function(t,e){var n=t.exec;if(mc(n)){var r=hc(n,t,e);return null!==r&&yc(r),r}if("RegExp"===bc(t))return hc(wc,t,e);throw new Sc("RegExp#exec called on incompatible receiver")},xc=g,Ec=Fe,jc=D,Ic=sr,Pc=Ei,Tc=G,Rc=Ot,kc=function(t,e,n){return e+(n?vc(t,e).length:1)},Lc=Oc;ac("match",(function(t,e,n){return[function(e){var n=Tc(this),r=jc(e)?void 0:Rc(e,t);return r?xc(r,e,n):new RegExp(e)[t](Pc(n))},function(t){var r=Ec(this),o=Pc(t),i=n(e,r,o);if(i.done)return i.value;if(!r.global)return Lc(r,o);var a=r.unicode;r.lastIndex=0;for(var c,u=[],f=0;null!==(c=Lc(r,o));){var l=Pc(c[0]);u[f]=l,""===l&&(r.lastIndex=kc(o,Ic(r.lastIndex),a)),f++}return 0===f?null:u}]}));var Cc=Object.is||function(t,e){return t===e?0!==t||1/t==1/e:t!=t&&e!=e},Mc=g,Ac=Fe,Fc=D,Dc=G,Nc=Cc,zc=Ei,Gc=Ot,Vc=Oc;ac("search",(function(t,e,n){return[function(e){var n=Dc(this),r=Fc(e)?void 0:Gc(e,t);return r?Mc(r,e,n):new RegExp(e)[t](zc(n))},function(t){var r=Ac(this),o=zc(t),i=n(e,r,o);if(i.done)return i.value;var a=r.lastIndex;Nc(a,0)||(r.lastIndex=0);var c=Vc(r,o);return Nc(r.lastIndex,a)||(r.lastIndex=a),null===c?-1:c.index}]}));var _c=me("span").classList,Bc=_c&&_c.constructor&&_c.constructor.prototype,Wc=c,Kc={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0},qc=Bc===Object.prototype?void 0:Bc,$c=yi,Uc=Je,Hc=function(t){if(t&&t.forEach!==$c)try{Uc(t,"forEach",$c)}catch(e){t.forEach=$c}};for(var Jc in Kc)Kc[Jc]&&Hc(Wc[Jc]&&Wc[Jc].prototype);Hc(qc);var Yc=s,Xc=Function.prototype,Qc=Xc.apply,Zc=Xc.call,tu="object"==typeof Reflect&&Reflect.apply||(Yc?Zc.bind(Qc):function(){return Zc.apply(Qc,arguments)}),eu="function"==typeof Bun&&Bun&&"string"==typeof Bun.version,nu=I([].slice),ru=TypeError,ou=c,iu=tu,au=K,cu=eu,uu=X,fu=nu,lu=function(t,e){if(t<e)throw new ru("Not enough arguments");return t},su=ou.Function,du=/MSIE .\./.test(uu)||cu&&function(){var t=ou.Bun.version.split(".");return t.length<3||"0"===t[0]&&(t[1]<3||"3"===t[1]&&"0"===t[2])}(),pu=function(t,e){var n=e?2:1;return du?function(r,o){var i=lu(arguments.length,1)>n,a=au(r)?r:su(r),c=i?fu(arguments,n):[],u=i?function(){iu(a,this,c)}:a;return e?t(u,o):t(u)}:t},gu=eo,vu=c,hu=pu(vu.setInterval,!0);gu({global:!0,bind:!0,forced:vu.setInterval!==hu},{setInterval:hu});var yu=eo,mu=c,bu=pu(mu.setTimeout,!0);yu({global:!0,bind:!0,forced:mu.setTimeout!==bu},{setTimeout:bu});var wu=function(){return e=function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.config=r({transitionDuration:e.transitionDuration||300,autoRunTransitions:e.autoRunTransitions||!1,printPDFMode:e.printPDFMode||!1,devMode:e.devMode||!1,onSlideChangedDelay:e.onSlideChangedDelay||0},e),this.iframes=[],this.id="Vizzy"},n=[{key:"log",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.config.devMode&&console.log("[Vizzy".concat(e?":"+e:"","] ").concat(t))}},{key:"init",value:function(t){this.log("Invoking init method"),this.Reveal=t,this.config=r(r({},this.config),this.Reveal.getConfig().vizzy),this.log("Configuration after merging with Reveal config: "+JSON.stringify(this.config)),this.loadIframes(),this.handleFragments(),this.checkPrintMode(),this.setupKeydownPropagation(),this.setupSlideChanged(),this.log("Terminating init method")}},{key:"loadIframes",value:function(){var t=this;this.log("Invoking loadIframes method"),document.querySelectorAll("vizzy[data-location]").forEach((function(e,n){var r=document.createElement("iframe");r.src=e.dataset.location,r.style.width="100%",r.style.height="100%",e.appendChild(r),t.iframes.push(r),r.addEventListener("load",(function(){r.contentWindow.addEventListener("keydown",(function(t){var e=new CustomEvent("iframe-keydown",{detail:t});window.document.dispatchEvent(e)}))})),t.log("Iframe loaded from ".concat(r.src),n)})),this.log("Terminating loadIframes method")}},{key:"handleFragments",value:function(){var t=this;this.log("Invoking handleFragments method"),this.Reveal.on("fragmentshown",(function(e){var n=e.fragment,r=n.closest("section").querySelector("iframe");if(r){var o=parseInt(n.getAttribute("data-fragment-index"));r.contentWindow.postMessage({type:"fragment",direction:"forward",fragmentIndex:o},"*"),t.log("Fragment shown: index ".concat(o))}})),this.Reveal.on("fragmenthidden",(function(e){var n=e.fragment,r=n.closest("section").querySelector("iframe");if(r){var o=parseInt(n.getAttribute("data-fragment-index"));r.contentWindow.postMessage({type:"fragment",direction:"backward",fragmentIndex:o},"*"),t.log("Fragment hidden: index ".concat(o))}})),this.log("Terminating handleFragments method")}},{key:"checkPrintMode",value:function(){this.log("Invoking checkPrintMode method"),window.location.search.match(/print-pdf/gi)&&(this.config.printPDFMode=!0,this.log("Print PDF mode detected"),this.config.autoRunTransitions&&this.runTransitions()),this.log("Terminating checkPrintMode method")}},{key:"runTransitions",value:function(){var t=this;this.log("Invoking runTransitions method"),this.iframes.forEach((function(e,n){e.contentWindow.postMessage({type:"run-transitions"},"*"),t.log("Running transitions in iframe: ".concat(e.src),n)})),this.log("Terminating runTransitions method")}},{key:"setupKeydownPropagation",value:function(){var t=this;this.log("Setting up keydown propagation from iframe to parent"),window.document.addEventListener("iframe-keydown",(function(e){t.Reveal.triggerKey(e.detail.keyCode),t.log("Propagated keydown event: keyCode ".concat(e.detail.keyCode))}),!1),this.log("Keydown propagation setup complete")}},{key:"setupSlideChanged",value:function(){var t=this;this.log("Setting up slide changed event listener"),this.Reveal.on("slidechanged",(function(e){t.log("Slide changed event detected"),setTimeout((function(){t.log("Executing delayed slide changed transitions");var n=e.currentSlide.querySelector("iframe");n&&(n.contentWindow.postMessage({type:"slidechanged"},"*"),t.log("Slide changed transition executed in iframe: ".concat(n.src)))}),t.config.onSlideChangedDelay)})),this.log("Slide changed event listener setup complete")}}],n&&t(e.prototype,n),o&&t(e,o),Object.defineProperty(e,"prototype",{writable:!1}),e;var e,n,o}();return wu}));
