# autohelm
A library to support standardized table of contents and footnote navigation in HTML files.

Early version of documentation ...

# Usage

```npm install --save @anywhichwya autohelm```

Add a heading in your HTML file with the class "autohelm-toc" at the location you want the TOC.

```html
<h1>Introduction</h1>
Some intro text

<h1 class="autohelm-toc">Table of Contents</h1>

<h1>Section One</h1>

Some content with a footnote.<span class="autohelm-footnote">a footnote</span>

<h1>Section Two</h1>
```


Add JavaScript something like this:

```javascript
import {buildFootnotes,buildTOC,engage} from "autohelm";

document.addEventListener((DOMContentLoaded) => {
    buildFootnotes(); // if your doc has footnotes, i.e. elements with the class autohelm-footnote (usually spans)
    buildTOC();
    engage();
})
```

See the site https://secst.org for an example of heavy use of Autohelm.

# History (Reverse Chronological Order)

2023-12-04 v0.0.25 Reduce size of open/close caret

2023-12-04 v0.0.24 First documented public version
