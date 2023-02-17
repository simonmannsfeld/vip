/*
 * VIP - Vanilla Icon Picker v1.0.0
 * Repository: https://github.com/simonmannsfeld/vip
 * Author: Simon Mannsfeld
 *
 * Released under the MIT license
 */

(function (root, factory) {
    if(typeof define === 'function' && define.amd) {
        define([], factory(root));
    } else if(typeof exports === 'object') {
        module.exports = factory(root);
    } else {
        root.VIconPicker = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    'use strict';

    let VIconPicker = function(vip, domElement, options, library) {
        let vIconPicker = {};

        vIconPicker.vip = vip;
        vIconPicker.domElement = domElement;
        vIconPicker.options = options;
        vIconPicker.library = library;

        vIconPicker.init = function() {
            if(!vIconPicker.options.ui.input) {
                vIconPicker.domElement.style = 'display: none;'
            }
            vIconPicker.domElement.insertAdjacentHTML('afterend', vIconPicker.renderIconPickerMarkup());
            if(vIconPicker.options.ui.previewContainer) {
                vIconPicker.domElement.nextSibling.querySelector('.vip-preview-container').after(vIconPicker.domElement);
            } else if(vIconPicker.options.ui.btn) {
                vIconPicker.domElement.nextSibling.querySelector('.vip-select-button').before(vIconPicker.domElement);
            } else {
                vIconPicker.domElement.nextSibling.appendChild(vIconPicker.domElement);
            }

            if(vIconPicker.options.ux.makeInputReadonly) {
                vIconPicker.domElement.readOnly = true;
            }
            vIconPicker.domElement.spellcheck = false;
            vIconPicker.picker = vIconPicker.domElement.parentNode;
            vIconPicker.initIconPickerClickEvents();
        };

        vIconPicker.renderIconPickerMarkup = function() {
            let btnMarkup = '';
            let previewContainerMarkup = '';

            if(vIconPicker.options.ui.btn) {
                btnMarkup = '<div class="vip-button-container"><button class="vip-select-button">' + vIconPicker.options.texts.btnLabel + '</button></div>';
            }

            if(vIconPicker.options.ui.previewContainer) {
                previewContainerMarkup = '<div class="vip-preview-container"><i class="' + vIconPicker.domElement.value + '"></i></div>';
            }

            return '<div class="vip-container">' + previewContainerMarkup + btnMarkup + '</div>';
        };

        vIconPicker.renderModal = function(event) {
            if(!vIconPicker.isOpen()) {
                event.stopPropagation();
                vIconPicker.options.on.beforeOpenModal(this);
                vIconPicker.open(this);
                vIconPicker.options.on.afterOpenModal(this);
            }
        };

        vIconPicker.initIconPickerClickEvents = function() {

            if(vIconPicker.options.clickEvents.btn && vIconPicker.options.ui.btn) {
                vIconPicker.picker.querySelector('.vip-select-button').addEventListener('click', function(e) {
                    vIconPicker.renderModal(e);
                });
            }

            if(vIconPicker.options.clickEvents.input && vIconPicker.options.ui.input) {
                if(vIconPicker.domElement.nodeName === 'SELECT') {
                    vIconPicker.domElement.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                    });
                }

                vIconPicker.domElement.addEventListener('click', function(e) {
                    if(!vIconPicker.isOpen()) {
                        vIconPicker.renderModal(e);
                    }
                });
            }

            if(vIconPicker.options.clickEvents.previewContainer && vIconPicker.options.ui.previewContainer) {
                vIconPicker.picker.querySelector('.vip-preview-container').addEventListener('click', function(e) {
                    vIconPicker.renderModal(e);
                });
            }
        };

        vIconPicker.initModalEvents = function() {
            vIconPicker.initModalCloseButtonClick();
            vIconPicker.initSearchEvent();
            vIconPicker.initSelectEvent();
        };

        vIconPicker.initSelectEvent = function() {
            document.querySelector('.vip-icon-library').addEventListener('click', function(e) {
                e.stopPropagation();
                if(e.target.tagName.toUpperCase() === 'I') {
                    if(vIconPicker.options.ui.previewContainer) {
                        vIconPicker.picker.querySelector('.vip-preview-container i').className = e.target.className;
                    }
                    vIconPicker.domElement.value = e.target.className;
                    vIconPicker.options.on.iconSelected(e.target.className);
                    vIconPicker.close();
                }
            });

            document.querySelector('.vip-modal').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        };

        vIconPicker.initModalCloseButtonClick = function() {
            document.querySelector('.vip-close-modal').addEventListener('click', function() {
                vIconPicker.close();
            });

            if(vIconPicker.options.ux.autoClose) {
                if(vIconPicker.options.ui.backdrop) {
                    document.querySelector('.vip-backdrop').addEventListener('click', function() {
                        vIconPicker.close();
                    });
                } else {
                    document.addEventListener('click', function(e) {
                        if(vIconPicker.isOpen() && !e.target.classList.contains('vip-model') && e.target.closest('.vip-modal') === null) {
                            vIconPicker.close();
                        }
                    });
                }
            }
        };

        vIconPicker.initSearchEvent = function() {
            document.querySelector('.vip-search-container input').addEventListener('keyup', function(ev) {
                let noMatch = true;
                if(ev.target.value.length > 2) {
                    let iconElements = document.querySelectorAll('.vip-icon-library i');
                    for(let i = 0; i < iconElements.length; i++) {
                        if(iconElements[i].dataset.vipSearch.includes(ev.target.value) || iconElements[i].getAttribute('class').includes(ev.target.value)) {
                            iconElements[i].style = '';
                            noMatch = false;
                        } else {
                            iconElements[i].style = 'display: none;';
                        }
                    }

                } else {
                    let allIcons = document.querySelectorAll('.vip-icon-library i');
                    for(let i = 0; i < allIcons.length; i++) {
                        allIcons[i].style = '';
                    }
                    noMatch = false;
                }
                if(noMatch) {
                    document.querySelector('.vip-no-results').style = '';
                } else {
                    document.querySelector('.vip-no-results').style = 'display: none;';
                }
            });
        };

        vIconPicker.renderModalHtml = function() {
            let icons = '';
            for (const [key, value] of Object.entries(vIconPicker.library)) {
                icons += '<i class="' + key + '" data-vip-search="' + value + '"></i>'
            }
            let html = '<div class="vip-modal"><div class="vip-modal-header"><div class="vip-headline">' + vIconPicker.options.texts.modalHeadline + '</div><button class="vip-close-modal"></button></div><div class="vip-modal-body"><div class="vip-search-container"><input type="search" placeholder="' + vIconPicker.options.texts.searchPlaceholder + '"></div><div class="vip-icon-container"><div class="vip-no-results" style="display: none;">' + vIconPicker.options.texts.noResultsText + '</div><div class="vip-icon-library">' + icons + '</div></div></div></div>';
            if(vIconPicker.options.ui.backdrop) {
                return '<div class="vip-backdrop">' + html + '</div>';
            }
            return html;
        };

        vIconPicker.init();

        vIconPicker.isOpen = function() {
            return !!document.querySelector('.vip-modal');
        };

        vIconPicker.open = function() {
            document.body.insertAdjacentHTML('beforeend', vIconPicker.renderModalHtml());
            vIconPicker.initModalEvents();
        };

        vIconPicker.close = function() {
            vIconPicker.options.on.beforeCloseModal(this);
            if(vIconPicker.options.ui.backdrop) {
                document.querySelector('.vip-backdrop').remove();
            } else {
                document.querySelector('.vip-modal').remove();
            }
            vIconPicker.options.on.afterCloseModal(this);
        };

        return vIconPicker;
    }

    return VIconPicker;
});

