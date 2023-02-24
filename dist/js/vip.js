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
})(typeof global !== "undefined" ? global : self.window || self.global, function (root) {

    'use strict';

    let VIconPicker = function(vip, domElement, options, library) {
        let vIconPicker = {};
        let self = this;

        self.vip = vip;
        self.domElement = domElement;
        self.options = options;
        self.library = library;

        self.init = function() {
            if(!self.options.ui.input) {
                self.domElement.style = 'display: none;'
            }
            self.domElement.insertAdjacentHTML('afterend', self.renderIconPickerMarkup());
            if(self.options.ui.previewContainer) {
                self.domElement.nextSibling.querySelector('.vip-preview-container').after(self.domElement);
            } else if(self.options.ui.btn) {
                self.domElement.nextSibling.querySelector('.vip-select-button').before(self.domElement);
            } else {
                self.domElement.nextSibling.appendChild(self.domElement);
            }

            if(self.options.ux.makeInputReadonly) {
                self.domElement.readOnly = true;
            }
            self.domElement.spellcheck = false;
            self.picker = self.domElement.parentNode;
            self.initIconPickerClickEvents();
        };

        self.renderIconPickerMarkup = function() {
            let btnMarkup = '';
            let previewContainerMarkup = '';

            if(self.options.ui.btn) {
                btnMarkup = '<div class="vip-button-container"><button class="vip-select-button">' + self.options.texts.btnLabel + '</button></div>';
            }

            if(self.options.ui.previewContainer) {
                previewContainerMarkup = '<div class="vip-preview-container"><i class="' + self.domElement.value + '"></i></div>';
            }

            return '<div class="vip-container">' + previewContainerMarkup + btnMarkup + '</div>';
        };

        self.renderModal = function(event) {
            if(!self.isOpen()) {
                event.stopPropagation();
                self.options.on.beforeOpenModal(this);
                self.open(this);
                self.options.on.afterOpenModal(this);
            }
        };

        self.initIconPickerClickEvents = function() {

            if(self.options.clickEvents.btn && self.options.ui.btn) {
                self.picker.querySelector('.vip-select-button').addEventListener('click', function(e) {
                    self.renderModal(e);
                });
            }

            if(self.options.clickEvents.input && self.options.ui.input) {
                if(self.domElement.nodeName === 'SELECT') {
                    self.domElement.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                    });
                }

                self.domElement.addEventListener('click', function(e) {
                    if(!self.isOpen()) {
                        self.renderModal(e);
                    }
                });
            }

            if(self.options.clickEvents.previewContainer && self.options.ui.previewContainer) {
                self.picker.querySelector('.vip-preview-container').addEventListener('click', function(e) {
                    self.renderModal(e);
                });
            }
        };

        self.initModalEvents = function() {
            self.initModalCloseButtonClick();
            self.initSearchEvent();
            self.initSelectEvent();
        };

        self.initSelectEvent = function() {
            document.querySelector('.vip-icon-library').addEventListener('click', function(e) {
                e.stopPropagation();
                if(e.target.tagName.toUpperCase() === 'I') {
                    if(self.options.ui.previewContainer) {
                        self.picker.querySelector('.vip-preview-container i').className = e.target.className;
                    }
                    self.domElement.value = e.target.className;
                    self.options.on.iconSelected(e.target.className);
                    self.close();
                }
            });

            document.querySelector('.vip-modal').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        };

        self.initModalCloseButtonClick = function() {
            document.querySelector('.vip-close-modal').addEventListener('click', function() {
                self.close();
            });

            if(self.options.ux.autoClose) {
                if(self.options.ui.backdrop) {
                    document.querySelector('.vip-backdrop').addEventListener('click', function() {
                        self.close();
                    });
                } else {
                    document.addEventListener('click', function(e) {
                        if(self.isOpen() && !e.target.classList.contains('vip-model') && e.target.closest('.vip-modal') === null) {
                            self.close();
                        }
                    });
                }
            }
        };

        self.initSearchEvent = function() {
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

        self.renderModalHtml = function() {
            let icons = '';
            for (const [key, value] of Object.entries(self.library)) {
                icons += '<i class="' + key + '" data-vip-search="' + value + '"></i>'
            }
            let html = '<div class="vip-modal"><div class="vip-modal-header"><div class="vip-headline">' + self.options.texts.modalHeadline + '</div><button class="vip-close-modal"></button></div><div class="vip-modal-body"><div class="vip-search-container"><input type="search" placeholder="' + self.options.texts.searchPlaceholder + '"></div><div class="vip-icon-container"><div class="vip-no-results" style="display: none;">' + self.options.texts.noResultsText + '</div><div class="vip-icon-library">' + icons + '</div></div></div></div>';
            if(self.options.ui.backdrop) {
                return '<div class="vip-backdrop">' + html + '</div>';
            }
            return html;
        };

        self.isOpen = function() {
            return !!document.querySelector('.vip-modal');
        };

        self.open = function() {
            document.body.insertAdjacentHTML('beforeend', self.renderModalHtml());
            self.initModalEvents();
        };

        self.close = function() {
            self.options.on.beforeCloseModal(this);
            if(self.options.ui.backdrop) {
                document.querySelector('.vip-backdrop').remove();
            } else {
                document.querySelector('.vip-modal').remove();
            }
            self.options.on.afterCloseModal(this);
        };

        self.init();

        return this;
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
})(typeof global !== "undefined" ? global : self.window || self.global, function (root) {

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
        let self = this;

        self.elements = null;

        self.library = null;

        self.iconPickers = [];

        self.isJsonFileRequired = function() {
            for(let i = 0; i < self.elements.length; i++) {
                if(self.elements[i].tagName.toUpperCase() === 'INPUT') {
                    return true;
                }
            }
            return false;
        };

        self.filterMismatchingElements = function() {
            self.elements = Array.from(self.elements).filter(function(element) {
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

        self.getIconsFromSelect = function(element) {
            let options = element.querySelectorAll('option');
            let library = {};
            for(let i = 0; i < options.length; i++) {
                library[options[i].value] = options[i].innerHTML;
            }
            return library;
        };

        self.makeIconPickers = function(options) {
            for(let i = 0; i < self.elements.length; i++) {
                let library = self.library;
                if(self.elements[i].tagName.toUpperCase() === 'SELECT') {
                    library = self.getIconsFromSelect(self.elements[i]);
                }

                self.iconPickers.push(new VIconPicker(this, self.elements[i], options, library));
            }
            options.on.ready(this);
        };

        self.init = function(selector, options) {

            if(!supports) {
                vipConsoleError('Vanilla Icon Picker (VIP) not supported. You should never surf the internet with a potato.');
                return;
            }

            let extendedOptions = extend(defaults, options || {});

            self.elements = document.querySelectorAll(selector);
            self.filterMismatchingElements();

            if(self.elements.length < 1) {
                return;
            }

            if(self.isJsonFileRequired()) {
                let xmlHttp = new XMLHttpRequest();
                xmlHttp.open('GET', extendedOptions.url, true);
                xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                xmlHttp.send();
                xmlHttp.onreadystatechange = function () {
                    if(this.readyState === 4) {
                        if(this.status === 200) {
                            self.library = JSON.parse(this.responseText);
                            self.makeIconPickers(extendedOptions);
                        } else {
                            vipConsoleError('Vanilla Icon Picker (VIP) cannot get JSON file. Did you pass the parameter "url"?');
                        }
                    }
                };
            } else {
                self.makeIconPickers(extendedOptions);
            }
        };

        self.init(selector, options);

        Vip.prototype.all = function() {
            return self.iconPickers;
        };
    };

    return Vip;

});


