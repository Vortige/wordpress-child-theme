(function () {
    const BOX_SELECTOR = '#boxzilla-4471';
    const BOX_MAX_HEIGHT = 860;
    const BOX_VIEWPORT_GAP = 20;
    const visibilityState = new WeakMap();

    function isVisible(element) {
        if (!element) {
            return false;
        }

        const styles = window.getComputedStyle(element);
        return styles.display !== 'none' && styles.visibility !== 'hidden' && element.offsetHeight > 0;
    }

    function setImportantStyle(element, property, value) {
        element.style.setProperty(property, value, 'important');
    }

    function clearLegacyInlineOverrides(box) {
        const marginTopValue = box.style.getPropertyValue('margin-top').trim();
        const marginTopPriority = box.style.getPropertyPriority('margin-top');
        if ((marginTopPriority === 'important' || marginTopPriority === '') && (marginTopValue === '10px' || marginTopValue === '-16px')) {
            box.style.removeProperty('margin-top');
        }
    }

    function keepBoxCentered(box) {
        if (!box.classList.contains('boxzilla-center')) {
            return;
        }

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const targetHeight = Math.min(BOX_MAX_HEIGHT, Math.max(0, viewportHeight - BOX_VIEWPORT_GAP));
        const marginTop = Math.max(0, Math.round((viewportHeight - targetHeight) / 2));

        setImportantStyle(box, 'margin-top', `${marginTop}px`);
    }

    function resetModalState(box) {
        box.scrollTop = 0;

        const resetScrollSelectors = ['.boxzilla-content', '.vz-modal', '.vz-modal__form'];
        resetScrollSelectors.forEach((selector) => {
            const node = box.querySelector(selector);
            if (node) {
                node.scrollTop = 0;
            }
        });
    }

    function enforceBoxzillaScroll(box) {
        clearLegacyInlineOverrides(box);
        setImportantStyle(box, 'height', 'min(860px, calc(100vh - 20px))');
        setImportantStyle(box, 'max-height', 'calc(100vh - 20px)');
        setImportantStyle(box, 'overflow-y', 'auto');
        setImportantStyle(box, 'overflow-x', 'hidden');
        setImportantStyle(box, 'border-radius', '18px');
        box.style.setProperty('-webkit-overflow-scrolling', 'touch');
        box.style.setProperty('overscroll-behavior', 'contain');
        box.style.setProperty('touch-action', 'pan-y');

        const boxContent = box.querySelector('.boxzilla-content');
        if (boxContent) {
            setImportantStyle(boxContent, 'height', 'auto');
            setImportantStyle(boxContent, 'max-height', 'none');
            setImportantStyle(boxContent, 'overflow', 'visible');
        }

        box.querySelectorAll('.embedded-booking').forEach((node) => {
            setImportantStyle(node, 'height', 'auto');
            setImportantStyle(node, 'max-height', 'none');
            setImportantStyle(node, 'min-height', '0');
        });

        const selectors = [
            { selector: '.vz-modal', overflow: 'hidden', borderRadius: '18px', height: 'auto', maxHeight: 'none', minHeight: '100%' },
            { selector: '.vz-modal__grid', overflow: 'visible', height: 'auto', maxHeight: 'none', minHeight: '100%' },
            { selector: '.vz-modal__form', overflow: 'visible', height: 'auto', maxHeight: 'none', minHeight: '0' }
        ];

        selectors.forEach(({ selector, overflow, borderRadius, height, maxHeight, minHeight }) => {
            const node = box.querySelector(selector);
            if (!node) {
                return;
            }

            setImportantStyle(node, 'max-height', maxHeight || 'none');
            setImportantStyle(node, 'min-height', minHeight || '0');
            setImportantStyle(node, 'height', height || 'auto');
            setImportantStyle(node, 'overflow', overflow);

            if (borderRadius) {
                setImportantStyle(node, 'border-radius', borderRadius);
            }
        });

        box.querySelectorAll('iframe').forEach((iframe) => {
            setImportantStyle(iframe, 'display', 'block');
            setImportantStyle(iframe, 'width', '100%');
            iframe.setAttribute('scrolling', 'yes');

            const heightValue = iframe.style.getPropertyValue('height').trim();
            const heightPriority = iframe.style.getPropertyPriority('height');
            if (heightPriority === 'important' && heightValue === 'auto') {
                iframe.style.removeProperty('height');
            }

            const maxHeightValue = iframe.style.getPropertyValue('max-height').trim();
            const maxHeightPriority = iframe.style.getPropertyPriority('max-height');
            if (maxHeightPriority === 'important' && maxHeightValue === 'none') {
                iframe.style.removeProperty('max-height');
            }

            const minHeightValue = iframe.style.getPropertyValue('min-height').trim();
            const minHeightPriority = iframe.style.getPropertyPriority('min-height');
            if (minHeightPriority === 'important' && (minHeightValue === '0' || minHeightValue === '0px')) {
                iframe.style.removeProperty('min-height');
            }
        });

    }

    function applyFix() {
        document.querySelectorAll(BOX_SELECTOR).forEach((box) => {
            const visible = isVisible(box);
            const wasVisible = visibilityState.get(box) === true;

            if (visible) {
                if (!wasVisible) {
                    resetModalState(box);
                }

                keepBoxCentered(box);
                enforceBoxzillaScroll(box);
                visibilityState.set(box, true);
                return;
            }

            visibilityState.set(box, false);
        });
    }

    let frame = null;
    function scheduleApply() {
        if (frame !== null) {
            return;
        }

        frame = window.requestAnimationFrame(function () {
            frame = null;
            applyFix();
        });
    }

    document.addEventListener('DOMContentLoaded', scheduleApply);
    window.addEventListener('load', scheduleApply);
    window.addEventListener('resize', scheduleApply);
    window.addEventListener('orientationchange', scheduleApply);
    document.addEventListener('click', scheduleApply, true);

    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
})();