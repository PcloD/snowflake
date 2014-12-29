//= require underscore
var webGL = {
  run: function() {
    this.clear();
    init();
    animate();
  },
  clear: function() {

    if(frame)
      cancelAnimationFrame(frame);
    scene = null;
    camera = null;
    renderer = null;
    var canvas = document.getElementsByTagName('canvas')[0];
    if(canvas) {
      canvas.parentNode.removeChild(canvas);
    }
  },
  shader: {
    vertex: null,
    fragment: null
  },
  getShader: function(type) {
    var shader = this.shader[type];
    if(shader) {
      return shader;
    } else {
      throw new Error("No shader found with id='"+type+"'");
    }
  },
  setShader: function(args) {
    _.extend(this.shader, args);
  }
};
console.log("LOADING WEBGL FRAME");
