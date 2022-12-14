const toTOC = (dom,headings,toc,previousLevel,previousHeading) => {
    const originalHeadings = [...headings],
        ul = document.createElement("ol"),
        isRoot = previousLevel===undefined;
    let previousLI;
    if(!previousLevel) {
        while(headings[0]!==toc) {
            headings.shift();
        }
        headings.shift(); // remove toc itself
    }
    while(headings.length>0) {
        const heading = headings[0],
            level = parseInt(heading.tagName.substring(1));
        previousLevel ||= level;
        if(level<previousLevel) {
            return ul;
        }
        if(level>previousLevel) {
            previousLI.appendChild(toTOC(dom,headings,toc,level,previousHeading));
        } else {
            previousLI = document.createElement("li");
            previousLI.innerHTML = `<a href="#${heading.id}">${heading.innerHTML}</a>`;
            previousLI.classList.add("autohelm-nav");
            ul.appendChild(previousLI);
            const headingEl = dom.querySelector("#"+heading.id),
                tocspan = document.createElement('span');
            tocspan.classList.add("autohelm-nav");
            tocspan.classList.add("autohelm-toc");
            tocspan.innerHTML = `<a href="#${toc.id}">&#9783;</a> `;
            headingEl.insertBefore(tocspan,headingEl.firstChild);
            //if(!isRoot) {
                const  navspan = document.createElement("span"),
                    nextHeading = headings[1];
                navspan.classList.add("autohelm-nav");
                navspan.classList.add("autohelm-nav-up-down");
                navspan.innerHTML = (previousHeading ? ` <a href="#${previousHeading.id}">&uarr;</a>` : '') + (nextHeading ?  ` <a href="#${nextHeading.id}">&darr;</a>` :'');
                headingEl.appendChild(navspan);
            //}
            previousHeading = headings.shift();
        }
        //previousLI = li;
    }
    return ul;
}

const buildTOC = ({tocSelector=".autohelm-toc",dom = document.body,directChildren,useSections}={}) => {
    const tocEl = dom.querySelector(tocSelector);
    if(!tocEl) {
        throw new Error(`No TOC element found for "${tocSelector}`);
    }
    for(let i=0;i<=6;i++) {
        [...dom.querySelectorAll("h"+i)].forEach((heading) => {
            if((!directChildren && !useSections) || (!useSections && heading.parentElement===dom) || (heading.parentElement.tagName==="SECTION" && heading.parentElement.children[0]===heading)) {
                if(heading.id.length===0) {
                    const text =  heading.textContent.replace(/[~`!@#$%\^&*()\-_=+\[{\]}\\|;.",<.>\/?]/g," ")
                        .split(" ").map((word) => word.trim().toLowerCase()).join("-")
                    heading.setAttribute("id",text);
                }
                heading.classList.add("autohelm-heading")
            }
        })
    }
    const headings = [...dom.querySelectorAll(".autohelm-heading")];
    const toc = toTOC(dom,headings,tocEl);
    tocEl.insertAdjacentElement("afterend",toc);
    if(tocEl.hasAttribute("data-toggle")) {
        const open = document.createElement("span"),
            close = document.createElement("span");
        toc.style.display = "none";
        open.classList.add("autohelm-open-toc");
        open.innerHTML = "&#9660;";
        open.style.display = "inline";
        open.style.fontSize = "15px";
        close.classList.add("autohelm-close-toc");
        close.innerHTML = "&#9650;";
        close.style.display = "none";
        close.style.fontSize = "15px";
        tocEl.appendChild(open)
        tocEl.appendChild(close);
    }
}

const buildFootnotes = ({dom = document.body,footnotesTitle = "Footnotes",footnotesLevel=1}={}) => {
    const heading = document.createElement("h"+footnotesLevel);
    heading.innerHTML = footnotesTitle;
    dom.appendChild(heading);
    const footnotes = [...dom.querySelectorAll(".autohelm-footnote")];
    footnotes.forEach((footnote,i) => {
        i++; // numbering starts at 1
        const href = footnote.getAttribute("href"),
            p = href ? dom.querySelector(href)  || document.createElement("p") : document.createElement("p");
        p.id ||= (footnote.id || `autohelm-footnote${i}`);
        footnote.id = `autohelm-footnote-ref${i}`;
        footnote.removeAttribute("href");
        const numbers = p.firstElementChild || document.createElement("span");
        if(numbers!=p.firstElementChild) p.appendChild(numbers);
        const backref = document.createElement("a");
        backref.setAttribute("href","#"+footnote.id);
        backref.innerHTML = i;
        if(numbers.childNodes.length>0) {
            numbers.appendChild(new Text(", "))
        }
        numbers.appendChild(backref);
        if(p.children.length===1) {
            p.appendChild(new Text(" "));
            while(footnote.firstChild) {
                p.appendChild(footnote.firstChild)
            }
        }
        footnote.innerHTML = `<a href="${href || '#'+p.id}">${i}</a>`;
        if(!dom.querySelector("#"+p.id)) {
            dom.appendChild(p)
        }
    })
}

const init = ({tocSelector=".autohelm-toc",dom = document.body,footnotesTitle="Footnotes",footnotesLevel=1,directChildren,useSections}={}) => {
    buildFootnotes({dom,footnotesTitle,footnotesLevel});
    buildTOC({tocSelector,dom,directChildren,useSections});
}

const engage = (tocSelector = ".autohelm-toc") => {
    let tocPopup;
    document.body.addEventListener("click",(event) => {
        const tocEl = document.body.querySelector(tocSelector);
        if(tocEl) {
            if(event.target.classList.contains("autohelm-open-toc")) {
                event.preventDefault();
                tocEl.nextElementSibling.style.display = "block";
                event.target.style.display = "none";
                document.getElementsByClassName("autohelm-close-toc")[0].style.display = "inline";
                return;
            }
            if(event.target.classList.contains("autohelm-close-toc")) {
                event.preventDefault();
                tocEl.nextElementSibling.style.display = "none";
                event.target.style.display = "none";
                document.getElementsByClassName("autohelm-open-toc")[0].style.display = "inline";
                return;
            }
            const anchors = [...document.body.querySelectorAll(`.autohelm-toc a[href="#${tocEl.id}"]`)];
            if(anchors.includes(event.target)) {
                event.preventDefault();
                const {top,left} = event.target.getBoundingClientRect();
                if(!tocPopup) {
                    tocPopup = document.createElement("div");
                    const clone = tocEl.nextElementSibling.cloneNode(true);
                    tocPopup.classList.add("autohelm-toc-popup");
                    tocPopup.style.height = "300px";
                    tocPopup.style.zIndex = 100;
                    tocPopup.style.background = "whitesmoke";
                    tocPopup.style.opacity = 1
                    tocPopup.style.borderRadius = "5px";
                    clone.style.display = "block";
                    clone.style.maxHeight = "290px";
                    clone.style.marginTop = "5px";
                    clone.style.marginBottom = "5px";
                    clone.style.overflow = "auto";
                    tocPopup.appendChild(clone);
                    document.body.appendChild(tocPopup);
                }
                tocPopup.style.position = "absolute";
                tocPopup.style.top = top+300 > window.innerHeight ? top+window.scrollY-300+"px" : top+window.scrollY+"px";
                tocPopup.style.left =left+"px";
                tocPopup.style.display = "block";
            } else {
                if(tocPopup) {
                    tocPopup.style.display = "none";
                }
            }
        }
    })
}


export {buildTOC,buildFootnotes,init,engage}