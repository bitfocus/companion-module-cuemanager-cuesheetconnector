const Constants = require('./constants');
const Helpers = require('./helpers');
const Clock = require('./clock');

module.exports = function(self){

	self.setActionDefinitions({
		go_to_prev_cue: {
			name: 'Go to Prev Cue',
			options: [],
			callback: async(action)=>{
				var throttleDelay = 500;
				if(isThrottled(self, 'go_to_prev_cue', throttleDelay)){
					self.log('error', '[Actions] Action {go_to_prev_cue} is throttled!');
					return;
				}
				
				callCueManagerCompanionService(self, 'PATCH', 'go_to_prev_cue');
			},
		},
		go_to_next_cue: {
			name: 'Go to Next Cue',
			options: [],
			callback: async(action)=>{
				var throttleDelay = 500;
				if(isThrottled(self, 'go_to_next_cue', throttleDelay)){
					self.log('error', '[Actions] Action {go_to_next_cue} is throttled!');
					return;
				}
				
				callCueManagerCompanionService(self, 'PATCH', 'go_to_next_cue');
			},
		},
		clear_position: {
			name: 'Clear Position',
			options: [],
			callback: async(action)=>{
				var throttleDelay = 1000;
				if(isThrottled(self, 'clear_position', throttleDelay)){
					self.log('error', '[Actions] Action {clear_position} is throttled!');
					return;
				}
				
				callCueManagerCompanionService(self, 'PATCH', 'clear_position');
			},
		},
		get_current_position: {
			name: 'Get Current Position',
			options: [],
			callback: async(action)=>{
				var throttleDelay = 1000;
				if(isThrottled(self, 'get_current_position', throttleDelay)){
					self.log('error', '[Actions] Action {get_current_position} is throttled!');
					return;
				}
				
				callCueManagerCompanionService(self, 'GET', 'current_position');
			},
		},
		sync_clock_to_cue_manager: {
			name: 'Sync Clock to Cue Manager',
			options: [],
			callback: async(action)=>{
				var throttleDelay = 500;
				if(isThrottled(self, 'sync_clock_to_cue_manager', throttleDelay)){
					self.log('error', '[Actions] Action {sync_clock_to_cue_manager} is throttled!');
					return;
				}
				
				Clock.syncClockToCueManager(self);
			},
		},
		adjust_duration: {
			name: 'Adjust Current Cue Duration +/-',
			options: [{
				type: 'number',
				label: 'Seconds (+/-)',
				id: 'seconds',
				default: 30,
				min: -9999,
				max: 9999,
			}],
			callback: async(action)=>{
				var throttleDelay = 500;
				if(isThrottled(self, 'sync_clock_to_cue_manager', throttleDelay)){
					self.log('error', '[Actions] Action {sync_clock_to_cue_manager} is throttled!');
					return;
				}
				
				callCueManagerCompanionService(self, 'PATCH', 'adjust_cue_duration', {
					"seconds": action.options.seconds
				});
			},
		},
	});
}


// Button throttling logic
let lastPressTimes = {}; // Store last press times for each action
function isThrottled(self, actionId, throttleDelay){
	
	// Set throttleable action if it doesn't exist yet
	if(Helpers.empty(lastPressTimes, actionId)){
		lastPressTimes[actionId] = 0;
	};

	// Check if throttleable action needs to be throttled
	const currentTime = self.getVariableValue('clock_utc_unix_milliseconds');
	if(currentTime - lastPressTimes[actionId] > throttleDelay){
		lastPressTimes[actionId] = currentTime;
		return false; // Not throttled
	}
	
	return true; // Throttled
}


function callCueManagerCompanionService(self, method, endpoint, jsonData){

	const settingsValidation = Helpers.validateCMSettings(self.config);
	
	if(!Helpers.empty(self, 'config', 'personal_access_token')){
		if(settingsValidation == 'OK'){

			var options = {
				method: method,
				body: JSON.stringify(jsonData),
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
			
			self.log('debug', '[Actions] Actions is calling Cue Manager companion service...');
			
			fetch(url, options).then(res => {
				const status_code = res.status;

				return res.text().then(responseData => {
					var jsonData = '';
					var caughtError;
					
					if(responseData != null && responseData !== '' && responseData !== undefined){
						
						try{
							jsonData = JSON.parse(responseData);

							if(status_code == 200){
								
								// Position variables
								if(Helpers.isset(jsonData, 'current_position', '_cue_number')){
									self.setVariableValues({ 'current_cue_number': jsonData.current_position._cue_number});
								} else {
									self.setVariableValues({ 'current_cue_number': '' });
								}
								
								if(Helpers.isset(jsonData, 'current_position', 'regarding_row_name')){
									self.setVariableValues({ 'current_cue_name': Helpers.buttonFriendlyText(jsonData.current_position.regarding_row_name)});
								} else {
									self.setVariableValues({ 'current_cue_name': '' });
								}

								if(Helpers.isset(jsonData, 'next_callable', 'name')){
									self.setVariableValues({ 'next_cue_name': Helpers.buttonFriendlyText(jsonData.next_callable.name)});
								} else if(endpoint != 'adjust_cue_duration'){
									self.setVariableValues({ 'next_cue_name': '' });
								}
								
								
								// Name variables
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
								
								
								
								
								
								if(endpoint == 'adjust_cue_duration'){
									if(!Helpers.empty(jsonData, 'current_position', 'id')){
										Helpers.setCueDurations(
											self,
											'current_cue',
											jsonData.current_position.regarding_row_duration,
											jsonData.current_position.duration_offset
										);
									}
									
									if(!Helpers.empty(jsonData, 'sheet')){
										Helpers.setSheetDurationTotals(
											self,
											jsonData.sheet.duration_total,
											jsonData.sheet.duration_remaining_excluding_current
										);
									}
								}
							} else if(status_code == 401){
								Helpers.updateStatus(self, 'authentication_failure', 'Invalid personal access token.');
							}

							Helpers.updateStatus(self, 'ok');
						} catch(error){
							Helpers.updateStatus(self, 'unknown_warning', 'JSON body not returned.');
							self.log('error', '[Actions] '+error);
						}
					}

					
					if(status_code >= 400){
						if(status_code == 404){
							Helpers.updateStatus(self, 'unknown_warning', 'Action Status: '+status_code+' - Sheet not connected.');
							self.log('error', '[Actions] Companion service HTTP status: '+res.status+' - Sheet not connected.');
						} else if (status_code == 409){
							Helpers.updateStatus(self, 'unknown_warning', 'Action Status: '+status_code+' - Sheet is too old to call cues.');
							self.log('error', '[Actions] Companion service HTTP status: '+res.status+' - Sheet is too old to call cues.');
						} else{
							Helpers.updateStatus(self, 'unknown_warning', 'Action Status: '+status_code+' - '+Helpers.getStatusCodeText(status_code));
							self.log('error', '[Actions] Companion service HTTP status: '+res.status, Helpers.getStatusCodeText(res.status));
						}
						self.log('error', responseData);
						
						// Clear cue manager variables.
						if(endpoint == 'current_position' && Helpers.empty(jsonData, 'sheet', 'name')){
							// Clear variables by starts with.
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
				Helpers.updateStatus(self, 'unknown_warning', 'Actions network error.');
				self.log('error', '[Actions] '+error);
			});
			
		} else{
			Helpers.updateStatus(self, 'unknown_warning', settingsValidation);
		}
	} else{
		Helpers.updateStatus(self, 'unknown_warning', 'Personal access token empty.');
		self.log('error', '[Actions] Personal access token cannot be empty.');
	}

}