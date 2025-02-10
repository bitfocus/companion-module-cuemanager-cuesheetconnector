// Helper functions used throughout the module
const { CompanionPresetFeedback } = require('@companion-module/base');

class Helpers{
    updateStatus(self, status, status_description){
        // Set undefined/null description to ok or empty string.
        if(status_description === undefined || status_description === null){
            if(status.toLocaleLowerCase() == 'ok'){
                status_description = 'ok';
            } else{
                status_description = '';
            }
        }
        
        // Change status if different from current status.
        if(status != self.getVariableValue('status') || status_description != self.getVariableValue('status_description')){
            self.updateStatus(status, status_description);
            self.setVariableValues({'status': status});
            self.setVariableValues({'status_description': status_description});
            self.checkFeedbacks('change_button_style_on_conditional');
        }
    }
    
    validateCMSettings(config){
        if(typeof config == 'object'){
            if(this.empty(config, 'personal_access_token')){
                return 'Personal access token empty.';
            }
            if(this.empty(config, 'live_service_base_endpoint')){
                return 'Live service base endpoint empty.';
            }
            if(this.empty(config, 'companion_service_base_endpoint')){
                return 'API base endpoint empty.';
            }
            if(this.empty(config, 'time_service_endpoint')){
                return 'Time service base endpoint empty.';
            }
            if(!this.validateCueManagerDomain(config.live_service_base_endpoint)){
                return 'Invalid live service base endpoint.';
            }
            if(!this.validateCueManagerDomain(config.companion_service_base_endpoint)){
                return 'Invalid companion service base endpoint.';
            }
            if(!this.validateCueManagerDomain(config.time_service_endpoint)){
                return 'Invalid time service base endpoint.';
            }
        }
        return 'OK';
    }
    
