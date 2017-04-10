var hffd, hfsd, lffd, lfsd, mvpf, ls, color_class;


$(document).ready(function () {


    var button_new_feature;

    var high_fast = document.getElementById('hffd');


    hffd = Sortable.create(high_fast, {
        group: "mvpcm",
        animation: 150,
        ghostClass: "ghost",
        filter: '.js-remove',
        onFilter: function (evt) {
            evt.item.parentNode.removeChild(evt.item);
            changeStateOfSaved(false);
        },
        onEnd: function (evt) {
            changeStateOfSaved(false);
        }
    });

    var high_slow = $('#hfsd')[0];

    hfsd = Sortable.create(high_slow, {
        group: "mvpcm",
        animation: 150,
        ghostClass: "ghost",
        filter: '.js-remove',
        onFilter: function (evt) {
            evt.item.parentNode.removeChild(evt.item);
            changeStateOfSaved(false);
        },
        onEnd: function (evt) {
            changeStateOfSaved(false);
        }
    });


    var low_slow = $('#lfsd')[0];

    lfsd = Sortable.create(low_slow, {
        group: "mvpcm",
        animation: 150,
        ghostClass: "ghost",
        filter: '.js-remove',
        onFilter: function (evt) {
            evt.item.parentNode.removeChild(evt.item);
            changeStateOfSaved(false);
        },
        onEnd: function (evt) {
            changeStateOfSaved(false);
        }
    });

    var low_fast = $('#lffd')[0];

    lffd = Sortable.create(low_fast, {
        group: "mvpcm",
        animation: 150,
        ghostClass: "ghost",
        filter: '.js-remove',
        onFilter: function (evt) {
            evt.item.parentNode.removeChild(evt.item);
            changeStateOfSaved(false);
        },
        onEnd: function (evt) {
            changeStateOfSaved(false);
        }
    });


    var mvp_features = $('#mvp_features')[0];

    mvpf = Sortable.create(mvp_features, {
        group: "mvpcm",
        animation: 150,
        ghostClass: "ghost",
        store: {
            get: function (sortable) {
                var order = localStorage.getItem(sortable.options.group);
                return order ? order.split('|') : [];
            },
            set: function (sortable) {
                var order = sortable.toArray();
                localStorage.setItem(sortable.options.group, order.join('|'));
            }
        },
        filter: '.js-remove',
        onFilter: function (evt) {
            evt.item.parentNode.removeChild(evt.item);
            changeStateOfSaved(false);
        },
        onEnd: function (evt) {
            changeStateOfSaved(false);
        }
    });


    button_add_feature.onclick = function () {

        var feature = $('#feature').val().trim();
        if (!feature) {
            return;
        }
        var el = document.createElement('li');
        el.innerHTML = '<i class="js-remove">✖ </i>' + feature;
        if (color_class != '') {
            el.className = el.className + color_class;
        }
        var kind_feature = button_new_feature.split('_');

        switch (kind_feature[2]) {
        case "lffd":
            lffd.el.appendChild(el);
            break;
        case "lfsd":
            lfsd.el.appendChild(el);
            break;
        case "hffd":
            hffd.el.appendChild(el);
            break;
        case "hfsd":
            hfsd.el.appendChild(el);
            break;
        }


        $('#modal_new_feature').modal("hide");

        changeStateOfSaved(false);

        color_class = '';
    }

    $('#modal_new_feature').on('show.bs.modal', function (e) {
        setTimeout(function () {
            $('#feature').focus();
            $('#feature').addClass("focusedInput");
        }, 500);
        var button = $(e.relatedTarget);
        button_new_feature = button[0].id;
        $('#feature').val('');
    });

    $('#button_save').on('click', function () {

        if (saveMe()) {

            changeStateOfSaved(true);
        } else {

            changeStateOfSaved(false);
            $('.modal-body #message').html('Can not save mvp, localStorage is not available');
            $('#modal_message').modal('show');
        }

    });

    $('#trash').on('click', function () {
        trashMe();
        initMVP();
    });

    $('#export').on('click', function () {
        exportJSON();
    });

    /**
    Check if we have localStorage support and init all stuff
    */


    if (typeof (Storage) !== "undefined") {
        ls = true;
        if (checkLocalStorageData()) {
            loadFromLocalStorage()
        } else {
            initMVP();
        }
    } else {
        // Nop localstorage!
        $('#button_save').prop('disabled', true);
        ls = false;
        initMVP();
    }

    /**
    tooltip activation
    */

    $('[data-toggle="tooltip"]').tooltip();

    /**
    Take screenshot
    */

    $('#screenshot').on('click', function () {
        $('#screenshot').tooltip('hide');
        setTimeout(function () {
            takeAndExportScreenshot();
        }, 350);
    });


});