(function (root, factory) {
    if(typeof define === 'function' && define.amd) {
        define([], factory(root));
    } else if(typeof exports === 'object') {
        module.exports = factory(root);
    } else {
        root.Vip = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    'use strict';

    let supports = !!document.querySelector && !!root.addEventListener;

    let defaults = {
        texts: {
            btnLabel: '▼',
            modalHeadline: 'Pick an icon',
            searchPlaceholder: 'Search...',
            noResultsText: 'No icons found. Please change the filter.',
        },
        clickEvents: {
            previewContainer: false,
            input: false,
            btn: true,
        },
        ui: {
            previewContainer: true,
            input: false,
            btn: true,
            backdrop: true,
        },
        ux: {
            makeInputReadonly: true,
            autoClose: false,
        },
        on: {
            ready: function(vip) {},
            beforeOpenModal: function(iconPicker) {},
            afterOpenModal: function(iconPicker) {},
            iconSelected: function(icon) {},
            beforeCloseModal: function(iconPicker) {},
            afterCloseModal: function(iconPicker) {},
        },
        url: '../json/icons.json',
    };

    let isObject = function(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    };

    let extend = function(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (isObject(target) && isObject(source)) {
            for (const key in source) {
                if (isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    extend(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return extend(target, ...sources);
    };

    let forEach = function (collection, callback, scope) {
        if (Object.prototype.toString.call(collection) === '[object Object]') {
            for(let prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        } else {
            for(let i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
            }
        }
    };

    let vipConsoleError = function (errorMessage) {
        return console.error('%c Vanilla Icon Picker: Error ', 'padding:2px;border-radius:20px;color:#fff;background:#f44336', '\n' + errorMessage);
    };

    let vipConsoleWarn = function (errorMessage) {
        return console.warn('%c Vanilla Icon Picker: Warning ', 'padding:2px;border-radius:20px;color:#000;background:#f9ee13', '\n' + errorMessage);
    };

    let Vip = function(selector, options) {
        Vip.init(selector, options);
    };

    Vip.elements = null;

    Vip.library = null;

    Vip.iconPickers = [];

    Vip.isJsonFileRequired = function() {
        for(let i = 0; i < Vip.elements.length; i++) {
            if(Vip.elements[i].tagName.toUpperCase() === 'INPUT') {
                return true;
            }
        }
        return false;
    };

    Vip.filterMismatchingElements = function() {
        Vip.elements = Array.from(Vip.elements).filter(function(element) {
            if(!['INPUT', 'SELECT'].includes(element.tagName.toUpperCase())) {
                vipConsoleWarn('One element cannot be rendered. Use only <input> and <select> tags to initiate Vanilla Icon Picker.');
                return false;
            }
            if(element.tagName.toUpperCase() === 'INPUT' && element.type !== 'text') {
                vipConsoleWarn('Vanilla Icon Picker (VIP) expected that <input> element to initiate have the property type="text". type="' + element.type + '" was given.');
            }
            return true;
        });
    };

    Vip.getIconsFromSelect = function(element) {
        let options = element.querySelectorAll('option');
        let library = {};
        for(let i = 0; i < options.length; i++) {
            library[options[i].value] = options[i].innerHTML;
        }
        return library;
    };

    Vip.makeIconPickers = function(options) {
        for(let i = 0; i < Vip.elements.length; i++) {
            let library = Vip.library;
            if(Vip.elements[i].tagName.toUpperCase() === 'SELECT') {
                library = Vip.getIconsFromSelect(Vip.elements[i]);
            }

            Vip.iconPickers.push(new VIconPicker(this, Vip.elements[i], options, library));
        }
        options.on.ready(this);
    };

    Vip.init = function(selector, options) {

        if(!supports) {
            vipConsoleError('Vanilla Icon Picker (VIP) not supported. You should never surf the internet with a potato.');
            return;
        }

        let extendedOptions = extend(defaults, options || {});

        Vip.elements = document.querySelectorAll(selector);
        Vip.filterMismatchingElements();

        if(Vip.elements.length < 1) {
            return;
        }

        if(Vip.isJsonFileRequired()) {
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.open('GET', extendedOptions.url, true);
            xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xmlHttp.send();
            xmlHttp.onreadystatechange = function () {
                if(this.readyState === 4) {
                    if(this.status === 200) {
                        Vip.library = JSON.parse(this.responseText);
                        Vip.makeIconPickers(extendedOptions);
                    } else {
                        vipConsoleError('Vanilla Icon Picker (VIP) cannot get JSON file. Did you pass the parameter "url"?');
                    }
                }
            };
        } else {
            Vip.makeIconPickers(extendedOptions);
        }
    };

    Vip.prototype.all = function() {
        return Vip.iconPickers;
    };

    return Vip;

});


