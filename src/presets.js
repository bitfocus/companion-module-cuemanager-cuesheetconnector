const Icons = require('./icons');

module.exports = function (self) {
    const presets = {
        // Transport
        go_to_prev_cue: { 
            type: 'button',
            category: 'Transport',
            name: 'Go to Prev Cue',
            style: {
                show_topbar: false,
                png64: Icons.transport.prev_track,
                size: 'auto',
                color: '#000000',
                bgcolor: '#a6a6a6',
            },
            steps: [{
                down: [{
                    actionId: "go_to_prev_cue"
                }],
                up: []
            }],
            feedbacks: [],
        },
        go_to_next_cue: { 
            type: 'button',
            category: 'Transport',
            name: 'Go to Next Cue',
            style: {
                show_topbar: false,
                png64: Icons.transport.next_track,
                size: 'auto',
                color: '#000000',
                bgcolor: '#4BCF6D',
            },
            steps: [{
                down: [{
                    actionId: "go_to_next_cue"
                }],
                up: []
            }],
            feedbacks: [],
        },
        clear_position: { 
            type: 'button',
            category: 'Transport',
            name: 'Clear Position',
            style: {
                show_topbar: false,
                png64: Icons.transport.stop,
                size: 'auto',
                color: '#000000',
                bgcolor: '#CE2323',
            },
            steps: [{
                down: [{
                    actionId: "clear_position"
                }],
                up: []
            }],
            feedbacks: [],
        },
        
        
        
        
        // Icons
        hourglass: { 
            type: 'button',
            category: 'Icons',
            name: 'Current Cue Hourglass Icon',
            style: {
                show_topbar: false,
                png64: Icons.transport.hourglass,
                size: 'auto',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        
        
        
        
        // Device Time
        device_time_offset_human: { 
            type: 'button',
            category: 'Device Time',
            name: 'Device Clock Status',
            style: {
                show_topbar: false,
                text: 'Device Clock\n$(cuemanager-cuesheetconnector:device_time_sync_status)\n($(cuemanager-cuesheetconnector:device_time_offset_human))',
                size: 'auto',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        device_time_adjusted_human: { 
            type: 'button',
            category: 'Device Time',
            name: 'Device Clock Status',
            style: {
                show_topbar: false,
                text: 'Clock Adjusted\n($(cuemanager-cuesheetconnector:device_time_adjusted_human))',
                size: 'auto',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        clock_local_hhmmss_12hr: { 
            type: 'button',
            category: 'Device Time',
            name: 'Local Time hh:mm:ss AM/PM',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:clock_local_hhmmss_12hr)',
                size: '14',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        clock_local_hhmmss: { 
            type: 'button',
            category: 'Device Time',
            name: 'Local Time hh:mm:ss',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:clock_local_hhmmss)',
                size: '14',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        clock_utc_hhmmss_12hr: { 
            type: 'button',
            category: 'Device Time',
            name: 'UTC Time hh:mm:ss AM/PM',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:clock_utc_hhmmss_12hr)',
                size: '14',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        clock_utc_hhmmss: { 
            type: 'button',
            category: 'Device Time',
            name: 'UTC Time hh:mm:ss',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:clock_utc_hhmmss)',
                size: '14',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        device_timezone: { 
            type: 'button',
            category: 'Device Time',
            name: 'Device Timezone',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:device_timezone)',
                size: 'auto',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        device_timezone_city: { 
            type: 'button',
            category: 'Device Time',
            name: 'Device Timezone City',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:device_timezone_city)',
                size: '14',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        utc_timezone: { 
            type: 'button',
            category: 'Device Time',
            name: 'UTC Timezone Name',
            style: {
                show_topbar: false,
                text: 'UTC',
                size: '14',
                color: '#FFFFFF',
                bgcolor: '#242424',
            },
            steps: [{
                down: [{
                    actionId: "sync_clock_to_cue_manager"
                }],
                up: []
            }],
            feedbacks: [],
        },
        
        
        
        
        // Names
        tenant_name: { 
            type: 'button',
            category: 'Names',
            name: 'Company Name',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:tenant_name)',
                size: '14',
                color: '#000000',
                bgcolor: '#DADADA',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        user_name: {
            type: 'button',
            category: 'Names',
            name: 'My Name',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:user_name)',
                size: '14',
                color: '#000000',
                bgcolor: '#DADADA',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        following_user_name: { 
            type: 'button',
            category: 'Names',
            name: 'Following User Name',
            style: {
                show_topbar: false,
                text: 'Following:\n$(cuemanager-cuesheetconnector:following_user_name)',
                size: '14',
                color: '#000000',
                bgcolor: '#DADADA',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        project_name: { 
            type: 'button',
            category: 'Names',
            name: 'Project Name',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:project_name)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#DADADA',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        sheet_name: { 
            type: 'button',
            category: 'Names',
            name: 'Sheet Name',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:sheet_name)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#DADADA',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        current_cue_number: { 
            type: 'button',
            category: 'Names',
            name: 'Current Cue Number',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:current_cue_number)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        current_cue_name: { 
            type: 'button',
            category: 'Names',
            name: 'Current Cue Name',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:current_cue_name)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        next_cue_name: { 
            type: 'button',
            category: 'Names',
            name: 'Next Cue Name',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:next_cue_name)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#4BCF6D',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        instance_status_description: { 
            type: 'button',
            category: 'Names',
            name: 'Instance Status',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:status_description)',
                size: 'auto',
                color: '#FFFFFF',
                bgcolor: '#000000',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [
                {
                    feedbackId: 'change_button_style_on_conditional',
                    options: {
                        variable_id: 'status',
                        compare_value: 'ok',
                        compare_as_lowercase: true,
                        comparison_operator: '!==',
                        bgcolor: '#FF0000',
                        color: '#FFFFFF'
                    }
                }
            ],
        },
        
        
        
        
        // Timers
        current_cue_over_under_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Current Cue Over/Under HH:MM:SS',
            style: {
                show_topbar: false,
                text: 'Cue\n$(cuemanager-cuesheetconnector:current_cue_over_under_hhmmss)',
                size: '13',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [
                {
                    feedbackId: 'change_button_style_on_conditional',
                    options: {
                        variable_id: 'current_cue_over_under_sign',
                        compare_value: '+',
                        compare_as_lowercase: true,
                        comparison_operator: '===',
                        bgcolor: '#FF0000',
                        color: '#FFFFFF'
                    }
                }
            ],
        },
        current_cue_over_under_mmss: {
            type: 'button',
            category: 'Timers',
            name: 'Current Cue Over/Under MM:SS',
            style: {
                show_topbar: false,
                text: 'Cue\n$(cuemanager-cuesheetconnector:current_cue_over_under_mm):$(cuemanager-cuesheetconnector:current_cue_over_under_ss)',
                size: '24',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [
                {
                    feedbackId: 'change_button_style_on_conditional',
                    options: {
                        variable_id: 'current_cue_over_under_sign',
                        compare_value: '+',
                        compare_as_lowercase: true,
                        comparison_operator: '===',
                        bgcolor: '#FF0000',
                        color: '#FFFFFF'
                    }
                }
            ]
        },
        current_cue_duration_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Current Cue Duration HH:MM:SS',
            style: {
                show_topbar: false,
                text: 'Cue Duration\n$(cuemanager-cuesheetconnector:current_cue_duration_hhmmss)',
                size: '13',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        current_cue_duration_mmss: {
            type: 'button',
            category: 'Timers',
            name: 'Current Cue Duration MM:SS',
            style: {
                show_topbar: false,
                text: 'Dur\n$(cuemanager-cuesheetconnector:current_cue_duration_mm):$(cuemanager-cuesheetconnector:current_cue_duration_ss)',
                size: '24',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        current_cue_remaining_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Current Cue Remaining HH:MM:SS',
            style: {
                show_topbar: false,
                text: 'Cue Remaining\n-$(cuemanager-cuesheetconnector:current_cue_remaining_hhmmss)',
                size: '13',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        next_cue_duration_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Next Cue Duration HH:MM:SS',
            style: {
                show_topbar: false,
                text: 'Next Cue Duration\n$(cuemanager-cuesheetconnector:next_cue_duration_hhmmss)',
                size: '13',
                color: '#000000',
                bgcolor: '#4BCF6D',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        next_cue_duration_mmss: {
            type: 'button',
            category: 'Timers',
            name: 'Next Cue Duration MM:SS',
            style: {
                show_topbar: false,
                text: 'Next\n$(cuemanager-cuesheetconnector:next_cue_duration_mm):$(cuemanager-cuesheetconnector:next_cue_duration_ss)',
                size: '24',
                color: '#000000',
                bgcolor: '#4BCF6D',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        sheet_over_under_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Current Cue Over/Under MM:SS',
            style: {
                show_topbar: false,
                text: 'Cue Sheet\n$(cuemanager-cuesheetconnector:sheet_over_under_hhmmss)',
                size: '13',
                color: '#FFFFFF',
                bgcolor: '#000000',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [
                {
                    feedbackId: 'change_button_style_on_conditional',
                    options: {
                        variable_id: 'sheet_over_under_sign',
                        compare_value: '+',
                        compare_as_lowercase: true,
                        comparison_operator: '===',
                        bgcolor: '#FF0000',
                        color: '#FFFFFF'
                    }
                }
            ],
        },
        sheet_total_runtime_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Total Runtime',
            style: {
                show_topbar: false,
                text: 'Total Runtime\n$(cuemanager-cuesheetconnector:sheet_total_runtime_hhmmss)',
                size: '13',
                color: '#FFFFFF',
                bgcolor: '#000000',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        sheet_duration_remaining_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Total Time Remaining',
            style: {
                show_topbar: false,
                text: 'Total Time Remaining\n-$(cuemanager-cuesheetconnector:sheet_duration_remaining_hhmmss)',
                size: '13',
                color: '#FFFFFF',
                bgcolor: '#000000',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        sheet_duration_remaining_excluding_current_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Remaining After Cue',
            style: {
                show_topbar: false,
                text: 'Remaining After Cue\n-$(cuemanager-cuesheetconnector:sheet_duration_remaining_excluding_current_hhmmss)',
                size: '13',
                color: '#FFFFFF',
                bgcolor: '#000000',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        sheet_countdown_to_start_hhmmss: {
            type: 'button',
            category: 'Timers',
            name: 'Countdown to Start',
            style: {
                show_topbar: false,
                text: 'Countdown\n$(cuemanager-cuesheetconnector:sheet_countdown_to_start_hhmmss)',
                size: '13',
                color: '#FFFFFF',
                bgcolor: '#000000',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        
        
        
        
        // Column Cells
        current_cue_cell_text_column_1: {
            type: 'button',
            category: 'Cell Text',
            name: 'Current Cue Cell Text For Column 1',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:current_cue_cell_text_column_1)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        current_cue_cell_text_column_2: {
            type: 'button',
            category: 'Cell Text',
            name: 'Current Cue Cell Text For Column 2',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:current_cue_cell_text_column_2)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        current_cue_cell_text_column_3: {
            type: 'button',
            category: 'Cell Text',
            name: 'Current Cue Cell Text For Column 3',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:current_cue_cell_text_column_3)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        current_cue_cell_text_column_4: {
            type: 'button',
            category: 'Cell Text',
            name: 'Current Cue Cell Text For Column 4',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:current_cue_cell_text_column_4)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#0D9CF3',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        next_cue_cell_text_column_1: {
            type: 'button',
            category: 'Cell Text',
            name: 'Next Cue Cell Text For Column 1',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:next_cue_cell_text_column_1)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#4BCF6D',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        next_cue_cell_text_column_2: {
            type: 'button',
            category: 'Cell Text',
            name: 'Next Cue Cell Text For Column 2',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:next_cue_cell_text_column_2)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#4BCF6D',
            },
            steps: [{
                down: [],
                up: []
            }],
            feedbacks: [],
        },
        next_cue_cell_text_column_3: {
            type: 'button',
            category: 'Cell Text',
            name: 'Next Cue Cell Text For Column 3',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:next_cue_cell_text_column_3)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#4BCF6D',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        next_cue_cell_text_column_4: {
            type: 'button',
            category: 'Cell Text',
            name: 'Next Cue Cell Text For Column 4',
            style: {
                show_topbar: false,
                text: '$(cuemanager-cuesheetconnector:next_cue_cell_text_column_4)',
                size: 'auto',
                color: '#000000',
                bgcolor: '#4BCF6D',
            },
            steps: [{
                down: [{
                    actionId: 'get_current_position'
                }],
                up: []
            }],
            feedbacks: [],
        },
        
        
        
        
        // Adjust Duration
        adjust_duration_minus_10m: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 10m from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-10m',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -600
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_minus_5m: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 5m from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-5m',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -300
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_minus_1m: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 1m from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-1m',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -60
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_minus_45s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 45s from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-45s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -45
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_minus_30s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 30s from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-30s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -30
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_minus_15s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 15s from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-15s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -15
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_minus_10s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 10s from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-10s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -10
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_minus_5s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 5s from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-5s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -5
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_minus_1s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Subtract 1s from Current Cue Duration',
            style: {
                show_topbar: false,
                text: '-1s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: -1
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_1s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 1s to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+1s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 1
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_5s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 5s to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+5s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 5
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_10s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 10s to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+10s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 10
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_15s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 15s to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+15s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 15
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_30s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 30s to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+30s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 30
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_45s: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 45s to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+45s',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 45
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_1m: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 1m to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+1m',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 60
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_5m: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 5m to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+5m',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 300
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
        adjust_duration_plus_10m: {
            type: 'button',
            category: 'Cue Duration (+/-)',
            name: 'Add 10m to Current Cue Duration',
            style: {
                show_topbar: false,
                text: '+10m',
                size: '24',
                color: '#FFFFFF',
                bgcolor: '#660066',
            },
            steps: [{
                down: [{
                    actionId: 'adjust_duration',
                    options: {
                        seconds: 600
                    }
                }],
                up: []
            }],
            feedbacks: [],
        },
    };

    self.setPresetDefinitions(presets);
};