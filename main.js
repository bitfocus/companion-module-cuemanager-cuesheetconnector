const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base');
const Constants = require('./src/constants');
const InitUpgradeScripts = require('./src/upgrades');
const InitActions = require('./src/actions');
const InitFeedbacks = require('./src/feedbacks');
const InitVariableDefinitions = require('./src/variables');
const InitPresets = require('./src/presets');
const InitLiveMicroservice = require('./src/live');
const Helpers = require('./src/helpers');


class ModuleInstance extends InstanceBase{
	constructor(internal){
		super(internal);
	}

	
	// Initialize module
	async init(config){
		this.updateStatus('Initializing...');
		
		this.config = config;
		
		const settingsValidation = Helpers.validateCMSettings(config);
		
		if(settingsValidation == 'OK'){
			this.variable_definitions = InitVariableDefinitions(this);
			InitFeedbacks(this);
			InitPresets(this);
			InitActions(this);
			InitLiveMicroservice(this);
		} else{
			this.updateStatus('Setup Required', settingsValidation);
		}
	}
	
	
	// When module gets deleted
	async destroy(){
		this.log('info', '[Main] destroy');
	}
	
	
	// When config is saved/updated
	async configUpdated(config){
		this.config = config;
		const settingsValidation = Helpers.validateCMSettings(config);
		if(settingsValidation == 'OK'){
			// Restart module on config update
			this.destroy();
			this.init(config);
			this.log('info', '[Main] Config updated successfully.');
		} else{
			// Connection has not been setup yet or is missing config values from user
			this.updateStatus('Setup Required', settingsValidation);
			this.log('error', '[Main] '+settingsValidation);
		}
	}

	
	// Return config fields for web config
	getConfigFields(){
		return [
			{
				type: 'static-text',
				id: 'spacer_0',
				label: '',
				width: 12,
				value: ''
			},
			{
				type: 'static-text',
				label: 'Information',
				id: 'info',
				width: 12,
				value: `This module allows you to control your Cue Manager Cue Sheets.
				Cue Manager offers collaborative real-time cue sheets (rundowns), schedules, and project management tools for 
				live events. For more information about this module, visit
				<a href="https://help.cuemanager.com/docs/bitfocus-companion-module/" target="_blank"
				>https://help.cuemanager.com/docs/bitfocus-companion-module/</a>.`
			},
			{
				type: 'static-text',
				id: 'spacer_1',
				label: '',
				width: 12,
				value: ''
			},
			{
				type: 'textinput',
				id: 'personal_access_token',
				label: 'Personal Access Token',
				width: 6,
				tooltip: 'A personal access token is required to connect to Cue Manager.'
			},
			{
				type: 'static-text',
				id: 'personal_access_token_information',
				label: 'Obtaining Your Personal Access Token',
				width: 6,
				value: `First you will need to grant access, then copy your personal access token, 
				which can be done <a href="https://app.cuemanager.com/companion/setup" target="_blank">here</a>.`
			},
			{
				type: 'static-text',
				id: 'spacer_2',
				label: '',
				width: 12,
				value: ''
			},
			{
				type: 'checkbox',
				id: 'store_cue_cell_text_as_variables_enabled',
				label: 'Store Cue Cell Data as Variables',
				default: false,
				width: 8
			},
			{
				type: 'static-text',
				id: 'store_cue_cell_text_as_variables_status_label_enabled',
				label: 'Status',
				value: 'Enabled',
				width: 4,
				isVisible: (config) => !!config.store_cue_cell_text_as_variables_enabled
			},
			{
				type: 'static-text',
				id: 'store_cue_cell_text_as_variables_status_label_disabled',
				label: 'Status',
				value: 'Disabled',
				width: 4,
				isVisible: (config) => !config.store_cue_cell_text_as_variables_enabled
			},
			{
				type: 'static-text',
				id: 'save_cell_text_as_variables_info',
				label: '',
				width: 12,
				value: `If you want to save cell text as variables, you can specify up to 4 column names here. 
				For example, the current cue's cell text associated with a column called <b>MIDI CC</b> can be assigned to 
				<code>current_cue_cell_text_column_1</code> by populating the below <b>Colum Name 1</b> field with <b>MIDI CC</b>.
				Please note that column names are case sensitive and if there are any duplicate column names, the column
				found latest in the default column order will take priority.`,
				isVisible: (config) => !!config.store_cue_cell_text_as_variables_enabled
			},
			{
				type: 'textinput',
				id: 'current_cue_cell_text_column_1',
				label: 'Column Name 1',
				width: 3,
				default: '',
				tooltip: 'Variable: current_cue_cell_text_column_1',
				isVisible: (config) => !!config.store_cue_cell_text_as_variables_enabled
			},
			{
				type: 'textinput',
				id: 'current_cue_cell_text_column_2',
				label: 'Column Name 2',
				width: 3,
				default: '',
				tooltip: 'Variable: current_cue_cell_text_column_2',
				isVisible: (config) => !!config.store_cue_cell_text_as_variables_enabled
			},
			{
				type: 'textinput',
				id: 'current_cue_cell_text_column_3',
				label: 'Column Name 3',
				width: 3,
				default: '',
				tooltip: 'Variable: current_cue_cell_text_column_3',
				isVisible: (config) => !!config.store_cue_cell_text_as_variables_enabled
			},
			{
				type: 'textinput',
				id: 'current_cue_cell_text_column_4',
				label: 'Column Name 4',
				width: 3,
				default: '',
				tooltip: 'Variable: current_cue_cell_text_column_4',
				isVisible: (config) => !!config.store_cue_cell_text_as_variables_enabled
			},
			{
				type: 'static-text',
				id: 'spacer_3',
				label: '',
				width: 12,
				value: ''
			},
			{
				type: 'static-text',
				id: 'spacer_4',
				label: '',
				width: 12,
				value: '',
				isVisible: (config) => !!config.store_cue_cell_text_as_variables_enabled
			},
			{
				type: 'checkbox',
				id: 'show_developer_options',
				label: 'Developer Options',
				default: false,
				width: 4
			},
			{
				type: 'static-text',
				label: 'Information',
				id: 'show_developer_options_info',
				width: 8,
				value: `Endpoints should NOT be changed under normal circumstances. 
				To reset all endpoints to their defaults, delete and re-add this connection.<br>`,
				isVisible: (config) => !!config.show_developer_options
			},
			{
				type: 'static-text',
				id: 'spacer_5',
				label: '',
				width: 12,
				value: ''
			},
			{
				type: 'checkbox',
				id: 'show_session_token',
				label: 'Show Session Token',
				default: false,
				width: 6,
				isVisible: (config) => !!config.show_developer_options
			},
			{
				type: 'static-text',
				id: 'session_token_text',
				label: 'Session Token',
				value: Constants.SESSION_TOKEN,
				width: 6,
				isVisible: (config) => !!config.show_session_token && !!config.show_developer_options
			},
			{
				type: 'static-text',
				id: 'session_token_placeholder',
				label: 'Session Token',
				value: '(Hidden)',
				width: 6,
				isVisible: (config) => !config.show_session_token && !!config.show_developer_options
			},
			{
				type: 'textinput',
				id: 'live_service_base_endpoint',
				label: 'Live Service Base Endpoint',
				width: 6,
				required: true,
				default: 'https://live.cuemanager.com/v4/live_sheets',
				isVisible: (config) => !!config.show_developer_options
			},
			{
				type: 'textinput',
				id: 'companion_service_base_endpoint',
				label: 'Companion Service Base Endpoint',
				width: 6,
				required: true,
				default: 'https://api.cuemanager.com/companion/v2',
				isVisible: (config) => !!config.show_developer_options
			},
			{
				type: 'textinput',
				id: 'time_service_endpoint',
				label: 'Time Service Endpoint',
				width: 6,
				required: true,
				default: 'https://time.cuemanager.com',
				isVisible: (config) => !!config.show_developer_options
			},
			{
				type: 'static-text',
				id: 'user_agent',
				label: 'User Agent',
				value: Constants.USER_AGENT,
				width: 6,
				isVisible: (config) => !!config.show_developer_options
			},
			{
				type: 'static-text',
				id: 'spacer_6',
				label: '',
				width: 12,
				value: ''
			},
		];
	}
}

runEntrypoint(ModuleInstance, InitUpgradeScripts);