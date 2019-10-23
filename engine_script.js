/*******************************************************************************
engine_script.js
********************************************************************************

>>> Dynamical Simulation of the clock hands

Click on the hands to perturb them. Ctrl+click changes the direction of the
perturbation. Shift+click increases the perturbation impulse amplitude. Ctrl
and Shift can be combined.

********************************************************************************

This script uses Math.js (developed with version 6.2.3): <http://mathjs.org/>

All angles are assumed to be in degree. The physical units of the simulation
are linear units. Identify degrees with meters to retrieve consistency. That's
enough care for 'display-only' simulation purpose.

Use the share-object behavior of JavaScript to avoid using global variables.

********************************************************************************

Main data structure:

  > sim
  |---> display
  |---> options
  |---> time
  |---> dyna
      |---> sec
      |---> min
      |---> hour

********************************************************************************
V1.2 - 02.10.2019 - Fabien Fellay
********************************************************************************

This script is licensed under the GNU General Public License version 3.

<https://opensource.org/licenses/GPL-3.0>

Copyright (C) 2017-2019 by Fabien Fellay

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <http://www.gnu.org/licenses/>.

*******************************************************************************/

// This enables a stricter mode of parsing JavaScript (preventing accidental globals, for example)
'use strict';

// Message in log
console.log('This script uses math.js (version ' + math.version + '): <http://mathjs.org/>');
console.log('Click on the hands to perturb them.\n' +
    'Ctrl+click changes the direction of the perturbation.\n' +
    'Shift+click increases the perturbation impulse amplitude.\n' +
    'Ctrl and Shift can be combined.');

// On load automatic start of the animation
window.onload = Start;

// Main function called on SVG loading: launch the permanent animation..........
function Start(load_event) { // The load_event can be used in case of need

    // Simulation object (containing all data)
    var sim = {
        display:new Object(),
        options:new Object(),
        time:new Object(),
        dyna:new Object()
    };

    // Display: get the hands object from the svg (can be done only after load)
    sim.display.second_hand = document.getElementById('RotSecond');
    sim.display.minute_hand = document.getElementById('RotMinute');
    sim.display.hour_hand = document.getElementById('RotHour');

    // Display: get the hands shade object from the svg (can be done only after load)
    sim.display.second_hand_shade = document.getElementById('ShadeSecond');
    sim.display.minute_hand_shade = document.getElementById('ShadeMinute');
    sim.display.hour_hand_shade = document.getElementById('ShadeHour');

    // Display: make the clicks pass through the hands shade
    sim.display.second_hand_shade.setAttribute('pointer-events','none');
    sim.display.minute_hand_shade.setAttribute('pointer-events','none');
    sim.display.hour_hand_shade.setAttribute('pointer-events','none');

    // Options: for continuous motion of seconds or minutes
    sim.options.continuous_second_hand = ContinuousSecondHand;
    sim.options.continuous_minute_hand = ContinuousMinuteHand;
    sim.options.enable_dynamic_simulation = EnableDynamicSimulation;
    var np = 2.0; // [s] Duration of the pause of the second hand (if continuous), typical: 2 sec

    // Options: the overspeed ratio and pause of the second hand
    if (sim.options.continuous_second_hand !== true) np = 0.0;
    sim.options.overspeed_fraction = 60/(60-np); // Typical: 60/58 for 2 seconds pause

    // Time: variables for continuous time
    sim.time.sfrac = 0.0;
    sim.time.mfrac = 0.0;
    sim.time.hfrac = 1/60;
    sim.time.sec_hand_speed = 0.0;
    sim.time.min_hand_speed = 0.0;
    sim.time.hour_hand_speed = 0.0;

    // Time: hand speeds for initialization
    if (sim.options.continuous_second_hand === true){
        sim.time.sfrac = 1/1000;
        sim.time.sec_hand_speed = 6.0*sim.options.overspeed_fraction; // Normal speed: 360 deg per 60 sec -> 6 deg per sec
        if (sim.options.continuous_minute_hand === true){
            sim.time.min_hand_speed = 0.1; // Normal speed: 360 deg per 3600 sec -> 0.1 deg per sec
            sim.time.hour_hand_speed = 1/120; // Normal speed: 720 deg per 86400 sec -> 1/120 deg per sec
        }
    }
    if (sim.options.continuous_minute_hand === true) sim.time.mfrac = 1/60;

    // The sampling time in seconds (20ms or 50.0Hz), common to the computation and the display
    var T = 20e-3; // Sampling time [s] (try 25ms or 40.0Hz in case of poor performance)

    // State-space model generation (containing all the dynamic data)
    sim.dyna.sec = new SSM(M_sec,c_sec,k_sec,T,'second hand',sim.options);
    sim.dyna.min = new SSM(M_min,c_min,k_min,T,'minute hand',sim.options);
    sim.dyna.hour = new SSM(M_hour,c_hour,k_hour,T,'hour hand',sim.options);

    // Options: perturbations
    sim.options.pertubation_low = impulse_low/T; // [N] Small perturbation force value (during time T)
    sim.options.pertubation_high = impulse_high/T; // [N] Large perturbation force value (during time T)

    // Prepare the perturbation events
    sim.display.cover = document.getElementById('cover');
    sim.display.cover.setAttribute('pointer-events','none'); // The clicks will pass through the cover (important)
    sim.display.second_hand.onmousedown = function(click_event) {Perturbation(click_event,sim.dyna.sec,sim.options)};
    sim.display.minute_hand.onmousedown = function(click_event) {Perturbation(click_event,sim.dyna.min,sim.options)};
    sim.display.hour_hand.onmousedown = function(click_event) {Perturbation(click_event,sim.dyna.hour,sim.options)};

    // Initialization of the dynamic states
    InitializeAllDynamics(sim);

    // Repeat every fixed fraction of a second (no recursive function and call-stack overflow this way)
    var sim_timer = setInterval(SimStep,T*1e3,sim); // in ms (simulation timer)
}

