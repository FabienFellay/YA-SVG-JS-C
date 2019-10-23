/*******************************************************************************
options_stepping.js
*******************************************************************************/

// Options for stepping motion of seconds or minutes (USER CHOICE)
var ContinuousSecondHand = false;
var ContinuousMinuteHand = true;
var EnableDynamicSimulation = true; // For a cool dynamic effect: true

// Dynamic of the second hand (physical parameters)
var M_sec = 0.1; // Mass [kg]
var c_sec = 5.2; // Viscous coefficient [N*s/m]
var k_sec = 510; // Stiffness [N/m]

// Dynamic of the minute hand (physical parameters)
var M_min = 0.2; // Mass [kg]
var c_min = 12; // Viscous coefficient [N*s/m]
var k_min = 1040; // Stiffness [N/m]

// Dynamic of the hour hand (physical parameters)
var M_hour = 0.3; // Mass [kg]
var c_hour = 10; // Viscous coefficient [N*s/m]
var k_hour = 1550; // Stiffness [N/m]

// Perturbation amplitude
var impulse_low = 50; // [kg*m/s] Small perturbation impulse (sampling time independent)
var impulse_high = 120; // [kg*m/s] Large perturbation impulse (sampling time independent)
