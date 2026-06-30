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
        const targetContainer =
            getContainer();

        clear();

        const data =
            arguments[0];

        if (
            !data ||
            !data.candidates
        ) {
            return;
        }

        const canvas =
            document.querySelector('canvas');

        if (
            !canvas ||
            !window.vm ||
            !window.vm.runtime ||
            !window.vm.runtime.renderer
        ) {
            return;
        }

        const rect =
            canvas.getBoundingClientRect();

        const nativeSize =
            window.vm.runtime.renderer.getNativeSize();

        const drawn =
            [];

        Object.keys(data.candidates)
            .slice(0, 4)
            .forEach(
                key => {
                    const bounds =
                        data.candidates[key];

                    if (
                        !bounds ||
                        drawn.indexOf(bounds) !== -1
                    ) {
                        return;
                    }

                    drawn.push(bounds);

                    const box =
                        document.createElement('div');

                    const left =
                        rect.left +
                        (
                            (
                                bounds.left +
                                nativeSize[0] / 2
                            ) /
                            nativeSize[0]
                        ) *
                        rect.width;

                    const right =
                        rect.left +
                        (
                            (
                                bounds.right +
                                nativeSize[0] / 2
                            ) /
                            nativeSize[0]
                        ) *
                        rect.width;

                    const top =
                        rect.top +
                        (
                            (
                                nativeSize[1] / 2 -
                                bounds.top
                            ) /
                            nativeSize[1]
                        ) *
                        rect.height;

                    const bottom =
                        rect.top +
                        (
                            (
                                nativeSize[1] / 2 -
                                bounds.bottom
                            ) /
                            nativeSize[1]
                        ) *
                        rect.height;

                    Object.assign(
                        box.style,
                        {
                            position: 'absolute',
                            left: left + 'px',
                            top: top + 'px',
                            width: (right - left) + 'px',
                            height: (bottom - top) + 'px',
                            border: '2px solid orange',
                            boxSizing: 'border-box',
                            pointerEvents: 'none'
                        }
                    );

                    targetContainer.appendChild(box);
                }
            );

        if (!drawn.length) {
            clear();
        }
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
