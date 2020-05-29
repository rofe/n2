/* ------
general purpose helix pages / display scripts
--------- */

(() => {
    const scrani = (() => {
    
        const scrani = { 
            
            // config
            animations: [            
                {selector: "body>main>div", animation:"eager-appear"},
            ],

            scrollY: -1,
            scrollYBottom:  0,
        }

        // setup
        scrani.setup = () => {
            for (let i=0; i<scrani.animations.length; i++) {
                a = scrani.animations[i];
                a.elems=document.querySelectorAll(a.selector);
            }
        }

        // update single element
        scrani.updateElement = (el, animation) => {
            let progress=0.0;
            const offsetTop = el.getBoundingClientRect().top+window.pageYOffset;

            if (scrani.scrollY > offsetTop) {
                progress=1.0;
            } else if (scrani.scrollYBottom < offsetTop) {
                progress=0.0;
            } else {
                progress=1.0-(offsetTop - scrani.scrollY)/window.innerHeight;
            }

            // HACK: manually specified animation
            progress=progress*2;
            if (progress>1) progress=1;
            
            if (animation == "eager-appear") {
                const transY=100-progress*100;
                const opacity=progress;
                el.style=`opacity: ${opacity}; transform: translateY(${transY}px)`;    
            }

            if (animation == "wipe") {
                const right=Math.round(100-progress*100);
                el.style=`clip-path: inset(0 ${right}% 0 0); -webkit-clip-path: inset(0 ${right}% 0 0)`;
            }
        }

        // update to get called by requestAnimationFrame
        scrani.update = (scrollY) => {
            
            if (scrollY == scrani.scrollY) return;

            scrani.scrollY = scrollY;
            scrani.scrollYBottom = scrollY+window.innerHeight;

            for (let i=0; i<scrani.animations.length;i++) {
                const a = scrani.animations[i];
                for (let j=0; j<a.elems.length;j++) {
                    scrani.updateElement(a.elems[j], a.animation);
                }
            }
        }

        //to be called onload
        scrani.onload = () => {
            
            scrani.setup();
            const repaint = () => {
                scrani.update(window.scrollY)
                window.requestAnimationFrame(repaint)
            }
            window.requestAnimationFrame(repaint);
  
        }

        return (scrani)
    })();

    window.scrani = scrani; 

})();

function classify() {
    document.querySelectorAll("main h1").forEach((e) => {
        var label=stripName(e.textContent);
        e.parentElement.classList.add(label);
    })
    document.querySelectorAll("div.image").forEach((e, i) => {
        e.classList.add(i%2?"right":"left");
    })
}
function wrapMenus() {
    hWrap(document.querySelector("main div.menu"),5);
    var h1=document.querySelector("main div.menu h1");
    document.querySelector("main div.menu").insertBefore(h1.cloneNode(true), document.querySelector("main div.menu>div"));
    h1.parentNode.removeChild(h1);
}

function hWrap(el, maxlevel) {
    var level=0;
    var newlevel=0;
    var wrapped=document.createElement('div');
    var currentParent=wrapped;
    Array.from(el.children).forEach((e) => {
        if (e.tagName.substr(0,1) == "H") {
            newlevel=+e.tagName.substr(1,1);
            
            if (newlevel<maxlevel) {
                if (newlevel<=level) {
                    while (newlevel<=level) {
                        currentParent=currentParent.parentElement;
                        level--;
                    }
                }
                if (newlevel>level) {
                    while (newlevel>level) {
                        var div=document.createElement('div');
                        if ((newlevel==level+1) && newlevel>1) div.className = e.id;
                        currentParent.appendChild(div);
                        currentParent=div;    
                        level++;
                    }
                } 
            }
    
        }
        currentParent.appendChild(e.cloneNode(true));
    })
    el.innerHTML="";
    el.appendChild(wrapped.firstChild);
};

function fixIcons() {
    document.querySelectorAll("use").forEach ((e) => {
        var a=e.getAttribute("href");
        var name=a.split("/")[2].split(".")[0];
        if (name == 'lab-cone') {
            var $div=document.createElement('div');
            $div.id='labconepreview';
            e.parentNode.parentNode.replaceChild($div, e.parentNode);
            setTimeout(randomizeLabCone, 1000);
        } else {
            e.setAttribute("href", `/icons.svg#${name}`);
        }
    });
}

function cloneMenuSwiper() {
    var menu=document.querySelector("div.menu");
    var mobilemenu=menu.cloneNode(true);
    mobilemenu.querySelector(":scope>div").className="locations-menus";
    var titleswitcher=document.createElement('div');
    titleswitcher.className="locations";
    mobilemenu.querySelectorAll("h2").forEach((e) => {
        titleswitcher.appendChild(e.cloneNode(true));
        e.parentNode.removeChild(e);
    });
    mobilemenu.insertBefore(titleswitcher, mobilemenu.firstChild);
    menu.classList.add("desktop");
    menu.parentNode.insertBefore(mobilemenu,menu.nextSibling);
}

var menuLocation="store";
var menuOffset=0;

function setMenuLocation(e) {
    
}

function bindInputs(inputs) {
    inputs.forEach((e) => {
        e.value=localStorage.getItem(e.id);
        e.addEventListener('change', (event) => {
            localStorage.setItem(event.target.id, event.target.value);
        })
    })
}

function updateMenuDisplay() {
    var vw=window.innerWidth;
    var p=(vw-375)/375;
    console.log(`p: ${p}`);
    p=Math.max(p,0);
    p=Math.min(p,1);
    console.log(`p: ${p}`);
    var pink=[252,216,199];
    var blue=[0,1,253];
    var r=pink[0]*(1-p)+blue[0]*(p);
    var g=pink[1]*(1-p)+blue[1]*(p);
    var b=pink[2]*(1-p)+blue[2]*(p);
    document.querySelector(".locations-menus .lab").style=`color:rgba(${r},${g},${b},1)`;
    document.querySelector(".locations #lab").style=`color:rgba(${r},${g},${b},1)`;
}

function isAndroid() {
    var os="";
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        os="android";
    }

    console.log(os);
    return (os=="android");

}

function resizeImages() {
    document.querySelectorAll('main div img').forEach((i) => {
        var s = i.getAttribute('src');
        if (s.indexOf('/hlx_')==0) {
            i.setAttribute('src',s+'?width=256')
        }
    })
}


function fixSmsUrls() {

    document.querySelectorAll("main a").forEach((e) => {
        var href=e.getAttribute("href");
        console.log(href);
        if (href && href.indexOf("https://sms.com")==0) {
            var smshref="sms:/"+href.substr(15);

            if (isAndroid()) {
                var s=smshref.split("&body");
                smshref=s[0]+"?body"+s[1];
            }
            e.setAttribute("href",smshref);
        }
    })

}

