// ==UserScript==
// @name         calmer.cloud
// @namespace    https://calmer.cloud
// @version      1.2
// @description  blurs images and videos on webpages
// @author       Austin Draughon
// @match        https://*/*
// @icon         https://static.wixstatic.com/media/8cb6d1_8ad0e3bf9fad4d799f2ebffcebd4f136~mv2.png/v1/fill/w_686,h_686,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/medium_cloud.png
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/adraughon/calmer-cloud/main/tampermonkey/calmercloud.user.js
// @downloadURL  https://raw.githubusercontent.com/adraughon/calmer-cloud/main/tampermonkey/calmercloud.user.js
// ==/UserScript==

(function() {
    'use strict';

    const blurAmount = '30px';

    function calm(items) {
        items.forEach(item => {
            try {
                if (item.nodeType === Node.ELEMENT_NODE && !item.hasAttribute('show')) {
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
                    if (item.shadowRoot) {
                        calm(item.shadowRoot.querySelectorAll('*:not(#parent)'));
                        observeMutations(item.shadowRoot);
                    }
                    if (item.tagName === 'IFRAME') {
                        item.remove();
                    }
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

    setInterval(() => {
        calm(document.querySelectorAll('*'));
    }, 100);

    function checkModeration(texttocheck) {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://api.openai.com/v1/chat/completions",
            headers: {
                "Content-Type": "application/json",
                //"Authorization": "Bearer KEY" // Replace with your API key
            },
            data: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: texttocheck }],
                max_tokens: 500
            }),
            onload: function(response) {
                const result = JSON.parse(response.responseText);
                const messageContent = result.choices[0].message.content;
                console.log("Moderation Input:", texttocheck, "Moderation Result:", messageContent);
            },
            onerror: function(error) {
                console.error("Request failed:", error);
            }
        });
    }

    // End of file
})();
