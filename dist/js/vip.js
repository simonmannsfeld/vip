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
            if(vIconPicker.options.hideInput) {
                vIconPicker.domElement.style = 'display: none;'
            }
            vIconPicker.domElement.insertAdjacentHTML('afterend', vIconPicker.renderIconPickerMarkup());
            vIconPicker.picker = vIconPicker.domElement.nextSibling;
            vIconPicker.initIconPickerClickEvents();
        };

        vIconPicker.renderIconPickerMarkup = function() {
            let btnMarkup = '<div class="vip-button-container"><button class="vip-select-button">' + vIconPicker.options.btnText + '</button></div>'
            return '<div class="vip-container"><div class="vip-preview-container"><i class="' + vIconPicker.domElement.value + '"></i></div>' + btnMarkup + '</div>';
        };

        vIconPicker.initIconPickerClickEvents = function() {
            vIconPicker.picker.querySelector('.vip-select-button').addEventListener('click', function() {
                if(!vIconPicker.isOpen()) {
                    vIconPicker.open(this);
                }
            });
            if(!vIconPicker.options.hideInput) {
                vIconPicker.domElement.addEventListener('click', function() {
                    if(!vIconPicker.isOpen()) {
                        vIconPicker.open();
                    }
                });
            }
        };

        vIconPicker.initModalEvents = function() {
            vIconPicker.initModalCloseButtonClick();
            vIconPicker.initSearchEvent();
            vIconPicker.initSelectEvent();
        };

        vIconPicker.initSelectEvent = function() {
            document.querySelector('.vip-icon-library').addEventListener('click', function(ev) {
                if(ev.target.tagName.toUpperCase() === 'I') {
                    vIconPicker.picker.querySelector('.vip-preview-container i').className = ev.target.className;
                    vIconPicker.domElement.value = ev.target.className;
                    vIconPicker.close();
                }
            });
        };

        vIconPicker.initModalCloseButtonClick = function() {
            document.querySelector('.vip-close-modal').addEventListener('click', function() {
                vIconPicker.close();
            });
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
            return '<div class="vip-backdrop"><div class="vip-modal"><div class="vip-modal-header"><div class="vip-headline">' + vIconPicker.options.modalHeadline + '</div><button class="vip-close-modal"></button></div><div class="vip-modal-body"><div class="vip-search-container"><input type="search" placeholder="' + vIconPicker.options.searchPlaceholder + '"></div><div class="vip-icon-container"><div class="vip-no-results" style="display: none;">' + vIconPicker.options.noResultsText + '</div><div class="vip-icon-library">' + icons + '</div></div></div></div></div>';
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
            document.querySelector('.vip-backdrop').remove();
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
        btnText: '...',
        searchPlaceholder: 'Seach...',
        noResultsText: 'No icons found. Please change the filter.',
        hideInput: true,
        backdrop: true,
        modalHeadline: 'Pick an icon',
        url: '/vip/dist/json/icons.json'
    };

    let extend = function ( defaults, options ) {
        let extended = {};
        forEach(defaults, function (value, prop) {
            extended[prop] = defaults[prop];
        });
        forEach(options, function (value, prop) {
            extended[prop] = options[prop];
        });
        return extended;
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
    }

    let vipConsoleWarn = function (errorMessage) {
        return console.warn('%c Vanilla Icon Picker: Warning ', 'padding:2px;border-radius:20px;color:#000;background:#f9ee13', '\n' + errorMessage);
    }

    let Vip = function(selector, options) {
        Vip.init(selector, options);
    }

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