// State-Space Model (SSM) Constructor..........................................
function SSM(M,c,k,T,name,Options) {

    // Input-Output-State
    this.ref_angle = 0; // Input
    this.ref_angle_p = 0; // Previous input
    this.pert_force = 0; // Perturbation input
    this.real_angle = 0; // Output

    this.X = math.zeros(2, 1); // Current state
    this.Z = math.zeros(2, 1); // Current warped state

    // Store the physical parameters
    this.M = M; // Mass [kg]
    this.c = c; // Viscous coefficient [N*s/m]
    this.k = k; // Stiffness [N/m]
    this.T = T; // Sampling time [s]
    this.name = name; // Name of the model

    // Classical dynamical variables
    var omega0_2 = k/M; // [1/s^2]
    var omega0 = Math.sqrt(omega0_2); // [1/s]

    this.lambda = c/(2*M); // [1/s]
    this.f = omega0/(2*math.PI); // [Hz] Free mode frequency without damping

    // Display basic information about dynamic
    if (Options.enable_dynamic_simulation == true) {
        var precision = 6;
        console.log('Eigen frequency of the ' + name + ': ' + math.format(this.f,precision) + ' [Hz]');
    }

    // Continuous state-space model
    this.A = math.matrix([[0,1],
        [-omega0_2,-2*this.lambda]]);
    this.B = math.matrix([[2*this.lambda,0],
        [omega0_2 - 4*math.pow(this.lambda,2),1/M]]);
    this.C = math.matrix([[1,0]]);
    this.D = math.matrix([[0,0]]);

    // Discrete state-space model by Tustin bilinear discretization
    var identity_matrix = math.identity(math.size(this.A));
    this.Trans_Mat = math.add(identity_matrix,math.multiply(this.A,-T/2));
    var Trans_Mat_Inv = math.inv(this.Trans_Mat);

    this.Ad = math.multiply(Trans_Mat_Inv,math.add(identity_matrix,math.multiply(this.A,T/2)));
    this.Bd = math.multiply(Trans_Mat_Inv,math.multiply(this.B,T) );
    this.Cd = math.multiply(this.C,Trans_Mat_Inv );
    this.Dd = math.add(math.multiply(this.Cd,math.multiply(this.B,T/2)),this.D);
    if (Options.enable_dynamic_simulation !== true) {
        // This will make output = input
        this.Cd = math.matrix([[0,0]]);
        this.Dd = math.matrix([[1,0]]);
    }

    // Input-state modulo correction
    this.Mod_Corr_Mat = math.matrix([[1],
        [-2*this.lambda]]); // Correction matrix
}

// To get the current time and thus the current hands reference angle...........
function GetTimeNAngle(sim) {

    // Get computer clock time
    var date = new Date();
    var ms = date.getMilliseconds();
    var s = date.getSeconds();
    var m = date.getMinutes();
    var h = date.getHours();

    // Process the time
    var scont = s + ms*sim.time.sfrac; // Seconds (continuous or discrete according to choice)
    var mcont = m + scont*sim.time.mfrac; // Minutes (continuous or discrete according to choice)
    var hcont = h + mcont*sim.time.hfrac; // Continuous hours (at min, sec or millisec increments based on previous choice)

    // Computation of the second reference angle (360 deg per 60 sec -> 6 deg per sec)
    sim.dyna.sec.ref_angle = Math.min(6.0*scont*sim.options.overspeed_fraction,360.0);

    // Computation of the minute reference angle (360 deg per 60 min -> 6 deg per min)
    sim.dyna.min.ref_angle = 6.0*mcont;

    // Computation of the hour reference angle (720 deg per 24 h -> 30 deg per h)
    sim.dyna.hour.ref_angle = 30.0*hcont;
}