function setColors() {
    let root = document.documentElement;
    document.querySelectorAll('code').forEach(($code) => {
        $code.innerText.split('\n').forEach((line)=>{
            var splits=line.split(':');
            if (splits[1]) root.style.setProperty(splits[0].trim(), splits[1].trim());
        })    
    })
}

function setLocation() {
    if (window.location.pathname.indexOf('/lab')==0) {
        storeLocation='lab';
        document.querySelector('header>ul>li:nth-of-type(2)').classList.add('selected')
    } else {
        storeLocation='store';
        document.querySelector('header>ul>li:nth-of-type(1)').classList.add('selected')
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function generateId () {
    var id="";
    var chars="123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i=0;i<4;i++) {
        id+=chars.substr(Math.floor(Math.random()*chars.length),1);
    }
    return id;
}


/* ------
pim and catalog management handling
--------- */


function indexCatalog() {
    catalog={
        byId: {},
        items: [],
        discounts: {}
};
    catalog_raw.forEach((e) => {
        
        if (!catalog.byId[e.id]) catalog.byId[e.id]=e;

        if (e.type=="ITEM") {
            catalog.items.push(e);
            if (e.item_data.variations) e.item_data.variations.forEach((v) => {
                catalog.byId[v.id]=v;
            })
        }
        if (e.type=="MODIFIER_LIST") {
            if (e.modifier_list_data.modifiers) e.modifier_list_data.modifiers.forEach((m) => {
                m.modifier_data.modifier_list_id=e.id;
                console.log(m.modifier_data.modifier_list_id);
                catalog.byId[m.id]=m;
            })
        }
        if (e.type=="DISCOUNT") {
            if (e.discount_data.name) {
                catalog.discounts[e.discount_data.name.toLowerCase()]={ id: e.id };
            }
        }
    })
} 

/* ------
product config
--------- */


function hideConfig() {
    var config=document.getElementById("config");
    config.classList.add("hidden");
    document.body.classList.remove("noscroll");
}

function isFixedPickup(item) {
    if (item.item_data.variations[0].item_variation_data.name.indexOf('day ')>0) {
        return true;
    }
    return false;
}

function getScrollingOffset($sel) {
    var selpos = $sel.offsetLeft-$sel.parentNode.firstChild.offsetLeft;
    var selwidth = $sel.offsetWidth;
    var wrapperwidth=document.querySelector("#config.cone-builder .wrapper").offsetWidth;
    var newOffset=-Math.round(selpos+(selwidth-wrapperwidth)/2);
    return newOffset;
}

function adjustScrolling($sel) {
    var newOffset=getScrollingOffset($sel);
    $sel.parentNode.style=`transform: translateX(${newOffset}px)`;
    scrollOffsets[$sel.parentNode.parentNode.getAttribute('data-name')]=newOffset;
}

function coneBuilderSelect($sel) {
    $sel.parentNode.querySelectorAll("span").forEach(($e) => {
        $e.classList.remove('selected');
    })
    $sel.classList.add('selected');
    showConfig();
    adjustScrolling($sel);
}


function randomizeLabCone() {
    var $labcone=document.getElementById('labconepreview');
    if ($labcone) {
        var $a=document.querySelector('a.labcone');
        var itemid=$a.getAttribute('data-id');
        var mods=createRandomConfig(itemid);
        $labcone.innerHTML=createConeFromConfig(mods);
    }
    setTimeout(randomizeLabCone,300);
}

function createRandomConfig(itemid) {
    var item=catalog.byId[itemid];
    var config=[];
    item.item_data.modifier_list_info.forEach((ml) => {
        var mods=catalog.byId[ml.modifier_list_id].modifier_list_data.modifiers;
        var mlname=catalog.byId[ml.modifier_list_id].modifier_list_data.name;
        if (mlname.includes('vessel')) {
            config.push(mods[0].id);
        } else {
            config.push(mods[Math.floor(Math.random()*mods.length)].id);
        }
    })
    return (config);
}

function createConeFromConfig(mods) {
    var coneconfig={};
    mods.forEach((m) => {
        var mod=catalog.byId[m];
        if (mod.modifier_data) {
            var mlname=catalog.byId[mod.modifier_data.modifier_list_id].modifier_list_data.name;
            var modname=stripName(mod.modifier_data.name);
            if (mlname.includes('vessel')) name='vessel';
            if (mlname.includes('flavor')) name='flavor';
            if (mlname.includes('dip')) name='dip';
            if (mlname.includes('topping')) name='topping';
            coneconfig[name]=modname;    
        }
    });

    const flavor=`url(/cone-builder/${coneconfig.flavor}-soft-serve.png)`;
    const vesself=`url(/cone-builder/${coneconfig.vessel}-front.png)`;
    const vesselb=`url(/cone-builder/${coneconfig.vessel}-back.png)`;
    const dip=`url(/cone-builder/${coneconfig.dip}-dip.png)`;
    let topping=`url(/cone-builder/${coneconfig.topping}-topping.png)`;
    if (coneconfig.topping.includes('cotton') && coneconfig.vessel.includes('cup')) {
        topping=`url(/cone-builder/${coneconfig.topping}-topping-cup.png)`;
    }    

    html=`<div style="background-image: ${vesselb}">
        <div style="background-image: ${flavor}">
        <div style="background-image: ${dip}">
        <div style="background-image: ${topping}">
        <div style="background-image: ${vesself}">
        </div>
        </div>
        </div>
        </div>
        </div>`;
    
    return html;

}

function coneBuilderFlow() {
    return ["variation", "vessel", "flavor", "dip", "topping"];
}

function coneBuilderShow(name) {
    var $current=document.querySelectorAll("div.cb-selection").forEach(($e) => {
        if ($e.getAttribute('data-name') == name) {
            $e.classList.remove('hidden');
            $e.classList.add('visible');
            adjustScrolling($e.querySelector('.selected'));
        } else {
            $e.classList.add('hidden');
            $e.classList.remove('visible');
        }
    })

    var flow=coneBuilderFlow();

    if (name==flow[0]) hide("cb-back");
    else show("cb-back");

    if (name==flow[flow.length-1]) {
        hide("cb-next");
        show("cb-addtocart");
    } else {
        show("cb-next");
        hide("cb-addtocart");
    }
}

function coneBuilderBack() {
    var $current=document.querySelector("div.cb-selection.visible");
    var flow=coneBuilderFlow()
    var index=flow.indexOf($current.getAttribute('data-name'));
    if (index>=1) coneBuilderShow(flow[index-1]);
}
function show(id) {
    document.getElementById(id).classList.remove("hidden");
}

function hide(id) {
    document.getElementById(id).classList.add("hidden");
}

function coneBuilderNext() {
    var $current=document.querySelector("div.cb-selection.visible");
    var flow=coneBuilderFlow()
    var index=flow.indexOf($current.getAttribute('data-name'));
    if (index<flow.length-1) coneBuilderShow(flow[index+1]);
}


function getConeBuilderHTML(item, callout) {
    let html='';
    html+=`<div class="close" onclick="hideConfig()"><svg class="icon icon-close"><use href="/icons.svg#close"></use></svg></div><div class="wrapper">`;
    html+=`<div id="cone-builder">
        </div>`;

        html+=`<div class="cb-controls"><div class="cb-selections">`;
        html+=`<div class="cb-selection visible" data-name="variation" value=""><h4>pick your size</h4><div class="cb-options smooth">`;
        item.item_data.variations.forEach((v, i) => {
            var price=v.item_variation_data.price_money.amount;
            price=price?`<br><span class="price">($${formatMoney(price)})</span>`:'';
            html+=`<span data-id="${v.id}" class="${i?"":"selected"}" onclick="coneBuilderSelect(this)">${v.item_variation_data.name}${price}</span>`;
        });
        html+=`</div></div>`;
        if (item.item_data.modifier_list_info) {
            item.item_data.modifier_list_info.forEach((m) => {
                var ml=catalog.byId[m.modifier_list_id];
                var name=ml.modifier_list_data.name;
                if (name.includes('vessel')) name='vessel';
                if (name.includes('flavor')) name='flavor';
                if (name.includes('dip')) name='dip';
                if (name.includes('topping')) name='topping';

                // html+=`<h3>${ml.modifier_list_data.name}</h3>`;
                html+=`<div class="cb-selection hidden" data-name="${name}"><h4>pick your ${name}</h4><div class="cb-options smooth">`;
                ml.modifier_list_data.modifiers.forEach((mod, i) => {
                    var price=mod.modifier_data.price_money.amount;
                    price=price?`<br><span class="price">(+$${formatMoney(price)})</span>`:'';
                    var modname=mod.modifier_data.name.replace('(v)','<svg><use href="/icons.svg#v"></use></svg>');
                    html+=`<span onclick="coneBuilderSelect(this)" data-id="${mod.id}" class="${i?"":"selected"}">${modname}${price}</span>`;
                })
            html+=`</div></div>`;
            });    
        }
        html+=`</div>
            <div class="cb-buttons">
               <div id="cb-back" class="hidden" onclick="coneBuilderBack()"><svg class="icon icon-back"><use href="/icons.svg#back"></use></svg></div>
               <div id="cb-next" onclick="coneBuilderNext()"><svg class="icon icon-next"><use href="/icons.svg#next"></use></svg></div>
               <div id="cb-addtocart" class="hidden" onclick="addConeToCart()"><h3>add to cart</h3></div>
            </div>
          </div>
        </div>`;

        return (html);
    }

function getConfigHTML(item, callout) {
    let html='';
    var pickupVars=isFixedPickup(item);
    var image="";

    if (item.item_data.variations[0].item_variation_data.name.indexOf('day ')>0) {
        pickupVars=true;
    }

    if (item.image_id) {
        var imgobj=catalog.byId[item.image_id];
        if (imgobj) {
            image=imgobj.image_data.url;
        } 
    }
    if (image) {
        html+=`<img src="${image}">`;
    }

    html+=`<div class="close" onclick="hideConfig()">X</div><div class="wrapper">`;

    if (pickupVars) {
        html+=`when would you like to pick this up?`
    } else {
        html+=`<h3>customize your ${item.item_data.name}</h3>`;
    }

    html+=callout;

    html+=`<select name="variation">`;
    item.item_data.variations.forEach((v) => {
        html+=`<option value="${v.id}">${v.item_variation_data.name} ($${formatMoney(v.item_variation_data.price_money.amount)})</option>`;
    });
    html+=`</select>`;
    if (item.item_data.modifier_list_info) {
        item.item_data.modifier_list_info.forEach((m) => {
            var ml=catalog.byId[m.modifier_list_id];
            // html+=`<h3>${ml.modifier_list_data.name}</h3>`;
            html+=`<div><select name="${ml.modifier_list_data.name}">`;
            ml.modifier_list_data.modifiers.forEach((mod) => {
                html+=`<option value="${mod.id}">${mod.modifier_data.name} (+$${formatMoney(mod.modifier_data.price_money.amount)})</option>`;
            })
        html+=`</select></div>`;
        });    
    }
    html+=`<button onclick="addConfigToCart()">add to cart</button>
           </div>`;
    
    return html;
}

var touchStartX=0;
var touchEndX=0;
var touchSpeed=0;
var scrollOffsets=[];

function scrollSelection(ev) {
    var $cbs=ev.target.parentNode.parentNode;
    var $options=ev.target.parentNode;

    
    if (ev.type == 'touchstart') {
        touchStartX=ev.touches[0].screenX;
        $options.classList.remove("smooth");
    }
    if (ev.type == 'touchmove') {
        var delta=0;
        delta=touchStartX-ev.touches[0].screenX;
        touchSpeed=touchEndX-ev.touches[0].screenX;
        touchEndX=ev.touches[0].screenX;
        newOffset=scrollOffsets[$cbs.getAttribute('data-name')]-delta;
        $options.style=`transform: translateX(${newOffset}px)`;
        ev.preventDefault();
    }

    if (ev.type == 'touchend') {
        var delta=touchStartX-touchEndX;
        $options.classList.add("smooth");
        newOffset=scrollOffsets[$cbs.getAttribute('data-name')]-delta-touchSpeed*10;
        var left=getScrollingOffset($options.firstChild);
        var right=getScrollingOffset($options.lastChild);

        if (newOffset > left) newOffset=left;
        if (newOffset < right) newOffset=right;


        $options.style=`transform: translateX(${newOffset}px)`;
        scrollOffsets[$cbs.getAttribute('data-name')]=newOffset;
    }
}

function configItem(item, callout) {
    var config=document.getElementById("config");
    config.classList.remove("hidden");
    document.body.classList.add("noscroll");
    var html='';
    var name=item.item_data.name;
    if (name == "lab cone") {
        html=getConeBuilderHTML(item, callout);
        config.classList.add('cone-builder');
        config.innerHTML=html;
        document.querySelectorAll('#config .cb-selection').forEach(($cbs) => {
            $cbs.addEventListener('touchstart', scrollSelection, true);
            $cbs.addEventListener('touchmove', scrollSelection, true);
            $cbs.addEventListener('touchcancel', scrollSelection, true);
            $cbs.addEventListener('touchend', scrollSelection, true);
        });
        showConfig();
        adjustScrolling(document.querySelector('#config.cone-builder .cb-options .selected'));
    } else {
        html=getConfigHTML(item, callout);
        config.classList.remove('cone-builder');
        config.innerHTML=html;
    }
}
    

function showConfig() {
    const cb=document.getElementById("cone-builder");
    if (cb) {
        var mods=[];
        document.querySelectorAll('#config.cone-builder .cb-options .selected').forEach((e) => {
            mods.push(e.getAttribute('data-id'));
        });
        cb.innerHTML=createConeFromConfig(mods);
    }
}

/* ------
check-out flow (pickup name, cell, time, store opening hours, payment)
--------- */


function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function getOpeningHoursConfig() {
    return storeLocations[storeLocation].openingHours;
}

function setPickupTimes () {
    var date=document.getElementById("pickup-date").value;
    var timeSelect=document.getElementById("pickup-time");
    var conf=getOpeningHoursConfig();
    var now=new Date();
    //var now=new Date("2020-04-15T22:51:00-07:00");

    var today=now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate();
    
    var openingTime=new Date(date);
    openingTime.setHours(conf.opening[openingTime.getDay()]);

    var closingTime=new Date(date);
    closingTime.setHours(conf.closing[closingTime.getDay()]);
    
    var startTime;
    
    if (today == date && (now.getTime()>openingTime)) {
        startTime=new Date(now.getTime()+(conf.prepTime*60000));
        time=new Date(startTime.getTime()+(10*60000-startTime.getTime()%(10*60000)));
        timeSelect.innerHTML="";
    } else {
        var openingTime=new Date(date);
        openingTime.setHours(conf.opening[openingTime.getDay()]);
        startTime=new Date(openingTime.getTime()+(conf.prepTime*60000));
        time=new Date(startTime.getTime());
        timeSelect.innerHTML="";
    }


    while (time<=closingTime) {
        var option = document.createElement("option");
        option.text = formatTime(time);
        option.value=time.toISOString();
        timeSelect.add(option);
        time=new Date(time.getTime()+10*60000);
    }

}

function displayThanks(payment){
    var cartEl=document.getElementById("cart");
    var $receipt;

    cartEl.querySelector(".payment").classList.add("hidden");
    if (storeLocations[storeLocation].orderAhead) {
        var $thankyou=cartEl.querySelector(".thankyou.order-ahead");
        $thankyou.classList.remove("hidden");
        $receipt=$thankyou.querySelector('.receipt-link');
    } else {
        var $thankyou=cartEl.querySelector(".thankyou.callyourname");
        $thankyou.classList.remove("hidden");
        $receipt=$thankyou.querySelector('.receipt-link');
    }

    var $receiptElem=document.getElementById("receipt-link");
    var receiptLink="/receipt"

    if (payment) {
            receiptLink=payment.receipt_url;
    }

    $receipt.setAttribute("href", receiptLink);

    var textElem=document.getElementById("text-link");
    var msg=`hi normal, this is ${order.fulfillments[0].pickup_details.recipient.display_name}, picking up my order in a (describe car)`;
    var smshref=`sms://+13852995418/${isAndroid()?"?":"&"}body=${encodeURIComponent(msg)}`;
    textElem.setAttribute("href", smshref);

    cart.clear();
    var summaryEl=document.querySelector("#cart .summary");
    summaryEl.innerHTML=`your cart is empty`;
}

function getTip() {
    var tipPercentage=+document.getElementById("tip").value;
    var tipAmount=Math.round(order.total_money.amount*tipPercentage/100);
    return (tipAmount);
}


function setPickupDates () {

    //var now=new Date("2020-04-15T22:51:00-07:00");
    var now=new Date();
    var i=0;

    var day=now;
    var conf=getOpeningHoursConfig();

    var weekdays = ["sun","mon","tue","wed","thu","fri","sat"];
    var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    var dateSelect=document.getElementById("pickup-date");
    var closedForToday=false;

    if (storeLocations[storeLocation].orderAhead) {

        while (i<storeLocations[storeLocation].orderAhead) {
            if (i==0) {
                /* check if we are past cutoff for today */
                var closingDate=new Date();
                closingDate.setHours(conf.closing[day.getDay()],0,0,0);
                if (now>closingDate-conf.lastOrderFromClose*60000) {
                    day.setDate(day.getDate()+1);
                    document.querySelector("#cart .info .pickup-time .warning.hidden").classList.remove("hidden");
                }
            }
            if(conf.opening[day.getDay()]) {
                var option = document.createElement("option");
                option.text = (i==0)?'today':weekdays[day.getDay()]+", "+months[day.getMonth()]+" "+day.getDate();
                option.value=day.getFullYear()+"/"+(day.getMonth()+1)+"/"+day.getDate();
                dateSelect.add(option);
            }

            day.setDate(day.getDate()+1);
            i++;
        }
        setPickupTimes();
    } else {
        var closingDate=new Date();
        var openingDate=new Date();
        closingDate.setHours(conf.closing[day.getDay()],0,0,0);
        openingDate.setHours(conf.opening[day.getDay()],0,0,0);

        var option = document.createElement("option");
        option.text = 'today';
        option.value=day.getFullYear()+"/"+(day.getMonth()+1)+"/"+day.getDate();
        dateSelect.add(option);

        setPickupTimes();

        if (now>closingDate-conf.lastOrderFromClose*60000) {
            document.querySelector("#cart .info").classList.add("hidden");
            document.querySelector("#cart .warning.toolate").classList.remove("hidden");
        }
        if (now<openingDate) {
            document.querySelector("#cart .info").classList.add("hidden");
            document.querySelector("#cart .warning.tooearly").classList.remove("hidden");
        }
    }
}

var paymentForm;

function initPaymentForm() {
        
    // Create and initialize a payment form object
        paymentForm = new SqPaymentForm({
            // Initialize the payment form elements
            
            applicationId: "sq0idp-q-NmavFwDX6MRLzzd5q-sg",
            locationId: storeLocations[storeLocation].locationId,

            inputClass: 'sq-input',
            autoBuild: false,
            // Customize the CSS for SqPaymentForm iframe elements
            inputStyles: [{
                fontSize: '16px',
                lineHeight: '24px',
                padding: '16px',
                placeholderColor: '#a0a0a0',
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim(),
                backgroundColor: 'transparent',
            }],
            // Initialize the credit card placeholders
            cardNumber: {
                elementId: 'sq-card-number',
                placeholder: 'Card Number'
            },
            cvv: {
                elementId: 'sq-cvv',
                placeholder: 'CVV'
            },
            expirationDate: {
                elementId: 'sq-expiration-date',
                placeholder: 'MM/YY'
            },
            postalCode: {
                elementId: 'sq-postal-code',
                placeholder: 'Postal'
            },
            
            // SqPaymentForm callback functions
            callbacks: {
                /*
                * callback function: cardNonceResponseReceived
                * Triggered when: SqPaymentForm completes a card nonce request
                */
                cardNonceResponseReceived: function (errors, nonce, cardData) {
                if (errors) {
                    // Log errors from nonce generation to the browser developer console.   
                    console.error('Encountered errors:');
                    errors.forEach(function (error) {
                        console.error('  ' + error.message);
                    });
                    alert('Encountered errors, check browser developer console for more details');
                    submittingPayment=false;
                    return;
                }
                   console.log(`The generated nonce is:\n${nonce}`);
      
                   var tipAmount=getTip();
      
                   var qs=`nonce=${encodeURIComponent(nonce)}&order_id=${encodeURIComponent(order.id)}&reference_id=${encodeURIComponent(order.reference_id)}&order_amount=${order.total_money.amount}&tip_amount=${tipAmount}`;   
      
                   fetch(storeLocations[storeLocation].endpoint+'?'+qs, {
                      method: 'GET',
                      headers: {
                        'Accept': 'application/json',
                      }
                    })
                    .catch(err => {
                      alert('Network error: ' + err);
                      submittingPayment==false;
                    })
                    .then(response => {
                      if (!response.ok) {
                        return response.text().then(errorInfo => Promise.reject(errorInfo));
                      }
                      return response.text();
                    })
                    .then(data => {
                      console.log(data);
                      var obj=JSON.parse(data);
                      if (typeof obj.errors != "undefined") {
                        alert('Payment failed to complete!\nCheck browser developer console for more details');
                        submittingPayment=false;
                      } else {
                        displayThanks(obj.payment);
                      }
                    })
                    .catch(err => {
                      console.error(err);
                    });          
                  }
            }
          });
      
          paymentForm.build();      
}

function onGetCardNonce(event) {
    if (!submittingPayment) {
        submittingPayment=true;
        event.preventDefault();
        paymentForm.requestCardNonce();    
    }
  }

storeLocation="";
storeLocations={
    store: { 
        endpoint: "https://script.google.com/macros/s/AKfycbzPFOTS5HT-Vv1mAYv3ktpZfNhGtRPdHz00Qi9Alw/exec",
        locationId: "6EXJXZ644ND0E",
        openingHours: { opening: [12,12,12,12,12,12,12],
            closing: [20,20,20,20,20,20,20],
            lastOrderFromClose: 10,
            prepTime: 10
        },
        orderAhead: 10
    },
    lab: {
        endpoint: "https://script.google.com/macros/s/AKfycbyQ1tQesQanw1Dd13t0c7KLxBRwKTesCfbHJQdHMMvc02aWiLGZ/exec",
        locationId: "3HQZPV73H8BHM",
        openingHours: { opening: [12,12,12,12,12,12,12],
            closing: [22,22,22,22,22,22,22],
            lastOrderFromClose: 10,
            prepTime: 10
        }    
    }
}

order={};
submittingPayment=false;

function checkDiscount(e) {
    if (catalog.discounts[e.value.toLowerCase()]) {
        e.setAttribute("data-id", catalog.discounts[e.value.toLowerCase()].id);
        e.classList.add("valid");
    } else {
        e.setAttribute("data-id", "");
        e.classList.remove("valid");
    }
}

async function checkCart() {

    var nomore=[];
    console.log("checking cart");
    var menuurl='/index.plain.html';
    if (storeLocation=='lab') {
        return (nomore);
    }
    var resp = await fetch(menuurl);
    var html = await resp.text(); 
   
    //console.log(html);
    $cartCheck=document.createElement('div');
    $cartCheck.id = "cart-check";
    $cartCheck.innerHTML = html;

    $menu=$cartCheck.querySelector("#store-menu").parentNode;

    cart.line_items.forEach((e) => {
        var variation=catalog.byId[e.variation];
        var item=catalog.byId[variation.item_variation_data.item_id];
        if (item.item_data.modifier_list_info) {
            //check for item name
            var found=false;
            var name=item.item_data.name;
            name=stripName(name);
            $menu.querySelectorAll("h2").forEach((e) => {
                var hname=stripName(e.innerText);
                var valid=e.firstChild.tagName != "DEL";
                if (name == hname && valid) {
                    found=true;
                }
            })
            if (!found) nomore.push(e); 
        } else {
            //check for variation name
            var found=false;
            var name=variation.item_variation_data.name;
            name=stripName(name);

            // check for h3 variation name

            $menu.querySelectorAll("h3").forEach((e) => {
                var hname=stripName(e.innerText);
                var valid=e.firstChild.tagName != "DEL";
                if (name == hname && e.firstChild.tagName != "DEL") {
                    found=true;
                }
            })

            //check for h3 item name

            var iname=item.item_data.name;
            iname=stripName(iname);

            $menu.querySelectorAll("h3").forEach((e) => {
                var hname=stripName(e.innerText);
                var valid=e.firstChild.tagName != "DEL";
                if (iname == hname && e.firstChild.tagName != "DEL") {
                    found=true;
                }
            })

            if (!found) nomore.push(e); 
        }
    })
        
    return nomore;
}

async function submitOrder() {
    var cartEl=document.getElementById("cart");

    var orderParams={};
    var now=false;
    orderParams.pickup_at=document.getElementById("pickup-time").value;
    if (orderParams.pickup_at=="now") {
        now=true;
        orderParams.pickup_at=new Date().toISOString();
        orderParams.now="yes";
    } 
    orderParams.display_name=document.getElementById("name").value;
    orderParams.cell=document.getElementById("cell").value;
    orderParams.reference_id=generateId();
    orderParams.discount_name=document.getElementById("discount").value;
    orderParams.discount=document.getElementById("discount").getAttribute("data-id");

    if (cart.itemCount==0) return;
    if (orderParams.display_name=="") {
        document.getElementById("name").focus();
        return;
    }
    if (orderParams.cell=="") {
        document.getElementById("cell").focus();
        return;
    }
    if (orderParams.discount=="" && orderParams.discount_name) {
        document.getElementById("discount").focus();
        alert("we don't recognize this discount anymore, typo?");
        return;
    }

    localStorage.setItem("name",orderParams.display_name);
    localStorage.setItem("cell",orderParams.cell);

    cartEl.querySelector(".lineitems").classList.add("hidden");
    cartEl.querySelector(".info").classList.add("hidden");
    var orderEl=cartEl.querySelector(".order");
    orderEl.classList.remove("hidden");
    orderEl.innerHTML=`<div class="ordering"><svg><use href="/icons.svg#normal"></use></svg></div>`;
    var nomore=await checkCart();

    if (nomore.length>0) {
        var sorry="we are so sorry we just ran out of "
        nomore.forEach((li, i) => {
            var v=catalog.byId[li.variation];
            var item=catalog.byId[v.item_variation_data.item_id];
                sorry+=(i?", ":"")+item.item_data.name+" : "+v.item_variation_data.name;
            cart.remove(li.fp);
        })
        sorry+=". we will refresh the store so you can look for alternatives. so sorry.";
        alert(sorry);
        window.location.reload();
        return;
    }
    
    orderParams.line_items=[];
    cart.line_items.forEach((li) => { 
        var mods=[];
        li.mods.forEach((m) => mods.push({"catalog_object_id": m}));
        var line_item={
            "catalog_object_id": li.variation,
            "quantity": ""+li.quantity };

        if (mods.length) {
            line_item.modifiers=mods;
        }
        orderParams.line_items.push(line_item);       
    });

    console.log ("order: "+JSON.stringify(orderParams));

    var qs="";
    for (var a in orderParams) {
        if (a=="line_items") {
            qs+=a+"="+encodeURIComponent(JSON.stringify(orderParams[a]));
        } else {
            qs+=a+"="+encodeURIComponent(orderParams[a]);
        }
        qs+="&";
    }

    console.log ("order qs: "+qs);

    fetch(storeLocations[storeLocation].endpoint+'?'+qs, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })
      .catch(err => {
        alert('Network error: ' + err);
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorInfo => Promise.reject(errorInfo));
        }
        return response.text();
      })
      .then(data => {
        console.log(data);
        var obj=JSON.parse(data);
        if (typeof obj.order != "undefined") {
            displayOrder(obj.order);
        } else {
            alert('Order Submission failed. Sorry.');
        }
      })
      .catch(err => {
        console.error(err);
      });          
}