$(document).on('change', '.btn-file :file', function () {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    var file = input[0].files[0];
    loadFile(file);
});


/**

Export the MVPmc into JSON format

*/


function exportJSON() {
    if (saveMe()) {
        var data = {};
        var v;
        for (var i = 0; i < localStorage.length; i++) {
            v = localStorage.key(i);
            data['' + v + ''] = localStorage.getItem(localStorage.key(i));
        }

        var blob = new Blob([JSON.stringify(data)], {
            type: "application/json"
        });
        var url = URL.createObjectURL(blob);
        var a = document.getElementById('export');
        a.href = url;
        var date = new Date();
        var nameMVP = localStorage.name ? localStorage.getItem('name') : 'MVPmc';
        var nameMVPQualif = nameMVP.replace(/[^A-Z0-9]+/ig, "_");
        a.download = nameMVPQualif + '_' + date + '.json';

    }
}

function trashMe() {
    if (ls) {
        localStorage.clear();
    }
    $('#mvp_features').html('');
    $('#lffd').html('');
    $('#lfsd').html('');
    $('#hfsd').html('');
    $('#hffd').html('');
    $('#name').val('');
    $('#idea').val('');
}



function changeStateOfSaved(bool) {
    if (bool) {
        $('.save').addClass('glyphicon-floppy-saved').removeClass('glyphicon-floppy-disk');
    } else {
        $('.save').addClass('glyphicon-floppy-disk').removeClass('glyphicon-floppy-saved');
    }
}


function saveMe() {
    if (ls) {
        localStorage.setItem('mvp_features', $('#mvp_features').html());
        localStorage.setItem('lffd', $('#lffd').html());
        localStorage.setItem('lfsd', $('#lfsd').html());
        localStorage.setItem('hfsd', $('#hfsd').html());
        localStorage.setItem('hffd', $('#hffd').html());
        localStorage.setItem('name', $('#name').val());
        localStorage.setItem('idea', $('#idea').val());
        return true;
    } else {
        return false;
    }
}

function loadFromLocalStorage() {
    if (ls) {
        if (localStorage.mvp_features) {
            $('#mvp_features').html(localStorage.getItem('mvp_features'));
        }
        if (localStorage.lffd) {
            $('#lffd').html(localStorage.getItem('lffd'));
        }
        if (localStorage.lfsd) {
            $('#lfsd').html(localStorage.getItem('lfsd'));
        }
        if (localStorage.hfsd) {
            $('#hfsd').html(localStorage.getItem('hfsd'));
        }
        if (localStorage.hffd) {
            $('#hffd').html(localStorage.getItem('hffd'));
        }
        if (localStorage.idea) {
            $('#idea').val(localStorage.getItem('idea'));
        }
        if (localStorage.name) {
            $('#name').val(localStorage.getItem('name'));
        }
    }
}

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        displayContents(contents);
    };
    reader.readAsText(file);
}

function displayContents(contents) {
    var element = document.getElementById('file-content');
    element.innerHTML = contents;
}

