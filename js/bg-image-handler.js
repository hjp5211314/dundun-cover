
class BgImageHandler {
    constructor() {
        this.init();
    }

    init() {
        const bgImageUpload = document.getElementById('bgImageUpload');
        const clearBgImage = document.getElementById('clearBgImage');
        const bgImageEl = document.getElementById('bgImage');

        if (bgImageUpload) {
            bgImageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        bgImageEl.src = event.target.result;
                        bgImageEl.onload = () => {

                            if (window.renderer) {
                                window.renderer.render();
                            }
                        };
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (clearBgImage) {
            clearBgImage.addEventListener('click', () => {
                bgImageEl.src = '';
                if (bgImageUpload) {
                    bgImageUpload.value = '';
                }
                if (window.renderer) {
                    window.renderer.render();
                }
            });
        }
    }
}


window.bgImageHandler = new BgImageHandler();
