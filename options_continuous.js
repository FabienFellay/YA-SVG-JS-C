/*******************************************************************************
options_continuous.js
*******************************************************************************/

// Options for continuous motion of seconds or minutes (USER CHOICE)
var ContinuousSecondHand = true;
var ContinuousMinuteHand = false;
var EnableDynamicSimulation = true; // For a cool dynamic effect: true

// Dynamic of the second hand (physical parameters)
var M_sec = 0.1; // Mass [kg]
var c_sec = 0.3; // Viscous coefficient [N*s/m]
var k_sec = 8; // Stiffness [N/m]

// Dynamic of the minute hand (physical parameters)
var M_min = 0.2; // Mass [kg]
var c_min = 2; // Viscous coefficient [N*s/m]
var k_min = 50; // Stiffness [N/m]

// Dynamic of the hour hand (physical parameters)
var M_hour = 0.3; // Mass [kg]
var c_hour = 3; // Viscous coefficient [N*s/m]
var k_hour = 100; // Stiffness [N/m]

// Perturbation amplitude
var impulse_low = 12.5; // [kg*m/s] Small perturbation impulse (sampling time independent)
var impulse_high = 37.5; // [kg*m/s] Large perturbation impulse (sampling time independent)
