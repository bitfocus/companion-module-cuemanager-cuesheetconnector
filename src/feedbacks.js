module.exports = async function(self){
	self.setFeedbackDefinitions({
		change_button_style_on_conditional: {
			type: 'boolean',
			name: "Change Button Style on Conditional",
			label: "Change Button Style on Conditional",
			description: "Changes the button style when the condition is true.",
			defaultStyle: {
				bgcolor: '#FF0000',
				color: '#FFFFFF',
			},
			options: [
				{
					type: 'dropdown',
					label: 'Change Button Style if this Variable',
					id: 'variable_id',
					default: 'current_cue_over_under_sign',
					choices: [
						{id: 'current_cue_over_under_sign', label: 'current_cue_over_under_sign (+/-)'},
						{id: 'current_cue_over_under_seconds', label: 'current_cue_over_under_seconds'},
						{id: 'current_cue_duration_seconds', label: 'current_cue_duration_seconds'},
						{id: 'current_cue_elapsed_seconds', label: 'current_cue_elapsed_seconds'},
						{id: 'current_cue_remaining_seconds', label: 'current_cue_remaining_seconds'},
						{id: 'next_cue_duration_seconds', label: 'next_cue_duration_seconds'},
						{id: 'sheet_over_under_sign', label: 'sheet_over_under_sign (+/-)'},
						{id: 'sheet_over_under_seconds', label: 'sheet_over_under_seconds'},
						{id: 'sheet_countdown_to_start_sign', label: 'sheet_countdown_to_start_sign (+/-)'},
						{id: 'sheet_duration_remaining_seconds', label: 'sheet_duration_remaining_seconds'},
						{id: 'sheet_duration_remaining_excluding_current_seconds', label: 'sheet_duration_remaining_excluding_current_seconds'},
						{id: 'status', label: 'status'},
						{id: 'clock_sync_initialized', label: 'clock_sync_initialized'},
						{id: 'device_time_offset_seconds', label: 'device_time_offset_seconds'},
						{id: 'device_time_offset_milliseconds', label: 'device_time_offset_milliseconds'},
					]
				},
				{
					type: 'dropdown',
					label: 'Is',
					id: 'comparison_operator',
					default: '==',
					choices: [
						{id: '==', label: 'Equal to (==)'},
						{id: '===', label: 'Strictly equal to (===)'},
						{id: '!=', label: 'Not equal to (!=)'},
						{id: '!==', label: 'Strictly not equal to (!==)'},
						{id: '>', label: 'Greater than (>)'},
						{id: '>=', label: 'Greater than or equa to (>=)'},
						{id: '<', label: 'Less than (<)'},
						{id: '<=', label: 'Less than or equal to (<=)'},
					]
				},
				{
					type: 'textinput',
					label: 'This Value',
					id: 'compare_value',
					default: ''
				},
				{
					type: 'checkbox',
					label: 'Compare both as Lowercase',
					id: 'compare_as_lowercase',
					default: false
				},
			],
			callback: (feedback) => {
				// Get the current variable and value to match
				var match_variable = self.getVariableValue(feedback.options.variable_id); // Variable value to match
				var compare_value = feedback.options.compare_value; // Value to match to
				
				
				// Set to lowercase if compare_as_lowercase is true
				if(feedback.options.compare_as_lowercase && typeof match_variable == 'string'){
					match_variable = match_variable.toLocaleLowerCase();
				}
				if(feedback.options.compare_as_lowercase && typeof compare_value == 'string'){
					compare_value = compare_value.toLocaleLowerCase();
				}

				
				// Determine whether the condition is true.
				var return_color = false;
				if(feedback.options.comparison_operator == '===' && match_variable === compare_value){
					return_color = true;
				} else if(feedback.options.comparison_operator == '==' && match_variable == compare_value){
					return_color = true;
				} else if(feedback.options.comparison_operator == '!==' && match_variable !== compare_value){
					return_color = true;
				} else if(feedback.options.comparison_operator == '!=' && match_variable != compare_value){
					return_color = true;
				} else if(feedback.options.comparison_operator == '>' && match_variable > compare_value){
					return_color = true;
				} else if(feedback.options.comparison_operator == '>=' && match_variable >= compare_value){
					return_color = true;
				} else if(feedback.options.comparison_operator == '<' && match_variable < compare_value){
					return_color = true;
				} else if(feedback.options.comparison_operator == '<=' && match_variable <= compare_value){
					return_color = true;
				}
				
				// Return styling if condition is true.
				return return_color;
			},
		},
	});
}

