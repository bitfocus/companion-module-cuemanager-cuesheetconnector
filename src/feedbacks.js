module.exports = async function(self){
	self.setFeedbackDefinitions({
		change_button_style_on_conditional: {
			type: 'advanced',
			name: "Change Button Style on Conditional",
			label: "Change Button Style on Conditional",
			description: "Changes the button style when a condition is met.",
			options: [
				{
					type: 'textinput',
					label: 'Variable ID',
					id: 'variable_id',
					default: '',
					isVisible: () => {
						// Make this variable hidden from user
						return false;
					}
				},
				{
					type: 'textinput',
					label: 'Compare Value',
					id: 'compare_value',
					default: '',
					isVisible: () => {
						// Make this variable hidden from user
						return false;
					}
				},
				{
					type: 'textinput',
					label: 'Compare as Lowercase',
					id: 'compare_as_lowercase',
					default: false,
					isVisible: () => {
						// Make this variable hidden from user
						return false;
					}
				},
				{
					type: 'textinput',
					label: 'Comparison Operator',
					id: 'comparison_operator',
					default: '==',
					isVisible: () => {
						// Make this variable hidden from user
						return false;
					}
				},
				{
					type: 'colorpicker',
					label: 'Background Color',
					id: 'bgcolor',
					default: '#FF0000', // Default to red
					isVisible: () => {
						// Make this variable hidden from user
						return false;
					}
				},
				{
					type: 'colorpicker',
					label: 'Text Color',
					id: 'color',
					default: '#FFFFFF', // Default to white
					isVisible: () => {
						// Make this variable hidden from user
						return false;
					}
				}
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
				if(return_color){
					return {
						bgcolor: feedback.options.bgcolor,
						color: feedback.options.color,
					};
				}
			},
		},
	});
}

