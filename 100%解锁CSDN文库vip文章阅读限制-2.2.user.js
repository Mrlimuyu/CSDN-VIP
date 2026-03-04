// ==UserScript==
// @name         100%解锁CSDN文库vip文章阅读限制
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  CSDN博客/文库阅读全文，去除VIP文章遮罩，免登录复制，展开代码块
// @author       Mrlimuyu
// @match        *://blog.csdn.net/*
// @match        *://wenku.csdn.net/*
// @match        *://download.csdn.net/*
// @match        *://*.blog.csdn.net/*
// @run-at       document-end
// @grant        none
// @license      yagiza
// ==/UserScript==

(function() {
    'use strict';

    // ==================== 1. 注入全局CSS样式 ====================
    const injectCSS = () => {
        const style = document.createElement('style');
        style.textContent = `
            /* 移除遮罩和阻挡层 */
            .hide-article-box,
            .hide-article-pos,
            .login-mark,
            .login-mask,
            .passport-login-mark,
            .mask-layer,
            .pay-mask,
            .vip-mask,
            .vip-caise,
            .column-mask,
            .passport-login-container,
            .passport-login-tip-container,
            .readall_box,
            .btn-readmore,
            #btn-readmore,
            .article-show-more,
            .open.vip,
            .article_pay_box,
            .fans_read_more,
            .follow-nickName-,
            .csdn-common-login-tip,
            .common-login-tip-container {
                display: none !important;
                height: 0 !important;
                overflow: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }

            /* 展开文章内容 - 博客 */
            #article_content,
            .article_content,
            .article-box .cont,
            .article-box .cont.first-show,
            .read-content .main-cont,
            .article-container .content,
            .htmledit_views,
            .markdown_views {
                max-height: none !important;
                height: auto !important;
                overflow: visible !important;
            }

            /* 启用文本选择和复制 */
            body, body *,
            .article_content, .article_content *,
            #article_content, #article_content *,
            .htmledit_views, .htmledit_views *,
            .markdown_views, .markdown_views *,
            pre, pre *, code, code * {
                -webkit-user-select: auto !important;
                -moz-user-select: auto !important;
                -ms-user-select: auto !important;
                user-select: auto !important;
            }

            /* 展开代码块 */
            pre.set-code-hide,
            .hide-preCode-box {
                max-height: none !important;
                height: auto !important;
                overflow: visible !important;
            }
            .hide-preCode-bt {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    };

    // ==================== 2. 移除遮罩层和限制元素 ====================
    const removeMasks = () => {
        // 遮罩层选择器（覆盖博客和文库）
        const maskSelectors = [
            '.hide-article-box',
            '.hide-article-pos',
            '.login-mark',
            '.login-mask',
            '.passport-login-mark',
            '.mask-layer',
            '.pay-mask',
            '.vip-mask',
            '.vip-caise',
            '.column-mask',
            '.passport-login-container',
            '.passport-login-tip-container',
            '.readall_box',
            '.btn-readmore',
            '#btn-readmore',
            '.article-show-more',
            '.article_pay_box',
            '.fans_read_more',
            '.csdn-common-login-tip',
            '.common-login-tip-container',
            '#mainBox > main > div.hide-article-box',
            '.open.vip'
        ];

        maskSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.dataset.csdnRemoved) {
                    el.remove();
                    el.dataset.csdnRemoved = 'true';
                }
            });
        });

        // 移除 follow-text 关注按钮区域
        const followText = document.querySelector('.follow-text');
        if (followText && followText.parentElement && followText.parentElement.parentElement) {
            followText.parentElement.parentElement.removeChild(followText.parentElement);
        }
    };

    // ==================== 3. 展开文章内容 ====================
    const expandContent = () => {
        // 博客文章内容（ID选择器）
        const articleById = document.getElementById('article_content');
        if (articleById) {
            articleById.removeAttribute('style');
            articleById.style.maxHeight = 'none';
            articleById.style.height = 'auto';
            articleById.style.overflow = 'visible';
        }

        // 文库/其他内容选择器
        const contentSelectors = [
            '.article_content',
            '.article-box .cont',
            '.article-box .cont.first-show',
            '.read-content .main-cont',
            '.article-container .content',
            '.csdn-tracking-statistics',
            '.htmledit_views',
            '.markdown_views'
        ];

        contentSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.maxHeight = 'none';
                el.style.height = 'auto';
                el.style.overflow = 'visible';
            });
        });
    };

    // ==================== 4. 展开折叠的代码块 ====================
    const expandCodeBlocks = () => {
        // 移除代码折叠按钮并展开
        document.querySelectorAll('.hide-preCode-bt').forEach(btn => {
            try { btn.click(); } catch(e) {}
        });

        document.querySelectorAll('pre.set-code-hide, .hide-preCode-box').forEach(el => {
            el.style.maxHeight = 'none';
            el.style.height = 'auto';
            el.style.overflow = 'visible';
            el.classList.remove('set-code-hide');
        });
    };

    // ==================== 5. 解锁复制功能 ====================
    const enableCopy = () => {
        // 移除 oncopy 事件
        document.body.oncopy = null;
        document.oncopy = null;
        document.body.oncontextmenu = null;

        // 拦截 copy 事件监听器
        if (!EventTarget.prototype._originalAddEventListener) {
            EventTarget.prototype._originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (type === 'copy' || type === 'cut' || type === 'selectstart') {
                    return; // 阻止绑定复制/剪切/选择限制事件
                }
                this._originalAddEventListener(type, listener, options);
            };
        }

        // 移除 contenteditable="false" 限制
        document.querySelectorAll('[contenteditable="false"]').forEach(el => {
            el.setAttribute('contenteditable', 'true');
        });

        // 移除 onselectstart/oncopy 属性
        document.querySelectorAll('[onselectstart]').forEach(el => {
            el.removeAttribute('onselectstart');
        });
        document.querySelectorAll('[oncopy]').forEach(el => {
            el.removeAttribute('oncopy');
        });
    };

    // ==================== 6. 移除登录弹窗 ====================
    const removeLoginPopup = () => {
        const loginSelectors = [
            '.passport-login-container',
            '.passport-login-tip-container',
            '.csdn-common-login-tip',
            '.common-login-tip-container'
        ];
        loginSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });

        // 移除 body 上的 overflow:hidden（登录弹窗导致的滚动禁止）
        if (document.body.style.overflow === 'hidden') {
            document.body.style.overflow = 'auto';
        }
    };

    // ==================== 主执行函数 ====================
    const executeAll = () => {
        removeMasks();
        expandContent();
        expandCodeBlocks();
        enableCopy();
        removeLoginPopup();
    };

    // ==================== 初始化 ====================
    // 立即注入CSS
    if (document.head) {
        injectCSS();
    } else {
        document.addEventListener('DOMContentLoaded', injectCSS);
    }

    // 页面Ready时执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeAll);
    } else {
        executeAll();
    }

    // 页面完全加载后再执行一次
    window.addEventListener('load', () => {
        setTimeout(executeAll, 500);
        setTimeout(executeAll, 1500);
        setTimeout(executeAll, 3000);
    });

    // MutationObserver 监视DOM变化（防抖处理）
    let debounceTimer = null;
    const observerCallback = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(executeAll, 300);
    };

    const startObserver = () => {
        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    if (document.body) {
        startObserver();
    } else {
        document.addEventListener('DOMContentLoaded', startObserver);
    }
})();