import * as NODE  from 'three/nodes';
import * as THREE from 'three';
import { CelestialBodies } from './celestialbodies';
import { Atmosphere } from '../shaders/vfx/atmosphereScattering'; 

export class Planet extends CelestialBodies{
    constructor(params,name){
        super(params,'Planet')
        this.name = name
    }


}