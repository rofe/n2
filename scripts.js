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
    document.querySelectorAll("main a").forEach((e) => {
        var href=e.getAttribute("href");
        console.log(href);
        if (href && href.indexOf("https://sms.com")==0) {
            e.setAttribute("href","sms:"+href.substr(9));
        }
    })

}

window.onload = function() {
  fixIcons();
  classify();
  //wrapMenus();
  //cloneMenuSwiper();
  fixSmsUrls();
  scrani.onload();
}

window.onresize=updateMenuDisplay;