function displayOrder(o) {
    order=o;
    html=`<h3>order: ${order.reference_id}</h3>`;
    order.line_items.forEach((li) => {
        html+=`<div class="line item"><span class="desc">${li.quantity} x ${li.name} : ${li.variation_name}</span> <span class="amount">$${formatMoney(li.base_price_money.amount*li.quantity)}</span></div>`;
        if (typeof li.modifiers !== "undefined") {
            li.modifiers.forEach((mod) => {
                html+=`<div class="line mod"><span class="desc">${mod.name}</span> <span class="amount">$${formatMoney(mod.total_price_money.amount)}</span></div>`;
            })
        }
    });
    if (order.discounts) {
        html+=`<div class="line discounts"><span class="desc">${order.discounts[0].name} - discount</span><span class="amount">- $${formatMoney(order.discounts[0].applied_money.amount)}</span></div>`;
    }
    html+=`<div class="line subtotal"><span class="desc">subtotal</span><span class="amount">$${formatMoney(order.total_money.amount)}</span></div>`;
    html+=`<div class="line tax"><span class="desc">prepared food tax (included)</span><span class="amount">$${formatMoney(order.total_tax_money.amount)}</span></div>`;
    html+=`<div class="line tip"><span class="desc">tip</span><span class="amount">$${formatMoney(getTip())}</span></div>`;
    html+=`<div class="line total"><span class="desc">total</span><span class="amount">$${formatMoney(order.total_money.amount+getTip())}</span></div>`;
    document.querySelector("#cart .order").innerHTML=html;
    if (!storeLocations[storeLocation].orderAhead) {
        document.querySelector('#cart .payment .wegotyourorder').classList.remove('hidden');
    }

    var paymentEl=document.querySelector("#cart .payment");
    paymentEl.classList.remove("hidden");
    initPaymentForm();
    if (storelocation =='lab') document.getElementById('sq-creditcard').innerHTML='i am here, ready to pick-up my order';
}



