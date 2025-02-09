const { combineRgb } = require('@companion-module/base');
const Helpers = require('./helpers');

module.exports = async function(self){
	self.setFeedbackDefinitions({
		over_under_button_color_feedback: {
			type: 'advanced',
			name: 'Turn Button Red When Time Over',
			label: 'Turn Button Red When Time Over',
			description: 'Changes button bg color to red if time is over.',
			options: [
				{
					type: 'textinput',
					label: 'Variable Name',
					id: 'variable',
					default: '',
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
				}
			],
			callback: (feedback) => {
			  // Get the current value of the specified sign variable
			  const variableValue = self.getVariableValue(feedback.options.variable);
			  
			  // Check if the sign is "+"
			  if (variableValue === '+') {
				return {
				  bgcolor: feedback.options.bgcolor, // Change background color to red
				};
			  }
			},
		  },
	});
	
}

