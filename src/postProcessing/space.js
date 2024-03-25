import { Atmosphere } from "./Shaders/atmosphereScattering.js";
import {EffectComposer, RenderPass, EffectPass} from "postprocessing";
import {HalfFloatType} from "three";

export class Space{
    constructor(render,scene_,camera_){
        this.planets = []
        this.isAtmosphere = false
        this.render  = render
        this.scene_  = scene_
        this.camera_ = camera_

    }

    initComposer(wdith,height){
        this.composer  = new EffectComposer(this.render,{frameBufferType: HalfFloatType});
        this.composer.addPass(new RenderPass(this.scene_, this.camera_));
        this.composer.setSize(wdith,height);
    }

    addEffects(effects){
        const that = this
        effects.forEach((e)=>{
            that.composer.addPass(new EffectPass(this.camera_, e));
        })
    }

    addPlanets(planet,atmosphere){
        this.planets.push({planet,atmosphere})

    }

    setAtmosphere(){
        this.atmosphere = new Atmosphere()
        this.atmosphere.createcomposer(this.planets.map((e)=>{return e.atmosphere}),this.camera_) 
        this.addEffects([this.atmosphere.depthPass])
        this.isAtmosphere = true
    }



    update(player){
        if (this.isAtmosphere) 
            this.atmosphere.run(this.camera_)
        this.planets.forEach((p)=>{
            p.planet.update(player)
        })
        this.composer.render();

    }


    
}