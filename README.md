# YA-SVG-JS-C
## Yet Another SVG+JavaScript Clock

![GitHub top language](https://img.shields.io/github/languages/top/FabienFellay/YA-SVG-JS-C)
![GitHub](https://img.shields.io/github/license/FabienFellay/YA-SVG-JS-C)

<https://fabienfellay.github.io/YA-SVG-JS-C/>

![Main YA-SVG-JS-C](/docs/YA_SVG_JS_C.png)

### Description
---
The files [YA_SVG_JS_C.svg](YA_SVG_JS_C.svg), [YA_SVG_JS_C_SL.svg](YA_SVG_JS_C_SL.svg) and [YA_SVG_JS_C_SD.svg](YA_SVG_JS_C_SD.svg) are some interactive SVG live clocks inspired (though different) by the Swiss Railway (**SBB CFF FFS**) iconic station clock by Hans Hilfiker.  
See <https://www.sbb.ch/>.

Those documents also feature vectorized portions of the free and open source font **Fira Sans** (light weight used).  
See <https://bboxtype.com/typefaces/FiraSans/>.

In its first original version, the hand colors are chosen according the the RGB canonical color scheme. It is a mnemonic: Red for seconds, Green for minutes and Blue for hours. Then, **Solarized-theme** light and dark versions were created in addition.  
See <https://ethanschoonover.com/solarized/>

A JavaScript dynamical simulation (file [engine_script.js](engine_script.js)) is running in order to animate the clock hands. **Click** on the hands to perturb them. **Ctrl+click** changes the direction of the perturbation. **Shift+click** increases the perturbation impulse amplitude. **Ctrl** and **Shift** can be combined. Files [options_continuous.js](options_continuous.js) and [options_stepping.js](options_stepping.js) are parameters files storing information about different dynamics behaviors.

Note that the script [engine_script.js](engine_script.js) on which the dynamical simulation is based uses **Math.js** (version 6.2.3), mainly because of various matrix operations not natively available with JavaScript (file [math.min.js](math.min.js)).  
See <https://mathjs.org/>

The SVG artworks themselves were designed using the free and open source vector graphics editor **Inkscape** (version 0.92.4).  
See <https://inkscape.org/>

### Interactive clocks
---
***Original (YA-SVG-JS-C)***

<https://fabienfellay.github.io/YA-SVG-JS-C/YA_SVG_JS_C.svg>

<div style="text-align: center;">
<object data="https://fabienfellay.github.io/YA-SVG-JS-C/YA_SVG_JS_C.svg" height="650" width="650" type="image/svg+xml">
</object>
</div>

***Solarized Light (YA-SVG-JS-C-SL)***

<https://fabienfellay.github.io/YA-SVG-JS-C/YA_SVG_JS_C_SL.svg>

<div style="text-align: center;">
<object data="https://fabienfellay.github.io/YA-SVG-JS-C/YA_SVG_JS_C_SL.svg" height="650" width="650" type="image/svg+xml">
</object>
</div>

***Solarized Dark (YA-SVG-JS-C-SD)***

<https://fabienfellay.github.io/YA-SVG-JS-C/YA_SVG_JS_C_SD.svg>

<div style="text-align: center;">
<object data="https://fabienfellay.github.io/YA-SVG-JS-C/YA_SVG_JS_C_SD.svg" height="650" width="650" type="image/svg+xml">
</object>
</div>

### How to use
---
First, download the following common files (right-click and _save as_ is OK):

- [math.min.js](math.min.js)  
- [engine_script.js](engine_script.js)

Then, for the original and Solarized Light versions, download files (a continuous sweeping dynamic has been chosen for those versions):

- [options_continuous.js](options_continuous.js)  
- [YA_SVG_JS_C.svg](YA_SVG_JS_C.svg)  
- [YA_SVG_JS_C_SL.svg](YA_SVG_JS_C_SL.svg)

Finally, assuming all the later files are in the same folder, simply open the SVG files directly with a modern browser (Firefox, Chrome, ...) and the interactive clocks should be displayed and running fine.

For the Solarized Dark version, the same principle applies but use the following files instead (a stepping dynamic has been chosen for this version):

- [options_stepping.js](options_stepping.js)  
- [YA_SVG_JS_C_SD.svg](YA_SVG_JS_C_SD.svg)

In addition, the following simple html files are only provided as examples on how to embed the interactive SVG clocks directly in some html pages:

- [YA_SVG_JS_C.html](YA_SVG_JS_C.html)  
- [YA_SVG_JS_C_SL.html](YA_SVG_JS_C_SL.html)  
- [YA_SVG_JS_C_SD.html](YA_SVG_JS_C_SD.html)  
- [YA_SVG_JS_C_SLD.html](YA_SVG_JS_C_SLD.html)

### History
---
- 04.10.2017: Initial Design

- 06.10.2017: Design Update (the initial version was identical to the **SBB CFF FFS** clock, leading to potential copyright issues)

- 28.10.2019: Small Design Tweak (centering of the 'SWISS MADE' seal, correct artwork title 'JavaScript' with a capital S). Typos corrected in the engine script and adaptation to the latest **Math.js** version. **Solarized-theme** versions introduced. Define separate options files for different dynamics. Modify SVG dimensions to % unit and add the viewbox property in order to allow re-scalable
svg (with active script) in html. Migration to **GitHub**.

Old version website  
[https://inkscape.org/en/~fabien.fellay/★yet-another-svgjavascript-clock](https://inkscape.org/~fabien.fellay/%E2%98%85yet-another-svgjavascript-clock)

---
*Copyright &copy; 2017-2019 Fabien Fellay.*

The script [engine_script.js](engine_script.js) along with its parameters files [options_continuous.js](options_continuous.js) and [options_stepping.js](options_stepping.js) are licensed under the GNU General Public License version 3 (GPL-3.0).  
<https://opensource.org/licenses/GPL-3.0>  
<https://www.gnu.org/licenses/>

The SVG artworks are licensed under the Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).  
<https://creativecommons.org/licenses/by-sa/4.0/>

The math.js library is licensed under the Apache License 2.0.  
<https://www.apache.org/licenses/>
