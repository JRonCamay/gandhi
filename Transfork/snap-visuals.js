window.Transfork = window.Transfork || {};

(function () {
    let container = null;

    function getContainer() {
        if (container) {
            return container;
        }

        container =
            document.createElement('div');

        container.className =
            'transfork-snap-visuals';

        Object.assign(
            container.style,
            {
                position: 'absolute',
                left: '0',
                top: '0',
                width: '0',
                height: '0',
                pointerEvents: 'none',
                zIndex: '999999'
            }
        );

        document.body.appendChild(container);

        return container;
    }

    function update() {
        getContainer();
    }

    function clear() {
        const targetContainer =
            getContainer();

        targetContainer.textContent =
            '';
    }

    window.Transfork.snapVisuals = {
        update,
        clear
    };
})();