    validateCueManagerDomain(url){
        if(typeof url == 'string'){
            // Make sure domain it HTTPS
            if(url.substring(0, 8).toLocaleLowerCase() == 'https://'){
                
                // Split the URL into domain parts.
                var domain_parts = url.split('.');
                domain_parts.reverse(); // Reverse array to securely verify the TLD (array position 0)
                
                // Make sure domain parts are at least 2 parts long (we don't want to verify subdomains)
                if(!this.empty(domain_parts, 1)){
                    
                    // Remove path from TLD
                    var tld_parts = domain_parts[0].split('/');
                    var tld = tld_parts[0];
                    
                    // Make sure domain is cuemanager.com
                    if(tld == 'com' && domain_parts[1] == 'cuemanager'){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isset(obj){
        var i, max_i;
        if(obj === undefined) return false;
        if(obj == null) return false;
        for (i = 1, max_i = arguments.length; i < max_i; i++) {
            if(obj[arguments[i]] === undefined){
                return false;
            }
            obj = obj[arguments[i]];
        }
        return true;
    }

    empty(obj){
        var i, max_i;
        if(obj === undefined) return true;
        if(obj == null) return true;
        if(obj == false) return true;
        if(obj == '') return true;
        for (i = 1, max_i = arguments.length; i < max_i; i++) {
            if(obj[arguments[i]] === undefined || obj[arguments[i]] === null || obj[arguments[i]] === false || obj[arguments[i]] === ''){
                return true;
            }
            if(Array.isArray(obj[arguments[i]])){
                if(obj[arguments[i]].length == 0){
                    return true;
                }
            } else if(typeof obj[arguments[i]] == 'object'){
                if(Object.keys(arguments[i]).length == 0){
                    return true;
                }
            } else if(!['function', 'symbol'].includes(typeof obj[arguments[i]])){
                if(obj[arguments[i]].toString().length == 0){
                    return true;
                }
            }
            obj = obj[arguments[i]];
        }
        return false;
    }

    trim(str, char) {
        if(typeof str == 'string'){
            var pattern = new RegExp(`^[${char}]+|[${char}]+$`, 'g');
            return str.replace(pattern, '');
        }
        return str;
    }

    getStatusCodeText(statusCode){
        var statusCodes = {
            // Informational responses (100–199)
            100: "Continue",
            101: "Switching Protocols",
            102: "Processing",
            103: "Early Hints",
            // Successful responses (200–299)
            200: "OK",
            201: "Created",
            202: "Accepted",
            203: "Non-Authoritative Information",
            204: "No Content",
            205: "Reset Content",
            206: "Partial Content",
            207: "Multi-Status",
            208: "Already Reported",
            226: "IM Used",
            // Redirection messages (300–399)
            300: "Multiple Choices",
            301: "Moved Permanently",
            302: "Found",
            303: "See Other",
            304: "Not Modified",
            305: "Use Proxy",
            307: "Temporary Redirect",
            308: "Permanent Redirect",
            // Client error responses (400–499)
            400: "Bad Request",
            401: "Unauthorized",
            402: "Payment Required",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            406: "Not Acceptable",
            407: "Proxy Authentication Required",
            408: "Request Timeout",
            409: "Conflict",
            410: "Gone",
            411: "Length Required",
            412: "Precondition Failed",
            413: "Payload Too Large",
            414: "URI Too Long",
            415: "Unsupported Media Type",
            416: "Range Not Satisfiable",
            417: "Expectation Failed",
            418: "I'm a teapot",
            421: "Misdirected Request",
            422: "Unprocessable Entity",
            423: "Locked",
            424: "Failed Dependency",
            425: "Too Early",
            426: "Upgrade Required",
            428: "Precondition Required",
            429: "Too Many Requests",
            431: "Request Header Fields Too Large",
            451: "Unavailable For Legal Reasons",
            // Server error responses (500–599)
            500: "Internal Server Error",
            501: "Not Implemented",
            502: "Bad Gateway",
            503: "Service Unavailable",
            504: "Gateway Timeout",
            505: "HTTP Version Not Supported",
            506: "Variant Also Negotiates",
            507: "Insufficient Storage",
            508: "Loop Detected",
            510: "Not Extended",
            511: "Network Authentication Required"
        };
	
        if(this.isset(statusCodes, statusCode)){
            return statusCodes[statusCode];
        }
        return "Unknown Status Code";
    }

    decodeHTMLEntities(str){
        if(typeof str == 'string'){
            const entityMap = {
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&quot;': '"',
                '&#39;': "'",
                '&#039;': "'",
                '&copy;': '©',
                '&reg;': '®',
                '&euro;': '€',
                '&pound;': '£',
                '&yen;': '¥',
                // Add other entities as needed
            };

            return str.replace(/&[a-zA-Z0-9#]+;/g, (match) => entityMap[match] || match);
        }
        
        return str;
    }

    encodeHTMLEntities(str){
        if(typeof str == 'string'){
            return str.replace(/[&<>"'\/]/g, (char) => {
                switch (char) {
                    case '&':
                        return '&amp;';
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                    case '"':
                        return '&quot;';
                    case "'":
                        return '&#39;';
                    case '/':
                        return '&#47;';
                    default:
                        return char;
                }
            });
        }
        return str;
    }

    stripValidTags(inputString) {
        const validTagName = /^[a-z][a-z0-9\-]*$/i; // Valid HTML tag name pattern
        let result = '';
        let insideTag = false;
        let tagNameBuffer = '';
        let buffer = '';

        for (let i = 0; i < inputString.length; i++) {
            const char = inputString[i];

            if (char === '<') {
                // Flush the buffer if we're entering a tag
                result += buffer;
                buffer = '';
                insideTag = true;
                tagNameBuffer = '';
            } else if (char === '>') {
                // End of tag: Strip all tags with attributes, keep others (like <notanhtmltag>)
                if (insideTag) {
                    const trimmedTagName = tagNameBuffer.trim();
                    const isClosingTag = trimmedTagName.startsWith('/');
                    const isSelfClosing = trimmedTagName.endsWith('/');
                    const cleanedTagName = trimmedTagName
                        .replace(/^\/|\/$/g, '') // Remove leading '/' or trailing '/'
                        .trim();

                    // Check if the tag has attributes (such as style="...", class="...", etc.)
                    if (/\s+[a-z\-]+=("[^"]*"|'[^']*')/i.test(tagNameBuffer) || validTagName.test(cleanedTagName)) {
                        // Remove all tags that either have attributes or are standard HTML tags
                    } else {
                        // Otherwise, keep the tag as is (non-standard tags like <notanhtmltag>)
                        result += '<' + tagNameBuffer + '>';
                    }
                }
                insideTag = false;
            } else if (insideTag) {
                // Build the tag name buffer if inside a tag
                tagNameBuffer += char;
            } else {
                // Build the text buffer if outside of a tag
                buffer += char;
            }
        }

        // Append any remaining text in the buffer
        result += buffer;

        return result;
    }

    processHTMLLineBreaks(text){
        if(typeof text == 'string'){
            text = text.replaceAll('</p>', '</p> ');
            text = text.replaceAll('<br>', '<br> ');
            text = text.replaceAll('<br>', ' ');
            text = text.replaceAll('<br style>', ' ');
            text = text.replace(/\s+/g, ' ');
        }
        return text;
    }

    buttonFriendlyText(text){
        if(typeof text == 'string'){
            return this.stripValidTags(this.processHTMLLineBreaks(this.decodeHTMLEntities(text))).replace(/\s+/g, ' ');
        }
        return '';
    }
    
    generateUniqueId(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }
    
    resetVariables(self, starts_with_strings){
        if(this.isset(self, 'variable_definitions', '0', 'variableId')){
            self.variable_definitions.forEach((variable) => {                
                
                if(typeof starts_with_strings == 'object'){
                    // Loop through starts with strings
                    starts_with_strings.forEach((starts_with) => {
                        // Reset variable that matches
                        if(variable.variableId.startsWith(starts_with)){
                            self.setVariableValues({[variable.variableId]: variable._cmDefault});
                        }
                    });
                } else{
                    // No starts with strings provided, default to resetting all variables
                    self.setVariableValues({[variable.variableId]: variable._cmDefault});
                }
                
            });
        }
    }

    setCueDurations(self, cue_position, duration, offset){
        // cue_position argument should be "current_cue" or "next_cue" as they prepend certain variables we set below

        
        if((!this.empty(duration) || duration == '0') && !isNaN(duration)){
            
            // Calculate milliseconds
            var duration_milliseconds = parseInt(duration) * 1000;
            var offset_milliseconds = parseInt(offset) * 1000
        
            // Recalculate duration_milliseconds to include offset
            if(this.empty(offset_milliseconds) && !isNaN(offset_milliseconds)){
                duration_milliseconds = duration_milliseconds + (offset_milliseconds);
            }
            
            // Set the variables
            self.setVariableValues({[cue_position+'_duration_hhmmss']: this.hhmmss(duration_milliseconds)});
            self.setVariableValues({[cue_position+'_duration_milliseconds']: duration_milliseconds});
            self.setVariableValues({[cue_position+'_duration_seconds']: duration});
            self.setVariableValues({[cue_position+'_duration_hh']: this.hh(duration_milliseconds, false, false)});
            self.setVariableValues({[cue_position+'_duration_mm']: this.mm(duration_milliseconds, false, false)});
            self.setVariableValues({[cue_position+'_duration_ss']: this.ss(duration_milliseconds, false, false)});
            self.setVariableValues({[cue_position+'_duration_offset_milliseconds']: offset_milliseconds});
            self.setVariableValues({[cue_position+'_duration_offset_seconds']: offset});
            self.setVariableValues({[cue_position+'_duration_offset_hh']: this.hh(offset_milliseconds, false, false)});
            self.setVariableValues({[cue_position+'_duration_offset_mm']: this.mm(offset_milliseconds, false, false)});
            self.setVariableValues({[cue_position+'_duration_offset_ss']: this.ss(offset_milliseconds, false, false)});
        }
    }
    
    setSheetDurationTotals(self, duration_total, duration_remaining_excluding_current){
        
        // Set sheet total runtime variables
        if((!this.empty(duration_total) || duration_total == '0') && !isNaN(duration_total)){
            self.setVariableValues({['sheet_total_runtime_hhmmss']: this.hhmmss(parseInt(duration_total) * 1000)});
            self.setVariableValues({['sheet_total_runtime_hh']: this.hh(parseInt(duration_total) * 1000, false, false)});
            self.setVariableValues({['sheet_total_runtime_mm']: this.mm(parseInt(duration_total) * 1000, false, false)});
            self.setVariableValues({['sheet_total_runtime_ss']: this.ss(parseInt(duration_total) * 1000, false, false)});
            self.setVariableValues({['sheet_total_runtime_seconds']: parseInt(duration_total)});
            self.setVariableValues({['sheet_total_runtime_milliseconds']: Math.floor(parseInt(duration_total) * 1000)});
        }
        
        // Set sheet duration remaining variables
        if(
            (!this.empty(duration_remaining_excluding_current) || duration_remaining_excluding_current == '0')
            && !isNaN(duration_remaining_excluding_current)
        ){
            self.setVariableValues({
                'sheet_duration_remaining_excluding_current_hhmmss': this.hhmmss(parseInt(duration_remaining_excluding_current) * 1000)
            });
            self.setVariableValues({
                'sheet_duration_remaining_excluding_current_hh': this.hh(parseInt(duration_remaining_excluding_current) * 1000, false, false)
            });
            self.setVariableValues({
                'sheet_duration_remaining_excluding_current_mm': this.mm(parseInt(duration_remaining_excluding_current) * 1000, false, false)
            });
            self.setVariableValues({
                'sheet_duration_remaining_excluding_current_ss': this.ss(parseInt(duration_remaining_excluding_current) * 1000, false, false)
            });
            self.setVariableValues({
                'sheet_duration_remaining_excluding_current_seconds': parseInt(duration_remaining_excluding_current)
            });
            self.setVariableValues({
                'sheet_duration_remaining_excluding_current_milliseconds': Math.floor(parseInt(duration_remaining_excluding_current) * 1000)
            });
        } else{
            // Default to 0
            self.setVariableValues({['sheet_duration_remaining_excluding_current_hhmmss']: '00:00:00'});
            self.setVariableValues({['sheet_duration_remaining_excluding_current_hh']: '00'});
            self.setVariableValues({['sheet_duration_remaining_excluding_current_mm']: '00'});
            self.setVariableValues({['sheet_duration_remaining_excluding_current_ss']: '00'});
            self.setVariableValues({['sheet_duration_remaining_excluding_current_seconds']: 0});
            self.setVariableValues({['sheet_duration_remaining_excluding_current_milliseconds']: 0});
        }
    }

    hhmmssOverUnder(unixMilliseconds, use_plus_sign = false, use_minus_sign = true) {
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;

        // Use the absolute value of the seconds for calculations
        const absUnixSeconds = Math.abs(unixSeconds);

        // Calculate total hours, minutes, and seconds
        const totalHours = Math.floor(absUnixSeconds / 3600);
        const minutes = Math.floor((absUnixSeconds % 3600) / 60);
        const seconds = absUnixSeconds % 60;

        // Format the time string with total hours (including over 24 hours)
        let formattedTime = `${totalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // If the time is negative, prepend with a minus sign
        if (isNegative && use_minus_sign) {
            formattedTime = `▼${formattedTime}`;
        } else if (use_plus_sign) {
            formattedTime = `⚠\n▲${formattedTime}`;
        }

        return formattedTime;
    }
    
    mmssOverUnder(unixMilliseconds, use_plus_sign = false, use_minus_sign = true) {
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;

        // Use the absolute value of the seconds for calculations
        const absUnixSeconds = Math.abs(unixSeconds);

        // Calculate minutes and seconds
        const minutes = Math.floor((absUnixSeconds % 3600) / 60);
        const seconds = absUnixSeconds % 60;

        // Format the time string
        let formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // If the time is negative, prepend with a minus sign
        if (isNegative && use_minus_sign) {
            formattedTime = `▼${formattedTime}`;
        } else if (use_plus_sign) {
            formattedTime = `⚠\n▲${formattedTime}`;
        }

        return formattedTime;
    }
    
    overUnderArrow(unixMilliseconds){
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;
        
        // Return arrow up or arrow down (arrow down should be default)
        if(!isNegative){
            return '▲';
        }
        return '▼';
    }
    
    overUnderSign(unixMilliseconds){
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;
        
        // Return arrow up or arrow down (arrow down should be default)
        if(!isNegative){
            return '+';
        }
        return '-';
    }
    
    hhmmss(unixMilliseconds, use_plus_sign = false, use_minus_sign = true) {
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;

        // Use the absolute value of the seconds for calculations
        const absUnixSeconds = Math.abs(unixSeconds);

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(absUnixSeconds / 3600);
        const minutes = Math.floor((absUnixSeconds % 3600) / 60);
        const seconds = absUnixSeconds % 60;

        // Optionally, show hours without exceeding 24 (e.g., days ignored)
        const hoursRemaining = hours % 24;

        // Format the time string
        let formattedTime = `${hoursRemaining.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // If the time is negative, prepend with a minus sign
        if(unixMilliseconds == '0'){
            formattedTime = `${formattedTime}`;
        } else if(isNegative && use_minus_sign){
            formattedTime = `-${formattedTime}`;
        } else if(use_plus_sign){
            formattedTime = `+${formattedTime}`;
        }

        return formattedTime;
    }
    
    hhmmss12Hour(unixMilliseconds) {
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(unixSeconds / 3600) % 24; // Ensure the hour is in the 0-23 range
        const minutes = Math.floor((unixSeconds % 3600) / 60);
        const seconds = unixSeconds % 60;

        // Determine AM or PM
        const period = hours >= 12 ? 'PM' : 'AM';

        // Convert hours to 12-hour format
        const hours12 = hours % 12;
        const displayHours = hours12 === 0 ? 12 : hours12; // If hours % 12 is 0, show 12

        // Format time string
        const formattedTime = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;

        return formattedTime;
    }
    
    mmss(unixMilliseconds, use_plus_sign = false, use_minus_sign = true) {
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;

        // Use the absolute value of the seconds for calculations
        const absUnixSeconds = Math.abs(unixSeconds);

        // Calculate minutes and seconds
        const hours = Math.floor(absUnixSeconds / 3600);
        const minutes = Math.floor((absUnixSeconds % 3600) / 60);
        const seconds = absUnixSeconds % 60;

        // Format the time string
        let formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if(hours >= 1 && !isNaN(hours)){
            formattedTime = '59:59';
        }

        // If the time is negative, prepend with a minus sign
        if(unixMilliseconds == '0'){
            formattedTime = `${formattedTime}`;
        } else if(isNegative && use_minus_sign){
            formattedTime = `-${formattedTime}`;
        } else if(use_plus_sign){
            formattedTime = `+${formattedTime}`;
        }

        return formattedTime;
    }
    
    hh(unixMilliseconds, use_plus_sign = false, use_minus_sign = true){
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;

        // Use the absolute value of the seconds for calculations
        const absUnixSeconds = Math.abs(unixSeconds);

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(absUnixSeconds / 3600);
        const minutes = Math.floor((absUnixSeconds % 3600) / 60);
        const seconds = absUnixSeconds % 60;

        // Optionally, show hours without exceeding 24 (e.g., days ignored)
        const hoursRemaining = hours % 24;

        // Format the time string
        let formattedTime = `${hoursRemaining.toString().padStart(2, '0')}`;

        // If the time is negative, prepend with a minus sign
        if(unixMilliseconds == '0'){
            formattedTime = `${formattedTime}`;
        } else if(isNegative && use_minus_sign){
            formattedTime = `-${formattedTime}`;
        } else if(use_plus_sign){
            formattedTime = `+${formattedTime}`;
        }

        return formattedTime;
    }
    
    mm(unixMilliseconds, use_plus_sign = false, use_minus_sign = true){
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;

        // Use the absolute value of the seconds for calculations
        const absUnixSeconds = Math.abs(unixSeconds);

        // Calculate minutes and seconds
        const hours = Math.floor(absUnixSeconds / 3600);
        const minutes = Math.floor((absUnixSeconds % 3600) / 60);
        const seconds = absUnixSeconds % 60;

        // Format the time string
        let formattedTime = `${minutes.toString().padStart(2, '0')}`;

        // If the time is negative, prepend with a minus sign
        if(unixMilliseconds == '0'){
            formattedTime = `${formattedTime}`;
        } else if(isNegative && use_minus_sign){
            formattedTime = `-${formattedTime}`;
        } else if(use_plus_sign){
            formattedTime = `+${formattedTime}`;
        }

        return formattedTime;
    }
    
    ss(unixMilliseconds, use_plus_sign = false, use_minus_sign = true){
        // Ensure the input only uses whole seconds (top of the second)
        const unixSeconds = Math.floor(unixMilliseconds / 1000);

        // Check if the input is negative
        const isNegative = unixSeconds <= 0.000001;

        // Use the absolute value of the seconds for calculations
        const absUnixSeconds = Math.abs(unixSeconds);

        // Calculate minutes and seconds
        const hours = Math.floor(absUnixSeconds / 3600);
        const minutes = Math.floor((absUnixSeconds % 3600) / 60);
        const seconds = absUnixSeconds % 60;

        // Format the time string
        let formattedTime = `${seconds.toString().padStart(2, '0')}`;

        // If the time is negative, prepend with a minus sign
        if(unixMilliseconds == '0'){
            formattedTime = `${formattedTime}`;
        } else if(isNegative && use_minus_sign){
            formattedTime = `-${formattedTime}`;
        } else if(use_plus_sign){
            formattedTime = `+${formattedTime}`;
        }

        return formattedTime;
    }
    
    idifyColumnName(input) {
        if(typeof input == 'string'){
            // Remove all non-alphanumeric characters (including non-Latin letters)
            input = input.replace(/[^\p{L}\p{N}]/gu, '');

            // Replace all spaces and line breaks with a single underscore
            input = input.replace(/\s+/g, '_');
        }
        return input;
    }
    
    configHasCellTextColumns(config){
        if(!this.empty(config)){
            // Loop through config fields looking for current_cue_cell_text_column_{n} fields that aren't emtpy
            var i;
            for(i = 1; i <= 100; i ++){ // 100 to future proof
                if(!this.empty(config, 'current_cue_cell_text_column_'+i)){
                    // A column name has been set. Return true.
                    return true
                }
            }
        }
        return false;
    }
}

// Export the entire class so it can be used elsewhere in Companion
module.exports = new Helpers();