function loadFile(file) {
    console.log(-1);
    var fr;

    if (typeof window.FileReader !== 'function') {

        $('.modal-body #message').html('The file API isn\'t supported on this browser yet :(');
        $('#modal_message').modal('show');
        return;
    }

    if (file) {
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
    } else {
        return;
    }

    function receivedText(e) {
        console.log(0);
        trashMe();
        lines = e.target.result;
        console.log(lines)
        var newArr = JSON.parse(lines);
        newArr.idea ? $('#idea').val(newArr.idea) : "";
        newArr.name ? $('#name').val(newArr.name) : "";
        newArr.mvp_features ? $('#mvp_features').html(newArr.mvp_features) : "";
        newArr.lffd ? $('#lffd').html(newArr.lffd) : "";
        newArr.lfsd ? $('#lfsd').html(newArr.lfsd) : "";
        newArr.hfsd ? $('#hfsd').html(newArr.hfsd) : "";
        newArr.hffd ? $('#hffd').html(newArr.hffd) : "";
    }
}

/**
 check if LocalStorage has our variables or not
 */

function checkLocalStorageData() {
    if (localStorage.idea || localStorage.idea === '' &&
        localStorage.name || localStorage.name === '' &&
        localStorage.mvp_features || localStorage.mvp_features === '' &&
        localStorage.lffd || localStorage.lffd === '' &&
        localStorage.lfsd || localStorage.lfsd === '' &&
        localStorage.hfsd || localStorage.hfsd === '' &&
        localStorage.hffd || localStorage.hffd === '') {

        return true;

    } else {

        return false;
    }
}

function initMVP() {
    var el = document.createElement('li');
    el.innerHTML = '<i class="js-remove">✖ </i>' + "Drag some features";
    mvpf.el.appendChild(el);

    var el = document.createElement('li');
    el.innerHTML = '<i class="js-remove">✖ </i>' + "Keep in mind and promove to the next version";
    lffd.el.appendChild(el);

    var el = document.createElement('li');
    el.innerHTML = '<i class="js-remove">✖ </i>' + "It will not be part of your 1st MVP";
    lfsd.el.appendChild(el);

    var el = document.createElement('li');
    el.innerHTML = '<i class="js-remove">✖ </i>' + "Try fast or carry over to the next version";
    hfsd.el.appendChild(el);

    var el = document.createElement('li');
    el.innerHTML = '<i class="js-remove">✖ </i>' + "This stuff must be part of your 1st MVP";
    hffd.el.appendChild(el);
}


//Adding color class

function colorMe(idButton) {

    switch (idButton) {
    case "button_yellow":
        color_class = 'yellowm';
        break;
    case "button_green":
        color_class = 'greenm'
        break;
    case "button_red":
        color_class = 'redm';
        break;
    }
}

/**
Take screenshot and download
*/


function takeAndExportScreenshot() {
    showButtons(false);
    html2canvas(document.body, {
        onrendered: function (canvas) {
            if (canvas.toBlob) {
                canvas.toBlob(function (blob) {
                    var nameMVP = localStorage.name ? localStorage.getItem('name') : 'MVPmc';
                    var nameMVPQualif = nameMVP.replace(/[^A-Z0-9]+/ig, "_");
                    saveAs(blob, nameMVPQualif + '.png');
                }, 'image/png');
            }
            showButtons(true);
        }
    });
}

/**
Hide and show stuff like buttons to the download MVP image
*/


function showButtons(bool) {

    if (bool) {

        document.getElementById('button_actions').style.display = 'block';
        document.getElementById('new_feature_hfsd').style.display = 'block';
        document.getElementById('new_feature_hffd').style.display = 'block';
        document.getElementById('new_feature_lffd').style.display = 'block';
        document.getElementById('new_feature_lfsd').style.display = 'block';
    } else {

        document.getElementById('button_actions').style.display = 'none';
        document.getElementById('new_feature_hfsd').style.display = 'none';
        document.getElementById('new_feature_hffd').style.display = 'none';
        document.getElementById('new_feature_lffd').style.display = 'none';
        document.getElementById('new_feature_lfsd').style.display = 'none';
    }
}
