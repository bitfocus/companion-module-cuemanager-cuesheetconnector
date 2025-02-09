const Helpers = require('./helpers');

class Clock{
    initClock(self){
        self.log('debug', '[Clock] Initializing clock...');
        
        // Update clock times
        setInterval(() =>{
            if(self.getVariableValue('clock_sync_initialized') == '1'){
                self.setVariableValues({'clock_utc_unix_milliseconds': this.utcTime(self, null)});
                self.setVariableValues({'clock_utc_unix_seconds': Math.floor(this.utcTime(self, null) / 1000)});
                self.setVariableValues({'clock_local_unix_milliseconds': this.localTime(self, null)});
                self.setVariableValues({'clock_local_unix_seconds': Math.floor(this.localTime(self, null) / 1000)});
                
                self.setVariableValues({'clock_utc_hhmmss': Helpers.hhmmss(this.utcTime(self, null))});
                self.setVariableValues({'clock_local_hhmmss': Helpers.hhmmss(this.localTime(self, null))});
                
                self.setVariableValues({'clock_utc_hhmmss_12hr': Helpers.hhmmss12Hour(this.utcTime(self, null))});
                self.setVariableValues({'clock_local_hhmmss_12hr': Helpers.hhmmss12Hour(this.localTime(self, null))});
                
                if(self.getVariableValue('clock_sync_initialized') != '1'){
                    Helpers.updateStatus(self, 'Warning', 'Initializing clock...');
                }
            }
        }, 100);
        
        // Get device time offset.
        this.syncClockToCueManager(self);
        setInterval(() => {
            this.syncClockToCueManager(self);
        }, 60000);
    }

    utcTime(self, local_time_milliseconds){
        // Use current UTC time or pass a local time in.
        
        if(Helpers.empty(local_time_milliseconds)){
            var now = Math.floor(Date.now() / 1000) * 1000; // Top of the current second (Keeps timers changing together)
        } else{
            var now = Math.floor(parseInt(local_time_milliseconds) / 1000) * 1000;
            
            // Handle timezone offset
            var tz_offset = self.getVariableValue('device_timezone_offset_milliseconds');
            if(!Helpers.empty(tz_offset)){
                tz_offset = parseInt(tz_offset);
            
                if(tz_offset >= 0){
                    now = (now - Math.abs(tz_offset));
                } else{
                    now = (now + Math.abs(tz_offset));
                }
            }
        }
        
        // Handle device time offset
        var device_offset = self.getVariableValue('device_time_offset_milliseconds');
        if(!Helpers.empty(device_offset)){
            device_offset = parseInt(device_offset);

            if(device_offset >= 0){
                now = (now - Math.abs(device_offset));
            } else{
                now = (now + Math.abs(device_offset));
            }
        }
        
        return now;
    }
    
    localTime(self, utc_time_milliseconds){
        // Use current UTC time or pass a UTC time in.
        if(Helpers.empty(utc_time_milliseconds)){
            var now = Math.floor(Date.now() / 1000) * 1000; // Top of the current second (Keeps timers changing together)
        } else{
            var now =  Math.floor(parseInt(utc_time_milliseconds) / 1000) * 1000;
        }
        
        // Handle device time offset
        var device_offset = self.getVariableValue('device_time_offset_milliseconds');
        if(!Helpers.empty(device_offset)){
            device_offset = parseInt(device_offset);

            if(device_offset >= 0){
                now = (now - Math.abs(device_offset));
            } else{
                now = (now + Math.abs(device_offset));
            }
        }
        
        // Handle timezone offset
        var tz_offset = self.getVariableValue('device_timezone_offset_milliseconds');
        if(!Helpers.empty(tz_offset)){
            tz_offset = parseInt(tz_offset);
            
            if(tz_offset >= 0){
                now = (now + Math.abs(tz_offset));
            } else{
                now = (now - Math.abs(tz_offset));
            }
        }
        
        return now;
    }
    
