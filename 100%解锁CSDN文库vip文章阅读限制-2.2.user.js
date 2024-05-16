// ==UserScript==
// @name         100%解锁CSDN文库vip文章阅读限制
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  CSDN文库阅读全文，去除VIP文章遮罩
// @author       Mrlimuyu
// @match        *://*.csdn.net/*
// @grant        none
// @license      yagiza
// @downloadURL https://update.greasyfork.org/scripts/495150/100%25%E8%A7%A3%E9%94%81CSDN%E6%96%87%E5%BA%93vip%E6%96%87%E7%AB%A0%E9%98%85%E8%AF%BB%E9%99%90%E5%88%B6.user.js
// @updateURL https://update.greasyfork.org/scripts/495150/100%25%E8%A7%A3%E9%94%81CSDN%E6%96%87%E5%BA%93vip%E6%96%87%E7%AB%A0%E9%98%85%E8%AF%BB%E9%99%90%E5%88%B6.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const adjustArticle = () => {
        // 移除遮罩层和限制高度的内容
        document.querySelectorAll('.hide-article-box, .login-mark, .mask, .vip-caise').forEach(el => el.remove());

        // 展开被限制高度的内容
        const articleContainer = document.querySelector('.article_content');
        if (articleContainer) {
            articleContainer.style.maxHeight = 'none';
            articleContainer.style.height = 'auto';
        }
    };

    // 启用复制功能
    const enableCopy = () => {
        document.body.oncopy = null;
        document.oncopy = null;
        document.querySelectorAll('*').forEach(el => {
            el.style.userSelect = 'auto';
            el.style.webkitUserSelect = 'auto';
            el.style.msUserSelect = 'auto';
            el.style.mozUserSelect = 'auto';
        });
    };

    // 使用MutationObserver来监视文档的变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                adjustArticle();
                enableCopy();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 页面加载时尝试执行一次
    window.addEventListener('load', () => {
        adjustArticle();
        enableCopy();
    });
})();