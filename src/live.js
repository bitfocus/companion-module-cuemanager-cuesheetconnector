const { CompanionPresetFeedback } = require('@companion-module/base');
const Constants = require('./constants');
const Helpers = require('./helpers');
const Clock = require('./clock');


// UPDATE SHEET VIA LIVE SERVICE


module.exports = function (self) {
    
    // Global variables used/updated in functions
    var checking_live_service_active = false;
    var try_first_call_interval;
    var current_position = {};
    var live_service_first_called = false;
    var live_service_last_5xx_error = 0;
    var live_updated_after = self.getVariableValue('clock_utc_unix_seconds');
    var live_service_call_status = 1;
    var live_service_call_status_time = self.getVariableValue('clock_utc_unix_seconds');
    var live_service_call_retries = 0;
    var live_service_unauthorized = false;
    var live_sheet_starts_at = '';
    var live_sheet_ends_at = '';
    var live_current_cue_created_at = '';
    var live_current_cue_updated_at = '';
    
    
    
    
    /*
        Initialize the clock.
        The current UTC and local times are kept in Companion variables.
        These times are calculated fetched and calculated from the Cue Manager time service.
        We want everything below bound to the clock we derive. No Date classes.
        This way, streamdecks can be time synced regardless of device time.
    */
    Clock.initClock(self);
    
    
    
    // Initialize updaters, checks, and timers
    initLiveService();
    
    
    
    
    // FUNCTIONS
    function callCueManagerLiveService(self){
        clearInterval(try_first_call_interval);
        
        if(!Helpers.empty(self, 'config', 'personal_access_token')){
            if(!Helpers.empty(current_position, 'sheet', 'uuid')){ // Only call live service if there is a sheet connected
                
                self.log('info', '[Live] Live service connection opened.');
                
                
                // Store the fact that we have initiated this network call.
                live_service_call_status = 2;
                live_service_call_status_time = self.getVariableValue('clock_utc_unix_seconds');

                
                var options = {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer '+self.config.personal_access_token,
                        'User-Agent': Constants.USER_AGENT
                    }
                };
            
                var url = Helpers.trim(self.config.live_service_base_endpoint, '/')+'/'+current_position.sheet.uuid;
                url += '?updated_after='+live_updated_after+'&btab_id='+'companion_'+Constants.SESSION_TOKEN;
                url += '&accept=application%2Fjson&include[]=next_position&include[]=duration_totals&include[]=cue_number';
                if(Helpers.configHasCellTextColumns(self.config) && self.config.store_cue_cell_text_as_variables_enabled){
                    url += '&include[]=current_position_cells&include[]=next_position_cells';
                }

                fetch(url, options).then(res => {
                    self.log('info', '[Live] Live service connection closed with HTTP' + res.status + '.');
                    
                    // Store the fact that we have finished this network call.
                    live_service_call_status = 3;
                    live_service_call_status_time = self.getVariableValue('clock_utc_unix_seconds');
                    
                    

                    return res.text().then(responseData => {
                        var returnedData = '';
                        var caughtError;

                        if (responseData != null && responseData !== '' && responseData !== undefined) {
                            try{
                                returnedData = JSON.parse(responseData);
                                
                                // VARIABLE(S) USED IN OTHER FUNCTIONS
                                // Make sure personal access token is valid
                                if(res.status === 401){ // HTTP401 personal access token invalid
                                    live_service_unauthorized = true;
                                } else {
                                    live_service_unauthorized = false;
                                }

                                
                                // Determine what to do with the response
                                if (live_service_unauthorized === true) {
                                    self.log('error', '[Live] Personal access token not authorized.');
                                } else if (Helpers.isset(returnedData, 'time')) {
                                    // Receive live service data
                                    receiveLiveServiceData(self, returnedData);
                                } else if (live_service_call_retries < 1) {
                                    // try again
                                    callCueManagerLiveService(self);
                                    // Increment retries
                                    live_service_call_retries ++;
                                }
                                
                                
                            } catch(error){
                                caughtError = error;
                                Helpers.updateStatus(self, 'Warning', 'JSON body not returned.');
                                self.log('error', '[Live] '+error);
                            }
                        }

                        if(res.status >= 400 && res.status < 500){
                            // Handle 4xx errors
                            
                            Helpers.updateStatus(self, 'Live Status: ' + res.status, Helpers.getStatusCodeText(res.status));
                            self.log('error', '[Live] Live service HTTP status: '+res.status, Helpers.getStatusCodeText(res.status));
                            
                        } else if(res.status >= 500){
                            // Handle 5xx errors
                            
                            self.log('error', '[Live] Live service returned status code '+res.status+' '+Helpers.getStatusCodeText(res.status));
                            self.log('error', '[Live] Live service HTTP status: '+res.status, Helpers.getStatusCodeText(res.status));
                            
                            // If multiple 5xx errors have happened in a row, set companion status warning.
                            if(live_service_last_5xx_error > self.getVariableValue('clock_utc_unix_milliseconds') - 30000){
                                Helpers.updateStatus(self, 'Live Status: ' + res.status, Helpers.getStatusCodeText(res.status));
                            }
                            
                            // Set timestamp of this 5xx error so we can track it later
                            live_service_last_5xx_error = self.getVariableValue('clock_utc_unix_milliseconds');

                        } else if(Helpers.empty(caughtError)){
                            // All is well. Make sure to set status to OK to clear previous warnings or errors.
                            Helpers.updateStatus(self, 'ok');
                        }

                    });
                }).catch(error => {
                    // Allow live service to be called again.
                    live_service_call_status = 3;
                    live_service_call_status_time = self.getVariableValue('clock_utc_unix_seconds');
                    
                    // Display and log warning
                    Helpers.updateStatus(self, 'Warning', 'Live network error.');
                    self.log('error', '[Live] '+error);
                });
            } else{
                self.log('info', '[Live] Sheet not set.');
                
                // CLEAR BUTTON TEXT
                // Define only cue manager variables. We don't want to clear device/session variables.
                clearCurrentCueOverUnder();
                Helpers.resetVariables(self, [
                    'project_',
                    'sheet_',
                    'current_cue_',
                    'next_cue_',
                    'following'
                ]);
            }
        } else{
            Helpers.updateStatus(self, 'Warning', 'Personal access token empty.');
            self.log('error', '[Live] Personal access token cannot be empty.');
        }
    }
    
    
    function receiveLiveServiceData(self, data){
        if(!Helpers.empty(current_position, 'sheet', 'uuid')){
            
            //  Update live_updated_after and call live service
            if(!Helpers.empty(data, 'updates', 'query_timestamp')){
                live_updated_after = data.updates.query_timestamp;
            }
            
            
            // Call the live service again if it was finished.
            if(live_service_call_status == 3){
                callCueManagerLiveService(self);
            }

            
            // Update companion variables
            if(!Helpers.empty(data, 'updates', 'sheet', 'query_timestamp')){
                self.log('info', '[Live] Sheet timestamp retrieved.');
                if(Helpers.isset(data, 'updates', 'sheet', 'current_position_row_name')){
                    self.log('info', '[Live] Sheet position retrieved.');
                    

                    // Clear over/under timers
                    if(
                        Helpers.empty(data, 'updates', 'sheet', 'my_position_current_row_uuid')
                        && Helpers.empty(data, 'updates', 'sheet', 'sheet_caller_position_current_row_uuid')
                    ){
                        clearCurrentCueOverUnder();
                    }
                    
                    
                    // Generic variables
                    self.setVariableValues({'tenant_name': Helpers.buttonFriendlyText(data.tenant_name)});
                    self.setVariableValues({'user_name': Helpers.buttonFriendlyText(data.user_name)});
                    self.setVariableValues({'project_name': Helpers.buttonFriendlyText(data.updates.sheet.regarding_project_name)});
                    self.setVariableValues({'sheet_name': Helpers.buttonFriendlyText(data.updates.sheet.name)});
                    self.setVariableValues({'current_cue_uuid': Helpers.buttonFriendlyText(data.updates.sheet.current_position_row_uuid)});
                    self.setVariableValues({'current_cue_number': data.updates.sheet.current_position_cue_number});
                    self.setVariableValues({'current_cue_name': Helpers.buttonFriendlyText(data.updates.sheet.current_position_row_name)});
                    self.setVariableValues({'next_cue_name': Helpers.buttonFriendlyText(data.updates.sheet.next_position_row_name)});
                    
                    
                    
                    // Cell Text Variables
                    if(Helpers.configHasCellTextColumns(self.config) && self.config.store_cue_cell_text_as_variables_enabled){
                        if(!Helpers.empty(data, 'updates', 'sheet', 'current_position_cells')){
                            // Loop through 4 cell text column names (We support 4)
                            var i;
                            for(i = 1; i <= 4; i ++){
                                var col_name_id = Helpers.idifyColumnName(self.config['current_cue_cell_text_column_'+i]);
                                if(!Helpers.empty(data, 'updates', 'sheet', 'current_position_cells', col_name_id)){
                                    self.setVariableValues({['current_cue_cell_text_column_'+i]: Helpers.buttonFriendlyText(data.updates.sheet.current_position_cells[col_name_id])});
                                } else{
                                    self.setVariableValues({['current_cue_cell_text_column_'+i]: ''});
                                }
                            }
                        }
                        
                        if(!Helpers.empty(data, 'updates', 'sheet', 'next_position_cells')){
                            // Loop through 4 cell text column names (We support 4)
                            var i;
                            for(i = 1; i <= 4; i ++){
                                var col_name_id = Helpers.idifyColumnName(self.config['current_cue_cell_text_column_'+i]);
                                if(!Helpers.empty(data, 'updates', 'sheet', 'next_position_cells', col_name_id)){
                                    self.setVariableValues({['next_cue_cell_text_column_'+i]: Helpers.buttonFriendlyText(data.updates.sheet.next_position_cells[col_name_id])});
                                } else{
                                    self.setVariableValues({['next_cue_cell_text_column_'+i]: ''});
                                }
                            }
                        }
                    }
                    
                    
                    // VARIABLE(S) USED IN OTHER FUNCTIONS
                    live_sheet_starts_at = data.updates.sheet.starts_at;
                    live_sheet_ends_at = data.updates.sheet.ends_at;
                    
                    
                    // Name of a followed user (if followed)
                    if(!Helpers.empty(data, 'updates', 'sheet', 'following', 'name')){
                        self.setVariableValues({'following_user_name': Helpers.buttonFriendlyText(data.updates.sheet.following.name)});
                    } else{
                        self.setVariableValues({'following_user_name': ''});
                    }
                    
                    
                    // Cue duration, offset and over/under
                    var duration_offset = '0';
                    if(!Helpers.empty(data, 'updates', 'sheet', 'my_position_duration_offset')){
                        duration_offset = data.updates.sheet.my_position_duration_offset;
                        live_current_cue_created_at = data.updates.sheet.my_position_created_at;
                        live_current_cue_updated_at = data.updates.sheet.my_position_updated_at;
                    } else if(!Helpers.empty(data, 'updates', 'sheet', 'sheet_caller_position_duration_offset')){
                        duration_offset = data.updates.sheet.sheet_caller_position_duration_offset;
                        live_current_cue_created_at = data.updates.sheet.sheet_caller_position_created_at;
                        live_current_cue_updated_at = data.updates.sheet.sheet_caller_position_updated_at;
                    }
                    
                    
                    // Sheet over/under
                    if(!Helpers.empty(data, 'updates', 'sheet')){
                        Helpers.setSheetDurationTotals(
                            self,
                            data.updates.sheet.duration_total,
                            data.updates.sheet.duration_remaining_excluding_current
                        );
                    }
                    
                    
                    // Set duration variables
                    if(!Helpers.empty(data, 'updates', 'sheet')){
                        Helpers.setCueDurations(
                            self,
                            'current_cue',
                            data.updates.sheet.current_position_row_duration,
                            duration_offset
                        );
                        Helpers.setCueDurations(
                            self,
                            'next_cue',
                            data.updates.sheet.next_position_row_duration,
                            0
                        );
                    }
                    
                }
            }
        }
    }
    
    
    function checkLiveServiceCallActive(self){
        if(!Helpers.empty(current_position, 'sheet', 'uuid')){
            if(checking_live_service_active == false){
                // VARIABLE(S) USED IN OTHER FUNCTIONS
                checking_live_service_active = true;
                
                
                if((live_service_call_status == 1 || live_service_call_status == 3) && live_service_call_status_time < self.getVariableValue('clock_utc_unix_seconds')){
                    // Live service call is probably inactive
                    self.log('error', '[Live] Live service call is inactive.');
                    
                    
                    if(live_service_call_retries > 0){
                        // We have already tried recently, we don't want to call now. Wait to prevent rapid call loops
                        // Log that we will check again soon...
                        if(live_service_unauthorized == false){
                            self.log('info', '[Live] Checking live service shortly...');
                        } else{
                            self.log('error', '[Live] Personal access token not authorized.');
                        }
                        
                        // Decrement retries since we have checked
                        live_service_call_retries --;
                    } else{
                        // Call live service
                        callCueManagerLiveService(self);
                        live_service_call_retries = 1;
                    }
                } else{
                    self.log('info', '[Live] Live service call is active.');
                }
            } else{
                self.log('info', '[Live] Already checking if calling live service is active.');
            }
        } else{
            self.log('info', '[Live] No sheet connected.');
        }
        
        // VARIABLE(S) USED IN OTHER FUNCTIONS
        // We have finished checking
        checking_live_service_active = false;
    }
    
    function clearCurrentCueOverUnder(){
        // Reset function variables
        live_current_cue_created_at = '';
        live_current_cue_updated_at = '';
        
        Helpers.setCueDurations(self, 'current_cue', 0, 0);
        
        // Reset companion variables
        Helpers.resetVariables(self, [
            'current_cue_over_under_',
            'current_cue_elapsed_',
            'current_cue_remaining_',
            'current_cue_duration_',
            'next_cue_duration_'
        ]);
        
        // Loop through 4 cell text column names (We support 4) and clear them
        var i;
        for(i = 1; i <= 4; i ++){
            self.setVariableValues({['current_cue_cell_text_column_'+i]: ''});
        }
    }
    
    function setCurrentCueOverUnder(updated_at){
        
        var duration = self.getVariableValue('current_cue_duration_seconds');
        var offset = self.getVariableValue('current_cue_duration_offset_seconds');
        
        if((!Helpers.empty(duration) || duration == '0') &&!Helpers.empty(updated_at) && !isNaN(duration)){
            
            // Calculate milliseconds
            var duration_milliseconds = parseInt(duration) * 1000;
            
            // Recalculate duration_milliseconds to include duration offset
            if(!Helpers.empty(offset) && !isNaN(offset)){
                var offset_milliseconds = parseInt(offset) * 1000;
                duration_milliseconds = duration_milliseconds + (offset_milliseconds);
            }
            
            
            // Calculate the over/under and elapsed time
            var updated_at_local_milliseconds = Clock.localTime(self, Clock.strtotime(updated_at));
            if(duration_milliseconds > 0){
                var time_elapsed_since_called_milliseconds = Clock.localTime(self, self.getVariableValue('clock_utc_unix_milliseconds')) - updated_at_local_milliseconds;
                var cue_over_under_milliseconds = time_elapsed_since_called_milliseconds - duration_milliseconds;
            } else{
                var time_elapsed_since_called_milliseconds = 0;
                var cue_over_under_milliseconds = 0;
            }
            
            
            // Set companion variables
            self.setVariableValues({'current_cue_over_under_hhmmss': Helpers.hhmmssOverUnder(cue_over_under_milliseconds, true)});
            self.setVariableValues({'current_cue_over_under_hh': Helpers.hh(cue_over_under_milliseconds, false, false)});
            self.setVariableValues({'current_cue_over_under_mm': Helpers.mm(cue_over_under_milliseconds, false, false)});
            self.setVariableValues({'current_cue_over_under_ss': Helpers.ss(cue_over_under_milliseconds, false, false)});
            self.setVariableValues({'current_cue_over_under_arrow': Helpers.overUnderArrow(cue_over_under_milliseconds)});
            self.setVariableValues({'current_cue_over_under_sign': Helpers.overUnderSign(cue_over_under_milliseconds)});
            self.setVariableValues({'current_cue_over_under_milliseconds': cue_over_under_milliseconds});
            self.setVariableValues({'current_cue_over_under_seconds': Math.floor(cue_over_under_milliseconds / 1000)});
            
            self.setVariableValues({'current_cue_elapsed_hhmmss': Helpers.hhmmssOverUnder(time_elapsed_since_called_milliseconds, true)});
            self.setVariableValues({'current_cue_elapsed_hh': Helpers.hh(time_elapsed_since_called_milliseconds, false, false)});
            self.setVariableValues({'current_cue_elapsed_mm': Helpers.mm(time_elapsed_since_called_milliseconds, false, false)});
            self.setVariableValues({'current_cue_elapsed_ss': Helpers.ss(time_elapsed_since_called_milliseconds, false, false)});
            self.setVariableValues({'current_cue_elapsed_milliseconds': time_elapsed_since_called_milliseconds});
            self.setVariableValues({'current_cue_elapsed_seconds': Math.floor(time_elapsed_since_called_milliseconds / 1000)});
            
            if(cue_over_under_milliseconds <= -1000){
                self.setVariableValues({'current_cue_remaining_hhmmss': Helpers.hhmmss(Math.abs(cue_over_under_milliseconds))});
                self.setVariableValues({'current_cue_remaining_hh': Helpers.hh(time_elapsed_since_called_milliseconds, false, false)});
                self.setVariableValues({'current_cue_remaining_mm': Helpers.mm(time_elapsed_since_called_milliseconds, false, false)});
                self.setVariableValues({'current_cue_remaining_ss': Helpers.ss(time_elapsed_since_called_milliseconds, false, false)});
            } else{
                self.setVariableValues({'current_cue_remaining_hhmmss': '00:00:00'});
                self.setVariableValues({'current_cue_remaining_hh': '00'});
                self.setVariableValues({'current_cue_remaining_mm': '00'});
                self.setVariableValues({'current_cue_remaining_ss': '00'});
            }
            self.setVariableValues({'current_cue_remaining_milliseconds': -cue_over_under_milliseconds});
            self.setVariableValues({'current_cue_remaining_seconds': -Math.floor(cue_over_under_milliseconds / 1000)});
        }
    }
    
    function setSheetOverUnder(sheet_starts_at, sheet_ends_at, current_cue_created_at, current_cue_updated_at){
        var current_cue_duration =  self.getVariableValue('current_cue_duration_seconds');
        var current_cue_offset = self.getVariableValue('current_cue_duration_offset_seconds');
        var duration_total =  self.getVariableValue('sheet_total_runtime_seconds');
        var duration_remaining = self.getVariableValue('sheet_duration_remaining_excluding_current_seconds');
        
        if((!Helpers.empty(duration_total) || duration_total == '0') && !isNaN(duration_total)){
            // Calculate milliseconds
            var duration_total_milliseconds = parseInt(duration_total) * 1000;
            var duration_remaining_milliseconds = parseInt(duration_remaining) * 1000;
            

            // Calculate current cue times if any
            var time_elapsed_since_called_milliseconds = 0;
            var current_cue_remaining_milliseconds = 0;
            if(!Helpers.empty(current_cue_updated_at)){
                // Calculate milliseconds
                var current_cue_duration_milliseconds = parseInt(current_cue_duration) * 1000;
            
                // Recalculate current_cue_duration_milliseconds to include duration offset
                if(!Helpers.empty(current_cue_offset) && !isNaN(current_cue_offset)){
                    var current_cue_offset_milliseconds = parseInt(current_cue_offset) * 1000;
                    current_cue_duration_milliseconds = current_cue_duration_milliseconds + (current_cue_offset_milliseconds);
                }
                
                // Elapsed and remaining
                time_elapsed_since_called_milliseconds = Clock.localTime(self, self.getVariableValue('clock_utc_unix_milliseconds')) - Clock.localTime(self, Clock.strtotime(current_cue_updated_at));
                current_cue_remaining_milliseconds = (time_elapsed_since_called_milliseconds - current_cue_duration_milliseconds);
            }
            
            
            // Calculate the projected end time
            var projected_finish_milliseconds = Clock.localTime(self, Clock.strtotime(current_cue_updated_at)) + duration_remaining_milliseconds + current_cue_duration_milliseconds;
            if(current_cue_remaining_milliseconds > 0){
                // Take into account the current cue.
                projected_finish_milliseconds = projected_finish_milliseconds + current_cue_remaining_milliseconds;
            }
            
            
            // Over/under
            if(!Helpers.empty(sheet_starts_at) && !Helpers.empty(sheet_ends_at)){
                var start_time = Clock.strtotime(sheet_starts_at);
                var end_time = Clock.strtotime(sheet_ends_at);
                var now = Clock.utcTime(self);
                
                // Calculate when the sheet "should" be finished by based on the start time of the sheet
                var target_finish_milliseconds = Clock.localTime(self, Clock.strtotime(sheet_starts_at)) + duration_total_milliseconds;
                
                
                if(now < end_time && !Helpers.empty(current_cue_created_at)){
                    // A CUE IS RUNNING
                    
                    
                    // Calculate over/under
                    if(target_finish_milliseconds < (Clock.localTime(self, self.getVariableValue('clock_utc_unix_milliseconds')) + duration_remaining_milliseconds)){
                        var sheet_over_under_milliseconds = projected_finish_milliseconds - target_finish_milliseconds;
                    } else{
                        var sheet_over_under_milliseconds = projected_finish_milliseconds - target_finish_milliseconds; // Needs -1000 to match App UI?
                    }
                    
                    // Set over/under companion variables
                    self.setVariableValues({'sheet_over_under_sign': Helpers.overUnderSign(sheet_over_under_milliseconds)});
                    self.setVariableValues({'sheet_over_under_arrow': Helpers.overUnderArrow(sheet_over_under_milliseconds)});
                    self.setVariableValues({'sheet_over_under_hhmmss': Helpers.hhmmssOverUnder(sheet_over_under_milliseconds, 1)});
                    self.setVariableValues({'sheet_over_under_hh': Helpers.hh(sheet_over_under_milliseconds, false, false)});
                    self.setVariableValues({'sheet_over_under_mm': Helpers.mm(sheet_over_under_milliseconds, false, false)});
                    self.setVariableValues({'sheet_over_under_ss': Helpers.ss(sheet_over_under_milliseconds, false, false)});
                    self.setVariableValues({'sheet_over_under_milliseconds': (sheet_over_under_milliseconds)});
                    self.setVariableValues({'sheet_over_under_seconds': (Math.floor(sheet_over_under_milliseconds / 1000))});
                } else if(now < end_time && target_finish_milliseconds > Clock.localTime(self, self.getVariableValue('clock_utc_unix_milliseconds'))){
                    // NO CUES RUNNING
                    
                    
                    // Calculate over/under
                    projected_finish_milliseconds = Clock.localTime(self, self.getVariableValue('clock_utc_unix_milliseconds'));
                    if(projected_finish_milliseconds > target_finish_milliseconds){
                        var sheet_over_under_milliseconds = target_finish_milliseconds - projected_finish_milliseconds;
                    } else{
                        var sheet_over_under_milliseconds = projected_finish_milliseconds - target_finish_milliseconds; // Needs -1000 to match App UI?
                    }
                    
                    // Set over/under companion variables
                    self.setVariableValues({'sheet_over_under_sign': Helpers.overUnderSign(sheet_over_under_milliseconds)});
                    self.setVariableValues({'sheet_over_under_arrow': Helpers.overUnderArrow(sheet_over_under_milliseconds)});
                    self.setVariableValues({'sheet_over_under_hhmmss': Helpers.hhmmssOverUnder(sheet_over_under_milliseconds, 1)});
                    self.setVariableValues({'sheet_over_under_hh': Helpers.hh(sheet_over_under_milliseconds, false, false)});
                    self.setVariableValues({'sheet_over_under_mm': Helpers.mm(sheet_over_under_milliseconds, false, false)});
                    self.setVariableValues({'sheet_over_under_ss': Helpers.ss(sheet_over_under_milliseconds, false, false)});
                    self.setVariableValues({'sheet_over_under_milliseconds': (sheet_over_under_milliseconds)});
                    self.setVariableValues({'sheet_over_under_seconds': (Math.floor(sheet_over_under_milliseconds / 1000))});
                } else{
                    // NO CUES RUNNING - Sheet's target end time has passed. Default companion variables.
                    
                    self.setVariableValues({'sheet_over_under_sign': '-'});
                    self.setVariableValues({'sheet_over_under_arrow': '▼'});
                    self.setVariableValues({'sheet_over_under_hhmmss': '00:00:00'});
                    self.setVariableValues({'sheet_over_under_hh': '00'});
                    self.setVariableValues({'sheet_over_under_mm': '00'});
                    self.setVariableValues({'sheet_over_under_ss': '00'});
                    self.setVariableValues({'sheet_over_under_milliseconds': '0'});
                    self.setVariableValues({'sheet_over_under_seconds': '0'});
                }
                
                // Set the projected finish variables
                self.setVariableValues({'sheet_projected_finish': Helpers.hhmmss(projected_finish_milliseconds)});
                self.setVariableValues({'sheet_projected_finish_12hr': Helpers.hhmmss12Hour(projected_finish_milliseconds)});
                
                
                // Set variables for total time remaining
                var current_cue_remaining_milliseconds = parseInt(self.getVariableValue('current_cue_remaining_milliseconds'));
                var sheet_duration_remaining_excluding_current_milliseconds = parseInt(self.getVariableValue('sheet_duration_remaining_excluding_current_milliseconds'));
                if(!isNaN(current_cue_remaining_milliseconds) && !isNaN(sheet_duration_remaining_excluding_current_milliseconds)){
                    if(current_cue_remaining_milliseconds > 0){
                        var total_remaining_milliseconds = current_cue_remaining_milliseconds + sheet_duration_remaining_excluding_current_milliseconds;
                    } else{
                        var total_remaining_milliseconds = sheet_duration_remaining_excluding_current_milliseconds;
                    }
                    
                    if(total_remaining_milliseconds <= 0){
                        total_remaining_milliseconds = 0;
                        var total_remaining_seconds = 0;
                    } else{
                        var total_remaining_seconds = (total_remaining_milliseconds / 1000);
                    }
                
                    self.setVariableValues({'sheet_duration_remaining_hhmmss': Helpers.hhmmss(total_remaining_milliseconds)});
                    self.setVariableValues({'sheet_duration_remaining_hh': Helpers.hh(total_remaining_milliseconds, false, false)});
                    self.setVariableValues({'sheet_duration_remaining_mm': Helpers.mm(total_remaining_milliseconds, false, false)});
                    self.setVariableValues({'sheet_duration_remaining_ss': Helpers.ss(total_remaining_milliseconds, false, false)});
                    self.setVariableValues({'sheet_duration_remaining_seconds': total_remaining_seconds});
                    self.setVariableValues({'sheet_duration_remaining_milliseconds': total_remaining_milliseconds});
                } else{
                    self.setVariableValues({'sheet_duration_remaining_hhmmss': '00:00:00'});
                    self.setVariableValues({'sheet_duration_remaining_hh': '00'});
                    self.setVariableValues({'sheet_duration_remaining_mm': '00'});
                    self.setVariableValues({'sheet_duration_remaining_ss': '00'});
                    self.setVariableValues({'sheet_duration_remaining_seconds': 0});
                    self.setVariableValues({'sheet_duration_remaining_milliseconds': 0});
                }
                
                // Set countdown to start
                
                var sheet_countdown_to_start_milliseconds = start_time - now;
                    
                if(now < end_time && now < start_time && Helpers.empty(self.getVariableValue('current_cue_uuid'))){
                    self.setVariableValues({'sheet_countdown_to_start_hhmmss': Helpers.hhmmssOverUnder(-Math.abs(sheet_countdown_to_start_milliseconds), true)});
                    self.setVariableValues({'sheet_countdown_to_start_hh': Helpers.hh(Math.abs(sheet_countdown_to_start_milliseconds), false, false)});
                    self.setVariableValues({'sheet_countdown_to_start_mm': Helpers.mm(Math.abs(sheet_countdown_to_start_milliseconds), false, false)});
                    self.setVariableValues({'sheet_countdown_to_start_ss': Helpers.ss(Math.abs(sheet_countdown_to_start_milliseconds), false, false)});
                    self.setVariableValues({'sheet_countdown_to_start_milliseconds': -Math.abs(sheet_countdown_to_start_milliseconds)});
                    self.setVariableValues({'sheet_countdown_to_start_seconds': -Math.floor(Math.abs(sheet_countdown_to_start_milliseconds / 1000))});
                } else if(now < end_time && Helpers.empty(self.getVariableValue('current_cue_uuid'))){
                    self.setVariableValues({'sheet_countdown_to_start_hhmmss': Helpers.hhmmssOverUnder(Math.abs(sheet_countdown_to_start_milliseconds), true)});
                    self.setVariableValues({'sheet_countdown_to_start_hh': Helpers.hh(Math.abs(sheet_countdown_to_start_milliseconds), false, false)});
                    self.setVariableValues({'sheet_countdown_to_start_mm': Helpers.mm(Math.abs(sheet_countdown_to_start_milliseconds), false, false)});
                    self.setVariableValues({'sheet_countdown_to_start_ss': Helpers.ss(Math.abs(sheet_countdown_to_start_milliseconds), false, false)});
                    self.setVariableValues({'sheet_countdown_to_start_milliseconds': Math.abs(sheet_countdown_to_start_milliseconds)});
                    self.setVariableValues({'sheet_countdown_to_start_seconds': Math.floor(Math.abs(sheet_countdown_to_start_milliseconds / 1000))});
                } else{
                    self.setVariableValues({'sheet_countdown_to_start_hhmmss': '00:00:00'});
                    self.setVariableValues({'sheet_countdown_to_start_hh': '00'});
                    self.setVariableValues({'sheet_countdown_to_start_mm': '00'});
                    self.setVariableValues({'sheet_countdown_to_start_ss': '00'});
                    self.setVariableValues({'sheet_countdown_to_start_milliseconds': 0});
                    self.setVariableValues({'sheet_countdown_to_start_seconds': 0});
                }
            } else{
                // No sheet is currently selected. Default companion variables.
                
                self.setVariableValues({'sheet_over_under_hhmmss': '00:00:00'});
                self.setVariableValues({'sheet_over_under_hh': '00'});
                self.setVariableValues({'sheet_over_under_mm': '00'});
                self.setVariableValues({'sheet_over_under_ss': '00'});
                self.setVariableValues({'sheet_over_under_milliseconds': '0'});
                self.setVariableValues({'sheet_over_under_seconds': '0'});
                self.setVariableValues({'sheet_projected_finish': '00:00:00'});
                self.setVariableValues({'sheet_projected_finish_12hr': '00:00:00 AM'});
            }
        }
    }
    
    function callCueManagerCompanionService(self, method, endpoint){

        var settingsValidation = Helpers.validateCMSettings(self.config);
        
        if(!Helpers.empty(self, 'config', 'personal_access_token')){
            if(settingsValidation == 'OK'){

                var options = {
                    method: method,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer '+self.config.personal_access_token,
                        'User-Agent': Constants.USER_AGENT
                    }
                };
            
                var url = Helpers.trim(self.config.companion_service_base_endpoint, '/')+'/'+endpoint;
                if(Helpers.configHasCellTextColumns(self.config) && self.config.store_cue_cell_text_as_variables_enabled){
                    url += '?include[]=current_position_cells&include[]=next_position_cells';
                }
                
                self.log('info', '[Live] Live is calling Cue Manager companion service...');
                
                fetch(url, options).then(res => {
                    
                    return res.text().then(responseData => {
                        var jsonData = null;
                        var caughtError;
                        
                        if (responseData != null && responseData !== '' && responseData !== undefined) {
                            try {
                                jsonData = JSON.parse(responseData);
                                
                                
                                // VARIABLE(S) USED IN OTHER FUNCTIONS
                                // Set this data as the global current position object
                                current_position = jsonData;

                                
                                if(res.status === 200){
                                    // Current position uuid
                                    if(Helpers.isset(jsonData, 'current_position', 'regarding_row_name')){
                                        self.setVariableValues({ 'current_cue_uuid': Helpers.buttonFriendlyText(jsonData.current_position.current_row_uuid) });
                                    } else {
                                        self.setVariableValues({ 'current_cue_uuid': '' });
                                    }
                                    
                                    // Current cue number
                                    if(Helpers.isset(jsonData, 'current_position', '_cue_number')){
                                        self.setVariableValues({ 'current_cue_number': jsonData.current_position._cue_number});
                                    } else {
                                        self.setVariableValues({ 'current_cue_number': '' });
                                    }
                                    
                                    // Current position name
                                    if(Helpers.isset(jsonData, 'current_position', 'regarding_row_name')){
                                        self.setVariableValues({ 'current_cue_name': Helpers.buttonFriendlyText(jsonData.current_position.regarding_row_name)});
                                    } else {
                                        self.setVariableValues({ 'current_cue_name': '' });
                                    }
                                    
                                    // Next callable cue
                                    if(Helpers.isset(jsonData, 'next_callable', 'name')){
                                        self.setVariableValues({ 'next_cue_name': Helpers.buttonFriendlyText(jsonData.next_callable.name) });
                                    } else {
                                        self.setVariableValues({ 'next_cue_name': '' });
                                    }
                                    
                                    
                                    // Project/sheet/tenant/user names
                                    if(Helpers.isset(jsonData, 'project', 'name')){
                                        self.setVariableValues({'project_name': Helpers.buttonFriendlyText(jsonData.project.name)});
                                    }
                                    if(Helpers.isset(jsonData, 'sheet', 'name')){
                                        self.setVariableValues({'sheet_name': Helpers.buttonFriendlyText(jsonData.sheet.name)});
                                    }
                                    if(Helpers.isset(jsonData, 'tenant', 'name')){
                                        self.setVariableValues({'tenant_name': Helpers.buttonFriendlyText(jsonData.tenant.name)});
                                    }
                                    if(Helpers.isset(jsonData, 'user', 'name')){
                                        self.setVariableValues({'user_name': Helpers.buttonFriendlyText(jsonData.user.name)});
                                    }
                                    
                                    
                                    // Duration variables
                                    if(!Helpers.empty(jsonData, 'current_position')){
                                        Helpers.setCueDurations(
                                            self,
                                            'current_cue',
                                            jsonData.current_position.regarding_row_duration,
                                            jsonData.current_position.duration_offset
                                        );
                                    }
                                    if(!Helpers.empty(jsonData, 'next_callable')){
                                        Helpers.setCueDurations(
                                            self,
                                            'next_cue',
                                            jsonData.next_callable.duration,
                                            0
                                        );
                                    }
                                    
                                    
                                    // Cell Text Variables
                                    if(Helpers.configHasCellTextColumns(self.config) && self.config.store_cue_cell_text_as_variables_enabled){
                                        if(!Helpers.empty(jsonData, 'current_position', 'cells')){
                                            // Loop through 4 cell text column names (We support 4)
                                            var i;
                                            for(i = 1; i <= 4; i ++){
                                                var col_name_id = Helpers.idifyColumnName(self.config['current_cue_cell_text_column_'+i]);
                                                if(!Helpers.empty(jsonData, 'current_position', 'cells', col_name_id)){
                                                    self.setVariableValues({['current_cue_cell_text_column_'+i]: Helpers.buttonFriendlyText(jsonData.current_position.cells[col_name_id])});
                                                } else{
                                                    self.setVariableValues({['current_cue_cell_text_column_'+i]: ''});
                                                }
                                            }
                                        }
                                        
                                        if(!Helpers.empty(jsonData, 'next_callable', 'cells')){
                                            // Loop through 4 cell text column names (We support 4)
                                            var i;
                                            for(i = 1; i <= 4; i ++){
                                                var col_name_id = Helpers.idifyColumnName(self.config['current_cue_cell_text_column_'+i]);
                                                if(!Helpers.empty(jsonData, 'next_callable', 'cells', col_name_id)){
                                                    self.setVariableValues({['next_cue_cell_text_column_'+i]: Helpers.buttonFriendlyText(jsonData.next_callable.cells[col_name_id])});
                                                } else{
                                                    self.setVariableValues({['next_cue_cell_text_column_'+i]: ''});
                                                }
                                            }
                                        }
                                    }
                                    
                                    
                                    // VARIABLE(S) USED IN OTHER FUNCTIONS
                                    // Cue duration, offset, & over/under
                                    live_sheet_starts_at = jsonData.sheet.starts_at;
                                    live_sheet_ends_at = jsonData.sheet.ends_at;
                                    if(!Helpers.empty(jsonData, 'current_position')){
                                        live_current_cue_created_at = jsonData.current_position.created_at;
                                        live_current_cue_updated_at = jsonData.current_position.updated_at;
                                    }
                                    
                                    
                                    // VARIABLE(S) USED IN OTHER FUNCTIONS
                                    // Sheet over/under
                                    if(!Helpers.empty(jsonData, 'sheet')){
                                        Helpers.setSheetDurationTotals(
                                            self,
                                            jsonData.sheet.duration_total,
                                            jsonData.sheet.duration_remaining_excluding_current
                                        );
                                    }
                                }

                                Helpers.updateStatus(self, 'ok');
                            } catch(error){
                                caughtError = error;
                                Helpers.updateStatus(self, 'Error', 'JSON body not returned.');
                                self.log('error', '[Live] '+error);
                            }
                        }

                        if(res.status >= 400){
                            Helpers.updateStatus(self, 'Companion Status: ' + res.status, Helpers.getStatusCodeText(res.status));
                            self.log('error', '[Live] Companion service HTTP status: '+res.status, Helpers.getStatusCodeText(res.status));
                            
                            // Clear cue manager variables if no sheet connected.
                            if(Helpers.empty(current_position, 'sheet')){
                                
                                clearCurrentCueOverUnder();
                                
                                // Define only cue manager variables. We don't want to clear device/session variables.
                                Helpers.resetVariables(self, [
                                    'project_',
                                    'sheet_',
                                    'current_cue_',
                                    'next_cue_',
                                    'following'
                                ]);
                            }
                        } else if(Helpers.empty(caughtError)){
                            Helpers.updateStatus(self, 'ok');
                        }

                    });
                }).catch(error => {
                    Helpers.updateStatus(self, 'Warning', 'Live API network error.');
                    self.log('error', '[Live] '+error);
                });
            
            } else{
                Helpers.updateStatus(self, 'Warning', settingsValidation);
                self.log('error', '[Live] '+settingsValidation);
            }
        } else{
            Helpers.updateStatus(self, 'Warning', 'Personal access token empty.');
            self.log('error', '[Live] Personal access token cannot be empty.');
        }
    }
    
    function initLiveService(){
        // First, we want to get initial project, sheet, user, tenant, and position info as current_position
        setTimeout(function(self){
            if(self.getVariableValue('clock_sync_initialized') == '1'){
                callCueManagerCompanionService(self, 'GET', 'current_position');
            }
        }, 2000, self); // Space out API calls in case the connection gets stuck in retry loop.
        
        
        // 15 second checks
        setInterval(function(self){
            if(self.getVariableValue('clock_sync_initialized') == '1'){ // Don't do anything unless we have clock sync.
                // Check to see if live service calls stopped
                checkLiveServiceCallActive(self);
                
                // If sheet was disconnected then reconnected, call CM API to get position
                if(Helpers.empty(current_position, 'sheet')){
                    callCueManagerCompanionService(self, 'GET', 'current_position');
                }
            }
        }, 15000, self);
        
        
        // 03m01s checks
        setInterval(function(self){
            if(self.getVariableValue('clock_sync_initialized') == '1'){ // Don't do anything unless we have clock sync.
                
                // Make sure the sheet is still connected to eliminate vampire devices from keeping a connection
                callCueManagerCompanionService(self, 'GET', 'current_position');
            }
        }, 181000, self);
        
        
        // Cue sheet timers
        setInterval(() => {
            if(self.getVariableValue('clock_sync_initialized') == '1'){
                setCurrentCueOverUnder(live_current_cue_updated_at);
                setSheetOverUnder(
                    live_sheet_starts_at,
                    live_sheet_ends_at,
                    live_current_cue_created_at,
                    live_current_cue_updated_at
                );
                self.checkFeedbacks('over_under_button_color_feedback');
            }
        }, 113);
        
        
        try_first_call_interval = setInterval(function(self) {
            // Call live service for the first time.
            if(self.getVariableValue('clock_sync_initialized') == '1'){
                if(!Helpers.empty(current_position, 'sheet', 'uuid') && Helpers.isset(self, 'config')){
                    if(live_service_first_called == false){
                        if(Helpers.validateCMSettings(self.config) === 'OK') {
                            // Set live_updated_after with current time (Offset may change);
                            live_updated_after = self.getVariableValue('clock_utc_unix_seconds');
                            // Call the service
                            callCueManagerLiveService(self);
                        }
                    }
                    live_service_first_called = true;
                }
            }
        }, 100, self);
    }
}