/* ------
shopping cart (configs, variations, modifiers, price, quantity)
--------- */

function addConeToCart(e) {
    hideConfig();
    var variation="";
    var mods=[];
    document.querySelectorAll(`#config.cone-builder .cb-options .selected`).forEach((e, i) => {
        if (!i) {
            variation=e.getAttribute('data-id');
        } else {
            if (e.getAttribute('data-id')) mods.push(e.getAttribute('data-id'));
        }
    })
    cart.add(variation, mods)
    updateCart();
}

function addConfigToCart(e) {
    hideConfig();
    var variation="";
    var mods=[];
    document.querySelectorAll(`#config select`).forEach((e, i) => {
        if (!i) {
            variation=e.value;
        } else {
            if (e.value) mods.push(e.value);
        }
    })
    cart.add(variation, mods)
    updateCart();
}

function toggleCartDisplay() {
    
    var cartEl=document.getElementById("cart");
    if (cartEl.classList.toggle("full")) {
        document.body.classList.add("noscroll");
        cartEl.querySelector(".summary").classList.add("hidden");
        cartEl.querySelector(".details").classList.remove("hidden");
    } else {
        document.body.classList.remove("noscroll");
        cartEl.querySelector(".summary").classList.remove("hidden");
        cartEl.querySelector(".details").classList.add("hidden");
    }
    cartEl.querySelector(".lineitems").classList.remove("hidden");
    cartEl.querySelector(".info").classList.remove("hidden");
    cartEl.querySelector(".order").classList.add("hidden");
    cartEl.querySelector(".payment").classList.add("hidden");
    cartEl.querySelector(".thankyou").classList.add("hidden");
    setPickupDates();

    var hidePickup=true;

    if (storeLocations[storeLocation].orderAhead) {
        cart.line_items.forEach((e) => {
            var variation=catalog.byId[e.variation];
            var item=catalog.byId[variation.item_variation_data.item_id];
            if (hidePickup && !isFixedPickup(item)) {
                hidePickup=false;
            }
        })    
    }


    if (hidePickup) {
        document.querySelector("#cart .pickup-time").classList.add("hidden");
    } else {
        document.querySelector("#cart .pickup-time").classList.remove("hidden");
    }
}


