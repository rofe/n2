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
        var label=e.textContent.split(" ")[0].toLowerCase();
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

        e.setAttribute("href", `/icons.svg#${name}`);
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
};
    catalog_raw.forEach((e) => {
        catalog.byId[e.id]=e;
        if (e.type=="ITEM") {
            catalog.items.push(e);
            if (e.item_data.variations) e.item_data.variations.forEach((v) => {
                catalog.byId[v.id]=v;
            })
        }
        if (e.type=="MODIFIER_LIST") {
            if (e.modifier_list_data.modifiers) e.modifier_list_data.modifiers.forEach((m) => {
                catalog.byId[m.id]=m;
            })
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

function configItem(item) {
    var config=document.getElementById("config");
    config.classList.remove("hidden");
    document.body.classList.add("noscroll");
    var html=`<div class="close" onclick="hideConfig()">X</div><div class="wrapper"><h3>customize your ${item.item_data.name}</h3>`;
    html+=`<p>*all soft serves will be served upside-down in a cup for optimal transport and limited contact, but you can totes add a cone on top :)</p>`;
    html+=`<select>`;
    item.item_data.variations.forEach((v) => {
        html+=`<option value="${v.id}">${v.item_variation_data.name} ($${formatMoney(v.item_variation_data.price_money.amount)})</option>`;
    });
    html+=`</select>`;
    item.item_data.modifier_list_info.forEach((m) => {
        var ml=catalog.byId[m.modifier_list_id];
        html+=`<h3>${ml.modifier_list_data.name}</h3>`;
        html+=`<div><select>`;
        html+=`<option value="" >no ${ml.modifier_list_data.name}</option>`;
        ml.modifier_list_data.modifiers.forEach((mod) => {
            html+=`<option value="${mod.id}">${mod.modifier_data.name} (+$${formatMoney(mod.modifier_data.price_money.amount)})</option>`;
        })
    html+=`</select></div>`;
    });
    html+=`<button onclick="addConfigToCart()">add to cart</button>
           </div>`;
    config.innerHTML=html;
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
    return { opening: [12,12,12,12,12,12,12],
             closing: [20,20,20,20,20,20,20],
             lastOrderFromClose: 10,
             prepTime: 10
    }
}

function setPickupTimes () {
    var date=document.getElementById("pickup-date").value;
    var timeSelect=document.getElementById("pickup-time");
    var conf=getOpeningHoursConfig();
    var now=new Date();
    var today=now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate();
    
    var openingTime=new Date(date);
    openingTime.setHours(conf.opening[openingTime.getDay()]);

    var closingTime=new Date(date);
    closingTime.setHours(conf.closing[closingTime.getDay()]);
    
    var startTime;
    
    if (today == date && (now.getTime()>openingTime)) {
        startTime=new Date(now.getTime()+(conf.prepTime*60000));
        time=new Date(startTime.getTime()+(10*60000-startTime.getTime()%(10*60000)));
    } else {
        var openingTime=new Date(date);
        openingTime.setHours(conf.opening[openingTime.getDay()]);
        startTime=new Date(openingTime.getTime()+(conf.prepTime*60000));
        time=new Date(startTime.getTime());
    }


    timeSelect.innerHTML="";

    while (time<=closingTime-conf.lastOrderFromClose*60000) {
        var option = document.createElement("option");
        option.text = formatTime(time);
        option.value=time.toISOString();
        timeSelect.add(option);
        time=new Date(time.getTime()+10*60000);
    }

}

function displayThanks(payment){
    var cartEl=document.getElementById("cart");
    cartEl.querySelector(".payment").classList.add("hidden");
    cartEl.querySelector(".thankyou").classList.remove("hidden");

    var receiptElem=document.getElementById("receipt-link");
    var receiptLink="/receipt"

    if (payment) {
            receiptLink=payment.receipt_url;
    }

    receiptElem.setAttribute("href", receiptLink);

    var textElem=document.getElementById("text-link");
    var msg=`hi normal, this is ${order.fulfillments[0].pickup_details.recipient.display_name}, picking up my order in a (describe car)`;
    var smshref=`sms://+13852995418/${isAndroid()?"?":"&"}body=${encodeURIComponent(msg)}`;
    textElem.setAttribute("href", smshref);

    cart.line_items=[];
    var summaryEl=document.querySelector("#cart .summary");
    summaryEl.innerHTML=`your cart is empty`;
}

function getTip() {
    var tipPercentage=+document.getElementById("tip").value;
    var tipAmount=Math.round(order.total_money.amount*tipPercentage/100);
    return (tipAmount);
}


function setPickupDates () {

    var now=new Date();
    var i=0;

    var day=now;
    var conf=getOpeningHoursConfig();

    var weekdays = ["sun","mon","tue","wed","thu","fri","sat"];
    var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    var dateSelect=document.getElementById("pickup-date");

    while (i<10) {
        if (i==0) {
            /* check if we are past cutoff for today */
            var closingDate=new Date();
            closingDate.setHours(conf.closing[day.getDay()],0,0,0);
            if (now>closingDate-conf.lastOrderFromClose*60000) {
                day.setDate(day.getDate()+1);
                document.querySelector(".order-props").className="order-props alert";
                document.getElementById("warning").className="warning";
            }
        }
        if(conf.opening[day.getDay()]) {
            var option = document.createElement("option");
            option.text = weekdays[day.getDay()]+", "+months[day.getMonth()]+" "+day.getDate();
            option.value=day.getFullYear()+"/"+(day.getMonth()+1)+"/"+day.getDate();
            dateSelect.add(option);
        }

        day.setDate(day.getDate()+1);
        i++;
    }
    setPickupTimes();
}

var paymentForm;

function initPaymentForm() {
        
    // Create and initialize a payment form object
        paymentForm = new SqPaymentForm({
            // Initialize the payment form elements
            
            applicationId: "sq0idp-q-NmavFwDX6MRLzzd5q-sg",
            inputClass: 'sq-input',
            autoBuild: false,
            // Customize the CSS for SqPaymentForm iframe elements
            inputStyles: [{
                fontSize: '16px',
                lineHeight: '24px',
                padding: '16px',
                placeholderColor: '#a0a0a0',
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
      
                   fetch(orderEndpoint+'?'+qs, {
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

orderEndpoint="https://script.google.com/macros/s/AKfycbzPFOTS5HT-Vv1mAYv3ktpZfNhGtRPdHz00Qi9Alw/exec";
order={};
submittingPayment=false;

function submitOrder() {
    var cartEl=document.getElementById("cart");

    var orderParams={};
    orderParams.pickup_at=document.getElementById("pickup-time").value;
    orderParams.display_name=document.getElementById("name").value;
    orderParams.cell=document.getElementById("cell").value;
    orderParams.reference_id=generateId();

    if (cart.itemCount==0) return;
    if (orderParams.display_name=="") {
        document.getElementById("name").focus();
        return;
    }
    if (orderParams.cell=="") {
        document.getElementById("cell").focus();
        return;
    }

    setCookie("name",orderParams.display_name, 200);
    setCookie("cell",orderParams.cell, 200);

    cartEl.querySelector(".lineitems").classList.add("hidden");
    cartEl.querySelector(".info").classList.add("hidden");
    var orderEl=cartEl.querySelector(".order");
    orderEl.classList.remove("hidden");
    orderEl.innerHTML=`<div class="ordering"><svg><use href="/icons.svg#normal"></use></svg></div>`;
    
    
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

    fetch(orderEndpoint+'?'+qs, {
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
    html+=`<div class="line subtotal"><span class="desc">subtotal</span><span class="amount">$${formatMoney(order.total_money.amount)}</span></div>`;
    html+=`<div class="line tax"><span class="desc">prepared food tax (included)</span><span class="amount">$${formatMoney(order.total_tax_money.amount)}</span></div>`;
    html+=`<div class="line tip"><span class="desc">tip</span><span class="amount">$${formatMoney(getTip())}</span></div>`;
    html+=`<div class="line total"><span class="desc">total</span><span class="amount">$${formatMoney(order.total_money.amount+getTip())}</span></div>`;
    document.querySelector("#cart .order").innerHTML=html;
    var paymentEl=document.querySelector("#cart .payment");
    paymentEl.classList.remove("hidden");
    initPaymentForm();
}



/* ------
shopping cart (configs, variations, modifiers, price, quantity)
--------- */

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
}


function initCart() {
    var cartEl=document.getElementById("cart");
    
    var html=`<div class="summary">items in your cart ($) <button onclick="toggleCartDisplay()">check out</button></div>`;
    html+=`<div class="details hidden">
            <div class="back" onclick="toggleCartDisplay()">&lt; back to shop</div>
            <div class="lineitems"></div>
            <div class="info">
                <input id="name" type="text" placeholder="Your Name">
                <input id="cell" type="text" placeholder="Cell Phone">
                <div class="pickup-time"> 
                    <nobr>
                        <select id="pickup-date" onchange="setPickupTimes()"></select><select id="pickup-time"></select>
                    </nobr>
                </div>
                <button onclick="submitOrder()">order</button>
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
                    <div id="sq-card-number"></div>
                    <div class="third" id="sq-expiration-date"></div>
                    <div class="third" id="sq-cvv"></div>
                    <div class="third" id="sq-postal-code"></div>
                    <button id="sq-creditcard" class="button-credit-card" onclick="onGetCardNonce(event)">pay</button>
                </div>             
            </div>
            <div class="thankyou hidden">
                <h3>thank you SO much, we REALLY appreciate you &#9825;</h3>
                <p>
                <a id="receipt-link" target="_new" href="">show receipt</a>
                </p>
                <p>
                <a id="text-link" href="sms://+13852995418/">text us when you arrive!</a>
                </p>
            </div>
        </div>`;

    cartEl.innerHTML=html;

    document.getElementById("name").value=getCookie("name");
    document.getElementById("cell").value=getCookie("cell");

}

function plus(el) {
  var fp=el.parentNode.parentNode.getAttribute("data-id");
  var li=cart.line_items.find((li) => fp == li.fp);
  if (li.quantity<20) li.quantity++;  
  updateCart();
}

function minus (el) {
    var fp=el.parentNode.parentNode.getAttribute("data-id");
    var li=cart.line_items.find((li) => fp == li.fp);
    li.quantity--;
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
        li.mods.forEach((m, i) => mods+=", "+catalog.byId[m].modifier_data.name);
        html+=`<div class="line item" data-id="${li.fp}"><div class="q"><span onclick="minus(this)" class="control">-</span> ${li.quantity} <span class="control" onclick="plus(this)">+</span></div><div class="desc">${i.item_data.name} : ${v.item_variation_data.name} ${mods}</div><div class="amount">$${formatMoney(li.quantity*li.price)}</div></div>`;
    })
    html+=`<div class="line total"><div class="q"></div><div class="desc">total</div><div>$${formatMoney(cart.totalAmount())}</div>`;

    lineitemsEl.innerHTML=html;
    
    console.log(JSON.stringify(cart.line_items));
}

function addToCart(e) {
    var id=e.getAttribute("data-id");
    console.log(id);
    if (id) {
        var obj=catalog.byId[id]
        if (obj.type=="ITEM") {
            configItem(obj);
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
    var itemElems=document.querySelectorAll("div.current > *");
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
   
            }            
        }
    });
}

var cart={
    line_items: [],
    remove: (fp) => {
        var index=cart.line_items.findIndex((li) => fp == li.fp);
        cart.line_items.splice(index, 1);
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
    },
    find: (variation, mods) => {
        var fp=variation;
        mods.forEach((m) => { fp+="-"+m});
        return cart.line_items.find((li) => fp == li.fp)
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
    }
}

window.onload = function() {
    fixIcons();
    classify();
    //wrapMenus();
    //cloneMenuSwiper();
    fixSmsUrls();
    makeShoppable();
  
    scrani.onload();
  }
  
  window.onresize=updateMenuDisplay;
  