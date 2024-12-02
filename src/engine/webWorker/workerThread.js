export function workersSRC(){
    return `
    self.onmessage = function(msg) {
      const payload = msg.data
      console.log(payload)
    }
    `
}