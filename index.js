const toTOC = (dom,headings,toc,previousLevel,previousHeading) => {
    const originalHeadings = [...headings],
        ul = document.createElement("ol");
    let previousLI;
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
                navspan = document.createElement("span"),
                tocspan = document.createElement('span'),
                nextHeading = headings[1];
            navspan.classList.add("autohelm-nav");
            navspan.classList.add("autohelm-nav-up-down");
            tocspan.classList.add("autohelm-nav");
            tocspan.classList.add("autohelm-toc");
            navspan.innerHTML = (previousHeading ? ` <a href="#${previousHeading.id}">&uarr;</a>` : '') + (nextHeading && !headingEl.classList.contains("toc") ?  ` <a href="#${nextHeading.id}">&darr;</a>` :'');
            tocspan.innerHTML = `<a href="#${toc.id}">&#9783;</a> `;
            previousHeading = headings.shift();
            headingEl.insertBefore(tocspan,headingEl.firstChild);
            headingEl.appendChild(navspan);
        }
        //previousLI = li;
    }
    return ul;
}

const buildTOC = ({tocSelector=".toc",dom = document.body}={}) => {
    const tocEl = dom.querySelector(tocSelector);
    if(!tocEl) {
        throw new Error(`No TOC element found for "${tocSelector}`);
    }
    for(let i=0;i<=6;i++) {
        [...dom.querySelectorAll("h"+i)].forEach((heading) => {
            if(heading.id.length===0) {
                const text =  heading.textContent.replace(/[~`!@#$%\^&*()\-_=+\[{\]}\\|;.",<.>]/g,"")
                    .split(" ").map((word) => word.trim().toLowerCase()).join("-")
                heading.setAttribute("id",text);
            }
            heading.classList.add("autohelm-heading")
        })
    }
    const headings = [...dom.querySelectorAll(".autohelm-heading")];
    while(!headings[0]?.classList.contains("toc") && headings.length>0) {
        headings.shift();
    }
    const toc = toTOC(dom,headings,tocEl);
    tocEl.insertAdjacentElement("afterend",toc);
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

const init = ({tocSelector=".toc",dom = document.body,footnotesTitle="Footnotes",footnotesLevel=1}={}) => {
    buildFootnotes({dom,footnotesTitle,footnotesLevel});
    buildTOC({tocSelector,dom});
}

const engage = () => {
    let tocClone;
    document.body.addEventListener("click",(event) => {
        const tocEl = document.body.querySelector(".toc");
        if(tocEl) {
            const anchors = [...document.body.querySelectorAll(`.autohelm-toc a[href="#${tocEl.id}"]`)];
            if(anchors.includes(event.target) && !tocEl.contains(event.target)) {
                event.preventDefault();
                const {top,left} = event.target.getBoundingClientRect();
                if(!tocClone) {
                    tocClone = tocEl.nextElementSibling.cloneNode(true);
                    tocClone.classList.add("autohelm-toc-popup");
                    tocClone.style.position = "absolute";
                    tocClone.style.height = tocClone.style.maxHeight = "300px";
                    tocClone.style.zIndex = 100;
                    tocClone.style.background = "whitesmoke";
                    tocClone.style.opacity = 1;
                    tocClone.style.overflow = "auto";
                    tocClone.classList.add("autohelm-toc-popup");
                    tocClone.style.position = "absolute";
                    document.body.appendChild(tocClone);
                }
                tocClone ||= tocEl.nextElementSibling.cloneNode(true);
                tocClone.style.height = tocClone.style.maxHeight = "300px";
                tocClone.style.top = top+300 > window.innerHeight ? top+window.scrollY-300+"px" : top+window.scrollY+"px";
                tocClone.style.left =left+"px";
                tocClone.style.display = "block";
            } else {
                if(tocClone) {
                    tocClone.style.display = "none";
                }
            }
        }
    })
}


export {buildTOC,buildFootnotes,init,engage}