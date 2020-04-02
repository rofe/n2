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

function fixSmsUrls() {
    var os="";
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        os="android";
    }

    console.log(os);

    document.querySelectorAll("main a").forEach((e) => {
        var href=e.getAttribute("href");
        console.log(href);
        if (href && href.indexOf("https://sms.com")==0) {
            var smshref="sms:/"+href.substr(15);

            if (os=="android") {
                var s=smshref.split("&body");
                smshref=s[0]+"?body"+s[1];
            }
            e.setAttribute("href",smshref);
        }
    })

}

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
    })
} 

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
    html+=`<select>`;
    item.item_data.variations.forEach((v) => {
        html+=`<option value="${v.id}">${v.item_variation_data.name}</option>`;
    });
    html+=`</select>`;
    item.item_data.modifier_list_info.forEach((m) => {
        var ml=catalog.byId[m.modifier_list_id];
        html+=`<h3>${ml.modifier_list_data.name}</h3>`;
        html+=`<div>`;
        ml.modifier_list_data.modifiers.forEach((mod) => {
            html+=`<p><input type="checkbox" id="${mod.id}" /><label for="${mod.id}">${mod.modifier_data.name}</label></p>`;
        })
    html+=`</div>`;
    });
    html+=`<button onclick="addConfigToCart()">add to cart</button>
           </div>`;
    config.innerHTML=html;
}

function addConfigToCart(e) {
    hideConfig();
    var variation=document.querySelector("#config select").value;
    var mods=[];
    document.querySelectorAll(`#config input[type="checkbox"]`).forEach((e) => {
        if (e.checked) mods.push(e.id);
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
    cartEl.querySelector(".order").classList.add("hidden");
    cartEl.querySelector(".payment").classList.add("hidden");
    cartEl.querySelector(".thankyou").classList.add("hidden");
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
                <button onclick="order()">order</button>
            </div>
            <div class="order hidden"></div>
            <div class="payment hidden"></div>
            <div class="thankyou hidden"></div>
        </div>`;

    cartEl.innerHTML=html;
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

function itemByName(name) {
    name=name.toLowerCase();
    var item=catalog.items.find((i) => {
        return (name == i.item_data.name.toLowerCase());
    })
    return (item);
}

function variationByName(item, name) {
    name=name.toLowerCase();
    var variation=item.item_data.variations.find((i) => {
        return (name == i.item_variation_data.name.toLowerCase());
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