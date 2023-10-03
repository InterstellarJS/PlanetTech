import { Atmosphere } from "../PlanetTech/shaders/vfx/atmosphereScattering";


export class Space{
    constructor(){

    }

    createAtmosphere(planet,params){
        this.planet = planet
        this.atmosphere  = new Atmosphere()
        this.atmosphere.createcomposer(params)
    }

    update(player){
        this.atmosphere.run()
        this.planet.update(player)
    }
}