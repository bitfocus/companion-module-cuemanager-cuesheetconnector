const Constants = require('./constants');
const Helpers = require('./helpers');
const Globals = require('./globals');
const Clock = require('./clock');

class Actions{

	// Static method to register actions with self object.
	static register(self){
		const instance = Actions.getInstance();
		self.setActionDefinitions({
			go_to_prev_cue: {
				name: 'Go to Prev Cue',
				options: [],
				callback: async (action) => {
					instance.callCueManagerCompanionService(self, 'PATCH', 'go_to_prev_cue');
				},
			},
			go_to_next_cue: {
				name: 'Go to Next Cue',
				options: [],
				callback: async (action) => {
					instance.callCueManagerCompanionService(self, 'PATCH', 'go_to_next_cue');
				},
			},
			clear_position: {
				name: 'Clear Position',
				options: [],
				callback: async (action) => {
					instance.callCueManagerCompanionService(self, 'PATCH', 'clear_position');
				},
			},
			get_current_position: {
				name: 'Get Current Position',
				options: [],
				callback: async (action) => {
					instance.callCueManagerCompanionService(self, 'GET', 'current_position');
				},
			},
			sync_clock_to_cue_manager: {
				name: 'Sync Clock to Cue Manager',
				options: [],
				callback: async (action) => {
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
				callback: async (action) => {
					instance.callCueManagerCompanionService(self, 'PATCH', 'adjust_cue_duration', {
						seconds: action.options.seconds
					});
				},
			},
		});
	}

	// Create/return singleton instance of Actions.
	static getInstance(){
		if(!Actions._instance){
			Actions._instance = new Actions();
		}
		return Actions._instance;
	}

	// Static wrapper for direct calls (such as live.js)
	static callCueManagerCompanionService(self, method, endpoint, jsonData){
		return Actions.getInstance().callCueManagerCompanionService(self, method, endpoint, jsonData);
	}

	isThrottled(self, actionId, throttleDelay){
		if(Helpers.empty(Globals.actionLastPressTimes, actionId)){
			Globals.actionLastPressTimes[actionId] = 0;
		}
		var currentTime = parseInt(self.getVariableValue('clock_utc_unix_milliseconds'));
		var lastTime = Globals.actionLastPressTimes[actionId];
		console.log(Globals);
		if(currentTime - lastTime > throttleDelay){
			Globals.actionLastPressTimes[actionId] = currentTime;
			return false; // Not throttled
		}
		return true; // Throttled
	}

	getActionThrottleDelay(action){
		const delays = {
			go_to_prev_cue: 500,
			go_to_next_cue: 500,
			clear_position: 1000,
			get_current_position: 1000,
			sync_clock_to_cue_manager: 500,
			adjust_duration: 500
		};
		return delays.hasOwnProperty(action) ? delays[action] : 500;
	}

	callCueManagerCompanionService(self, method, endpoint, json_postfields){
		if(this.isThrottled(self, endpoint, this.getActionThrottleDelay(endpoint))){
			self.log('error', `[Actions] Action {${endpoint}} is throttled!`);
			return;
		}

		const settingsValidation = Helpers.validateCMSettings(self.config);

		if(!Helpers.empty(self, 'config', 'personal_access_token')){
			if(settingsValidation === 'OK'){
				// Set fetch options
				var options = {
					method: method,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + self.config.personal_access_token,
						'User-Agent': Constants.USER_AGENT
					}
				};
				// Add body if present and allowed in fetch method
				if(!Helpers.empty(json_postfields) && !['get', 'head'].includes(method.toLowerCase())){
					options['body'] = JSON.stringify(json_postfields)
				}
				// URL
				let url = Helpers.trim(self.config.companion_service_base_endpoint, '/') + '/' + endpoint;
				if(Helpers.configHasCellTextColumns(self.config) && self.config.store_cue_cell_text_as_variables_enabled) {
					url += '?include[]=current_position_cells&include[]=next_position_cells';
				}

				self.log('debug', '[Actions] Calling Cue Manager companion service...');

				fetch(url, options).then(res => {
					const status_code = res.status;
					
					return res.text().then(responseData => {
						let jsonData = '';
						let caughtError;

						if(responseData != null && responseData !== '' && responseData !== undefined){
							try{
								jsonData = JSON.parse(responseData);
								if(status_code === 200){
									// Process Current Position
									if(Helpers.isset(jsonData, 'current_position', 'current_row_uuid')){
										self.setVariableValues({
											'current_cue_uuid': jsonData.current_position.current_row_uuid,
											'current_cue_name': Helpers.buttonFriendlyText(jsonData.current_position.regarding_row_name),
											'current_cue_number': jsonData.current_position._cue_number,
											'current_cue_position_created_at': jsonData.current_position.created_at,
											'current_cue_position_updated_at': jsonData.current_position.updated_at
										});
									} else{
										self.setVariableValues({
											'current_cue_uuid': '',
											'current_cue_name': '',
											'current_cue_number': '',
											'current_cue_position_created_at': '',
											'current_cue_position_updated_at': ''
										});
									}

									// Process Next Callable Cue
									if(Helpers.isset(jsonData, 'next_callable', 'name')){
										self.setVariableValues({ 'next_cue_name': Helpers.buttonFriendlyText(jsonData.next_callable.name) });
									} else{
										self.setVariableValues({ 'next_cue_name': '' });
									}

									// Process Project/Sheet/Tenant/User info
									if(Helpers.isset(jsonData, 'project', 'name')){
										self.setVariableValues({ 'project_name': Helpers.buttonFriendlyText(jsonData.project.name) });
									}
									if(Helpers.isset(jsonData, 'sheet', 'uuid')){
										self.setVariableValues({
											'sheet_uuid': jsonData.sheet.uuid,
											'sheet_name': Helpers.buttonFriendlyText(jsonData.sheet.name),
											'sheet_starts_at': jsonData.sheet.starts_at,
											'sheet_ends_at': jsonData.sheet.ends_at
										});
									}
									if(Helpers.isset(jsonData, 'tenant', 'name')){
										self.setVariableValues({ 'tenant_name': Helpers.buttonFriendlyText(jsonData.tenant.name) });
									}
									if(Helpers.isset(jsonData, 'user', 'name')){
										self.setVariableValues({ 'user_name': Helpers.buttonFriendlyText(jsonData.user.name) });
									}

									// Set durations based on endpoint
									if(endpoint === 'adjust_cue_duration' || endpoint === 'current_position'){
										if (!Helpers.empty(jsonData, 'current_position', 'id')) {
											Helpers.setCueDurations(
												self,
												'current_cue',
												jsonData.current_position.regarding_row_duration,
												jsonData.current_position.duration_offset
											);
										}
									}
									if(endpoint === 'current_position' && !Helpers.empty(jsonData, 'next_callable')){
										Helpers.setCueDurations(
											self,
											'next_cue',
											jsonData.next_callable.duration,
											0
										);
									} else if(endpoint === 'adjust_cue_duration' && !Helpers.empty(jsonData, 'sheet')){
										Helpers.setSheetDurationTotals(
											self,
											jsonData.sheet.duration_total,
											jsonData.sheet.duration_remaining_excluding_current
										);
									}

									// Process Cell Text Variables
									if(Helpers.configHasCellTextColumns(self.config) && self.config.store_cue_cell_text_as_variables_enabled){
										if(!Helpers.empty(jsonData, 'current_position', 'cells')){
											for(let i = 1; i <= 4; i++){
												const col_name_id = Helpers.idifyColumnName(self.config['current_cue_cell_text_column_' + i]);
												if(!Helpers.empty(jsonData, 'current_position', 'cells', col_name_id)){
													self.setVariableValues({ ['current_cue_cell_text_column_' + i]: Helpers.buttonFriendlyText(jsonData.current_position.cells[col_name_id]) });
												} else{
													self.setVariableValues({ ['current_cue_cell_text_column_' + i]: '' });
												}
											}
										}
										if(!Helpers.empty(jsonData, 'next_callable', 'cells')){
											for(let i = 1; i <= 4; i++){
												const col_name_id = Helpers.idifyColumnName(self.config['current_cue_cell_text_column_' + i]);
												if(!Helpers.empty(jsonData, 'next_callable', 'cells', col_name_id)){
													self.setVariableValues({ ['next_cue_cell_text_column_' + i]: Helpers.buttonFriendlyText(jsonData.next_callable.cells[col_name_id]) });
												} else{
													self.setVariableValues({ ['next_cue_cell_text_column_' + i]: '' });
												}
											}
										}
									}
								} else if(status_code === 401){
									Helpers.updateStatus(self, 'authentication_failure', 'Invalid personal access token.');
								}

								Helpers.updateStatus(self, 'ok');
							} catch(error){
								caughtError = error;
								Helpers.updateStatus(self, 'unknown_error', 'JSON body not returned.');
								self.log('error', '[Actions] ' + error);
							}
						}

						if(status_code >= 400){
							if(status_code === 404){
								Helpers.updateStatus(self, 'unknown_warning', 'Action Status: ' + status_code + ' - Sheet not connected.');
								self.log('error', '[Actions] Companion service HTTP status: ' + res.status + ' - Sheet not connected.');
							} else if(status_code === 409){
								Helpers.updateStatus(self, 'unknown_warning', 'Action Status: ' + status_code + ' - Sheet is too old to call cues.');
								self.log('error', '[Actions] Companion service HTTP status: ' + res.status + ' - Sheet is too old to call cues.');
							} else{
								Helpers.updateStatus(self, 'unknown_warning', 'Action Status: ' + status_code + ' - ' + Helpers.getStatusCodeText(status_code));
								self.log('error', '[Actions] Companion service HTTP status: ' + res.status, Helpers.getStatusCodeText(res.status));
							}
							self.log('error', responseData);
							if(endpoint === 'current_position' && Helpers.empty(jsonData, 'sheet')){
								Helpers.clearCurrentCueOverUnder(self);
								Helpers.resetVariables(self, [
									'project_',
									'sheet_',
									'current_cue_',
									'next_cue_',
									'following_'
								]);
							}
						} else if(Helpers.empty(caughtError)){
							Helpers.updateStatus(self, 'ok');
						}
					});
				}).catch(error => {
					Helpers.updateStatus(self, 'unknown_warning', 'Actions network error.');
					self.log('error', '[Actions] ' + error);
				});
			} else{
				Helpers.updateStatus(self, 'unknown_warning', settingsValidation);
				self.log('error', '[Actions] ' + settingsValidation);
			}
		} else{
			Helpers.updateStatus(self, 'unknown_warning', 'Personal access token empty.');
			self.log('error', '[Actions] Personal access token cannot be empty.');
		}
	}
}

/*
	To support both function calls and static method access, export factory a function to register actions.
	This function also has static methods attached.
*/
function registerActions(self){
	Actions.register(self);
}
registerActions.callCueManagerCompanionService = Actions.callCueManagerCompanionService;
registerActions.register = Actions.register;
registerActions.getInstance = Actions.getInstance;
registerActions.Actions = Actions; // For direct access to the class

module.exports = registerActions;
