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

# Styling

These are the suggested styles to add to you stylesheet

```css
span.autohelm-nav a {text-decoration: unset; color:unset}
span.autohelm-nav-up-down a {font-size: 80%; vertical-align:text-top}
span.autohelm-footnote {position:relative; font-size:small; top:-.5em}
```

See the site https://secst.org for an example of heavy use of Autohelm.

# History (Reverse Chronological Order)

2022-12-22 v0.0.35 Corrected history dates, they were set to 2023. Added styling info to README.

2022-12-17 v0.0.34 Remove TOC from the TOC itself.

2022-12-17 v0.0.33 Fixed issue with previous and next arrows navigating to wrong place.

2022-12-17 v0.0.32 Further improvements to section heading selection.

2022-12-17 v0.0.31 Improved useSections to only select headers that are the first child of a section.

2022-12-16 v0.0.30 Removed some secondary heading filtering.

2022-12-16 v0.0.29 Added option 'useSections' which will only use headings that are the first child of a section element.

2022-12-08 v0.0.28 Added option 'directChildren' to init in addition the buildTOC.

2022-12-08 v0.0.27 Added option 'directChildren' to restrict headings to only those that are direct children of the node being searched for headings.

2022-12-04 v0.0.25 Reduce size of open/close caret

2022-12-04 v0.0.24 First documented public version