function initCart() {
    var cartEl=document.getElementById("cart");
    
    var html=`<div class="summary">items in your cart ($) <button onclick="toggleCartDisplay()">check out</button></div>`;
    html+=`<div class="details hidden">
            <div class="back" onclick="toggleCartDisplay()">&lt; back to shop</div>
            <div class="lineitems"></div>
            <div class="info">
                <input id="name" type="text" placeholder="your name">
                <input id="cell" type="text" placeholder="cell phone">
                <div class="pickup-time"> 
                    <nobr>
                        <select id="pickup-date" onchange="setPickupTimes()"></select><select id="pickup-time"></select>
                    </nobr>
                    <div class="warning hidden">i’m so sorry! we are not accepting orders after hours, but of course you can order normal&reg; for tomorrow... or the next day</div>
                </div>
                <input id="discount" data-id="" type="text" placeholder="discount code?" onkeyup="checkDiscount(this)">
                <button onclick="submitOrder()">order</button>
            </div>
            <div class="warning hidden toolate">
            <p>i’m so sorry! we are not accepting orders after hours, we'll keep our cones in your cart though :) hope to see you tomorrow!</p>
            </div>
            <div class="warning hidden tooearly">
            <p>* we are not open yet, but we will keep your cart around, just reload the page once we are open and complete the checkout.</p> 
            <p>we are excited to see you.</p>
            </div>
            <div class="order hidden"></div>
            <div class="payment hidden">
                <div class="tip"><select onchange="displayOrder(order)" id="tip">
                    <option value="0">no tip</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="25">25%</option>
                </select></div>
                <div id="form-container">
                    <div class="wegotyourorder warning hidden">
                    <p>we are ready for you!</p>
                    <p>please process payment once you have arrived and we’ll call your name when your order is ready</p>
                    </div>
                    <div id="sq-card-number"></div>
                    <div class="third" id="sq-expiration-date"></div>
                    <div class="third" id="sq-cvv"></div>
                    <div class="third" id="sq-postal-code"></div>
                    <button id="sq-creditcard" class="button-credit-card" onclick="onGetCardNonce(event)">pay</button>
                    <button id="sq-apple-pay"></button>
                </div>             
            </div>
            <div class="thankyou order-ahead hidden">
                <h3 class="warning">thank you SO much, text us when you arrive at our STORE and ready for pick up</h3>
                <p>
                <a id="text-link" href="sms://+13852995418/">(395)299-5418</a>
                </p>
                <p>
                <a class="receipt-link" target="_new" href="">show receipt</a>
                </p>
            </div>
            <div class="thankyou callyourname hidden">
                <h3 class="warning">thank you SO much! We’ll call your name when your order is ready :)</h3>
                <p>
                <a class="receipt-link" target="_new" href="">show receipt</a>
                </p>
            </div>
        </div>`;

    cartEl.innerHTML=html;

    var name=getCookie("name");
    var cell=getCookie("cell");

    if (name) {
        setCookie('name','',-10);
        localStorage.setItem('name',name);
        console.log('migrating name to ls')
    }

    if (cell) {
        setCookie('cell','',-10);
        localStorage.setItem('cell',cell);
        console.log('migrating cell to ls')
    }

    

    document.getElementById("name").value=localStorage.getItem("name");
    document.getElementById("cell").value=localStorage.getItem("cell");

}

