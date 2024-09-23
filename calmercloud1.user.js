// ==UserScript==
// @name         calmer.cloud
// @namespace    https://calmer.cloud
// @version      1.5
// @description  blurs images and videos on webpages
// @author       Austin Draughon
// @match        https://*/*
// @icon         https://static.wixstatic.com/media/8cb6d1_8ad0e3bf9fad4d799f2ebffcebd4f136~mv2.png/v1/fill/w_686,h_686,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/medium_cloud.png
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/adraughon/calmer.cloud/raw/refs/heads/main/calmercloud1.user.js
// @downloadURL  https://github.com/adraughon/calmer.cloud/raw/refs/heads/main/calmercloud1.user.js
// ==/UserScript==

(function() {
    'use strict';

    const blurAmount = '30px';

    function calm(items) {
        items.forEach(item => {
            try {
                if (item.shadowRoot) {
                        calm(item.shadowRoot.querySelectorAll('*:not(#parent)'));
                        observeMutations(item.shadowRoot);
                }
                if (item.nodeType === Node.ELEMENT_NODE && !item.hasAttribute('calmed')) {
                    if (item.tagName === 'IMG' || item.tagName === 'IMAGE') {
                        item.style.filter = `blur(${blurAmount})`;
                    }
                    if (item.tagName === 'VIDEO') {
                        item.style.filter = `blur(${blurAmount})`;
                        item.setAttribute('muted', true);
                        item.removeAttribute('autoplay');
                    }
                    if (item.style.cssText.indexOf('background-image: url(') !== -1) {
                        item.style.filter = `blur(${blurAmount})`;
                    }
                    if (item.tagName === 'IFRAME') {
                        item.remove();
                    }
                    item.setAttribute('calmed',true);
                }
            } catch (error) {
                console.log('calmer.cloud error:', error);
            }
        });
    }

    function observeMutations(targetNode) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    calm(mutation.addedNodes);
                }
            });
        });

        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
    }

    console.log('calmer.cloud ready to go');

    window.addEventListener('load', function() {
        calm(document.querySelectorAll('*'));
        observeMutations(document.body);
    });

    window.addEventListener('scroll', () => {
        calm(document.querySelectorAll('*'));
    });
    window.scrollBy(0, 1);

    //setInterval(() => {
    //    calm(document.querySelectorAll('*'));
    //}, 100);


    // End of file
})();
