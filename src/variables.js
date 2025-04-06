module.exports = function (self) {
	const deviceTzOffset = new Date().getTimezoneOffset();
	const deviceTzOffsetInMilliseconds = (deviceTzOffset * 60) * 1000;
	const deviceTzOffsetSign = deviceTzOffsetInMilliseconds > 0 ? '-' : '+';
	
	
	var variable_definitions = [
		{
			variableId: 'status',
			name: 'The current status of the connection.',
			_cmDefault: 'connecting'
		},
		{
			variableId: 'status_description',
			name: 'The current status description.',
			_cmDefault: 'Initializing'
		},
		{
			variableId: 'clock_sync_initialized',
			name: 'If the clock synchronization has been intiialized.',
			_cmDefault: '0'
		},
		{
			variableId: 'clock_utc_unix_milliseconds',
			name: 'The UTC time in milliseconds.',
			_cmDefault: Date.now()
		},
		{
			variableId: 'clock_utc_unix_seconds',
			name: 'The UTC time in seconds.',
			_cmDefault: (Date.now() / 1000)
		},
		{
			variableId: 'clock_utc_hhmmss',
			name: 'The UTC time in 24 hour HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'clock_utc_hhmmss_12hr',
			name: 'The UTC time in 12 hour HH:MM:SS[AM/PM].',
			_cmDefault: '00:00:00 AM'
		},
		{
			variableId: 'clock_local_unix_milliseconds',
			name: 'The local time in milliseconds.',
			_cmDefault: Date.now() - new Date().getTimezoneOffset() * 60000
		},
		{
			variableId: 'clock_local_unix_seconds',
			name: 'The local time in seconds.',
			_cmDefault: (Date.now() - new Date().getTimezoneOffset() * 60000) / 1000
		},
		{
			variableId: 'clock_local_hhmmss',
			name: 'The local time in 24 hour HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'clock_local_hhmmss_12hr',
			name: 'The local time in 12 hour HH:MM:SS[AM/PM].',
			_cmDefault: '00:00:00 AM'
		},
		{
			variableId: 'device_timezone',
			name: 'The timezone of your device.',
			_cmDefault: Intl.DateTimeFormat().resolvedOptions().timeZone
		},
		{
			variableId: 'device_timezone_city',
			name: 'The timezone city name of your device.',
			_cmDefault: Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]
		},
		{
			variableId: 'device_timezone_offset_seconds',
			name: 'Your device timezone offset in seconds.',
			_cmDefault: deviceTzOffsetSign+Math.abs(Math.floor(deviceTzOffsetInMilliseconds / 1000))
		},
		{
			variableId: 'device_timezone_offset_milliseconds',
			name: 'Your device timezone offset in milliseconds.',
			_cmDefault: deviceTzOffsetSign+Math.abs(deviceTzOffsetInMilliseconds)
		},
		{
			variableId: 'device_time_sync_status',
			name: 'The time sync status of your device (OK, slow, fast).',
			_cmDefault: 'OK'
		},
		{
			variableId: 'device_time_offset_seconds',
			name: 'The time offset of your device in seconds.',
			_cmDefault: '-0'
		},
		{
			variableId: 'device_time_offset_milliseconds',
			name: 'The time offset of your device in milliseconds.',
			_cmDefault: '-0'
		},
		{
			variableId: 'device_time_offset_human',
			name: 'The time offset of your device in friendly format.',
			_cmDefault: '-0'
		},
		{
			variableId: 'device_time_adjusted_milliseconds',
			name: 'The amount of time your device time has been adjusted in milliseconds.',
			_cmDefault: '-0'
		},
		{
			variableId: 'device_time_adjusted_human',
			name: 'The amount of time your device time has been adjusted in friendly format.',
			_cmDefault: '-0'
		},
		{
			variableId: 'project_name',
			name: 'The project name of the current cue sheet.',
			_cmDefault: 'Project Name'
		},
		{
			variableId: 'sheet_uuid',
			name: 'The uuid of the current cue sheet.',
			_cmDefault: ''
		},
		{
			variableId: 'sheet_name',
			name: 'The name of the current cue sheet.',
			_cmDefault: 'Sheet Name'
		},
		{
			variableId: 'sheet_starts_at',
			name: 'The the start time of the current sheet.',
			_cmDefault: ''
		},
		{
			variableId: 'sheet_ends_at',
			name: 'The the end time of the current sheet.',
			_cmDefault: ''
		},
		{
			variableId: 'sheet_cues_total',
			name: 'The total number of cues in the current sheet.',
			_cmDefault: 0
		},
		{
			variableId: 'sheet_total_runtime_hhmmss',
			name: 'The total runtime of the current sheet in HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'sheet_total_runtime_hh',
			name: 'The hours part of sheet total runtime in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_total_runtime_mm',
			name: 'The minutes part of sheet total runtime in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_total_runtime_ss',
			name: 'The seconds part of sheet total runtime in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_total_runtime_milliseconds',
			name: 'The total runtime of the current sheet in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_total_runtime_seconds',
			name: 'The total runtime of the current sheet in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_countdown_to_start_hhmmss',
			name: 'Time left until the current cue sheet start time in HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'sheet_countdown_to_start_hh',
			name: 'The hours part of sheet countdown to start in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_countdown_to_start_mm',
			name: 'The minutes part of sheet countdown to start in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_countdown_to_start_ss',
			name: 'The seconds part of sheet countdown to start in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_countdown_to_start_milliseconds',
			name: 'Time left until the current cue sheet start time in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_countdown_to_start_seconds',
			name: 'Time left until the current cue sheet start time in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_countdown_to_start_arrow',
			name: 'The arrow part of countdown to start time (▲/▼).',
			_cmDefault: '▼'
		},
		{
			variableId: 'sheet_countdown_to_start_sign',
			name: 'The arrow part of countdown to start time (+/-).',
			_cmDefault: '-'
		},
		{
			variableId: 'sheet_projected_finish',
			name: 'The projected finish time of your sheet in 24 hour HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'sheet_projected_finish_12hr',
			name: 'The projected finish time of your sheet in 12 hour HH:MM:SS[AM/PM].',
			_cmDefault: '00:00:00 AM'
		},
		{
			variableId: 'sheet_duration_remaining_excluding_current_hhmmss',
			name: 'The remaining duration of the cue sheet excluding the current cue in HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'sheet_duration_remaining_excluding_current_hh',
			name: 'The hours part of remaining duration of the cue sheet excluding the current cue in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_duration_remaining_excluding_current_mm',
			name: 'The minutes part of remaining duration of the cue sheet excluding the current cue in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_duration_remaining_excluding_current_ss',
			name: 'The seconds part of remaining duration of the cue sheet excluding the current cue in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_duration_remaining_excluding_current_seconds',
			name: 'The remaining duration of the cue sheet excluding the current cue in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_duration_remaining_excluding_current_milliseconds',
			name: 'The remaining duration of the cue sheet excluding the current cue in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_duration_remaining_hhmmss',
			name: 'The total remaining duration of the cue sheet in HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'sheet_duration_remaining_hh',
			name: 'The hours part of remaining duration of the cue sheet in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_duration_remaining_mm',
			name: 'The minutes part of remaining duration of the cue sheet in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_duration_remaining_ss',
			name: 'The seconds part of remaining duration of the cue sheet in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_duration_remaining_seconds',
			name: 'The total remaining duration of the cue sheet in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_duration_remaining_milliseconds',
			name: 'The total remaining duration of the cue sheet in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_over_under_sign',
			name: 'The sign part of cue sheet over/under time (+/-).',
			_cmDefault: '-'
		},
		{
			variableId: 'sheet_over_under_arrow',
			name: 'The arrow part of cue sheet over/under time (▲/▼).',
			_cmDefault: '▼'
		},
		{
			variableId: 'sheet_over_under_hhmmss',
			name: 'The total over/under time of the entire cue sheet in HH:MM:SS.',
			_cmDefault: '▼00:00:00'
		},
		{
			variableId: 'sheet_over_under_hh',
			name: 'The hours part of cue sheet over/under time in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_over_under_mm',
			name: 'The minutes part of cue sheet over/under time in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_over_under_ss',
			name: 'The seconds part of cue sheet over/under time in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'sheet_over_under_seconds',
			name: 'The total over/under time of the entire cue sheet in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'sheet_over_under_milliseconds',
			name: 'The total over/under time of the entire cue sheet in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_uuid',
			name: 'The uuid of the current cue sheet.',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_position_created_at',
			name: 'The time when the current cue position was created.',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_position_updated_at',
			name: 'The time when the current cue position was updated.',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_position_is_paused',
			name: 'Whether or not the current cue is paused.',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_position_seconds_paused',
			name: 'The number of seconds paused for the current cue.',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_position_last_paused_at',
			name: 'The time when the current cue position was last paused.',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_number',
			name: 'The number of the current cue.',
			_cmDefault: null
		},
		{
			variableId: 'current_cue_number_of_total',
			name: 'The current cue number of total cues (e.g., 4/67).',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_name',
			name: 'The name of the current cue.',
			_cmDefault: 'Current Cue Name'
		},
		{
			variableId: 'current_cue_duration_hhmmss',
			name: 'The duration of the current cue in HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'current_cue_duration_seconds',
			name: 'The duration of the current cue in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_duration_hh',
			name: 'The hours part of current cue duration in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_duration_mm',
			name: 'The minutes part of current cue duration in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_duration_ss',
			name: 'The seconds part of current cue duration in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_duration_milliseconds',
			name: 'The duration of the current cue in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_duration_offset_milliseconds',
			name: 'The duration offset of the current cue in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_duration_offset_hh',
			name: 'The hours part of current cue duration offset in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_duration_offset_mm',
			name: 'The minutes part of current cue duration offset in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_duration_offset_ss',
			name: 'The seconds part of current cue duration offset in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_duration_offset_seconds',
			name: 'The duration offset of the current cue in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_over_under_hhmmss',
			name: 'The over/under time of the current cue in HH:MM:SS.',
			_cmDefault: '▼00:00:00'
		},
		{
			variableId: 'current_cue_over_under_sign',
			name: 'The sign part of current cue over/under time (+/-).',
			_cmDefault: '-'
		},
		{
			variableId: 'current_cue_over_under_arrow',
			name: 'The arrow part of current cue over/under time (▲/▼).',
			_cmDefault: '▼'
		},
		{
			variableId: 'current_cue_over_under_hh',
			name: 'The hours part of current cue over/under time in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_over_under_mm',
			name: 'The minutes part of current cue over/under time in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_over_under_ss',
			name: 'The seconds part of current cue over/under time in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_over_under_seconds',
			name: 'The over/under time of the current cue in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_over_under_milliseconds',
			name: 'The over/under time of the current cue in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_elapsed_hhmmss',
			name: 'The total elapsed time of the current cue in HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'current_cue_elapsed_hh',
			name: 'The hours part of current cue time elapsed in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_elapsed_mm',
			name: 'The minutes part of current cue time elapsed in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_elapsed_ss',
			name: 'The seconds part of current cue time elapsed in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_elapsed_seconds',
			name: 'The total elapsed time of the current cue in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_elapsed_milliseconds',
			name: 'The total elapsed time of the current cue in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_remaining_hhmmss',
			name: 'The remaining time of the current cue in HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'current_cue_remaining_hh',
			name: 'The hours part of current cue time remaining in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_remaining_mm',
			name: 'The minutes part of current cue time remaining in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_remaining_ss',
			name: 'The seconds part of current cue time remaining in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'current_cue_remaining_seconds',
			name: 'The remaining time of the current cue in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_remaining_milliseconds',
			name: 'The remaining time of the current cue in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'current_cue_cell_text_column_1',
			name: 'The current cue cell text of Column Name 1 (set in config).',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_cell_text_column_2',
			name: 'The current cue cell text of Column Name 2 (set in config).',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_cell_text_column_3',
			name: 'The current cue cell text of Column Name 3 (set in config).',
			_cmDefault: ''
		},
		{
			variableId: 'current_cue_cell_text_column_4',
			name: 'The current cue cell text of Column Name 4 (set in config).',
			_cmDefault: ''
		},
		{
			variableId: 'next_cue_name',
			name: 'The name of the next cue.',
			_cmDefault: 'Next Cue Name'
		},
		{
			variableId: 'next_cue_duration_hhmmss',
			name: 'The duration of the next cue in HH:MM:SS.',
			_cmDefault: '00:00:00'
		},
		{
			variableId: 'next_cue_duration_hh',
			name: 'The hours part of next cue duration in HH.',
			_cmDefault: '00'
		},
		{
			variableId: 'next_cue_duration_mm',
			name: 'The minutes part of next cue duration in MM.',
			_cmDefault: '00'
		},
		{
			variableId: 'next_cue_duration_ss',
			name: 'The seconds part of next cue duration in SS.',
			_cmDefault: '00'
		},
		{
			variableId: 'next_cue_duration_seconds',
			name: 'The duration of the next cue in seconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'next_cue_duration_milliseconds',
			name: 'The duration of the next cue in milliseconds.',
			_cmDefault: '0'
		},
		{
			variableId: 'next_cue_cell_text_column_1',
			name: 'The next cue cell text of Column Name 1 (set in config).',
			_cmDefault: ''
		},
		{
			variableId: 'next_cue_cell_text_column_2',
			name: 'The next cue cell text of Column Name 2 (set in config).',
			_cmDefault: ''
		},
		{
			variableId: 'next_cue_cell_text_column_3',
			name: 'The next cue cell text of Column Name 3 (set in config).',
			_cmDefault: ''
		},
		{
			variableId: 'next_cue_cell_text_column_4',
			name: 'The next cue cell text of Column Name 4 (set in config).',
			_cmDefault: ''
		},
		{
			variableId: 'user_name',
			name: 'Your name.',
			_cmDefault: 'My Name'
		},
		{
			variableId: 'following_user_name',
			name: 'The name of the user you are currently following (if any).',
			_cmDefault: ''
		},
		{
			variableId: 'tenant_name',
			name: 'The name of your company.',
			_cmDefault: 'Company Name'
		},
	];
	
	
	// Set definitions
	self.setVariableDefinitions(variable_definitions);
	
	
	// Set default values to the definitions
	var default_variable_values = {};
	variable_definitions.forEach((variable) => {
		default_variable_values[variable.variableId] = variable._cmDefault;
	});
	self.setVariableValues(default_variable_values);
	
	
	// Return all definitions
	return variable_definitions;
}