    syncClockToCueManager(self){
        
        if(!Helpers.empty(self, 'config', 'time_service_endpoint')){
            var options = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            };
            
            var url = Helpers.trim(self.config.time_service_endpoint, '/');
            
            self.log('debug', '[Clock] Clock is calling Cue Manager time service...');
            
            
            // Set client timestamp to calculate network latency
            var client_utc_datetime = new Date();
            var now = Date.now();
            var client_timezone_offset = (client_utc_datetime.getTimezoneOffset() * 60) * 1000;
            if(client_timezone_offset < 0){
                var client_utc_timestamp = (client_utc_datetime.valueOf()).toFixed(3) - Math.abs(client_timezone_offset);
            } else{
                var client_utc_timestamp = (client_utc_datetime.valueOf()).toFixed(3) + client_timezone_offset;
            }
            
            
            fetch(url, options).then(res => {
                
                const status_code = res.status;

                // Get current timestamp in milliseconds
                var now_timestamp = Date.now();
                var network_latency = Math.abs(now_timestamp - (client_utc_timestamp));

                
                return res.text().then(responseData => {

                    var returnedData = '';

                    if(responseData != null && responseData !== '' && responseData !== undefined){
                        try{
                            returnedData = JSON.parse(responseData);
                        } catch(e){
                            returnedData = responseData;
                        }


                        // Set device time offset
                        if(!Helpers.empty(returnedData, 'time')){
                            
                            if(typeof returnedData.time == 'string'){
                            
                                // Calculate server-client difference time on response and response time
                                var server_timestamp = returnedData.time * 1000;
                                var server_client_response_diff_time = now_timestamp - server_timestamp;
                    
                                // Subtract network latency from diff
                                if(server_client_response_diff_time < 0){
                                    var server_client_clock_diff = (server_client_response_diff_time + (network_latency));
                                } else{
                                    var server_client_clock_diff = (server_client_response_diff_time - (network_latency));
                                }
                                
                        
                                // Calculate clock sync offset with sign
                                if(server_client_response_diff_time < 0){
                                    var clock_sync_offset = -Math.abs(Math.ceil(server_client_clock_diff));
                                } else{
                                    var clock_sync_offset = Math.abs(Math.ceil(server_client_clock_diff));
                                }
                                
                                
                                // Only update if change is meaningful. We don't want the clock jumping around.
                                var old_clock_sync_offset = parseInt(self.getVariableValue('device_time_offset_milliseconds'));
                                if(old_clock_sync_offset == 0 || Math.abs(old_clock_sync_offset - clock_sync_offset) > 100){
                                    
                                    if(self.getVariableValue('clock_sync_initialized') == '0'){
                                        self.setVariableValues({'clock_sync_initialized': '1'});
                                        Helpers.updateStatus(self, 'ok');
                                    }
                                    
                                    
                                    // Set device sync status
                                    var device_time_sync_status = 'OK';
                                    if(clock_sync_offset > 1500){
                                        device_time_sync_status = 'Fast';
                                    } else if(clock_sync_offset < -1500){
                                        device_time_sync_status = 'Slow';
                                    }
                                    self.setVariableValues({ 'device_time_sync_status': device_time_sync_status});
                                    
                                    // Set device offset variables
                                    self.setVariableValues({ 'device_time_offset_milliseconds': clock_sync_offset });
                                    self.setVariableValues({ 'device_time_offset_seconds': Math.floor(clock_sync_offset / 1000) });
                                    self.setVariableValues({ 'device_time_offset_human': this.formatMilliseconds(clock_sync_offset)});
                                    if(clock_sync_offset < 0){
                                        self.setVariableValues({ 'device_time_adjusted_milliseconds': -clock_sync_offset });
                                        self.setVariableValues({ 'device_time_adjusted_human': this.formatMilliseconds(clock_sync_offset, true)});
                                    } else{
                                        self.setVariableValues({ 'device_time_adjusted_milliseconds': '+'+clock_sync_offset });
                                        self.setVariableValues({ 'device_time_adjusted_human': this.formatMilliseconds(clock_sync_offset, true)});
                                    }
                                    
                                    self.log('debug', '[Clock] Device time sync is '+device_time_sync_status);
                                    self.log('debug', '[Clock] Device time offset is '+clock_sync_offset);
                                    
                                    // Set device timezone variables
                                    const deviceTzOffset = new Date().getTimezoneOffset();
                                    const deviceTzOffsetInMilliseconds = (deviceTzOffset * 60) * 1000;
                                    const deviceTzOffsetSign = deviceTzOffsetInMilliseconds > 0 ? '-' : '+';
                                    self.setVariableValues({'device_timezone': Intl.DateTimeFormat().resolvedOptions().timeZone});
                                    self.setVariableValues({'device_timezone_city': Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]});
                                    self.setVariableValues({'device_timezone_offset_milliseconds': deviceTzOffsetSign+Math.abs(deviceTzOffsetInMilliseconds)});
                                    self.setVariableValues({'device_timezone_offset_seconds': deviceTzOffsetSign+Math.abs(Math.floor(deviceTzOffsetInMilliseconds / 1000))});
                                    
                                    self.log('debug', '[Clock] Device timezone is '+Intl.DateTimeFormat().resolvedOptions().timeZone);
                                    self.log('debug', '[Clock] Device timezone offset is '+deviceTzOffsetSign+Math.abs(deviceTzOffsetInMilliseconds)+'ms');
                                    
                                } else{
                                    self.log('debug', '[Clock] Clock sync difference not enough to update. ('+Math.abs(old_clock_sync_offset - clock_sync_offset)+')ms');
                                }
                            } else{
                                // Time data type is not string
                                Helpers.updateStatus(self, 'Warning: Unable to get current time.');
                                self.log('error', '[Clock] Time service returned invalid data type for time.');
                            }
                        } else{
                            // No time data
                            Helpers.updateStatus(self, 'Warning: Unable to get current time.');
                            self.log('error', '[Clock] Time service returned no time data.');
                        }
                    }
                    
                    
                    if(status_code >= 400){
                        Helpers.updateStatus(self, 'Warning: Unable to get current time.');
                        self.log('error', '[Clock] Time service HTTP status: '+res.status, Helpers.getStatusCodeText(res.status));
                    }
                });
            }).catch(err => {
                Helpers.updateStatus(self, 'Warning', 'Clock network error.');
                self.log('error', '[Clock] '+err);
            });
        }
    }
    
    formatMilliseconds(milliseconds, flip_sign = false){
        // Flip the sign if flip_sign is true
        const adjustedMilliseconds = flip_sign ? -milliseconds : milliseconds;
        const isNegative = adjustedMilliseconds < 0;
        const absMilliseconds = Math.abs(adjustedMilliseconds);

        let result;
        if(absMilliseconds < 1000){
            // If less than 1 second, keep it as milliseconds
            result = `${absMilliseconds}ms`;
        } else if(absMilliseconds < 60000){
            // If less than 1 minute, convert to seconds
            const seconds = absMilliseconds / 1000;
            result = `${seconds.toFixed(2).slice(0, 6)}s`;
        } else if(absMilliseconds < 3600000){
            // If less than 1 hour, show as hhmmss
            result = Helpers.hhmmssOverUnder(absMilliseconds);
        } else if(absMilliseconds < 86400000){
            // If less than 1 day, show as hhmmss
            result = Helpers.hhmmssOverUnder(absMilliseconds);
        } else{
            // If 1 day or longer, convert to days
            const days = absMilliseconds / 86400000;
            result = `${days.toFixed(2).slice(0, 6)}d`;
        }

        return isNegative ? `-${result}` : `+${result}`; // Add + or - sign
    }
    
    strtotime(text){
        if(typeof text == 'string'){
            // Handle the "now" string (current time)
            if(text.toLowerCase() === 'now'){
                return self.getVariableValue('clock_utc_unix_milliseconds'); // Current timestamp in seconds
            }

            // Handle the "tomorrow" string
            if(text.toLowerCase() === 'tomorrow'){
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1); // Add one day
                return tomorrow.getTime();
            }

            // Handle "yesterday" string
            if(text.toLowerCase() === 'yesterday'){
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1); // Subtract one day
                return yesterday.getTime();
            }

            // Handle relative time expressions like "-6 hours", "2 days", "+2 days", "500 milliseconds", etc.
            const relativeMatch = text.match(/^([-+]?[\d]+) (seconds?|minutes?|hours?|days?|weeks?|months?|years?|milliseconds?)$/i);
            if(relativeMatch){
                const [_, num, unit] = relativeMatch;
                const now = new Date(self.getVariableValue('clock_utc_unix_milliseconds'));
                let multiplier = parseInt(num, 10);
            
                switch(unit.toLowerCase()){
                    case 'second':
                    case 'seconds':
                        now.setSeconds(now.getSeconds() + multiplier);
                        break;
                    case 'minute':
                    case 'minutes':
                        now.setMinutes(now.getMinutes() + multiplier);
                        break;
                    case 'hour':
                    case 'hours':
                        now.setHours(now.getHours() + multiplier);
                        break;
                    case 'day':
                    case 'days':
                        now.setDate(now.getDate() + multiplier);
                        break;
                    case 'week':
                    case 'weeks':
                        now.setDate(now.getDate() + multiplier * 7);
                        break;
                    case 'month':
                    case 'months':
                        now.setMonth(now.getMonth() + multiplier);
                        break;
                    case 'year':
                    case 'years':
                        now.setFullYear(now.getFullYear() + multiplier);
                        break;
                    case 'millisecond':
                    case 'milliseconds':
                        now.setMilliseconds(now.getMilliseconds() + multiplier);
                        break;
                    default:
                        return false; // Invalid unit
                }
                return now.getTime(); // Return UNIX timestamp in seconds
            }

            // Match both formats: space-separated or T-separated with optional fractional seconds
            const match = text.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?$/);

            if(!match){
                return false; // Invalid format
            }

            const [_, datePart, timePart, fractionalSeconds] = match;

            // Combine date and time into UTC format
            let dateTimeString = `${datePart}T${timePart}${fractionalSeconds || ''}Z`; // Ensure it's in UTC with "Z" at the end

            const parsedDate = new Date(dateTimeString);

            // Check if the parsed date is valid
            if(isNaN(parsedDate.getTime())){
                return false; // Invalid date
            }

            // Return UNIX timestamp in seconds
            return parsedDate.getTime();
        }
        
        return false;
    }
    
    date(format, timestamp = null) {
        const date = timestamp ? new Date(timestamp) : new Date();

        const padZero = (num, length = 2) => String(num).padStart(length, "0");

        const formatMap = {
            // Day
            d: () => padZero(date.getUTCDate()), // Day of the month (01 to 31)
            D: () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()], // Short day name
            j: () => date.getUTCDate(), // Day of the month without leading zeros
            l: () => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getUTCDay()], // Full day name
            N: () => date.getUTCDay() || 7, // Day of the week (1 for Monday, 7 for Sunday)
            w: () => date.getUTCDay(), // Day of the week (0 for Sunday, 6 for Saturday)
            z: () => {
                const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
                return Math.floor((date - start) / (1000 * 60 * 60 * 24));
            }, // Day of the year (0 to 365)

            // Month
            F: () => [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ][date.getUTCMonth()], // Full month name
            m: () => padZero(date.getUTCMonth() + 1), // Numeric month (01 to 12)
            M: () => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getUTCMonth()], // Short month name
            n: () => date.getUTCMonth() + 1, // Numeric month without leading zeros
            t: () => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate(), // Number of days in the month

            // Year
            Y: () => date.getUTCFullYear(), // Full numeric year
            y: () => String(date.getUTCFullYear()).slice(-2), // Two-digit year

            // Time
            a: () => (date.getUTCHours() < 12 ? "am" : "pm"), // Lowercase am/pm
            A: () => (date.getUTCHours() < 12 ? "AM" : "PM"), // Uppercase AM/PM
            g: () => date.getUTCHours() % 12 || 12, // Hour (1 to 12)
            G: () => date.getUTCHours(), // Hour (0 to 23)
            h: () => padZero(date.getUTCHours() % 12 || 12), // Hour (01 to 12)
            H: () => padZero(date.getUTCHours()), // Hour (00 to 23)
            i: () => padZero(date.getUTCMinutes()), // Minutes (00 to 59)
            s: () => padZero(date.getUTCSeconds()), // Seconds (00 to 59)

            // Full Date/Time
            c: () => date.toISOString(), // ISO 8601 date (e.g., 2025-01-09T10:00:00Z)
            r: () => date.toUTCString(), // RFC 2822 date (e.g., Thu, 09 Jan 2025 10:00:00 GMT)
            U: () => Math.floor(date.getTime() / 1000) // UNIX timestamp
        };

        return format.replace(/\\?([a-zA-Z])/g, (match, char) => {
            if (match.startsWith("\\")) return char; // Handle escaped characters
            return formatMap[char] ? formatMap[char]() : char;
        });
    }
}

module.exports = new Clock();