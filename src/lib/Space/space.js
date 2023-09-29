import { Atmosphere } from "../PlanetTech/shaders/vfx/atmosphereScattering";


export class Space{
    constructor(){

    }

    createAtmosphere(planet,atmosphereRadius){
        this.planet      = planet
        let planetCenter = planet.metaData().cnt
        let planetRadius = planet.metaData().radius
        this.atmosphere  = new Atmosphere()
        this.atmosphere.createcomposer(planetRadius,planetCenter,atmosphereRadius)
    }

    update(player){
        this.atmosphere.run()
        this.planet.update(player)
    }
}