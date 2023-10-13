import { Atmosphere } from "./Shaders/atmosphereScattering";
import {EffectComposer, RenderPass, EffectPass} from "postprocessing";
import {HalfFloatType} from "three";
import renderer from "../render"; 


export class Space{
    constructor(){
        this.planets = []
        this.isAtmosphere = false
    }

    initComposer(){
        this.container = document.getElementById('canvasContainer');
        this.composer  = new EffectComposer(renderer.renderer,{frameBufferType: HalfFloatType});
        this.composer.addPass(new RenderPass(renderer.scene_, renderer.camera_));
        this.composer.setSize(this.container.clientWidth,this.container.clientHeight);
    }

    addEffects(effects){
        const that = this
        effects.forEach((e)=>{
            that.composer.addPass(new EffectPass(renderer.camera_, e));
        })
    }

    addPlanets(planet,atmosphere){
        this.planets.push({planet,atmosphere})

    }

    setAtmosphere(){
        this.atmosphere = new Atmosphere()
        this.atmosphere.createcomposer(this.planets.map((e)=>{return e.atmosphere})) 
        this.addEffects([this.atmosphere.depthPass])
        this.isAtmosphere = true
    }

    update(player){
        if (this.isAtmosphere) 
            this.atmosphere.run()
        this.planets.forEach((p)=>{
            p.planet.update(player)
        })
        this.composer.render();

    }


    
}