function plus(el) {
  var fp=el.parentNode.parentNode.getAttribute("data-id");
  var li=cart.line_items.find((li) => fp == li.fp);
  if (li.quantity<20) {
      cart.setQuantity(fp, li.quantity+1);
  }
  updateCart();
}

function minus (el) {
    var fp=el.parentNode.parentNode.getAttribute("data-id");
    var li=cart.line_items.find((li) => fp == li.fp);
    cart.setQuantity(fp, li.quantity-1);
    if (li.quantity==0) cart.remove(fp);   
    updateCart();
}

function updateCart() {
    var cartEl=document.getElementById("cart");

    var count=cart.totalItems();
    if (count>0) {
        cartEl.classList.remove("hidden");
    } else {
        cartEl.classList.add("hidden");
        document.body.classList.remove("noscroll");
    }

    var summaryEl=cartEl.querySelector(".summary");
    summaryEl.innerHTML=`${count} item${count==1?"":"s"} in your cart ($${formatMoney(cart.totalAmount())}) <button onclick="toggleCartDisplay()">check out</button>`;
    
    var lineitemsEl=cartEl.querySelector(".lineitems");
    var html=``;
    cart.line_items.forEach((li) => {
        var v=catalog.byId[li.variation];
        var i=catalog.byId[v.item_variation_data.item_id];
        var mods="";
        var cone="";
        if (i.item_data.name == 'lab cone') cone=`<div class="cone">${createConeFromConfig(li.mods)}</div>`;
        li.mods.forEach((m, i) => mods+=", "+catalog.byId[m].modifier_data.name);
        html+=`<div class="line item" data-id="${li.fp}">
            <div class="q"><span onclick="minus(this)" class="control">-</span> ${li.quantity} <span class="control" onclick="plus(this)">+</span></div>
            <div class="desc">${cone} 
            ${i.item_data.name} : ${v.item_variation_data.name} ${mods}</div>
            <div class="amount">$${formatMoney(li.quantity*li.price)}</div>
            </div>`;
    })
    html+=`<div class="line total"><div class="q"></div><div class="desc">total</div><div>$${formatMoney(cart.totalAmount())}</div>`;

    lineitemsEl.innerHTML=html;
    
    console.log(JSON.stringify(cart.line_items));
}

