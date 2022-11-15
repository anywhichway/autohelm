const patchHeadings = (node) => {
    const footnotes = node.querySelector('.footnotes');
    if(footnotes) {
        const heading = document.createElement("h1");
        heading.innerText = "Footnotes";
        footnotes.parentElement.insertBefore(heading,footnotes);
    }
    [...node.getElementsByClassName("data-footnote-backref")].forEach((a) => {
        a.setAttribute("target","_self");
    })
    for(let i=1;i<10;i++) {
        [...node.querySelectorAll("h"+i)].forEach((heading,i,headings) => {
            if(!isSlotted(heading)) {
                if (!heading.getAttribute("id")) {
                    heading.setAttribute("id", heading.innerText.toLowerCase().replace(/\s/g, "-"))
                }
                heading.setAttribute("title",heading.innerText)
                heading.classList.add("ah-heading");
            }
        });
    }
    const toc = node.querySelector("#toc")||node.querySelector("#table-of-contents");
    let floatingToc;
    if(toc) {
        const footnotes = node.querySelector("#footnotes");
        if(footnotes && !toc.nextElementSibling.querySelector('a[href="#footnotes"]')) {
            const li = document.createElement("li");
            li.classList.add("toc-item");
            li.innerHTML = '<a href="#footnotes">Footnotes</a>';
            toc.nextElementSibling.appendChild(li);
        }
        convertList(toc.nextElementSibling,"OL","toc-item");
        floatingToc = toc.nextElementSibling.cloneNode(true);
        const tocLink = document.createElement("li");
        tocLink.setAttribute("value","0");
        tocLink.innerHTML = `<a href="#${toc.id}" target="_self">${toc.innerText}</a>`;
        floatingToc.insertBefore(tocLink,floatingToc.firstChild);
        floatingToc.setAttribute("id","ah-floating-toc");
        floatingToc.style.display = "none";
        floatingToc.style.paddingTop = "5px";
        floatingToc.style.paddingRight = "5px";
        floatingToc.style.paddingBottom = "5px";
        floatingToc.style.zIndex = 100;
        floatingToc.style.opacity = 1;
        floatingToc.style.backgroundColor = "white";
        floatingToc.style.border = "1px solid gray";
        floatingToc.style.maxHeight = "250px";
        floatingToc.style.overflow = "auto";
        floatingToc.style.position = "absolute";
        node.appendChild(floatingToc);
    }
    let tocOn;
    [...node.querySelectorAll(".ah-heading")].forEach((heading,i,headings) => {
        if(i>0) {
            const previous = document.createElement("a");
            previous.setAttribute("target","_self");
            previous.setAttribute("href","#"+headings[i-1].id);
            previous.setAttribute("title",headings[i-1].getAttribute("title"));
            previous.classList.add("ah-nav");
            previous.innerHTML = "&uarr;";
            heading.appendChild(previous);
        }
        if(i<headings.length-1) {
            const next = document.createElement("a");
            next.setAttribute("target","_self");
            next.setAttribute("href","#"+headings[i+1].id);
            next.setAttribute("title",headings[i+1].getAttribute("title"));
            next.classList.add("ah-nav");
            next.innerHTML = "&darr;";
            heading.appendChild(next);
        }
        if((tocOn || heading.id==="toc" || heading.id==="table-of-contents") && floatingToc) {
            const toc = document.createElement("span");
            toc.classList.add("ah-toc-icon");
            toc.innerHTML = "&#9783";
            toc.style.marginRight = ".25em";
            heading.insertBefore(toc,heading.firstChild);
        }
        if(heading.id==="toc" || heading.id==="table-of-contents") {
            tocOn = true;
        }
    })
}

const activate = (node) => {
    [...node.querySelectorAll("li.toc-item a")].forEach((a) => {
        a.setAttribute("target","_self");
    })
    node.addEventListener("click",(event) => {
        const target = event.target;
        if(target.classList.contains("ah-toc-icon")) {
            const floatingToc = node.querySelector("#ah-floating-toc");
            event.preventDefault();
            event.stopImmediatePropagation();
            const {x,y,height} = target.getBoundingClientRect(),
                top =  (y+height+250+window.scrollY) > floatingToc.parentElement.clientHeight ? ((y - 250) - height)+window.scrollY:  (y+height+window.scrollY);
            floatingToc.style.left = x+"px";
            floatingToc.style.top = top+"px";
            floatingToc.style.display = "block";
        }
    });
    node.addEventListener("scroll",() => {
        const floatingToc = node.querySelector("#ah-floating-toc");
        if(floatingToc) floatingToc.style.display="none";
    })
    node.addEventListener("click",() => {
        const floatingToc = node.querySelector("#ah-floating-toc");
        if(floatingToc) floatingToc.style.display="none";
    });
    node.classList.add("ah-list"); // toc-list?
}

const isSlotted = (node) => {
    return node.tagName==="SLOT" || (node.parentElement && isSlotted(node.parentElement))
}

const convertList = (list,to=list.tagName==="OL" ? "UL" : "OL",className) => {
    [...list.children].forEach((child) => {
        convertList(child,to,className);
    });
    if(["OL","UL"].includes(list.tagName) && list.tagName!==to) {
        const replacement = document.createElement(to);
        if(className) {
            replacement.classList.add(className);
            [...list.querySelectorAll("li")].forEach((li) => {
                li.classList.add(className);
            })
        }
        while(list.firstChild) replacement.appendChild(list.firstChild);
        list.replaceWith(replacement)
    }
}
const AutoHelm = {
    patchHeadings,activate
}
export {AutoHelm as default}