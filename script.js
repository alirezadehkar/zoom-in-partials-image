(function() {
    const config = {
        zoomClass: 'partials-zoom',
        zoomInCursor: 'zoom-in',
        zoomOutCursor: 'zoom-out'
    };
    
    let zoomedElements = new Map();
    
    const pixelRatio = window.devicePixelRatio || 1;

    function initZoom() {
        const zoomableElements = document.querySelectorAll('.' + config.zoomClass);
        
        zoomableElements.forEach(element => {
            element.style.cursor = config.zoomInCursor;
            
            let defaultDimensions = {
                width: 'auto',
                height: '100%'
            };
            
            if (element.complete) {
                setDefaultDimensions(element, defaultDimensions);
            } else {
                element.onload = function() {
                    setDefaultDimensions(element, defaultDimensions);
                };
            }
            
            zoomedElements.set(element, {
                isZoomed: false,
                defaultDimensions: defaultDimensions
            });
            
            element.addEventListener('click', handleZoomToggle);
        });
    }
    
    function setDefaultDimensions(element, defaultDimensions) {
        if (element.naturalWidth / element.naturalHeight > window.innerWidth / window.innerHeight) {
            defaultDimensions.width = '100%';
            defaultDimensions.height = 'auto';
        }
        
        element.style.width = defaultDimensions.width;
        element.style.height = defaultDimensions.height;
    }
    
    function handleZoomToggle(event) {
        const element = event.currentTarget;
        const elementData = zoomedElements.get(element);
        
        if (!elementData) return;
        
        if (elementData.isZoomed) {
            unzoomElement(element, elementData);
        } else {
            zoomElement(element, elementData, event);
        }
    }
    
    function zoomElement(element, elementData, event) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const frameWidth = element.naturalWidth / pixelRatio;
        const frameHeight = element.naturalHeight / pixelRatio;
        
        const elementFrameWidth = element.offsetWidth / 3;
        const elementFrameHeight = frameHeight * (elementFrameWidth / frameWidth);
        
        const clickX = event.clientX - Math.round((windowWidth - element.offsetWidth) / 2);
        const clickY = windowHeight - event.clientY;
        
        if (clickY <= 0) return;
        
        elementData.isZoomed = true;
        
        let zoomedFrameWidth, zoomedFrameHeight;
        
        if (frameWidth / frameHeight > 1.7) {
            zoomedFrameWidth = windowWidth;
            zoomedFrameHeight = frameHeight * (zoomedFrameWidth / frameWidth);
        } else {
            zoomedFrameHeight = windowHeight;
            zoomedFrameWidth = frameWidth * (zoomedFrameHeight / frameHeight);
        }
        
        element.style.height = 'auto';
        element.style.width = zoomedFrameWidth * 3 + 'px';
        
        const ySteps = Math.min(Math.floor(clickY / elementFrameHeight), 2);
        
        element.style.position = 'absolute';
        element.style.left = -1 * Math.floor(clickX / elementFrameWidth) * zoomedFrameWidth + (windowWidth - zoomedFrameWidth) / 2 + 'px';
        element.style.bottom = -1 * (ySteps * zoomedFrameHeight) + (windowHeight - zoomedFrameHeight) / 2 + 'px';
        element.style.cursor = config.zoomOutCursor;
        
        element.classList.add('zoomed');
    }
    
    function unzoomElement(element, elementData) {
        elementData.isZoomed = false;
        
        element.style.width = elementData.defaultDimensions.width;
        element.style.height = elementData.defaultDimensions.height;
        element.style.position = '';
        element.style.left = '';
        element.style.bottom = '';
        element.style.cursor = config.zoomInCursor;
        
        element.classList.remove('zoomed');
    }
    
    function setupObserver() {
        const observer = new MutationObserver(function(mutations) {
            let needsInit = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    needsInit = true;
                }
            });
            
            if (needsInit) {
                initZoom();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        initZoom();
        setupObserver();
        
        window.addEventListener('resize', function() {
            zoomedElements.forEach(function(data, element) {
                if (data.isZoomed) {
                    unzoomElement(element, data);
                }
                
                setDefaultDimensions(element, data.defaultDimensions);
            });
        });
    });
})();