function findCallout($parent) {
    var callout="";
    var $e=$parent.nextSibling;
    while ($e && $e.tagName != $parent.tagName) {
        if ($e.tagName=="P" && $e.textContent.indexOf("*")==0) {
            callout+=`<p>${$e.textContent}</p>`;        
        }
        console.log($e.tagName +":"+$e.textContent)
        $e=$e.nextSibling;
    }
    return callout;
}

function addToCart(e) {
    var id=e.getAttribute("data-id");
    console.log(id);
    if (id) {
        var obj=catalog.byId[id]
        if (obj.type=="ITEM") {
            var callout=findCallout(e.parentNode);
            configItem(obj, callout);
        } else {
            cart.add(obj.id);
            updateCart();
        }
    }
}

function formatMoney(num) {
    return (""+(num/100).toFixed(2))
}

function stripName(name) {
    name=name.split('(')[0];
    name=name.split('$')[0];
    return (name.toLowerCase().replace(/[^0-9a-z]/gi, ''))
}

function itemByName(name) {
    name=stripName(name);
    var item=catalog.items.find((i) => {
        return (name == stripName(i.item_data.name));
    })
    return (item);
}

function variationByName(item, name) {
    name=stripName(name);
    var variation=item.item_data.variations.find((i) => {
        var vname=i.item_variation_data.name.toLowerCase();
        vname=vname.split("(")[0].trim();
        vname=stripName(vname);
        return (name == vname);
    })
    return (variation);
}