// Initialization of one SSM model..............................................
function InitializeSSM(SSM,hand_speed) {

    // Initialize angle
    SSM.X.subset(math.index(0, 0),SSM.ref_angle);

    // This case is only relevant for the continuous second hand
    if ((SSM.name == 'second hand') && (SSM.ref_angle == 360.0)) {
        hand_speed = 0.0;
    }

    // Initialize angular velocity minus 2*lambda*angle (in motion case)
    SSM.X.subset(math.index(1, 0),hand_speed - 2*SSM.lambda*SSM.ref_angle);

    // Warped Z state initialization
    SSM.Z = math.add(math.multiply(SSM.Trans_Mat,SSM.X),
        math.multiply(math.multiply(SSM.B,-SSM.T/2),math.matrix([[SSM.ref_angle],[SSM.pert_force]])));

    // Previous input initialization
    SSM.ref_angle_p = SSM.ref_angle;
}

// Initialization of all models.................................................
function InitializeAllDynamics(sim) {

    // Get the reference angles
    GetTimeNAngle(sim); // Directly set in all SSM object

    // Initialize dynamics of second hand
    InitializeSSM(sim.dyna.sec,sim.time.sec_hand_speed);

    // Initialize dynamics of minute hand
    InitializeSSM(sim.dyna.min,sim.time.min_hand_speed);

    // Initialize dynamics of hour hand
    InitializeSSM(sim.dyna.hour,sim.time.hour_hand_speed);
}

// The step of one SSM model....................................................
function SSMStep(SSM) {

    // Deal with the reference angle modulo (not so trivial at first)
    var ref_angle_delta = SSM.ref_angle - SSM.ref_angle_p; // Difference of input

    if (math.abs(ref_angle_delta) > 180) {
        // Update state: jump to input, at 360 deg resolution
        SSM.Z = math.add(SSM.Z,math.multiply(SSM.Mod_Corr_Mat,
            math.round(ref_angle_delta/360)*360));
    }
    SSM.ref_angle_p = SSM.ref_angle; // Previous input update

    // Computation of the real angle (using state-space model)
    SSM.real_angle = math.subset(math.add(math.multiply(SSM.Cd,SSM.Z),
        math.multiply(SSM.Dd,math.matrix([[SSM.ref_angle],[SSM.pert_force]]))),
        math.index(0,0)); // Output (alternatively: use math.squeeze)
    SSM.Z = math.add(math.multiply(SSM.Ad,SSM.Z),
        math.multiply(SSM.Bd,math.matrix([[SSM.ref_angle],[SSM.pert_force]]))); // State update

    // Reset perturbation impulse
    SSM.pert_force = 0;
}

// The step of the animation....................................................
function SimStep(sim) {

    // Get the reference angles
    GetTimeNAngle(sim); // Directly set in all SSM object

    // Update of the second real angle and states
    SSMStep(sim.dyna.sec);

    // Update of the minute real angle and states
    SSMStep(sim.dyna.min);

    // Update of the hour real angle and states
    SSMStep(sim.dyna.hour);

    // Display of the second hand
    sim.display.second_hand.setAttribute('transform','rotate(' + sim.dyna.sec.real_angle.toString() + ')');
    sim.display.second_hand_shade.setAttribute('transform','rotate(' + sim.dyna.sec.real_angle.toString() + ')');

    // Display of the minute hand
    sim.display.minute_hand.setAttribute('transform','rotate(' + sim.dyna.min.real_angle.toString() + ')');
    sim.display.minute_hand_shade.setAttribute('transform','rotate(' + sim.dyna.min.real_angle.toString() + ')');

    // Display of the hour hand
    sim.display.hour_hand.setAttribute('transform','rotate(' + sim.dyna.hour.real_angle.toString() + ')');
    sim.display.hour_hand_shade.setAttribute('transform','rotate(' + sim.dyna.hour.real_angle.toString() + ')');
}

// The perturbation function....................................................
function Perturbation(click_event,SSM,Options) {

    var perturbation_value = Options.pertubation_low;
    if (click_event.shiftKey) {
        perturbation_value = Options.pertubation_high;
    }

    if ((click_event.ctrlKey) || (click_event.metaKey)) {
        SSM.pert_force -= perturbation_value;
    } else {
        SSM.pert_force += perturbation_value;
    }
}

// Debug function to output a value in the console..............................
function print(value) {
    // This function name overrides the regular print function, which opens the physical printer dialog.
    var precision = 14;
    console.log(math.format(value, precision));
}
