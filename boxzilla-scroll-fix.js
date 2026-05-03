(function () {
    const BOX_SELECTOR = '.boxzilla';

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

    function enforceBoxzillaScroll(box) {
        setImportantStyle(box, 'margin-top', '10px');
        setImportantStyle(box, 'max-height', 'calc(100vh - 20px)');
        setImportantStyle(box, 'overflow-y', 'auto');
        setImportantStyle(box, 'overflow-x', 'hidden');
        box.style.setProperty('-webkit-overflow-scrolling', 'touch');
        box.style.setProperty('overscroll-behavior', 'contain');
        box.style.setProperty('touch-action', 'pan-y');

        const boxContent = box.querySelector('.boxzilla-content');
        if (boxContent) {
            setImportantStyle(boxContent, 'max-height', 'none');
            setImportantStyle(boxContent, 'overflow', 'visible');
        }

        const selectors = ['.vz-modal', '.vz-modal__grid', '.vz-modal__form'];
        selectors.forEach((selector) => {
            const node = box.querySelector(selector);
            if (!node) {
                return;
            }

            setImportantStyle(node, 'max-height', 'none');
            setImportantStyle(node, 'min-height', '0');
            setImportantStyle(node, 'height', 'auto');
            setImportantStyle(node, 'overflow', 'visible');
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
            if (isVisible(box)) {
                enforceBoxzillaScroll(box);
            }
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