function makeShoppable() {
    initCart();
    indexCatalog();
    var itemElems=document.querySelectorAll("div.storemenu > *");
    var currentItem={};
    
    var div=document.createElement("div");
    div.innerHTML=`<button class="add-to-cart" onclick="addToCart(this)">add to cart</button>`;
    var addToCartButton=div.firstChild;

    itemElems.forEach((e) => {
        if (e.tagName == "H2") {
            var name=e.innerText;
            name=name.split("$")[0];
            name=name.trim();
            var item=itemByName(name);
            if (item) {
                console.log(`item: ${item.item_data.name} : ${item.id}`);
                if (item.item_data.modifier_list_info) {
                    var button=addToCartButton.cloneNode(true);
                    button.setAttribute("data-id", item.id);
                    e.appendChild(button);                    
                    var mods=item.item_data.modifier_list_info;
                    mods.forEach((e) => {
                        var mod=catalog.byId[e.modifier_list_id];
                        console.log(`mod: ${mod.modifier_list_data.name} : ${mod.id}`);
                    });
                    currentItem={};            
                } else {
                    currentItem=item;
                }
            } else {
                console.log(`item: ${name} not found`);
                currentItem={};            
            }    
        }
        
        if (e.tagName == "H3") {
            if (currentItem.id) {
                var name=e.innerText;
                name=name.trim();
                var variation=variationByName(currentItem, name); 
                if (variation) {
                    console.log(`variation: ${variation.item_variation_data.name} : ${variation.id}`);
                    var button=addToCartButton.cloneNode(true);
                    button.setAttribute("data-id", variation.id);
                    e.appendChild(button);                    
                } else {
                    console.log(`variation: ${name} not found`);
                }
   
            } else {
                var name=e.innerText;
                name=name.trim();
                var item=itemByName(name);
                if (item) {
                    console.log(`item: ${item.item_data.name} : ${item.id}`);
                    var button=addToCartButton.cloneNode(true);
                    if (item.item_data.variations.length>1) {
                        button.setAttribute("data-id", item.id);
                    } else {
                        button.setAttribute("data-id", item.item_data.variations[0].id);
                    }
                    e.appendChild(button);
                }   
            }            
        }
    });

    // square links

    const squareprefix='https://squareup.com/dashboard/items/library/';

    document.querySelectorAll("main a").forEach(($a) => {
        var href=$a.getAttribute('href');
        if (href.indexOf(squareprefix)==0) {
            var itemid=href.substr(squareprefix.length);
            $a.setAttribute('data-id', itemid);
            $a.setAttribute('onclick', 'addToCart(this)');
            $a.removeAttribute('href');
            $a.classList.add('item');
            $a.classList.add(stripName(catalog.byId[itemid].item_data.name));
        }
    })
}

var cart={
    line_items: [],
    remove: (fp) => {
        var index=cart.line_items.findIndex((li) => fp == li.fp);
        cart.line_items.splice(index, 1);
        cart.store();
    },
    add: (variation, mods) => {
        if (!mods) mods=[];
        var li=cart.find(variation, mods);
        if (li) {
            li.quantity++;
        } else {
            var fp=variation;
            var price=catalog.byId[variation].item_variation_data.price_money.amount;
            mods.forEach((m) => { fp+="-"+m; price+=catalog.byId[m].modifier_data.price_money.amount});
            cart.line_items.push({fp: fp, variation: variation, mods: mods, quantity: 1, price:  price})
        }
        cart.store();

    },
    find: (variation, mods) => {
        var fp=variation;
        mods.forEach((m) => { fp+="-"+m});
        return cart.line_items.find((li) => fp == li.fp)
    },
    setQuantity: (fp, q) => {
        var index=cart.line_items.findIndex((li) => fp == li.fp);
        cart.line_items[index].quantity=q;
        cart.store();

    },
    totalAmount: () => {
        var total=0;
        cart.line_items.forEach((li)=>{ total+=li.price*li.quantity
        })
        return (total);
    },
    totalItems: () => {
        var total=0;
        cart.line_items.forEach((li)=>{ total+=li.quantity
        })
        return (total);
    },
    clear: () => {
        cart.line_items=[];
        cart.store();
    },

    store: () => {
        localStorage.setItem("cart-"+storeLocation,JSON.stringify({lastUpdate: new Date(), line_items: cart.line_items}));
    },

    load: () => {
        var cartobj=JSON.parse(localStorage.getItem("cart-"+storeLocation));
        cart.line_items=[];

        if (cartobj && cartobj.line_items) {
            // validate
            cartobj.line_items.forEach((li) => {
                if (catalog.byId[li.variation]) cart.line_items.push(li);
            })
        }
    }
}

/* ---
sign up form
--- */

customerEndpoint="https://script.google.com/macros/s/AKfycbwny6SK6iv7OqtmyM3DcMfwVFQGrVS8V4PaWf4U3kZojtfguns/exec";


function insertSignupForm() {
    var $signup;
    var $form=document.createElement('div');

    var $signup=document.getElementById('sign-up-for-pint-club');
    if ($signup) {
        $signup=$signup.parentNode;
        $form.id='signup';
        $form.className='form';
    
        $form.innerHTML=`<div class="form-wrapper"><input type="text" id="name" placeholder="name">
        <input type="text" id="cell" placeholder="cell">
        <input type="text" id="email" placeholder="email">
        <button onclick="signup()">sign up to pint club</button></div>`;
    
        $signup.parentNode.replaceChild($form, $signup);
        bindInputs(document.querySelectorAll('#signup input'));    
    }
}

function signup() {
    var ValidationException={};

    try {
        var params={};
        document.querySelectorAll('#signup input').forEach((e) => {
            params[e.id]=e.value;
            if (!e.value) {
                e.focus();
                throw ValidationException;
            }
        }) 
        var $signup=document.querySelector("#signup");
        $signup.innerHTML=`<div class="ordering"><svg><use href="/icons.svg#normal"></use></svg></div>`;
    
        var qs="";
        for (var a in params) {
            qs+=a+"="+encodeURIComponent(params[a]);
            qs+="&";
        }
    
        console.log ("customer qs: "+qs);
    
        fetch(customerEndpoint+'?'+qs, {
            method: 'GET',
            headers: {
            'Accept': 'application/json',
            }
        })
        .catch(err => {
            alert('Network error: ' + err);
        })
        .then(response => {
            if (!response.ok) {
            return response.text().then(errorInfo => Promise.reject(errorInfo));
            }
            return response.text();
        })
        .then(data => {
            console.log(data);
            var obj=JSON.parse(data);
            if (typeof obj.customer != "undefined") {
                $signup.innerHTML=`<div class="form-wrapper"><p>welcome ${params.name.split(' ')[0].toLowerCase()},<br>
                    we are SO excited to have you as our newest member of NORMAL&reg; PINT CLUB! stay tuned, we'll be in touch shortly.</p></div>`;
            } else {
                alert('Pint Club Signup failed. Sorry.');
            }
        })
        .catch(err => {
            console.error(err);
        });          
    
    } catch (e) {
        console.log ("validation failed");
    }
}



/* ----
general setup
--- */

window.addEventListener('DOMContentLoaded', (event) => {
    //resizeImages();
    setLocation();
    setColors();
    fixIcons();
    classify();
    //wrapMenus();
    //cloneMenuSwiper();
    fixSmsUrls();
    makeShoppable();    
    insertSignupForm();
    cart.load();
    updateCart();
});

window.onload = function() {  
    scrani.onload();
  }
  
//window.onresize=updateMenuDisplay;
  